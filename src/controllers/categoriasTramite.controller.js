import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones
ctrl.getCategoriasTramite = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        const result = await prisma.categoriasTramite.findMany();
        res.json({ message: "Success", data: result });
      }
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.createCategoriaTramite = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
          const { nombre } = req.body;
          const result = await prisma.categoriasTramite.create({
            data: {
              nombre: nombre,
            },
          });
          res.json({ message: "Success", data: result });
        } else {
          res.json({ message: "Fail", data: "Permisos insuficientes" });
        }
      }
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

export default ctrl;
