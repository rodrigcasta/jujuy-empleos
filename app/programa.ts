import SistemaAlumnos from "./dominio/sistema-alumnos";
import Alumno from "./dominio/alumno";
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

app.post("/alumnos", (req: Request, res: Response) => {
  sistemaAlumnos
    .crearAlumno(req.body.padron, req.body.nombre, req.body.apellido, req.body.fechaNacimiento)
    .then((alumnoCreado) => {
      res.json(alumnoCreado);
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
