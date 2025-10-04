import SistemaAlumnos from "./dominio/sistema-alumnos";
import Alumno from "./dominio/alumno";
import AlumnoNoEncontradoError from "../app/dominio/alumno-no-encontrado-error";
import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.use(express.json());

const sistemaAlumnos = new SistemaAlumnos();

app.get("/alumnos", (req: Request, res: Response) => {
  sistemaAlumnos.obtenerAlumnos().then((alumnos: Alumno[]) => {
    res.json(alumnos);
  });
});

app.get("/alumnos/:padron", (req: Request, res: Response) => {
  sistemaAlumnos
    .obtenerAlumnoPorPadron(req.params.padron)
    .then((alumno: Alumno) => {
      res.json(alumno);
    })
    .catch((error) => {
      if (error instanceof AlumnoNoEncontradoError) {
        res.status(404).json({
          error: `No se encontró el alumno con padrón ${req.params.padron}`,
        });
      } else {
        throw error;
      }
    });
});

app.post("/alumnos", (req: Request, res: Response) => {
  sistemaAlumnos
    .crearAlumno(req.body.padron, req.body.nombre, req.body.apellido, req.body.fechaNacimiento)
    .then((alumnoCreado) => {
      res.json(alumnoCreado);
    });
});

app.delete("/alumnos/:padron", (req: Request, res: Response) => {
  sistemaAlumnos
    .eliminarAlumno(req.params.padron)
    .then(() => {
      res.status(200).json({ mensaje: "Alumno eliminado correctamente" });
    })
    .catch((error) => {
      if (error instanceof AlumnoNoEncontradoError) {
        res.status(404).json({
          error: `No se encontró el alumno con padrón ${req.params.padron}`,
        });
      } else {
        throw error;
      }
    });
});

const server = app
  .listen(port, () => {
    console.log("El servidor está corriendo en el puerto: ", port);
  })
  .on("error", (error) => {
    throw new Error(error.message);
  });

export { app, server };
