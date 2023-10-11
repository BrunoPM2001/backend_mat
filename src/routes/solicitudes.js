import { Router } from "express";
//import ctrl from "../controllers/solicitudes.controller.js";

const router = Router();

//  Rutas para user
router.get("/getSolicitudes", (req, res) => {
  res.json({ message: "Success", data: "Solicitudes" })
});

router.post("/createSolicitud", (req, res) => {
  res.json({ message: "Success", data: "Crear solicitud" })
});

router.put("/subsanarSolicitud", (req, res) => {
  res.json({ message: "Success", data: "Subsanar solicitud" })
});

router.delete("/cancelarTramite", (req, res) => {
  res.json({ message: "Success", data: "Solicitud eliminada" })
});

export default router;