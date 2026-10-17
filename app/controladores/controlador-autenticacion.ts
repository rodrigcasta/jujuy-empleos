import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import DatosDeUsuarioInvalidos from "../dominio/datos-de-usuario-invalidos";
import SistemaUsuarios from "../dominio/sistema-usuarios";
import Usuario from "../dominio/usuario";
import UsuarioYaExisteError from "../dominio/usuario-ya-existe-error";
import { registrarExcepcion, renderizarError } from "../web/registrar-excepcion";
import { EstadoHttp } from "../web/estado-http";

// Campos de los formularios (pueden faltar si el request no se envió desde el formulario)
interface FormularioLogin {
  email?: string;
  contrasena?: string;
}

interface FormularioRegistro {
  nombre?: string;
  apellido?: string;
  email?: string;
  contrasena?: string;
  confirmacion?: string;
}

export const crearControladorAutenticacion = (sistemaUsuarios: SistemaUsuarios) => {
  const router = express.Router();

  // Inicia la sesión del usuario y lo lleva al listado de alumnos
  const iniciarSesion = (req: Request, res: Response, usuario: Usuario) => {
    req.login(usuario, (error) => {
      if (error) {
        registrarExcepcion(req, error);
        renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo iniciar la sesión");
      } else {
        res.redirect(EstadoHttp.VER_OTRO, "/alumnos");
      }
    });
  };

  router.get("/login", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.redirect(EstadoHttp.ENCONTRADO, "/alumnos");
    } else {
      res.render("login", { titulo: "Iniciar sesión" });
    }
  });

  router.post(
    "/login",
    (req: Request<Record<string, string>, unknown, FormularioLogin>, res: Response, next: NextFunction) => {
      passport.authenticate("local", (error: Error | null, usuario: Usuario | false) => {
        if (error) {
          registrarExcepcion(req, error);
          renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo iniciar la sesión");
        } else if (!usuario) {
          res.status(EstadoHttp.NO_AUTORIZADO).render("login", {
            titulo: "Iniciar sesión",
            error: "Email o contraseña incorrectos",
            email: req.body.email,
          });
        } else {
          iniciarSesion(req, res, usuario);
        }
      })(req, res, next);
    },
  );

  router.get("/registro", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.redirect(EstadoHttp.ENCONTRADO, "/alumnos");
    } else {
      res.render("registro", { titulo: "Registro" });
    }
  });

  router.post("/registro", async (req: Request<Record<string, string>, unknown, FormularioRegistro>, res: Response) => {
    const { nombre, apellido, email, contrasena, confirmacion } = req.body;
    // Las contraseñas no se devuelven al formulario
    const renderizarFormulario = (estado: EstadoHttp, error: string) => {
      res.status(estado).render("registro", { titulo: "Registro", error, nuevo: { nombre, apellido, email } });
    };

    try {
      const usuario = await sistemaUsuarios.registrar(
        nombre ?? "",
        apellido ?? "",
        email ?? "",
        contrasena ?? "",
        confirmacion,
      );
      iniciarSesion(req, res, usuario);
    } catch (error: unknown) {
      registrarExcepcion(req, error);
      if (error instanceof DatosDeUsuarioInvalidos) {
        renderizarFormulario(EstadoHttp.SOLICITUD_INCORRECTA, error.message);
      } else if (error instanceof UsuarioYaExisteError) {
        renderizarFormulario(EstadoHttp.CONFLICTO, error.message);
      } else {
        renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo registrar el usuario");
      }
    }
  });

  router.post("/logout", (req: Request, res: Response) => {
    req.logout((error) => {
      if (error) {
        registrarExcepcion(req, error);
        renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo cerrar la sesión");
      } else {
        res.redirect(EstadoHttp.VER_OTRO, "/login");
      }
    });
  });

  return router;
};
