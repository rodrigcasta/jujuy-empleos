import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import pool from "../../app/adaptadores/pool";
import RepositorioOfertaSql from "../../app/adaptadores/repositorio-oferta-sql";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import Oferta from "../../app/dominio/oferta";
import { MundoDeLaAplicacion } from "../support/mundo";

const FECHA_PUBLICACION = new Date("2026-11-16T15:00:00.000Z");
const DESCRIPCION = "Descripcion de una oferta laboral";
const UBICACION = "CABA";

const obtenerIdEmpresario = async (email: string): Promise<number> => {
  const resultado = await pool.query<{ id: number }>("SELECT id FROM usuarios WHERE email = $1", [email]);
  assert.equal(resultado.rows.length, 1, `No se encontró un empresario con email ${email}`);
  return resultado.rows[0].id;
};

const obtenerOferta = async (titulo: string): Promise<{ id: number; activa: boolean }> => {
  const resultado = await pool.query<{ id: number; activa: boolean }>(
    "SELECT id, activa FROM ofertas WHERE titulo = $1",
    [titulo],
  );
  assert.equal(resultado.rows.length, 1, `No se encontró una única oferta titulada ${titulo}`);
  return resultado.rows[0];
};

const crearOferta = async (email: string, titulo: string, cerrada: boolean) => {
  const oferta = new Oferta(titulo, DESCRIPCION, UBICACION, await obtenerIdEmpresario(email), FECHA_PUBLICACION);
  if (cerrada) {
    oferta.cerrar();
  }
  await new RepositorioOfertaSql(new RepositorioUsuarioSql()).guardar(oferta);
};

Given(
  "que el empresario {string} tiene una oferta activa titulada {string}",
  async function (this: MundoDeLaAplicacion, email: string, titulo: string) {
    await crearOferta(email, titulo, false);
  },
);

Given(
  "que el empresario {string} tiene una oferta cerrada titulada {string}",
  async function (this: MundoDeLaAplicacion, email: string, titulo: string) {
    await crearOferta(email, titulo, true);
  },
);

Then("ve el botón {string}", async function (this: MundoDeLaAplicacion, texto: string) {
  await expect(this.pagina.getByRole("button", { name: texto, exact: true })).toBeVisible();
});

Then("no ve el botón {string}", async function (this: MundoDeLaAplicacion, texto: string) {
  await expect(this.pagina.getByRole("button", { name: texto, exact: true })).toHaveCount(0);
});

When("selecciona el botón {string}", async function (this: MundoDeLaAplicacion, texto: string) {
  await this.presionar(texto);
});

Then("la oferta {string} queda cerrada", async function (this: MundoDeLaAplicacion, titulo: string) {
  const oferta = await obtenerOferta(titulo);
  expect(oferta.activa).toBe(false);
  await expect(this.pagina.getByText("Cerrada", { exact: true })).toBeVisible();
});

When("intenta cerrar directamente la oferta {string}", async function (this: MundoDeLaAplicacion, titulo: string) {
  const oferta = await obtenerOferta(titulo);
  const respuesta = await this.pagina.request.post(`/ofertas/${oferta.id}/cerrar`);
  expect(respuesta.status()).toBe(403);
});

Then("no puede cerrar la oferta {string}", async function (this: MundoDeLaAplicacion, titulo: string) {
  const oferta = await obtenerOferta(titulo);
  expect(oferta.activa).toBe(true);
});

When("una persona visita el listado público de ofertas", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/ofertas");
});

When("visita el listado de ofertas", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/ofertas");
});

Then("no ve la oferta {string} en el listado", async function (this: MundoDeLaAplicacion, titulo: string) {
  await expect(this.pagina.getByRole("heading", { name: titulo, exact: true })).toHaveCount(0);
});

Then(
  "ve la oferta {string} con la etiqueta {string}",
  async function (this: MundoDeLaAplicacion, titulo: string, etiqueta: string) {
    await expect(this.pagina.getByRole("heading", { name: titulo, exact: true })).toBeVisible();
    const articulo = this.pagina.locator("article").filter({ has: this.pagina.getByRole("heading", { name: titulo }) });
    await expect(articulo.getByText(etiqueta, { exact: true })).toBeVisible();
  },
);
