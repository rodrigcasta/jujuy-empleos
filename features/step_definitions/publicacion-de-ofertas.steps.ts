import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import pool from "../../app/adaptadores/pool";
import { registrarse } from "../support/acciones";
import { MundoDeLaAplicacion } from "../support/mundo";

Given("que el empresario {string} esta autenticado", async function (this: MundoDeLaAplicacion, email: string) {
  this.emailEmpresario = email;
});

Given("tiene una suscripcion {string}", async function (this: MundoDeLaAplicacion, suscripcion: string) {
  assert.ok(this.emailEmpresario);
  await registrarse(this, {
    nombre: "Laura",
    apellido: "Fernandez",
    email: this.emailEmpresario,
    contraseña: "Empresa2026!#",
    confirmación: "Empresa2026!#",
    suscripcion,
  });
});

Given("todavia no publico ninguna oferta", async function (this: MundoDeLaAplicacion) {
  assert.ok(this.emailEmpresario);
  const resultado = await pool.query<{ cantidad: string }>(
    `SELECT COUNT(*) AS cantidad
     FROM ofertas
     JOIN usuarios ON usuarios.id = ofertas.id_empresario
     WHERE usuarios.email = $1`,
    [this.emailEmpresario],
  );
  assert.equal(Number(resultado.rows[0].cantidad), 0);
});

When(
  "publica una oferta con titulo {string}, descripcion {string} y ubicacion {string}",
  async function (this: MundoDeLaAplicacion, titulo: string, descripcion: string, ubicacion: string) {
    await this.pagina.goto("/ofertas/nueva");
    await this.pagina.getByLabel("Título").fill(titulo);
    await this.pagina.getByLabel("Descripción").fill(descripcion);
    await this.pagina.getByLabel("Ubicación").fill(ubicacion);
    await this.presionar("Publicar oferta");
  },
);

Then("la oferta se publica exitosamente", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina.getByRole("alert")).toContainText("La oferta se publicó exitosamente");
});

Then("queda asociada al empresario {string}", async function (email: string) {
  const resultado = await pool.query<{ email: string }>(
    `SELECT usuarios.email
     FROM ofertas
     JOIN usuarios ON usuarios.id = ofertas.id_empresario
     WHERE usuarios.email = $1`,
    [email],
  );
  assert.equal(resultado.rows.length, 1);
  assert.equal(resultado.rows[0].email, email);
});

Given("que el usuario no esta autenticado", function () {
  // Cada escenario comienza con un contexto de navegador nuevo y sin cookies.
});

When("intenta acceder a la publicacion de ofertas", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/ofertas/nueva");
});

Then("debe autenticarse antes de publicar una oferta", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina).toHaveURL(/\/login$/);
});
