import express from "express";
import path from "path";
import SistemaAlumnos from "./dominio/sistema-alumnos";
import SistemaUsuarios from "./dominio/sistema-usuarios";
import RepositorioAlumnoSql from "./adaptadores/repositorio-alumno-sql";
import RepositorioUsuarioSql from "./adaptadores/repositorio-usuario-sql";
import { configurarAutenticacion, requiereAutenticacion } from "./web/autenticacion";
import { logDeRequests } from "./web/log-de-requests";
import { crearControladorInicio } from "./controladores/controlador-inicio";
import { crearControladorAutenticacion } from "./controladores/controlador-autenticacion";
import { crearControladorAlumnos } from "./controladores/controlador-alumnos";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "vistas"));

// Archivos de Bootstrap (CSS y JS) servidos desde node_modules. Se montan antes del log para no registrar
// cada request de estos archivos estáticos.
const directorioBootstrap = path.join(path.dirname(require.resolve("bootstrap/package.json")), "dist");
app.use("/vendor/bootstrap", express.static(directorioBootstrap));

app.use(logDeRequests);

const sistemaAlumnos = new SistemaAlumnos(new RepositorioAlumnoSql());
const sistemaUsuarios = new SistemaUsuarios(new RepositorioUsuarioSql());

configurarAutenticacion(app, sistemaUsuarios);

app.use(crearControladorInicio());
app.use(crearControladorAutenticacion(sistemaUsuarios));
// Ningún usuario anónimo puede acceder a las páginas de alumnos
app.use("/alumnos", requiereAutenticacion, crearControladorAlumnos(sistemaAlumnos));

const server = app
  .listen(port, () => {
    console.log("El servidor está corriendo en el puerto: ", port);
  })
  .on("error", (error) => {
    console.log("Error: ", error.message);
  });

export { port, server };
