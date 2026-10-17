import { Given, Then, When } from "@cucumber/cucumber";
import { MundoDeLaAplicacion } from "../support/mundo";
import { debeRedirigirA } from "../support/verificaciones";

const iniciarSesion = async (mundo: MundoDeLaAplicacion, email: string, contrasena: string) => {
  mundo.registrarRespuesta(await mundo.navegador.post("/login").type("form").send({ email, contrasena }));
};

Given(
  "que inició sesión con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await iniciarSesion(this, email, contrasena);
  },
);

When("un usuario anónimo intenta ver el listado de alumnos", async function (this: MundoDeLaAplicacion) {
  this.registrarRespuesta(await this.navegador.get("/alumnos"));
});

When(
  "inicia sesión con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await iniciarSesion(this, email, contrasena);
  },
);

When("cierra la sesión", async function (this: MundoDeLaAplicacion) {
  this.registrarRespuesta(await this.navegador.post("/logout"));
});

Then("es redirigido a la página de inicio de sesión", function (this: MundoDeLaAplicacion) {
  debeRedirigirA(this.respuesta(), "/login");
});
