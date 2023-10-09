import { Router } from "express";
import ctrl from "../controllers/requisitosTramite.controller.js";

const router = Router();

//  Rutas
router.get("/getRequisitosTramite", ctrl.getRequisitosTramite);

router.post("/createRequisitoTramite", ctrl.createRequisitoTramite);

router.put("/disableRequisitoTramite", ctrl.disableRequisitoTramite);

router.put("/enableRequisitoTramite", ctrl.enableRequisitoTramite);

export default router;
