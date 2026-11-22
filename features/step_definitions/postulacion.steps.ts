import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import pool from "../../app/adaptadores/pool";
import RepositorioOfertaSql from "../../app/adaptadores/repositorio-oferta-sql";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import { EstadoHttp } from "../../app/web/estado-http";
import Oferta from "../../app/dominio/oferta";
import SistemaUsuarios from "../../app/dominio/sistema-usuarios";
import { MundoDeLaAplicacion } from "../support/mundo";

Given("que no hay un usuario autenticado", function () {
  // Cada escenario comienza con un contexto de navegador nuevo y sin sesión.
});

Given(
  "que existe la oferta {string} publicada por {string}",
  async function (this: MundoDeLaAplicacion, titulo: string, emailEmpresario: string) {
    const contrasena = "Empresa2026!#";
    const empresario = await new SistemaUsuarios(new RepositorioUsuarioSql()).registrarEmpresario(
      "Laura",
      "Fernandez",
      emailEmpresario,
      contrasena,
      contrasena,
      "Profesional",
    );
    this.contrasenasUsuarios.set(emailEmpresario, contrasena);
    await new RepositorioOfertaSql(new RepositorioUsuarioSql()).guardar(
      new Oferta(
        titulo,
        "Desarrollo y mantenimiento de servicios backend",
        "Buenos Aires",
        empresario,
        new Date("2026-11-09T15:00:00.000Z"),
      ),
    );
  },
);

When("se postula a la oferta {string} desde su detalle", async function (this: MundoDeLaAplicacion, titulo: string) {
  const resultado = await pool.query<{ id: number }>("SELECT id FROM ofertas WHERE titulo = $1", [titulo]);
  assert.equal(resultado.rows.length, 1);
  await this.pagina.goto(`/ofertas/${resultado.rows[0].id}`);
  await this.presionar("Postularse");
});

Given("ya se postuló a la oferta {string}", async function (this: MundoDeLaAplicacion, titulo: string) {
  const resultado = await pool.query<{ id: number }>("SELECT id FROM ofertas WHERE titulo = $1", [titulo]);
  assert.equal(resultado.rows.length, 1);
  await this.pagina.goto(`/ofertas/${resultado.rows[0].id}`);
  await this.presionar("Postularse");
});

When("intenta postularse nuevamente a la oferta {string}", async function (this: MundoDeLaAplicacion, titulo: string) {
  const resultado = await pool.query<{ id: number }>("SELECT id FROM ofertas WHERE titulo = $1", [titulo]);
  assert.equal(resultado.rows.length, 1);
  await this.pagina.goto(`/ofertas/${resultado.rows[0].id}`);
  await this.presionar("Postularse");
});

When("intenta postularse a la oferta {string}", async function (this: MundoDeLaAplicacion, titulo: string) {
  const resultado = await pool.query<{ id: number }>("SELECT id FROM ofertas WHERE titulo = $1", [titulo]);
  assert.equal(resultado.rows.length, 1);
  const rutaPostulacion = `/ofertas/${resultado.rows[0].id}/postulaciones`;
  await this.pagina.goto(`/ofertas/${resultado.rows[0].id}`);
  if (this.emailUsuarioAutenticado === undefined) {
    await this.presionar("Postularse");
    return;
  }
  await Promise.all([
    this.pagina.waitForEvent("framenavigated", (frame) => frame === this.pagina.mainFrame()),
    this.pagina.evaluate((ruta) => {
      const formulario = document.createElement("form");
      formulario.method = "post";
      formulario.action = ruta;
      document.body.appendChild(formulario);
      formulario.submit();
    }, rutaPostulacion),
  ]);
});

Then("ve el mensaje {string}", async function (this: MundoDeLaAplicacion, mensaje: string) {
  await expect(this.pagina.getByRole("alert")).toContainText(mensaje);
});

Then("es dirigido al inicio de sesión", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina).toHaveURL("/login");
});

Then("no se registra una postulación", async function () {
  const resultado = await pool.query<{ cantidad: string }>("SELECT COUNT(*) AS cantidad FROM postulaciones");
  assert.equal(Number(resultado.rows[0].cantidad), 0);
});

Then(
  "queda registrada una postulación de {string} a la oferta {string}",
  async function (emailAspirante: string, titulo: string) {
    const resultado = await pool.query<{ cantidad: string }>(
      `SELECT COUNT(*) AS cantidad
       FROM postulaciones
       INNER JOIN usuarios ON usuarios.id = postulaciones.id_aspirante
       INNER JOIN ofertas ON ofertas.id = postulaciones.id_oferta
       WHERE usuarios.email = $1 AND ofertas.titulo = $2`,
      [emailAspirante, titulo],
    );
    assert.equal(Number(resultado.rows[0].cantidad), 1);
  },
);

Then("conserva una única postulación a la oferta {string}", async function (this: MundoDeLaAplicacion, titulo: string) {
  const emailAspirante = this.emailUsuarioAutenticado;
  assert.ok(emailAspirante);
  const resultado = await pool.query<{ cantidad: string }>(
    `SELECT COUNT(*) AS cantidad
       FROM postulaciones
       INNER JOIN usuarios ON usuarios.id = postulaciones.id_aspirante
       INNER JOIN ofertas ON ofertas.id = postulaciones.id_oferta
       WHERE usuarios.email = $1 AND ofertas.titulo = $2`,
    [emailAspirante, titulo],
  );
  assert.equal(Number(resultado.rows[0].cantidad), 1);
});
Given("que la oferta {string} fue cerrada", async function (titulo: string) {
  const resultado = await pool.query<{ id: number }>("SELECT id FROM ofertas WHERE titulo = $1", [titulo]);
  assert.equal(resultado.rows.length, 1);
  const repositorioOferta = new RepositorioOfertaSql(new RepositorioUsuarioSql());
  const oferta = await repositorioOferta.recuperarPorId(resultado.rows[0].id);
  assert.ok(oferta);
  oferta.cerrarPor(oferta.obtenerTitular());
  await repositorioOferta.actualizar(oferta);
});

When(
  "envía directamente una postulación a la oferta {string}",
  async function (this: MundoDeLaAplicacion, titulo: string) {
    const resultado = await pool.query<{ id: number }>("SELECT id FROM ofertas WHERE titulo = $1", [titulo]);
    assert.equal(resultado.rows.length, 1);
    const rutaDetalle = `/ofertas/${resultado.rows[0].id}`;
    const respuesta = await this.pagina.request.post(`${rutaDetalle}/postulaciones`, { maxRedirects: 0 });

    expect(respuesta.status()).toBe(EstadoHttp.VER_OTRO);
    expect(respuesta.headers().location).toBe(rutaDetalle);
    await this.pagina.goto(rutaDetalle);
  },
);
