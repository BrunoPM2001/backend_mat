import { PrismaClient } from "@prisma/client";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import jwt from "jsonwebtoken";
import s3Client from "../../config/s3client.js";

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones * TODO - Use JWT - Validar tipo de archivo cargado
ctrl.getSolicitudes = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.perfil != null) {
          const result = await prisma.solicitudes.findMany({
            where: {
              id_usuario: Number(payload.id),
            },
          });
          res.json({ message: "Success", data: result });
        } else {
          res.json({ message: "Fail", data: "Permisos insuficientes" });
        }
      }
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.getAdjuntosSolicitud = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar premsos del usuario
        if (payload.perfil != null) {
          const { id } = req.query;
          const result = await prisma.requisitosSolicitud.findMany({
            where: {
              id_solicitud: Number(id),
              Solicitudes: {
                id_usuario: Number(payload.id),
              },
            },
            select: {
              id_solicitud: true,
              nombreArchivo: true,
              Requisitos: {
                select: {
                  nombre: true,
                  descripcion: true,
                },
              },
            },
          });
          //  Generar enlace para descargar el archivo de S3
          const adjuntos = await Promise.all(
            result.map(async (element) => {
              return {
                ...element,
                url: await getSignedUrl(
                  s3Client,
                  new GetObjectCommand({
                    Bucket: process.env.BUCKET_REQUISITOS_SOLICITUD,
                    Key: element.id_solicitud + "/" + element.nombreArchivo,
                  }),
                  {
                    expiresIn: 3600,
                  }
                ),
              };
            })
          );
          res.json({ message: "Success", data: adjuntos });
        } else {
          res.json({ message: "Fail", data: "Permisos insuficientes" });
        }
      }
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.createSolicitud = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.perfil != null) {
          const validFiles = [];
          const files = req.files;
          const { id_tramite } = req.body;
          //  Obtener requisitos que deben ser adjuntados para validar los archivos
          const req_tramite = await prisma.requisitos.findMany({
            where: {
              id_tramite: Number(id_tramite),
              activo: true,
            },
          });
          //  Validar: Obligatorio? => Tipo de archivo => Tamaño máx? => Subir archivo
          for (let i = 0; i < req_tramite.length; i++) {
            let requisito = req_tramite[i];
            let file = files["requisito_" + (i + 1)];
            if (file != undefined) {
              if (file[0].size <= requisito.maxSizeKb) {
                validFiles.push(i); //  Archivos que están ok
              } else {
                res.json({
                  message: "Fail",
                  data:
                    "El requisito con id " +
                    requisito.id +
                    " supera el tamaño máximo.",
                });
                return;
              }
            } else if (requisito.obligatorio) {
              res.json({
                message: "Fail",
                data:
                  "El requisito con id " + requisito.id + " es obligatorio.",
              });
              return;
            }
          }
          //  Crear solicitud en la DB
          const solicitud = await prisma.solicitudes.create({
            data: {
              id_tramite: Number(id_tramite),
              id_usuario: Number(payload.id),
            },
          });
          //  Archivos válidos
          validFiles.forEach(async (i) => {
            let req = req_tramite[i];
            let fileName = "requisito_" + (i + 1);
            let file = files[fileName][0];
            //  Subir registro a la DB
            await prisma.requisitosSolicitud.create({
              data: {
                id_solicitud: Number(solicitud.id),
                id_requisito: req.id,
                nombreArchivo: fileName,
              },
            });
            // Subir requisito a minio
            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.BUCKET_REQUISITOS_SOLICITUD,
                Key: solicitud.id + "/" + fileName,
                Body: file.buffer,
              })
            );
          });
          res.json({ message: "Success", data: solicitud });
        } else {
          res.json({ message: "Fail", data: "Permisos insuficientes" });
        }
      }
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.deleteSolicitud = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.perfil != null) {
          const { id } = req.query;
          const estado = await prisma.solicitudes.findUnique({
            where: {
              id: Number(id),
              id_usuario: Number(payload.id),
            },
          });
          if (estado.estado == "Pendiente") {
            //  Eliminar solicitud
            const reqDel = await prisma.solicitudes.delete({
              where: {
                id: Number(id),
              },
              include: {
                RequisitosSolicitud: true,
              },
            });
            //  Eliminar archivos cargados
            reqDel.RequisitosSolicitud.forEach(async (ele) => {
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: process.env.BUCKET_REQUISITOS_SOLICITUD,
                  Key: reqDel.id + "/" + ele.nombreArchivo,
                })
              );
            });
            res.json({
              message: "Success",
              data: "Solicitud eliminada correctamente!",
            });
          } else {
            res.json({
              message: "Fail",
              data: "No se puede eliminar la solicitud!",
            });
          }
        } else {
          res.json({ message: "Fail", data: "Permisos insuficientes" });
        }
      }
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

//  Administrativos
ctrl.acceptSolicitud = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        const { id } = req.query;
        //  Validar permisos del usuario y ver si hay una solicitud
        if (payload.permisos == 2) {
          const exist = await prisma.solicitudes.count({
            where: {
              id: Number(id),
              estado: "Pendiente",
              Tramites: {
                id_dependencia: Number(payload.Dependencias.id),
              },
            },
          });
          if (exist == 0) {
            res.json({
              message: "Fail",
              data: "No hay acceso a esa solicitud",
            });
            return;
          }
          const fecha = new Date(
            Date.now() + process.env.OFFSET * 60 * 1000
          ).toISOString();
          await prisma.solicitudes.update({
            where: {
              id: Number(id),
            },
            data: {
              estado: "Aprobado",
              fecha_actualizacion: fecha,
            },
          });
          res.json({ message: "Success", data: "Solicitud aprobada" });
        } else if (payload.permisos == 3) {
          const exist = await prisma.solicitudes.count({
            where: {
              id: Number(id),
              estado: "Pendiente",
            },
          });
          if (exist == 0) {
            res.json({
              message: "Fail",
              data: "No hay acceso a esa solicitud",
            });
            return;
          }
          const fecha = new Date(
            Date.now() + process.env.OFFSET * 60 * 1000
          ).toISOString();
          await prisma.solicitudes.update({
            where: {
              id: Number(id),
            },
            data: {
              estado: "Aprobado",
              fecha_actualizacion: fecha,
            },
          });
          res.json({ message: "Success", data: "Solicitud aprobada" });
        } else {
          res.json({ message: "Fail", data: "Permisos insuficientes" });
        }
      }
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.refuseSolicitud = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        const { id, obs } = req.body;
        //  Validar permisos del usuario y ver si hay una solicitud
        if (payload.permisos == 2) {
          const exist = await prisma.solicitudes.count({
            where: {
              id: Number(id),
              estado: "Pendiente",
              Tramites: {
                id_dependencia: Number(payload.Dependencias.id),
              },
            },
          });
          if (exist == 0) {
            res.json({
              message: "Fail",
              data: "No hay acceso a esa solicitud",
            });
            return;
          }
          const fecha = new Date(
            Date.now() + process.env.OFFSET * 60 * 1000
          ).toISOString();
          await prisma.solicitudes.update({
            where: {
              id: Number(id),
            },
            data: {
              estado: "Rechazado",
              observacion: obs,
              fecha_actualizacion: fecha,
            },
          });
          res.json({ message: "Success", data: "Solicitud rechazada" });
        } else if (payload.permisos == 3) {
          const exist = await prisma.solicitudes.count({
            where: {
              id: Number(id),
              estado: "Pendiente",
            },
          });
          if (exist == 0) {
            res.json({
              message: "Fail",
              data: "No hay acceso a esa solicitud",
            });
            return;
          }
          const fecha = new Date(
            Date.now() + process.env.OFFSET * 60 * 1000
          ).toISOString();
          await prisma.solicitudes.update({
            where: {
              id: Number(id),
            },
            data: {
              estado: "Rechazado",
              observacion: obs,
              fecha_actualizacion: fecha,
            },
          });
          res.json({ message: "Success", data: "Solicitud rechazada" });
        } else {
          res.json({ message: "Fail", data: "Permisos insuficientes" });
        }
      }
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

export default ctrl;
