import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones - TODO * USE JWT
ctrl.getCategoriasTramite = async (req, res) => {
  try {
    const result = await prisma.categoriasTramite.findMany();
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.createCategoriaTramite = async (req, res) => {
  try {
    const { nombre } = req.body;
    const result = await prisma.categoriasTramite.create({
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
