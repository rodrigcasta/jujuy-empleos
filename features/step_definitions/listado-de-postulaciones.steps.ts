import assert from "node:assert/strict";
import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import pool from "../../app/adaptadores/pool";
import RepositorioPostulacionSql from "../../app/adaptadores/repositorio-postulacion-sql";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import RepositorioOfertaSql from "../../app/adaptadores/repositorio-oferta-sql";
import Postulacion from "../../app/dominio/postulacion";
import SistemaUsuarios from "../../app/dominio/sistema-usuarios";
import { MundoDeLaAplicacion } from "../support/mundo";

Given(
  "la oferta {string} recibió una postulación de {string} {string} con email {string} el {string}",
  async function (titulo: string, nombre: string, apellido: string, email: string, fecha: string) {
    const resultado = await pool.query<{ id: number }>("SELECT id FROM ofertas WHERE titulo = $1", [titulo]);
    assert.equal(resultado.rows.length, 1);
    const repositorioUsuario = new RepositorioUsuarioSql();
    const repositorioOferta = new RepositorioOfertaSql(repositorioUsuario);
    const oferta = await repositorioOferta.recuperarPorId(resultado.rows[0].id);
    assert.ok(oferta);
    const aspirante = await new SistemaUsuarios(repositorioUsuario).registrarAspirante(
      nombre,
      apellido,
      email,
      "Aspirante2026!#",
    );
    await new RepositorioPostulacionSql(repositorioUsuario, repositorioOferta).guardar(
      Postulacion.crear(aspirante, oferta, new Date(`${fecha}T12:00:00.000Z`)),
    );
  },
);

When("accede al detalle de la oferta {string}", async function (this: MundoDeLaAplicacion, titulo: string) {
  const resultado = await pool.query<{ id: number }>("SELECT id FROM ofertas WHERE titulo = $1", [titulo]);
  assert.equal(resultado.rows.length, 1);
  await this.pagina.goto(`/ofertas/${resultado.rows[0].id}`);
});

Then("ve el detalle de la oferta", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina.getByRole("heading", { name: "Detalle de la oferta", exact: true })).toBeVisible();
});

Then("ve la sección {string}", async function (this: MundoDeLaAplicacion, nombre: string) {
  await expect(this.pagina.getByRole("heading", { name: nombre, exact: true })).toBeVisible();
});

Then("no ve la sección {string}", async function (this: MundoDeLaAplicacion, nombre: string) {
  await expect(this.pagina.getByRole("heading", { name: nombre, exact: true })).toHaveCount(0);
  await expect(this.pagina.getByRole("table")).toHaveCount(0);
});

Then("ve la tabla de postulaciones:", async function (this: MundoDeLaAplicacion, datos: DataTable) {
  const filasEsperadas = datos.raw();
  const filas = this.pagina.getByRole("table").getByRole("row");
  await expect(filas).toHaveCount(filasEsperadas.length);

  for (const [indice, filaEsperada] of filasEsperadas.entries()) {
    const celdas = await filas.nth(indice).locator("th, td").allTextContents();
    expect(celdas.map((celda) => celda.trim())).toEqual(filaEsperada);
  }
});
