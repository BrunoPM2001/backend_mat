import { PrismaClient } from "@prisma/client";
import { DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import s3Client from "../../config/s3client.js"

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones * TODO - Use JWT
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
    //  Validar: Obligatorio? => Tamaño máx? => Subir archivo
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
    //  Crear registros en la DB y subir elementos a minio
    validFiles.forEach(i => {
      
    })

    res.json({ cuenta: req_tramite })
  } catch (e) {
    
  }
}

export default ctrl;