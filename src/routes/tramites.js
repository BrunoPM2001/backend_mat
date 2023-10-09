import { Router } from "express";
import ctrl from "../controllers/tramites.controller.js";

const router = Router();

//  Rutas
router.get("/getTramites", ctrl.getTramites);

router.get("/getTramite", ctrl.getTramite);

router.get("/getStatsTramite", ctrl.getStatsTramite);

router.post("/createTramite", ctrl.createTramite);

router.put("/updateTramite", (req, res) => {
  res.json({ message: "Trámite actualizado" });
});

router.put("/disableTramite", ctrl.disableTramite);

router.put("/enableTramite", ctrl.enableTramite);

export default router;
