import express, { Request, Response } from "express";
import Alumno from "../dominio/alumno";
import AlumnoNoEncontradoError from "../dominio/alumno-no-encontrado-error";
import PadronDeAlumnoInvalido from "../dominio/padron-de-alumno-invalido";
import SistemaAlumnos from "../dominio/sistema-alumnos";
import { registrarExcepcion, renderizarError } from "../web/registrar-excepcion";
import { EstadoHttp } from "../web/estado-http";

// Campos del formulario de alta (pueden faltar si el request no se envió desde el formulario)
interface FormularioAlumno {
  padron?: string;
  nombre?: string;
  apellido?: string;
}

interface AlumnoVista {
  padron: string;
  nombre: string;
  apellido: string;
}

const aVista = (alumno: Alumno): AlumnoVista => ({
  padron: alumno.getPadron(),
  nombre: alumno.getNombre(),
  apellido: alumno.getApellido(),
});

// Rutas montadas en /alumnos
export const crearControladorAlumnos = (sistemaAlumnos: SistemaAlumnos) => {
  const router = express.Router();

  router.get("/", async (req: Request, res: Response) => {
    try {
      const alumnos = await sistemaAlumnos.obtenerAlumnos();
      res.render("alumnos", { titulo: "Alumnos", alumnos: alumnos.map(aVista) });
    } catch (error: unknown) {
      registrarExcepcion(req, error);
      renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo obtener el listado de alumnos");
    }
  });

  // Se declara antes de /:padron para que "nuevo" no se interprete como un padrón
  router.get("/nuevo", (_req: Request, res: Response) => {
    res.render("alumno-nuevo", { titulo: "Nuevo alumno" });
  });

  router.get("/:padron", async (req: Request, res: Response) => {
    try {
      const alumno = await sistemaAlumnos.obtenerAlumnoPorPadron(req.params.padron);
      res.render("alumno", {
        titulo: `Alumno ${alumno.getPadron()}`,
        alumno: aVista(alumno),
      });
    } catch (error: unknown) {
      registrarExcepcion(req, error);
      if (error instanceof AlumnoNoEncontradoError) {
        renderizarError(res, EstadoHttp.NO_ENCONTRADO, `No se encontró el alumno con padrón ${req.params.padron}`);
      } else {
        renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo obtener el alumno");
      }
    }
  });

  router.post("/", async (req: Request<Record<string, string>, unknown, FormularioAlumno>, res: Response) => {
    try {
      const alumnoCreado: Alumno = await sistemaAlumnos.crearAlumno(
        req.body.padron ?? "",
        req.body.nombre ?? "",
        req.body.apellido ?? "",
      );

      res.redirect(EstadoHttp.VER_OTRO, `/alumnos/${encodeURIComponent(alumnoCreado.getPadron())}`);
    } catch (error: unknown) {
      registrarExcepcion(req, error);
      if (error instanceof PadronDeAlumnoInvalido) {
        res.status(EstadoHttp.SOLICITUD_INCORRECTA).render("alumno-nuevo", {
          titulo: "Nuevo alumno",
          error: error.message,
          nuevo: req.body,
        });
      } else {
        renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo crear el alumno");
      }
    }
  });

  router.post("/:padron/eliminar", async (req: Request, res: Response) => {
    try {
      await sistemaAlumnos.eliminarAlumno(req.params.padron);
      res.redirect(EstadoHttp.VER_OTRO, "/alumnos");
    } catch (error: unknown) {
      registrarExcepcion(req, error);
      if (error instanceof AlumnoNoEncontradoError) {
        renderizarError(res, EstadoHttp.NO_ENCONTRADO, `No se encontró el alumno con padrón ${req.params.padron}`);
      } else {
        renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo eliminar el alumno");
      }
    }
  });

  return router;
};
