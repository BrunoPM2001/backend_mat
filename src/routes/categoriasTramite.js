import { Router } from "express";
import ctrl from "../controllers/categoriasTramite.controller.js";

const router = Router();

//  Rutas
router.get("/getCategoriasTramite", ctrl.getCategoriasTramite);

router.post("/createCategoriaTramite", ctrl.createCategoriaTramite);

export default router;
