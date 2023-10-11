import express from "express";
import cors from "cors";
import router_usuarios from "./src/routes/usuarios.js";
import router_dependencias from "./src/routes/dependencias.js";
import router_categoriasTramite from "./src/routes/categoriasTramite.js";
import router_tramites from "./src/routes/tramites.js";
import router_requisitos from "./src/routes/requisitosTramite.js";
import router_solicitudes from "./src/routes/solicitudes.js";

const app = express();

//  Middlewares
app.use(cors());
app.use(express.json());

//  Rutas
app.use("/usuarios", router_usuarios);
app.use("/dependencias", router_dependencias);
app.use("/categoriasTramite", router_categoriasTramite);
app.use("/tramites", router_tramites);
app.use("/requisitos", router_requisitos);
app.use("/solicitudes", router_solicitudes);

//  Corriendo servicio
app.listen(3000, () => console.log("Listening..."));
