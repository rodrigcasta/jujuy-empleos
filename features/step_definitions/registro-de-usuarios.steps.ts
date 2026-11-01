import assert from "node:assert/strict";
import { DataTable, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import pool from "../../app/adaptadores/pool";
import { registrarse } from "../support/acciones";
import { MundoDeLaAplicacion } from "../support/mundo";

When("se registra con los datos:", async function (this: MundoDeLaAplicacion, tabla: DataTable) {
  const datos = tabla.rowsHash();
  await registrarse(this, {
    nombre: datos["nombre"],
    apellido: datos["apellido"],
    email: datos["email"],
    contraseña: datos["contraseña"],
    confirmación: datos["confirmación"],
  });
});

When(
  "se registra con nombre {string}, apellido {string}, email {string}, contraseña {string} y confirmación {string}",
  async function (
    this: MundoDeLaAplicacion,
    nombre: string,
    apellido: string,
    email: string,
    contraseña: string,
    confirmación: string,
  ) {
    await registrarse(this, { nombre, apellido, email, contraseña, confirmación });
  },
);

Then("la contraseña de {string} no se guarda en texto plano", async function (email: string) {
  const resultado = await pool.query<{ hash_contrasena: string }>(
    "SELECT hash_contrasena FROM usuarios WHERE email = $1",
    [email],
  );
  assert.equal(resultado.rows.length, 1, `No existe el usuario ${email}`);
  assert.match(resultado.rows[0].hash_contrasena, /^\$2[aby]\$/, "La contraseña no está guardada como hash bcrypt");
});

When("inicia una registracion", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/registro");
});

Then("puede elegir las suscripciones:", async function (this: MundoDeLaAplicacion, tabla: DataTable) {
  for (const [suscripcion] of tabla.raw()) {
    await expect(this.pagina.getByLabel(suscripcion)).toBeVisible();
  }
});

Then("la suscripcion inicial es {string}", async function (this: MundoDeLaAplicacion, suscripcion: string) {
  await expect(this.pagina.getByLabel(suscripcion)).toBeChecked();
});
