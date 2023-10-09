import { Router } from "express";
import ctrl from "../controllers/dependencias.controller.js";

const router = Router();

//  Rutas
router.get("/getDependencias", ctrl.getDependencias);

router.post("/createDependencia", ctrl.createDependencia);

export default router;
