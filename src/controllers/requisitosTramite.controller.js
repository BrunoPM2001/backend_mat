import { PrismaClient } from "@prisma/client";
import { PutObjectCommand } from "@aws-sdk/client-s3"
import s3Client from "../../config/s3client.js"

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones - TODO * USE JWT * incluir carga de plantillas MINIO
ctrl.getRequisitosTramite = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await prisma.requisitos.findMany({
      where: {
        id_tramite: Number(id),
      },
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.createRequisitoTramite = async (req, res) => {
  try {
    const plantilla = req.body.plantilla == "true" ? true : false;
    if (plantilla) {
      const {
        tramiteId,
        nombre,
        descripcion,
        tipo,
        formato,
        obligatorio,
      } = req.body;
      const result = await prisma.requisitos.create({
        data: {
          id_tramite: Number(tramiteId),
          nombre: nombre,
          descripcion: descripcion,
          tipo: tipo,
          formato: formato,
          obligatorio: Boolean(obligatorio),
        },
      });
      const file = req.file;
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.BUCKET_PLANTILLAS,
        Key: result.id_tramite + "/Req_" + result.id,
        Body: file.buffer,
        ContentType: file.mimetype
      }))
      res.json({ message: "Success", data: result });
    } else {
      res.json({ message: "Success", data: "Solo se insertará en la DB" });
    }
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.disableRequisitoTramite = async (req, res) => {
  try {
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
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.enableRequisitoTramite = async (req, res) => {
  try {
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
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

export default ctrl;
