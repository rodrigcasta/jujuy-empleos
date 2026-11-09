import assert from "node:assert/strict";
import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import pool from "../../app/adaptadores/pool";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import SistemaUsuarios from "../../app/dominio/sistema-usuarios";
import { registrarse } from "../support/acciones";
import { MundoDeLaAplicacion } from "../support/mundo";

Given("que existe un aspirante registrado con email {string}", async function (email: string) {
  await new SistemaUsuarios(new RepositorioUsuarioSql()).registrarAspirante("Pedro", "Sanchez", email, "Empleo2026!#");
});

When("se registra con los datos:", async function (this: MundoDeLaAplicacion, tabla: DataTable) {
  const datos = tabla.rowsHash();
  await registrarse(this, {
    nombre: datos["nombre"],
    apellido: datos["apellido"],
    email: datos["email"],
    contraseña: datos["contraseña"],
    confirmación: datos["confirmación"],
    suscripcion: datos["suscripcion"],
    tipoUsuario: datos["tipo_usuario"],
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
    await registrarse(this, { nombre, apellido, email, contraseña, confirmación, tipoUsuario: "Empresario" });
  },
);

When(
  "Pedro Sanchez intenta registrarse como empresario con email {string}, contrasena {string}, confirmacion {string} y suscripcion {string}",
  async function (
    this: MundoDeLaAplicacion,
    email: string,
    contrasena: string,
    confirmacion: string,
    suscripcion: string,
  ) {
    const resultado = await pool.query("SELECT COUNT(*)::int AS cantidad FROM usuarios");
    this.cantidadUsuariosAntes = resultado.rows[0].cantidad;
    await registrarse(this, {
      nombre: "Pedro",
      apellido: "Sanchez",
      email,
      contraseña: contrasena,
      confirmación: confirmacion,
      suscripcion,
      tipoUsuario: "Empresario",
    });
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

When("inicia una registracion como empresario", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/registro");
  await this.pagina.getByText("Empresario", { exact: true }).click();
});

Then("puede elegir las suscripciones:", async function (this: MundoDeLaAplicacion, tabla: DataTable) {
  for (const [suscripcion] of tabla.raw()) {
    await expect(this.pagina.getByLabel(suscripcion)).toBeVisible();
  }
});

Then("la suscripcion inicial es {string}", async function (this: MundoDeLaAplicacion, suscripcion: string) {
  await expect(this.pagina.getByLabel(suscripcion)).toBeChecked();
});

Then(
  "el usuario {string} queda registrado con suscripcion {string}",
  async function (email: string, suscripcion: string) {
    const resultado = await pool.query<{ suscripcion: string }>("SELECT suscripcion FROM usuarios WHERE email = $1", [
      email,
    ]);

    assert.equal(resultado.rows.length, 1, `No existe el usuario ${email}`);
    assert.equal(resultado.rows[0].suscripcion, suscripcion);
  },
);

Then(
  "se informan los requisitos de contraseña {string}",
  async function (this: MundoDeLaAplicacion, requisitos: string) {
    await expect(this.pagina.locator("#ayuda-contrasena")).toHaveText(requisitos);
  },
);
