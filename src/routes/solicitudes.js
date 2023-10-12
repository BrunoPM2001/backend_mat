import { Router } from "express";
import ctrl from "../controllers/solicitudes.controller.js";
import { uploadRequisitos, verifySize } from "../../config/multer.js";

const router = Router();

//  Rutas para user - TODO estimar límite de requisitos - IMPLEMENTAR SUBSANAR
router.get("/getSolicitudes", ctrl.getSolicitudes);

router.post("/createSolicitud", uploadRequisitos.fields([
  {name: "requisito_1", maxCount: 1},
  {name: "requisito_2", maxCount: 1},
  {name: "requisito_3", maxCount: 1},
  {name: "requisito_4", maxCount: 1},
  {name: "requisito_5", maxCount: 1},
  {name: "requisito_6", maxCount: 1},
  {name: "requisito_7", maxCount: 1},
  {name: "requisito_8", maxCount: 1},
  {name: "requisito_9", maxCount: 1},
  {name: "requisito_10", maxCount: 1},
]), ctrl.createSolicitud);

router.put("/subsanarSolicitud", (req, res) => {
  res.json({ message: "Success", data: "Subsanar solicitud" })
});

router.delete("/deleteSolicitud", ctrl.deleteSolicitud);

export default router;