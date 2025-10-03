import SistemaAlumnos from "./dominio/sistema-alumnos";
import express, { Request, Response } from "express";

const app = express();
const port = 3000;

const sistemaAlumnos = new SistemaAlumnos();

app.get("/alumnos", (req: Request, res: Response) => {
  const alumnos = sistemaAlumnos.obtenerAlumnos();
  res.json(JSON.stringify(alumnos));
});

const server = app
  .listen(port, () => {
    console.log("Server running at PORT: ", port);
  })
  .on("error", (error) => {
    throw new Error(error.message);
  });

export { app, server };
