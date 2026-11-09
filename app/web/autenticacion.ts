import cookieSession from "cookie-session";
import crypto from "crypto";
import { Express, NextFunction, Request, Response } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import SistemaUsuarios from "../dominio/sistema-usuarios";
import Usuario from "../dominio/usuario";
import { EstadoHttp } from "./estado-http";

const DURACION_SESION_MS = 8 * 60 * 60 * 1000;

const obtenerSecretoDeSesion = (): string => {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  console.warn("SESSION_SECRET no está definido: se usa un secreto aleatorio y las sesiones se pierden al reiniciar");
  return crypto.randomBytes(32).toString("hex");
};

// Datos propios que se guardan en la sesión, además de los que guarda Passport
interface DatosDeSesion extends CookieSessionInterfaces.CookieSessionObject {
  venceEn?: number;
}

type CallbackDeSesion = (error?: Error) => void;

const vaciarSesion = (sesion: object) => {
  for (const clave of Object.keys(sesion)) {
    Reflect.deleteProperty(sesion, clave);
  }
};

const adaptarSesionParaPassport = (req: Request, _res: Response, next: NextFunction) => {
  const sesion: DatosDeSesion | null | undefined = req.session;
  if (sesion) {
    if (sesion.venceEn && Date.now() > sesion.venceEn) {
      vaciarSesion(sesion);
    }
    // No enumerables, para que no se serialicen en la cookie
    Object.defineProperty(sesion, "regenerate", {
      value: (callback: CallbackDeSesion) => {
        vaciarSesion(sesion);
        sesion.venceEn = Date.now() + DURACION_SESION_MS;
        callback();
      },
    });
    Object.defineProperty(sesion, "save", {
      value: (callback: CallbackDeSesion) => callback(),
    });
  }
  next();
};

export const usuarioActual = (req: Request): Usuario | undefined => req.user as Usuario | undefined;

// Configura las sesiones (guardadas del lado del cliente, en una cookie firmada) y Passport con la estrategia de
// email y contraseña. La cookie solo contiene el id del usuario y el vencimiento de la sesión.
export const configurarAutenticacion = (app: Express, sistemaUsuarios: SistemaUsuarios) => {
  app.use(
    cookieSession({
      name: "sesion",
      keys: [obtenerSecretoDeSesion()],
      httpOnly: true,
      sameSite: "lax",
      maxAge: DURACION_SESION_MS,
    }),
  );
  app.use(adaptarSesionParaPassport);

  passport.use(
    new LocalStrategy({ usernameField: "email", passwordField: "contrasena" }, (email, contrasena, done) => {
      sistemaUsuarios.autenticar(email, contrasena).then((usuario) => done(null, usuario ?? false), done);
    }),
  );
  passport.serializeUser((usuario, done) => done(null, (usuario as Usuario).obtenerId()));
  passport.deserializeUser((id: number, done) => {
    sistemaUsuarios.obtenerPorId(id).then((usuario) => done(null, usuario ?? false), done);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // Deja los datos del usuario logueado disponibles para el layout
  app.use((req: Request, res: Response, next: NextFunction) => {
    const usuario = usuarioActual(req);
    if (usuario) {
      res.locals.usuarioActual = {
        nombre: usuario.obtenerNombre(),
        email: usuario.obtenerEmail(),
        esEmpresario: usuario.esEmpresario(),
      };
    }
    next();
  });
};

export const requiereAutenticacion = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect(EstadoHttp.ENCONTRADO, "/login");
  }
};
