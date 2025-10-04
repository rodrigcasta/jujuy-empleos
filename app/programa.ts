import Alumno from "./dominio/alumno";
import AlumnoNoEncontradoError from "../app/dominio/alumno-no-encontrado-error";
import express, { Request, Response } from "express";
import PadronDeAlumnoInvalido from "../app/dominio/padron-de-alumno-invalido";
import SistemaAlumnos from "./dominio/sistema-alumnos";

const app = express();
const port = 3000;

app.use(express.json());

const sistemaAlumnos = new SistemaAlumnos();

app.get("/alumnos", async (req: Request, res: Response) => {
  const alumnos = await sistemaAlumnos.obtenerAlumnos();
  res.json(alumnos);
});

app.get("/alumnos/:padron", async (req: Request, res: Response) => {
  try {
    const alumno = await sistemaAlumnos.obtenerAlumnoPorPadron(req.params.padron);
    res.json(alumno);
  } catch (error: any) {
    if (error instanceof AlumnoNoEncontradoError) {
      res.status(404).json({
        error: `No se encontró el alumno con padrón ${req.params.padron}`,
      });
    } else {
      res.status(500);
    }
  }
});

app.post("/alumnos", async (req: Request, res: Response) => {
  try {
    const alumnoCreado: Alumno = await sistemaAlumnos.crearAlumno(
      req.body.padron,
      req.body.nombre,
      req.body.apellido,
      req.body.fechaNacimiento,
    );

    res.json(alumnoCreado);
  } catch (error: any) {
    if (error instanceof PadronDeAlumnoInvalido) {
      res.status(400).json({
        error: "El campo padron es obligatorio",
      });
    } else {
      res.status(500);
    }
  }
});

app.delete("/alumnos/:padron", async (req: Request, res: Response) => {
  try {
    await sistemaAlumnos.eliminarAlumno(req.params.padron);
    res.status(200).json({ mensaje: "Alumno eliminado correctamente" });
  } catch (error: any) {
    if (error instanceof AlumnoNoEncontradoError) {
      res.status(404).json({
        error: `No se encontró el alumno con padrón ${req.params.padron}`,
      });
    } else {
      res.status(500);
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
