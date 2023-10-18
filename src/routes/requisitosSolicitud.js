import { Router } from "express";

const router = Router();

//  Rutas
router.get("/getAdjuntos", (req, res) => {
  res.json({
    message:
      "Retorna los requisitos adjuntados así como el enlace respectivo para descargarlo",
  });
});

export default router;
