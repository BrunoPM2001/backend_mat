import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const ctrl = {};

//  Funciones - TODO
ctrl.getUsuarios = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
          const result = await prisma.usuarios.findMany({
            select: {
              id: true,
              username: true,
              email: true,
              perfil: true,
              activo: true,
              fecha_registro: true,
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

ctrl.getUsuario = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
          const { id } = req.query;
          const result = await prisma.usuarios.findUnique({
            where: {
              id: Number(id),
            },
            select: {
              id: true,
              username: true,
              email: true,
              perfil: true,
              activo: true,
              fecha_registro: true,
              Perfiles: true,
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

ctrl.createUsuario = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
          //  Ver el tipo de perfil que se está creando
          const { perfil } = req.body;
          switch (perfil) {
            case "Interno":
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
                    username: (
                      nombres[0] +
                      a_paterno +
                      a_materno[0]
                    ).toUpperCase(),
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
            case "Externo":
              {
                const {
                  doc,
                  a_paterno,
                  a_materno,
                  nombres,
                  email,
                  celular,
                  sexo,
                } = req.body;

                const result = await prisma.usuarios.create({
                  data: {
                    username: (
                      nombres[0] +
                      a_paterno +
                      a_materno[0]
                    ).toUpperCase(),
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
            case "Juridico":
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

ctrl.disableUsuario = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
          const { id } = req.query;
          await prisma.usuarios.update({
            where: {
              id: Number(id),
            },
            data: {
              activo: false,
            },
          });
          res.json({
            message: "Success",
            data: "Usuario con id " + id + " bloqueado.",
          });
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

ctrl.enableUsuario = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
          const { id } = req.query;
          await prisma.usuarios.update({
            where: {
              id: Number(id),
            },
            data: {
              activo: true,
            },
          });
          res.json({
            message: "Success",
            data: "Usuario con id " + id + " activado.",
          });
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

ctrl.changePass = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        const { id } = payload;
        const { oldPass, newPass } = req.body;
        const user = await prisma.usuarios.findUnique({
          where: {
            id: Number(id),
            password: oldPass,
          },
        });
        if (user != null) {
          if (user.activo == true) {
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
      }
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

ctrl.restorePass = async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        res.json({ message: "Fail", data: "Error en token" });
      } else {
        //  Validar permisos del usuario
        if (payload.permisos >= 4) {
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
          const newPass = ["Interno", "Externo"].includes(usuario.perfil)
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

ctrl.login = async (req, res) => {
  try {
    const { usuario, password, administrativo } = req.body;
    //  Manejar el tipo de usuario a logear
    if (!administrativo) {
      const result = await prisma.usuarios.findUnique({
        where: {
          username: usuario,
          password: password,
        },
        select: {
          id: true,
          username: true,
          email: true,
          perfil: true,
          activo: true,
        },
      });
      //  Validar usuario, contraseña y estado
      if (result == null) {
        res.json({
          message: "Fail",
          data: "Usuario y/o contraseña incorrecto(s)",
        });
      } else if (!result.activo) {
        res.json({ message: "Fail", data: "Usuario bloqueado" });
      } else {
        const token = jwt.sign(result, process.env.JWT_SECRET_KEY, {
          expiresIn: 3600,
        });
        res.json({ message: "Success", data: result, token: token });
      }
    } else {
      const result = await prisma.usuariosAdministrativos.findUnique({
        where: {
          username: usuario,
          password: password,
        },
        select: {
          id: true,
          username: true,
          email: true,
          permisos: true,
          activo: true,
          Dependencias: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });
      //  Validar usuario, contraseña y estado
      if (result == null) {
        res.json({
          message: "Fail",
          data: "Usuario y/o contraseña incorrecto(s)",
        });
      } else if (!result.activo) {
        res.json({ message: "Fail", data: "Usuario bloqueado" });
      } else {
        const token = jwt.sign(result, process.env.JWT_SECRET_KEY, {
          expiresIn: 120,
        });
        res.json({ message: "Success", data: result, token: token });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ message: "Fail", data: "Exception" });
  }
};

//  Usuarios administrativos
ctrl.createAdministrativo = async (req, res) => {
  try {
    const {
      id_dependencia,
      a_paterno,
      a_materno,
      nombres,
      doc,
      email,
      permisos,
    } = req.body;
    const result = await prisma.usuariosAdministrativos.create({
      data: {
        id_dependencia: Number(id_dependencia),
        doc: doc,
        a_paterno: a_paterno,
        a_materno: a_materno,
        nombres: nombres,
        username: (nombres[0] + a_paterno + a_materno[0]).toUpperCase(),
        password: doc,
        email: email,
        permisos: permisos,
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
  "perfil": "Interno",
  "doc": "123456789",
  "a_paterno": "Random",
  "a_materno": "Random",
  "nombres": "Random123",
  "email": "random123@gmail.com",
  "celular": "987654321",
  "codigo": "12345678",
  "facultad": "FACU",
  "sexo": "Masculino"
}
CREAR USUARIO EXTERNO:
{
  "perfil": "Externo",
  "doc": "12345678",
  "a_paterno": "Ejemplo",
  "a_materno": "Ejemplo",
  "nombres": "Sample",
  "email": "sample@gmail.com",
  "celular": "987654321",
  "sexo": "Masculino"
}
CREAR USUARIO JURIDICO:
{
  "perfil": "Juridico",
  "email": "juridico@gmail.com",
  "celular": "987654321",
  "ruc": "10724587629",
  "razon_social": "Random S.A."
}
*/
