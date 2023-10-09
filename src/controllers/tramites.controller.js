import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones - TODO * USE JWT * MANEJO DE ERRORES POR FKS
ctrl.getTramites = async (req, res) => {
  try {
    const result = await prisma.tramites.findMany();
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.getTramite = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await prisma.tramites.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

//  TODO * Saber a qué se refieren con stats (cantidad, porcentajes, etc)
ctrl.getStatsTramite = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await prisma.tramites.count({
      where: {
        id: Number(id),
      },
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.createTramite = async (req, res) => {
  try {
    const { dependenciaId, categoriaId, nombre, descripcion, html, tupa } =
      req.body;
    const result = await prisma.tramites.create({
      data: {
        id_dependencia: dependenciaId,
        id_categoria: categoriaId,
        nombre: nombre,
        descripcion: descripcion,
        html: html,
        tupa: tupa,
      },
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.disableTramite = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await prisma.tramites.update({
      data: {
        estado: "Deshabilitado",
      },
      where: {
        id: Number(id),
      },
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.enableTramite = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await prisma.tramites.update({
      data: {
        estado: "Habilitado",
      },
      where: {
        id: Number(id),
      },
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

export default ctrl;
