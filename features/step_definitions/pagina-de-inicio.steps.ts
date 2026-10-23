import assert from "node:assert/strict";
import { Then, When } from "@cucumber/cucumber";
import { MundoDeLaAplicacion } from "../support/mundo";
import { contenidoPrincipal } from "../support/verificaciones";

When("visita la página de inicio", async function (this: MundoDeLaAplicacion) {
  const respuesta = await this.navegador.get("/");
  assert.equal(respuesta.status, 200);
  this.registrarRespuesta(respuesta);
});

// Se revisa solo el contenido principal: la barra de navegación siempre tiene links a estas páginas
Then("se le ofrece iniciar sesión", function (this: MundoDeLaAplicacion) {
  assert.ok(
    contenidoPrincipal(this.respuesta()).includes('<a href="/login">iniciar sesión</a>'),
    "Se esperaba un link a /login en la página",
  );
});

Then("se le ofrece consultar el listado de alumnos", function (this: MundoDeLaAplicacion) {
  assert.ok(
    contenidoPrincipal(this.respuesta()).includes('<a href="/alumnos">listado de alumnos</a>'),
    "Se esperaba un link a /alumnos en la página",
  );
});

Then("no se le ofrece iniciar sesión", function (this: MundoDeLaAplicacion) {
  assert.ok(
    !contenidoPrincipal(this.respuesta()).includes('href="/login"'),
    "La página no debería tener un link a /login",
  );
});

Then("no se le ofrece consultar el listado de alumnos", function (this: MundoDeLaAplicacion) {
  assert.ok(
    !contenidoPrincipal(this.respuesta()).includes('href="/alumnos"'),
    "La página no debería tener un link a /alumnos",
  );
});
