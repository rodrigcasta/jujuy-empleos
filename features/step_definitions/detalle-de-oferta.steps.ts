import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { MundoDeLaAplicacion } from "../support/mundo";

Given("fue publicada por el empresario con email {string}", function (this: MundoDeLaAplicacion, email: string) {
  assert.equal(this.emailEmpresario, email);
});

When(
  "selecciono la oferta {string} desde el listado de ofertas",
  async function (this: MundoDeLaAplicacion, titulo: string) {
    await this.pagina.goto("/ofertas");
    await this.pagina.getByRole("link", { name: titulo, exact: true }).click();
  },
);

Then("veo que el titulo es {string}", async function (this: MundoDeLaAplicacion, titulo: string) {
  await expect(this.pagina.getByRole("heading", { name: titulo, exact: true })).toBeVisible();
});

Then("la descripcion es {string}", async function (this: MundoDeLaAplicacion, descripcion: string) {
  await expect(this.pagina.getByText(descripcion, { exact: true })).toBeVisible();
});

Then("la ubicacion es {string}", async function (this: MundoDeLaAplicacion, ubicacion: string) {
  await expect(this.pagina.getByText(ubicacion, { exact: true })).toBeVisible();
});

Then("el email del empresario es {string}", async function (this: MundoDeLaAplicacion, email: string) {
  await expect(this.pagina.getByRole("link", { name: email, exact: true })).toBeVisible();
});

Then("puedo volver al listado de ofertas", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina.getByRole("link", { name: /Volver/ })).toHaveAttribute("href", "/ofertas");
});
