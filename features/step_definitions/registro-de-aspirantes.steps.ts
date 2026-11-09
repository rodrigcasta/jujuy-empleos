import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import pool from "../../app/adaptadores/pool";
import { registrarse } from "../support/acciones";
import { MundoDeLaAplicacion } from "../support/mundo";

Given("que no existe un usuario registrado con email {string}", async function (email: string) {
  const resultado = await pool.query("SELECT 1 FROM usuarios WHERE email = $1", [email]);
  assert.equal(resultado.rows.length, 0);
});

When(
  "Sofia Martinez se registra como aspirante con email {string}, contrasena {string} y confirmacion {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string, confirmacion: string) {
    this.emailUsuarioRegistrado = email;
    await registrarse(this, {
      nombre: "Sofia",
      apellido: "Martinez",
      email,
      contraseña: contrasena,
      confirmación: confirmacion,
      tipoUsuario: "Aspirante",
    });
  },
);

When(
  "Ana Torres intenta registrarse como aspirante con email {string}, contrasena {string} y confirmacion {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string, confirmacion: string) {
    this.emailUsuarioRegistrado = email;
    await registrarse(this, {
      nombre: "Ana",
      apellido: "Torres",
      email,
      contraseña: contrasena,
      confirmación: confirmacion,
      tipoUsuario: "Aspirante",
    });
  },
);

Then("la registracion resulta exitosa", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina).toHaveURL("/");
});

Then("Sofia queda registrada como aspirante", async function (this: MundoDeLaAplicacion) {
  assert.ok(this.emailUsuarioRegistrado);
  const resultado = await pool.query<{ tipo_usuario: string }>("SELECT tipo_usuario FROM usuarios WHERE email = $1", [
    this.emailUsuarioRegistrado,
  ]);
  assert.equal(resultado.rows.length, 1);
  assert.equal(resultado.rows[0].tipo_usuario, "Aspirante");
});

Then("no tiene una suscripcion asociada", async function (this: MundoDeLaAplicacion) {
  assert.ok(this.emailUsuarioRegistrado);
  const resultado = await pool.query<{ suscripcion: string | null }>(
    "SELECT suscripcion FROM usuarios WHERE email = $1",
    [this.emailUsuarioRegistrado],
  );
  assert.equal(resultado.rows.length, 1);
  assert.equal(resultado.rows[0].suscripcion, null);
});

Then("queda autenticada en la aplicacion", async function (this: MundoDeLaAplicacion) {
  assert.ok(this.emailUsuarioRegistrado);
  await expect(this.pagina.getByText(`Sofia (${this.emailUsuarioRegistrado})`)).toBeVisible();
});

Then("no se registra un nuevo usuario", async function (this: MundoDeLaAplicacion) {
  assert.ok(this.emailUsuarioRegistrado);
  const resultado = await pool.query("SELECT 1 FROM usuarios WHERE email = $1", [this.emailUsuarioRegistrado]);
  assert.equal(resultado.rows.length, 0);
});
