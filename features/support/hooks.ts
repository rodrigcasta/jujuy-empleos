import { AfterAll, Before, BeforeAll } from "@cucumber/cucumber";
import { server } from "../../app/programa";
import pool from "../../app/adaptadores/pool";
import RepositorioAlumnoSql from "../../app/adaptadores/repositorio-alumno-sql";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";

// El log de requests de la aplicación se mezcla con la salida de Cucumber: se oculta salvo que se pida con
// MOSTRAR_LOG=1 (útil para investigar un escenario que falla)
const logOriginal = console.log;
const errorOriginal = console.error;

BeforeAll(() => {
  if (!process.env.MOSTRAR_LOG) {
    console.log = () => undefined;
    console.error = () => undefined;
  }
});

// Cada escenario empieza con la base de datos vacía
Before(async () => {
  await new RepositorioAlumnoSql().eliminarTodos();
  await new RepositorioUsuarioSql().eliminarTodos();
});

AfterAll(async () => {
  console.log = logOriginal;
  console.error = errorOriginal;
  server.close();
  await pool.end();
});
