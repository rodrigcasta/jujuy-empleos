import express from "express";
import { AddressInfo } from "net";
import path from "path";
import SistemaUsuarios from "./dominio/sistema-usuarios";
import RepositorioUsuarioSql from "./adaptadores/repositorio-usuario-sql";
import RepositorioOfertaSql from "./adaptadores/repositorio-oferta-sql";
import { configurarAutenticacion } from "./web/autenticacion";
import { logDeRequests } from "./web/log-de-requests";
import { crearControladorInicio } from "./controladores/controlador-inicio";
import { crearControladorAutenticacion } from "./controladores/controlador-autenticacion";
import SistemaOfertas from "./dominio/sistema-ofertas";
import { crearControladorOfertas } from "./controladores/controlador-ofertas";
import RepositorioPostulacionSql from "./adaptadores/repositorio-postulacion-sql";
import SistemaPostulaciones from "./dominio/sistema-postulaciones";
import { crearControladorCuenta } from "./controladores/controlador-cuenta";
import ProveedorFechaDelSistema from "./adaptadores/proveedor-fecha-del-sistema";

const app = express();
const port = parseInt(process.env.PORT || "3000");

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "vistas"));

// Archivos de Bootstrap (CSS y JS) servidos desde node_modules. Se montan antes del log para no registrar
// cada request de estos archivos estáticos.
const directorioBootstrap = path.join(path.dirname(require.resolve("bootstrap/package.json")), "dist");
app.use("/vendor/bootstrap", express.static(directorioBootstrap));

app.use(logDeRequests);

const sistemaUsuarios = new SistemaUsuarios(new RepositorioUsuarioSql());
const sistemaOfertas = new SistemaOfertas(new RepositorioOfertaSql(new RepositorioUsuarioSql()));
const sistemaPostulaciones = new SistemaPostulaciones(new RepositorioPostulacionSql(), new ProveedorFechaDelSistema());

configurarAutenticacion(app, sistemaUsuarios);

app.use(crearControladorInicio());
app.use(crearControladorAutenticacion(sistemaUsuarios));
app.use(crearControladorCuenta());
app.use("/ofertas", crearControladorOfertas(sistemaOfertas, sistemaPostulaciones));

const server = app
  .listen(port, () => {
    console.log("El servidor está corriendo en el puerto: ", (server.address() as AddressInfo).port);
  })
  .on("error", (error) => {
    console.log("Error: ", error.message);
  });

export { port, server };
