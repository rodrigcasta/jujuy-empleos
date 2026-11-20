import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import pool from "../../app/adaptadores/pool";
import RepositorioOfertaSql from "../../app/adaptadores/repositorio-oferta-sql";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import Oferta from "../../app/dominio/oferta";
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
  if (!mundo.pagina.url().includes("/ofertas/nueva")) {
    return;
  }
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
    tipoUsuario: "Empresario",
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
    tipoUsuario: "Empresario",
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
  this.cantidadOfertasAntes = Number(resultado.rows[0].cantidad);
  assert.equal(this.cantidadOfertasAntes, 0);
});

Given(/^ya publico (\d+) ofertas?$/, async function (this: MundoDeLaAplicacion, cantidad: string) {
  assert.ok(this.emailEmpresario);
  const resultado = await pool.query<{ id: number }>("SELECT id FROM usuarios WHERE email = $1", [
    this.emailEmpresario,
  ]);
  assert.equal(resultado.rows.length, 1);
  const repositorioOferta = new RepositorioOfertaSql(new RepositorioUsuarioSql());
  this.cantidadOfertasAntes = Number(cantidad);
  for (let numero = 1; numero <= this.cantidadOfertasAntes; numero += 1) {
    await repositorioOferta.guardar(
      new Oferta(
        `Oferta ${numero}`,
        `Descripcion de la oferta ${numero}`,
        "Buenos Aires",
        resultado.rows[0].id,
        new Date("2026-11-02T15:00:00.000Z"),
      ),
    );
  }
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
  await expect(this.pagina.getByText("Completá los datos para comenzar la búsqueda de candidatos.")).toBeVisible();
  await expect(this.pagina.locator(".text-primary")).toHaveCount(3);
  await expect(this.pagina.getByLabel("Título")).toHaveAttribute("placeholder", "Ej. Desarrollador backend");
  await expect(this.pagina.getByLabel("Descripción")).toHaveAttribute(
    "placeholder",
    "Describí las responsabilidades y los requisitos del puesto",
  );
  await expect(this.pagina.getByLabel("Ubicación")).toHaveAttribute("placeholder", "Ej. Tres de Febrero");
  await expect(this.pagina.getByRole("button", { name: "Publicar oferta" })).toHaveClass(/w-100/);
  assert.ok(this.ultimaOferta);
  await expect(this.pagina.getByLabel("Título")).toHaveValue(this.ultimaOferta.titulo);
  await expect(this.pagina.getByLabel("Descripción")).toHaveValue(this.ultimaOferta.descripcion);
  await expect(this.pagina.getByLabel("Ubicación")).toHaveValue(this.ultimaOferta.ubicacion);

  const enlaceNuevaOferta = this.pagina.getByRole("link", {
    name: "Nueva oferta",
  });

  await expect(enlaceNuevaOferta).toBeVisible();
  await expect(enlaceNuevaOferta).toHaveAttribute("href", "/ofertas/nueva");

  if (this.cantidadOfertasAntes !== undefined && this.emailEmpresario) {
    const resultado = await pool.query<{ cantidad: string }>(
      `SELECT COUNT(*) AS cantidad
       FROM ofertas
       JOIN usuarios ON usuarios.id = ofertas.id_empresario
       WHERE usuarios.email = $1`,
      [this.emailEmpresario],
    );
    assert.equal(Number(resultado.rows[0].cantidad), this.cantidadOfertasAntes + 1);
  }
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

Then(
  "la publicacion es rechazada porque su suscripcion no permite publicar mas ofertas",
  async function (this: MundoDeLaAplicacion) {
    await expect(this.pagina).toHaveURL(/\/?limite=ofertas$/);
    await expect(this.pagina.getByRole("heading", { name: "Inicio" })).toBeVisible();
    await expect(this.pagina.getByRole("alert")).toContainText(
      "Alcanzaste el límite de publicaciones permitido por tu suscripción.",
    );
    assert.ok(this.emailEmpresario);
    assert.notEqual(this.cantidadOfertasAntes, undefined);
    const resultado = await pool.query<{ cantidad: string }>(
      `SELECT COUNT(*) AS cantidad
       FROM ofertas
       JOIN usuarios ON usuarios.id = ofertas.id_empresario
       WHERE usuarios.email = $1`,
      [this.emailEmpresario],
    );
    assert.equal(Number(resultado.rows[0].cantidad), this.cantidadOfertasAntes);
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
  await expect(
    this.pagina.getByRole("link", {
      name: "Nueva oferta",
    }),
  ).toHaveCount(0);
});
