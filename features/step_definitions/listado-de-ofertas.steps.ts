import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import RepositorioOfertaSql from "../../app/adaptadores/repositorio-oferta-sql";
import { MundoDeLaAplicacion } from "../support/mundo";

Given("que no existen ofertas", async function () {
  await new RepositorioOfertaSql().eliminarTodos();
});

When("visualizo la lista de ofertas", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/ofertas");
});

Then("la lista se muestra vacia", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina.getByRole("heading", { name: "Ofertas laborales", level: 1 })).toBeVisible();
  await expect(this.pagina.getByText("No hay ofertas publicadas", { exact: true })).toBeVisible();
});
