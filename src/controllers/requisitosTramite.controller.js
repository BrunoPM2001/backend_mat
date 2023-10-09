import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones - TODO * USE JWT * incluir carga de plantillas MINIO
ctrl.getRequisitosTramite = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await prisma.requisitos.findMany({
      where: {
        id_tramite: Number(id),
      },
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.createRequisitoTramite = async (req, res) => {
  try {
    const {
      tramiteId,
      nombre,
      descripcion,
      tipo,
      formato,
      plantilla,
      obligatorio,
    } = req.body;
    const result = await prisma.requisitos.create({
      data: {
        id_tramite: tramiteId,
        nombre: nombre,
        descripcion: descripcion,
        tipo: tipo,
        formato: formato,
        plantilla: plantilla,
        obligatorio: obligatorio,
      },
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.disableRequisitoTramite = async (req, res) => {
  try {
    const { id } = req.query;
    await prisma.requisitos.update({
      data: {
        activo: false,
      },
      where: {
        id: Number(id),
      },
    });
    res.json({
      message: "Success",
      data: "Requisito con id " + id + " deshabilitado.",
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.enableRequisitoTramite = async (req, res) => {
  try {
    const { id } = req.query;
    await prisma.requisitos.update({
      data: {
        activo: true,
      },
      where: {
        id: Number(id),
      },
    });
    res.json({
      message: "Success",
      data: "Requisito con id " + id + " habilitado.",
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

export default ctrl;
