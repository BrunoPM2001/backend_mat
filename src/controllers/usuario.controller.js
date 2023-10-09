import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones - TODO * USE JWT * REESCRUCTURAR LA QUERY DE CREAR
ctrl.getUsuarios = async (req, res) => {
  try {
    const result = await prisma.usuarios.findMany();
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.getUsuario = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        Perfiles: true,
      },
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.createUsuario = async (req, res) => {
  try {
    //  Ver el tipo de perfil que se está creando
    const { perfil } = req.body;
    switch (perfil) {
      case "interno":
        {
          const {
            doc,
            a_paterno,
            a_materno,
            nombres,
            email,
            celular,
            sexo,
            codigo,
            facultad,
          } = req.body;

          const result = await prisma.usuarios.create({
            data: {
              username: (nombres[0] + a_paterno + a_materno[0]).toUpperCase(),
              password: doc,
              email: email,
              perfil: perfil,
              Perfiles: {
                create: {
                  celular: celular,
                  doc: doc,
                  a_paterno: a_paterno,
                  a_materno: a_materno,
                  nombres: nombres,
                  codigo: codigo,
                  facultad: facultad,
                  sexo: sexo,
                },
              },
            },
            include: {
              Perfiles: true,
            },
          });
          res.json({ message: "Success", data: result });
        }
        break;
      case "externo":
        {
          const { doc, a_paterno, a_materno, nombres, email, celular, sexo } =
            req.body;

          const result = await prisma.usuarios.create({
            data: {
              username: (nombres[0] + a_paterno + a_materno[0]).toUpperCase(),
              password: doc,
              email: email,
              perfil: perfil,
              Perfiles: {
                create: {
                  celular: celular,
                  doc: doc,
                  a_paterno: a_paterno,
                  a_materno: a_materno,
                  nombres: nombres,
                  sexo: sexo,
                },
              },
            },
            include: {
              Perfiles: true,
            },
          });
          res.json({ message: "Success", data: result });
        }
        break;
      case "juridico":
        {
          const { ruc, razon_social, email, celular } = req.body;

          const result = await prisma.usuarios.create({
            data: {
              username: ruc,
              password: ruc,
              email: email,
              perfil: perfil,
              Perfiles: {
                create: {
                  celular: celular,
                  ruc: ruc,
                  razon_social: razon_social,
                },
              },
            },
            include: {
              Perfiles: true,
            },
          });
          res.json({ message: "Success", data: result });
        }
        break;
      default:
        res.json({ message: "Fail", data: "Perfil no existe" });
        break;
    }
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.disableUsuario = async (req, res) => {
  try {
    const { id } = req.query;
    await prisma.usuarios.update({
      where: {
        id: Number(id),
      },
      data: {
        estado: "bloqueado",
      },
    });
    res.json({
      message: "Success",
      data: "Usuario con id " + id + " bloqueado.",
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.enableUsuario = async (req, res) => {
  try {
    const { id } = req.query;
    await prisma.usuarios.update({
      where: {
        id: Number(id),
      },
      data: {
        estado: "activado",
      },
    });
    res.json({
      message: "Success",
      data: "Usuario con id " + id + " activado.",
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.changePass = async (req, res) => {
  try {
    const { id } = req.query;
    const { oldPass, newPass } = req.body;
    const user = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
        password: oldPass,
      },
    });
    if (user != null) {
      if (user.estado == "activado") {
        await prisma.usuarios.update({
          where: {
            id: Number(id),
          },
          data: {
            password: newPass,
          },
        });
        res.json({ message: "Success", data: "Contraseña actualizada" });
      } else {
        res.json({ message: "Fail", data: "Usuario bloqueado" });
      }
    } else {
      res.json({ message: "Fail", data: "Contraseña incorrecta" });
    }
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.restorePass = async (req, res) => {
  try {
    const { id } = req.query;
    const usuario = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        perfil: true,
        Perfiles: {
          select: {
            doc: true,
            ruc: true,
          },
        },
      },
    });
    const newPass = ["interno", "externo"].includes(usuario.perfil)
      ? usuario.Perfiles.doc
      : usuario.Perfiles.ruc;
    const result = await prisma.usuarios.update({
      where: {
        id: Number(id),
      },
      data: {
        password: newPass,
      },
    });
    res.json({ message: "Success", data: result });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

export default ctrl;

/*  Ejemplos de JSON PARA LAS REQUEST
CREAR USUARIO INTERNO:
{
  "perfil": "interno",
  "doc": "123456789",
  "a_paterno": "Random",
  "a_materno": "Random",
  "nombres": "Random123",
  "email": "random123@gmail.com",
  "celular": "987654321",
  "codigo": "12345678",
  "facultad": "FACU",
  "sexo": "masculino"
}
CREAR USUARIO EXTERNO:
{
  "perfil": "externo",
  "doc": "12345678",
  "a_paterno": "Ejemplo",
  "a_materno": "Ejemplo",
  "nombres": "Sample",
  "email": "sample@gmail.com",
  "celular": "987654321",
  "sexo": "masculino"
}
CREAR USUARIO JURIDICO:
{
  "perfil": "juridico",
  "email": "juridico@gmail.com",
  "celular": "987654321",
  "ruc": "10724587629",
  "razon_social": "Random S.A."
}
*/
