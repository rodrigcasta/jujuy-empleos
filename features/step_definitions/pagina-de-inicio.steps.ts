import assert from "node:assert/strict";
import { Then, When } from "@cucumber/cucumber";
import { MundoDeLaAplicacion } from "../support/mundo";
import { Opcion } from "../support/parametros";
import { contenidoPrincipal } from "../support/verificaciones";

When("visita la página de inicio", async function (this: MundoDeLaAplicacion) {
  const respuesta = await this.navegador.get("/");
  assert.equal(respuesta.status, 200);
  this.registrarRespuesta(respuesta);
});

// Se revisa solo el contenido principal: la barra de navegación siempre tiene links a estas páginas
Then("se le ofrece {opcion}", function (this: MundoDeLaAplicacion, { texto, ruta }: Opcion) {
  const link = `<a href="${ruta}">${texto}</a>`;
  assert.ok(contenidoPrincipal(this.respuesta()).includes(link), `Se esperaba el link ${link} en la página`);
});

Then("no se le ofrece {opcion}", function (this: MundoDeLaAplicacion, { ruta }: Opcion) {
  assert.ok(
    !contenidoPrincipal(this.respuesta()).includes(`href="${ruta}"`),
    `La página no debería tener un link a ${ruta}`,
  );
});
