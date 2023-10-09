import { Router } from "express";

const router = Router();

//  Rutas
router.get("/getTramites", (req, res) => {
  res.json({ message: "Trámites" });
});

router.get("/getTramite", (req, res) => {
  res.json({ message: "Trámite" });
});

router.get("/getStatsTramite", (req, res) => {
  res.json({ message: "Estadísticas del trámite" });
});

router.post("/createTramite", (req, res) => {
  res.json({ message: "Trámite creado" });
});

router.put("/updateTramite", (req, res) => {
  res.json({ message: "Trámite actualizado" });
});

router.put("/disableTramite", (req, res) => {
  res.json({ message: "Trámite habilitado" });
});

router.put("/enableTramite", (req, res) => {
  res.json({ message: "Trámite deshabilitado" });
});

export default router;
