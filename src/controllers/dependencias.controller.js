import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones - TODO * USE JWT
ctrl.getDependencias = async (req, res) => {
  try {
    const result = await prisma.dependencias.findMany();
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.createDependencia = async (req, res) => {
  try {
    const { nombre } = req.body;
    const result = await prisma.dependencias.create({
      data: {
        nombre: nombre,
      },
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

export default ctrl;
