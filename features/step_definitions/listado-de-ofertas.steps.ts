import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import RepositorioOfertaSql from "../../app/adaptadores/repositorio-oferta-sql";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import Oferta from "../../app/dominio/oferta";
import Usuario from "../../app/dominio/usuario";
import { MundoDeLaAplicacion } from "../support/mundo";

const FECHA_DE_REFERENCIA = new Date("2026-11-04T15:00:00.000Z");

Given(
  "que existe la oferta con titulo {string}, descripcion {string} y ubicacion {string}",
  async function (titulo: string, descripcion: string, ubicacion: string) {
    const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
    await new RepositorioUsuarioSql().guardar(empresario);
    await new RepositorioOfertaSql().guardar(
      new Oferta(titulo, descripcion, ubicacion, empresario.obtenerId(), new Date("2026-11-04T15:00:00.000Z")),
    );
  },
);

Given("no soy un usuario registrado", function () {
  // Cada escenario comienza con un contexto de navegador nuevo y sin cookies.
});

Given("que no existen ofertas", async function () {
  await new RepositorioOfertaSql().eliminarTodos();
});

Given(
  /^que existe la oferta con titulo "([^"]+)" que fue creada hace (\d+) dias?$/,
  async function (titulo: string, cantidadDias: string) {
    const diasDesdePublicacion = Number(cantidadDias);
    const fechaPublicacion = new Date(FECHA_DE_REFERENCIA);
    fechaPublicacion.setUTCDate(fechaPublicacion.getUTCDate() - diasDesdePublicacion);
    const empresario = new Usuario("Laura", "Fernandez", `laura${diasDesdePublicacion}@example.com`, "hash");
    await new RepositorioUsuarioSql().guardar(empresario);
    await new RepositorioOfertaSql().guardar(
      new Oferta(titulo, `Descripcion de ${titulo}`, "Buenos Aires", empresario.obtenerId(), fechaPublicacion),
    );
  },
);

Given("que existen {int} ofertas", async function (cantidadOfertas: number) {
  const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
  await new RepositorioUsuarioSql().guardar(empresario);
  const repositorioOferta = new RepositorioOfertaSql();
  for (let numeroOferta = 1; numeroOferta <= cantidadOfertas; numeroOferta += 1) {
    await repositorioOferta.guardar(
      new Oferta(
        `Oferta ${numeroOferta}`,
        `Descripcion de la oferta ${numeroOferta}`,
        "Buenos Aires",
        empresario.obtenerId(),
        FECHA_DE_REFERENCIA,
      ),
    );
  }
});

When("visualizo la lista de ofertas", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/ofertas");
});

Then("la lista se muestra vacia", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina.getByRole("heading", { name: "Ofertas laborales", level: 1 })).toBeVisible();
  await expect(this.pagina.getByText("No hay ofertas publicadas", { exact: true })).toBeVisible();
});

Then(
  "se muestra la oferta con titulo {string}, descripcion {string} y ubicacion {string}",
  async function (this: MundoDeLaAplicacion, titulo: string, descripcion: string, ubicacion: string) {
    await expect(this.pagina.getByRole("heading", { name: titulo })).toBeVisible();
    await expect(this.pagina.getByText(descripcion, { exact: true })).toBeVisible();
    await expect(this.pagina.getByText(ubicacion, { exact: true })).toBeVisible();
  },
);

Then("la oferta con titulo {string} se muestra primera", async function (this: MundoDeLaAplicacion, titulo: string) {
  await expect(this.pagina.locator("article h2").nth(0)).toHaveText(titulo);
});

Then("la oferta con titulo {string} se muestra segunda", async function (this: MundoDeLaAplicacion, titulo: string) {
  await expect(this.pagina.locator("article h2").nth(1)).toHaveText(titulo);
});

Then("la lista muestra las {int} ofertas", async function (this: MundoDeLaAplicacion, cantidadOfertas: number) {
  await expect(this.pagina.locator("article")).toHaveCount(cantidadOfertas);
});
