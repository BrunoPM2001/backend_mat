import { PrismaClient } from "@prisma/client";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import jwt from "jsonwebtoken";
import s3Client from "../../config/s3client.js";

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones - TODO * EVITAR QUE LA APP CRASHEE POR PRISMA CLIENT

//  Retorna los requisitos independientemente de su estado
ctrl.getRequisitosTramiteAdmin = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
          const { id } = req.query;
          const result = await prisma.requisitos.findMany({
            where: {
              id_tramite: Number(id),
            },
          });
          const requisitos = await Promise.all(
            result.map(async (requisito) => {
              if (requisito.plantilla == true) {
                return {
                  ...requisito,
                  url: await getSignedUrl(
                    s3Client,
                    new GetObjectCommand({
                      Bucket: process.env.BUCKET_PLANTILLAS,
                      Key: requisito.id_tramite + "/Req_" + requisito.id,
                    }),
                    {
                      expiresIn: 600,
                    }
                  ),
                };
              } else {
                return {
                  ...requisito,
                  url: null,
                };
              }
            })
          );
          res.json({ message: "Success", data: requisitos });
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

ctrl.getRequisitosTramite = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        const { id } = req.query;
        const result = await prisma.requisitos.findMany({
          where: {
            id_tramite: Number(id),
            activo: true,
          },
        });
        const requisitos = await Promise.all(
          result.map(async (requisito) => {
            if (requisito.plantilla == true) {
              return {
                ...requisito,
                url: await getSignedUrl(
                  s3Client,
                  new GetObjectCommand({
                    Bucket: process.env.BUCKET_PLANTILLAS,
                    Key: requisito.id_tramite + "/Req_" + requisito.id,
                  }),
                  {
                    expiresIn: 600,
                  }
                ),
              };
            } else {
              return {
                ...requisito,
                url: null,
              };
            }
          })
        );
        res.json({ message: "Success", data: requisitos });
      }
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.createRequisitoTramite = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
          const plantilla = req.body.plantilla == "true" ? true : false;
          const {
            tramiteId,
            nombre,
            descripcion,
            formato,
            maxSizeKb,
            obligatorio,
          } = req.body;
          const result = await prisma.requisitos.create({
            data: {
              id_tramite: Number(tramiteId),
              nombre: nombre,
              descripcion: descripcion,
              formato: formato,
              maxSizeKb: Number(maxSizeKb),
              plantilla: plantilla,
              obligatorio: obligatorio == "true" ? true : false,
            },
          });
          //  Cargar plantilla si es que existe
          if (plantilla) {
            const file = req.file;
            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.BUCKET_PLANTILLAS,
                Key: result.id_tramite + "/Req_" + result.id,
                Body: file.buffer,
                ContentType: file.mimetype,
              })
            );
          }
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

ctrl.updatePlantillaRequisito = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
          const plantilla = req.body.plantilla == "true" ? true : false;
          const { id, formato, maxSizeKb, obligatorio } = req.body;
          const result = await prisma.requisitos.update({
            data: {
              formato: formato,
              maxSizeKb: Number(maxSizeKb),
              plantilla: plantilla,
              obligatorio: obligatorio == true ? true : false,
            },
            where: {
              id: Number(id),
            },
          });
          if (plantilla) {
            const file = req.file;
            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.BUCKET_PLANTILLAS,
                Key: result.id_tramite + "/Req_" + result.id,
                Body: file.buffer,
                ContentType: file.mimetype,
              })
            );
          } else {
            await s3Client.send(
              new DeleteObjectCommand({
                Bucket: process.env.BUCKET_PLANTILLAS,
                Key: result.id_tramite + "/Req_" + result.id,
              })
            );
          }
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

ctrl.disableRequisitoTramite = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
          const { id } = req.query;
          await prisma.requisitos.update({
            data: {
              activo: false,
            },
            where: {
              id: Number(id),
            },
          });
          res.json({
            message: "Success",
            data: "Requisito con id " + id + " deshabilitado.",
          });
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

ctrl.enableRequisitoTramite = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
          const { id } = req.query;
          await prisma.requisitos.update({
            data: {
              activo: true,
            },
            where: {
              id: Number(id),
            },
          });
          res.json({
            message: "Success",
            data: "Requisito con id " + id + " habilitado.",
          });
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
