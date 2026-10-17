import Alumno from "./dominio/alumno";
import AlumnoNoEncontradoError from "../app/dominio/alumno-no-encontrado-error";
import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import PadronDeAlumnoInvalido from "../app/dominio/padron-de-alumno-invalido";
import SistemaAlumnos from "./dominio/sistema-alumnos";
import RepositorioAlumnoSql from "./adaptadores/repositorio-alumno-sql";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "vistas"));

// Imprime los datos de cada request y de su response
app.use((req: Request, res: Response, next: NextFunction) => {
  const inicio = Date.now();
  const cuerpo = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : "";
  console.log(`--> ${req.method} ${req.originalUrl} ${cuerpo}`.trimEnd());

  res.on("finish", () => {
    const datos = [
      `${res.statusCode}`,
      `${Date.now() - inicio}ms`,
      res.get("Content-Type"),
      res.get("Content-Length") && `${res.get("Content-Length")} bytes`,
      res.get("Location") && `-> ${res.get("Location")}`,
    ].filter(Boolean);
    console.log(`<-- ${req.method} ${req.originalUrl} ${datos.join(" ")}`);
  });

  next();
});

const registrarExcepcion = (req: Request, error: any) => {
  console.error(`!!! ${req.method} ${req.originalUrl} ${error?.constructor?.name}: ${error?.message}`);
};

const sistemaAlumnos = new SistemaAlumnos(new RepositorioAlumnoSql());

app.get("/", (_req: Request, res: Response) => {
  res.render("inicio", { titulo: "Inicio" });
});

// Devuelve la versión del package.json
app.get("/version", (req: Request, res: Response) => {
  try {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    const pkgContent = fs.readFileSync(pkgPath, { encoding: "utf8" });
    const pkg = JSON.parse(pkgContent) as { version?: string };
    res.json({ equipo: "caseros", version: pkg.version ?? "unknown" });
  } catch (error: any) {
    registrarExcepcion(req, error);
    res.status(500).json({ error: "No se pudo leer la versión" });
  }
});

const aVista = (alumno: Alumno) => ({
  padron: alumno.getPadron(),
  nombre: alumno.getNombre(),
  apellido: alumno.getApellido(),
});

const renderizarError = (res: Response, estado: number, mensaje: string) => {
  res.status(estado).render("error", { titulo: "Error", mensaje });
};

app.get("/alumnos", async (req: Request, res: Response) => {
  try {
    const alumnos = await sistemaAlumnos.obtenerAlumnos();
    res.render("alumnos", { titulo: "Alumnos", alumnos: alumnos.map(aVista) });
  } catch (error: any) {
    registrarExcepcion(req, error);
    renderizarError(res, 500, "No se pudo obtener el listado de alumnos");
  }
});

app.get("/alumnos/:padron", async (req: Request, res: Response) => {
  try {
    const alumno = await sistemaAlumnos.obtenerAlumnoPorPadron(req.params.padron);
    res.render("alumno", {
      titulo: `Alumno ${alumno.getPadron()}`,
      alumno: aVista(alumno),
    });
  } catch (error: any) {
    registrarExcepcion(req, error);
    if (error instanceof AlumnoNoEncontradoError) {
      renderizarError(res, 404, `No se encontró el alumno con padrón ${req.params.padron}`);
    } else {
      renderizarError(res, 500, "No se pudo obtener el alumno");
    }
  }
});

app.post("/alumnos", async (req: Request, res: Response) => {
  try {
    const alumnoCreado: Alumno = await sistemaAlumnos.crearAlumno(req.body.padron, req.body.nombre, req.body.apellido);

    res.redirect(303, `/alumnos/${encodeURIComponent(alumnoCreado.getPadron())}`);
  } catch (error: any) {
    registrarExcepcion(req, error);
    if (error instanceof PadronDeAlumnoInvalido) {
      try {
        const alumnos = await sistemaAlumnos.obtenerAlumnos();
        res.status(400).render("alumnos", {
          titulo: "Alumnos",
          alumnos: alumnos.map(aVista),
          error: "El campo padron es obligatorio",
          nuevo: req.body,
        });
      } catch (error: any) {
        registrarExcepcion(req, error);
        renderizarError(res, 500, "No se pudo obtener el listado de alumnos");
      }
    } else {
      renderizarError(res, 500, "No se pudo crear el alumno");
    }
  }
});

app.post("/alumnos/:padron/eliminar", async (req: Request, res: Response) => {
  try {
    await sistemaAlumnos.eliminarAlumno(req.params.padron);
    res.redirect(303, "/alumnos");
  } catch (error: any) {
    registrarExcepcion(req, error);
    if (error instanceof AlumnoNoEncontradoError) {
      renderizarError(res, 404, `No se encontró el alumno con padrón ${req.params.padron}`);
    } else {
      renderizarError(res, 500, "No se pudo eliminar el alumno");
    }
  }
});

const server = app
  .listen(port, () => {
    console.log("El servidor está corriendo en el puerto: ", port);
  })
  .on("error", (error) => {
    console.log("Error: ", error.message);
  });

export { app, server };
