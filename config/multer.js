import multer from "multer";

const storage = multer.memoryStorage();
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

const uploadRequisitos = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // if ([
    //   "application/pdf",
    //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    // ].includes(file.mimetype)
    // ) {
    cb(null, true);
    // } else {
    //   cb(null, false);
    // }
  },
});

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

const verifyMultipleSize = (req, res, next) => {
  const files = req.files;
  for (let i = 1; i <= 10; i++) {
    console.log(files["requisito_" + i]);
  }
  // next();
};

export { uploadPlantillas, uploadRequisitos, verifySize, verifyMultipleSize };
