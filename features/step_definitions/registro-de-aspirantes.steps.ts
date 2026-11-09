import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import pool from "../../app/adaptadores/pool";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import SistemaUsuarios from "../../app/dominio/sistema-usuarios";
import { registrarse } from "../support/acciones";
import { MundoDeLaAplicacion } from "../support/mundo";

Given("que no existe un usuario registrado con email {string}", async function (email: string) {
  const resultado = await pool.query("SELECT 1 FROM usuarios WHERE email = $1", [email]);
  assert.equal(resultado.rows.length, 0);
});

Given("que existe un empresario registrado con email {string}", async function (email: string) {
  await new SistemaUsuarios(new RepositorioUsuarioSql()).registrar("Maria", "Gonzalez", email, "Empresa2026!#");
});

Given("que Sofia eligio registrarse como aspirante", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/registro");
  await this.pagina.getByText("Aspirante", { exact: true }).click();
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
    const resultado = await pool.query("SELECT COUNT(*)::int AS cantidad FROM usuarios");
    this.cantidadUsuariosAntes = resultado.rows[0].cantidad;
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

When(
  "Maria Gonzalez intenta registrarse como aspirante con email {string}, contrasena {string} y confirmacion {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string, confirmacion: string) {
    this.emailUsuarioRegistrado = email;
    const resultado = await pool.query("SELECT COUNT(*)::int AS cantidad FROM usuarios");
    this.cantidadUsuariosAntes = resultado.rows[0].cantidad;
    await registrarse(this, {
      nombre: "Maria",
      apellido: "Gonzalez",
      email,
      contraseña: contrasena,
      confirmación: confirmacion,
      tipoUsuario: "Aspirante",
    });
  },
);

When(
  "intenta registrarse con nombre vacio, apellido {string}, email {string}, contrasena {string} y confirmacion {string}",
  async function (
    this: MundoDeLaAplicacion,
    apellido: string,
    email: string,
    contrasena: string,
    confirmacion: string,
  ) {
    await this.pagina.getByLabel("Nombre").fill("");
    await this.pagina.getByLabel("Apellido").fill(apellido);
    await this.pagina.getByLabel("Email").fill(email);
    await this.pagina.getByLabel("Contraseña *", { exact: true }).fill(contrasena);
    await this.pagina.getByLabel("Repetir contraseña *", { exact: true }).fill(confirmacion);
    await this.presionar("Crear cuenta");
  },
);

When(
  "intenta registrarse sin seleccionar tipo de usuario con nombre {string}, apellido {string}, email {string}, contrasena {string} y confirmacion {string}",
  async function (
    this: MundoDeLaAplicacion,
    nombre: string,
    apellido: string,
    email: string,
    contrasena: string,
    confirmacion: string,
  ) {
    const resultado = await pool.query("SELECT COUNT(*)::int AS cantidad FROM usuarios");
    this.cantidadUsuariosAntes = resultado.rows[0].cantidad;
    await this.pagina.goto("/registro");
    await this.pagina.getByLabel("Nombre").fill(nombre);
    await this.pagina.getByLabel("Apellido").fill(apellido);
    await this.pagina.getByLabel("Email").fill(email);
    await this.pagina.getByLabel("Contraseña *", { exact: true }).fill(contrasena);
    await this.pagina.getByLabel("Repetir contraseña *", { exact: true }).fill(confirmacion);
    await this.presionar("Crear cuenta");
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
  assert.notEqual(this.cantidadUsuariosAntes, undefined);
  const resultado = await pool.query("SELECT COUNT(*)::int AS cantidad FROM usuarios");
  assert.equal(resultado.rows[0].cantidad, this.cantidadUsuariosAntes);
});

Then("continua seleccionada la opcion {string}", async function (this: MundoDeLaAplicacion, opcion: string) {
  await expect(this.pagina.getByRole("radio", { name: opcion })).toBeChecked();
});
