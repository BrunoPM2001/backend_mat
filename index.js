import express from "express";
import cors from "cors";
import router_usuarios from "./src/routes/usuarios.js";
import router_tramites from "./src/routes/tramites.js";

const app = express();

//  Middlewares
app.use(cors());
app.use(express.json());

//  Rutas
app.use("/usuarios", router_usuarios);
app.use("/tramites", router_tramites);

//  Corriendo servicio
app.listen(3000, () => console.log("Listening..."));
