import { PrismaClient } from "@prisma/client";
import { DeleteObjectCommand, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3"
import s3Client from "../../config/s3client.js"

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones * TODO - Use JWT - Validar tipo de archivo cargado
ctrl.getSolicitudes = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await prisma.solicitudes.findMany({
      where: {
        id_usuario: Number(id)
      }
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
}

ctrl.createSolicitud = async (req, res) => {
  try {
    const validFiles = [];
    const files = req.files;
    const {
      id_usuario,
      id_tramite
    } = req.body;
    //  Obtener requisitos que deben ser adjuntados para validar los archivos
    const req_tramite = await prisma.requisitos.findMany({
      where: {
        id_tramite: Number(id_tramite),
        activo: true
      }
    });
    //  Validar: Obligatorio? => Tipo de archivo => Tamaño máx? => Subir archivo
    for (let i = 0; i < req_tramite.length; i++) {
      let req = req_tramite[i];
      let file = files["requisito_" + (i + 1)];
      if (file != undefined) {
        if (file[0].size <= req.maxSizeKb) {
          validFiles.push(i);   //  Archivos que están ok
        } else {
          res.json({ message: "Fail", data: "El requisito con id " + req.id + " supera el tamaño máximo." });
          return;
        }
      } else if (req.obligatorio) {
        res.json({ message: "Fail", data: "El requisito con id " + req.id + " es obligatorio." });
        return;
      }
    }
    //  Crear solicitud en la DB
    const solicitud = await prisma.solicitudes.create({
      data: {
        id_tramite: Number(id_tramite),
        id_usuario: Number(id_usuario)
      }
    });
    validFiles.forEach(async(i) => {
      let req = req_tramite[i];
      let fileName = "requisito_" + (i + 1);
      let file = files[fileName][0];
      //  Subir registro a la DB
      await prisma.requisitosSolicitud.create({
        data: {
          id_solicitud: Number(solicitud.id),
          id_requisito: req.id,
          nombreArchivo: fileName
        }
      });
      // Subir requisito a minio
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.BUCKET_REQUISITOS_SOLICITUD,
        Key: solicitud.id + "/" + fileName,
        Body: file.buffer
      }));
    })

    res.json({ message: "Success", data: solicitud });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
}

ctrl.deleteSolicitud = async (req, res) => {
  try {
    const { id, id_usuario } = req.query;
    const estado = await prisma.solicitudes.findUnique({
      where: {
        id: Number(id),
        id_usuario: Number(id_usuario)
      }
    });
    if (estado.estado == "Pendiente") {
      //  Eliminar solicitud
      const reqDel = await prisma.solicitudes.delete({
        where: {
          id: Number(id)
        },
        include: {
          RequisitosSolicitud: true
        }
      });
      //  Eliminar archivos cargados
      reqDel.RequisitosSolicitud.forEach(async(ele) => {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.BUCKET_REQUISITOS_SOLICITUD,
          Key: reqDel.id + "/" + "requisito_" + ele.id_requisito
        }))
      });
      res.json({ message: "Success", data: "Solicitud eliminada correctamente!" });
    } else {
      res.json({ message: "Fail", data: "No se puede eliminar la solicitud!" });
    }
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
}

export default ctrl;