import multer from "multer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const storage = multer.memoryStorage();

//  Middlewares
//  Carga de plantillas en ciertos formatos
const uploadPlantillas = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

//  Carga de varios requisitos
const uploadRequisitos = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

//  Validar tamaño de un archivo
const verifySize = (req, res, next) => {
  const maxSize = 1024 * 1024 * 10;
  if (req.file) {
    if (req.file.size > maxSize) {
      res.json({ message: "Fail", data: "Archivo excede el límite de tamaño" });
    } else {
      next();
    }
  } else if (req.body.plantilla == "false") {
    next();
  } else {
    res.json({ message: "Fail", data: "Tipo de archivo inválido" });
  }
};

//  Validar carga y tipo de requisitos cargados
const verifyMultipleSizeAndTypes = async (req, res, next) => {
  const maxSize = 1024 * 1024 * 10;
  const files = req.files;
  const { id_tramite } = req.body;
  const formats = await prisma.requisitos.findMany({
    where: {
      id_tramite: Number(id_tramite),
      activo: true,
    },
    select: {
      id: true,
      formato: true,
    },
  });
  for (let i = 1; i <= 10; i++) {
    if (files["requisito_" + i] != undefined) {
      //  Validar que no hayan archivos demás
      if (i > formats.length) {
        res.json({
          message: "Fail",
          data: "Límite de archivos cargados superado",
        });
        return;
      }
      let extFile = files["requisito_" + i][0].originalname
        .split(".")
        .pop()
        .toLowerCase();
      if (files["requisito_" + i][0].size > maxSize) {
        console.log(files["requisito_" + i][0]);
        res.json({ message: "Fail", data: "Archivo supera los 10 mb" });
        return;
      } else if (extFile != formats[i - 1].formato) {
        res.json({ message: "Fail", data: "Archivo de tipo incorrecto" });
        return;
      }
    }
  }
  next();
};

export {
  uploadPlantillas,
  uploadRequisitos,
  verifySize,
  verifyMultipleSizeAndTypes,
};
