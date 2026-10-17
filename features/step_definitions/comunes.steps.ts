import assert from "node:assert/strict";
import { DataTable, Given, Then } from "@cucumber/cucumber";
import supertest from "supertest";
import { app } from "../../app/programa";
import { MundoDeLaAplicacion } from "../support/mundo";
import { debeContener, debeRedirigirA } from "../support/verificaciones";

// Steps usados tanto por la autenticación como por el registro de usuarios

Given("que existe el usuario:", async function (this: MundoDeLaAplicacion, datos: DataTable) {
  const usuario = datos.rowsHash();
  // Se registra con otro navegador para que el del escenario siga sin sesión
  const respuesta = await supertest.agent(app).post("/registro").type("form").send({
    nombre: usuario["nombre"],
    apellido: usuario["apellido"],
    email: usuario["email"],
    contrasena: usuario["contraseña"],
  });
  assert.equal(respuesta.status, 303, "No se pudo registrar el usuario");
});

Then("puede ver el listado de alumnos", async function (this: MundoDeLaAplicacion) {
  const respuesta = await this.navegador.get("/alumnos");
  assert.equal(respuesta.status, 200);
  this.registrarRespuesta(respuesta);
});

Then("no puede ver el listado de alumnos", async function (this: MundoDeLaAplicacion) {
  debeRedirigirA(await this.navegador.get("/alumnos"), "/login");
});

Then("la página muestra {string}", function (this: MundoDeLaAplicacion, texto: string) {
  debeContener(this.respuesta(), texto);
});

Then("ve el mensaje de error {string}", function (this: MundoDeLaAplicacion, mensaje: string) {
  const respuesta = this.respuesta();
  assert.ok(respuesta.status >= 400, `Se esperaba un error, pero el estado fue ${respuesta.status}`);
  debeContener(respuesta, mensaje);
});
