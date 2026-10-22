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

When("un usuario anónimo intenta {consulta}", async function (this: MundoDeLaAplicacion, ruta: string) {
  this.registrarRespuesta(await this.navegador.get(ruta));
});

When(
  "un usuario anónimo intenta dar de alta al alumno con padrón {string}, nombre {string} y apellido {string}",
  async function (this: MundoDeLaAplicacion, padron: string, nombre: string, apellido: string) {
    this.registrarRespuesta(await this.navegador.post("/alumnos").type("form").send({ padron, nombre, apellido }));
  },
);

When(
  "un usuario anónimo intenta eliminar al alumno con padrón {string}",
  async function (this: MundoDeLaAplicacion, padron: string) {
    this.registrarRespuesta(await this.navegador.post(`/alumnos/${padron}/eliminar`));
  },
);

When(
  "inicia sesión con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await iniciarSesion(this, email, contrasena);
  },
);

When("cierra la sesión", async function (this: MundoDeLaAplicacion) {
  this.registrarRespuesta(await this.navegador.post("/logout"));
});

// Se le pide que inicie sesión redirigiéndolo a la página de inicio de sesión
Then("se le pide que inicie sesión", function (this: MundoDeLaAplicacion) {
  debeRedirigirA(this.respuesta(), "/login");
});
