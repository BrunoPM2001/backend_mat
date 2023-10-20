import { Router } from "express";
import ctrl from "../controllers/usuario.controller.js";

const router = Router();

//  Rutas
router.get("/getUsuarios", ctrl.getUsuarios);

router.get("/getUsuario", ctrl.getUsuario);

router.post("/createUsuario", ctrl.createUsuario);

router.put("/updateUsuario", (req, res) => {
  res.json({ message: "Usuario actualizado" });
});

router.put("/disableUsuario", ctrl.disableUsuario);

router.put("/enableUsuario", ctrl.enableUsuario);

router.put("/changePass", ctrl.changePass);

router.put("/restorePass", ctrl.restorePass);

//  Login
router.put("/login", ctrl.login);

//  Administrativos
router.post("/createAdministrativo", ctrl.createAdministrativo);

export default router;
