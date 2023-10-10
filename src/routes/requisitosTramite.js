import { Router } from "express";
import ctrl from "../controllers/requisitosTramite.controller.js";
import { upload, verifySize } from "../../config/multer.js";

const router = Router();

//  Rutas
router.get("/getRequisitosTramiteAdmin", ctrl.getRequisitosTramiteAdmin);

router.get("/getRequisitosTramite", ctrl.getRequisitosTramite);

router.post("/createRequisitoTramite", upload.single('file'), verifySize, ctrl.createRequisitoTramite);

router.put("/updatePlantillaRequisito", upload.single('file'), verifySize, ctrl.updatePlantillaRequisito)

router.put("/disableRequisitoTramite", ctrl.disableRequisitoTramite);

router.put("/enableRequisitoTramite", ctrl.enableRequisitoTramite);

export default router;
