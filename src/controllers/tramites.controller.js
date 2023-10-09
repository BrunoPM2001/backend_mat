import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones - TODO * USE JWT
ctrl.getTramites = async (req, res) => {
  try {
    const result = await prisma.tramites.findMany();
    res.json({ message: "Success", data: result });
  } catch (e) {
    res.json({ message: "Fail", data: "Exception" });
  }
};
