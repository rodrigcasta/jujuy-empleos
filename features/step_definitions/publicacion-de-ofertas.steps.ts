import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import pool from "../../app/adaptadores/pool";
import { registrarse } from "../support/acciones";
import { MundoDeLaAplicacion } from "../support/mundo";

const completarYEnviarOferta = async (
  mundo: MundoDeLaAplicacion,
  titulo: string,
  descripcion: string,
  ubicacion: string,
) => {
  mundo.ultimaOferta = { titulo, descripcion, ubicacion };
  await mundo.pagina.goto("/ofertas/nueva");
  await mundo.pagina.locator("[maxlength]").evaluateAll((campos) => {
    campos.forEach((campo) => campo.removeAttribute("maxlength"));
  });
  await mundo.pagina.getByLabel("Título").fill(titulo);
  await mundo.pagina.getByLabel("Descripción").fill(descripcion);
  await mundo.pagina.getByLabel("Ubicación").fill(ubicacion);
  await mundo.pagina.locator('form[action="/ofertas"]').evaluate((formulario: HTMLFormElement) => {
    formulario.noValidate = true;
  });
  await mundo.presionar("Publicar oferta");
};

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

Given("su suscripcion permite publicar una nueva oferta", async function (this: MundoDeLaAplicacion) {
  assert.ok(this.emailEmpresario);
  await registrarse(this, {
    nombre: "Laura",
    apellido: "Fernandez",
    email: this.emailEmpresario,
    contraseña: "Empresa2026!#",
    confirmación: "Empresa2026!#",
    suscripcion: "Gratuita",
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
    await completarYEnviarOferta(this, titulo, descripcion, ubicacion);
  },
);

When(
  "intenta publicar una oferta con titulo {string}, descripcion {string} y ubicacion {string}",
  async function (this: MundoDeLaAplicacion, titulo: string, descripcion: string, ubicacion: string) {
    await completarYEnviarOferta(this, titulo, descripcion, ubicacion);
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

const comprobarRechazo = async (mundo: MundoDeLaAplicacion, mensaje: string) => {
  await expect(mundo.pagina.getByRole("alert")).toContainText(mensaje);
  assert.ok(mundo.ultimaOferta);
  await expect(mundo.pagina.getByLabel("Título")).toHaveValue(mundo.ultimaOferta.titulo);
  await expect(mundo.pagina.getByLabel("Descripción")).toHaveValue(mundo.ultimaOferta.descripcion);
  await expect(mundo.pagina.getByLabel("Ubicación")).toHaveValue(mundo.ultimaOferta.ubicacion);
};

Then("la publicacion es rechazada porque el titulo es obligatorio", async function (this: MundoDeLaAplicacion) {
  await comprobarRechazo(this, "titulo es obligatorio");
});

Then(
  "la publicacion es rechazada porque el titulo supera los 50 caracteres",
  async function (this: MundoDeLaAplicacion) {
    await comprobarRechazo(this, "El titulo tiene más de 50 caracteres");
  },
);

Then("la publicacion es rechazada porque la descripcion es obligatoria", async function (this: MundoDeLaAplicacion) {
  await comprobarRechazo(this, "descripcion es obligatorio");
});

Then("la publicacion es rechazada porque la ubicacion es obligatoria", async function (this: MundoDeLaAplicacion) {
  await comprobarRechazo(this, "ubicacion es obligatorio");
});

Then(
  "la publicacion es rechazada porque la descripcion supera los 250 caracteres",
  async function (this: MundoDeLaAplicacion) {
    await comprobarRechazo(this, "La descripción tiene mas de 250 caracteres");
  },
);

Then(
  "la publicacion es rechazada porque la ubicacion supera los 70 caracteres",
  async function (this: MundoDeLaAplicacion) {
    await comprobarRechazo(this, "La ubicación tiene más de 70 caracteres");
  },
);

Given("que el usuario no esta autenticado", function () {
  // Cada escenario comienza con un contexto de navegador nuevo y sin cookies.
});

When("intenta acceder a la publicacion de ofertas", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/ofertas/nueva");
});

Then("debe autenticarse antes de publicar una oferta", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina).toHaveURL(/\/login$/);
});
