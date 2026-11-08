import { once } from "node:events";
import { setTimeout } from "node:timers/promises";
import { After, AfterAll, Before, BeforeAll, setDefaultTimeout, Status } from "@cucumber/cucumber";
import { Browser, chromium } from "@playwright/test";
import { port, server } from "../../app/programa";
import pool from "../../app/adaptadores/pool";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import RepositorioOfertaSql from "../../app/adaptadores/repositorio-oferta-sql";
import { MundoDeLaAplicacion } from "./mundo";

// Mayor que el tiempo de espera de Playwright, para que un step que falla lo informe Playwright (indicando qué
// esperaba encontrar en la página) en lugar de Cucumber (que solo indica que se agotó el tiempo)
setDefaultTimeout(15_000);

// El log de requests de la aplicación se mezcla con la salida de Cucumber: se oculta salvo que se pida con
// MOSTRAR_LOG=1 (útil para investigar un escenario que falla)
const logOriginal = console.log;
const errorOriginal = console.error;

// La aplicación empieza a escuchar al importarla. Si el puerto estuviera ocupado por otro proceso,
// el navegador usaría esa otra aplicación (que podría no usar la base de pruebas)
const esperarServidor = async () => {
  if (server.listening) {
    return;
  }
  const demora = setTimeout(2_000).then(() => {
    throw new Error(`La aplicación no pudo escuchar en el puerto ${port}: lo está usando otro proceso`);
  });
  await Promise.race([once(server, "listening"), demora]);
};

// Un único navegador para todos los escenarios: abrirlo es lo más lento
let navegador: Browser | undefined;

BeforeAll(async () => {
  if (!process.env.MOSTRAR_LOG) {
    console.log = () => undefined;
    console.error = () => undefined;
  }
  // Con MOSTRAR_NAVEGADOR=1 se abre la ventana del navegador y se demora cada acción, para poder seguir los escenarios
  const mostrarNavegador = Boolean(process.env.MOSTRAR_NAVEGADOR);
  navegador = await chromium.launch({ headless: !mostrarNavegador, slowMo: mostrarNavegador ? 300 : 0 });
  await esperarServidor();
});

// Cada escenario empieza con la base de datos vacía y un navegador sin sesión
Before(async function (this: MundoDeLaAplicacion) {
  await new RepositorioOfertaSql().eliminarTodos();
  await new RepositorioUsuarioSql().eliminarTodos();
  // Si BeforeAll falló, Cucumber no ejecuta los escenarios: acá el navegador siempre está abierto
  await this.abrirNavegador(navegador as Browser);
});

After(async function (this: MundoDeLaAplicacion, { result }) {
  // El reporte HTML incluye cómo se veía la página cuando falló el escenario
  if (result?.status === Status.FAILED) {
    await this.attach(await this.pagina.screenshot({ fullPage: true }), "image/png");
  }
  await this.cerrarNavegador();
});

AfterAll(async () => {
  console.log = logOriginal;
  console.error = errorOriginal;
  // Si el servidor o el pool quedaran abiertos, el proceso no terminaría
  server.close();
  await pool.end();
  // No está abierto si falló BeforeAll, por ejemplo porque no se pudo descargar Chromium
  await navegador?.close();
});
