import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { MundoDeLaAplicacion } from "../support/mundo";

const iniciarSesion = async (mundo: MundoDeLaAplicacion, email: string, contrasena: string) => {
  await mundo.pagina.goto("/login");
  await mundo.pagina.getByLabel("Email").fill(email);
  await mundo.pagina.getByLabel("Contraseña").fill(contrasena);
  await mundo.presionar("Ingresar");
};

Given(
  "que inició sesión con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await iniciarSesion(this, email, contrasena);
  },
);

When("un usuario anónimo intenta consultar el listado de alumnos", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/alumnos");
});

// La interfaz no le ofrece estos formularios a un usuario anónimo: se envían igual, como lo haría alguien que
// conoce las rutas de la aplicación
When(
  "un usuario anónimo intenta dar de alta al alumno con padrón {string}, nombre {string} y apellido {string}",
  async function (this: MundoDeLaAplicacion, padron: string, nombre: string, apellido: string) {
    await this.enviarFormulario("/alumnos", { padron, nombre, apellido });
  },
);

When(
  "un usuario anónimo intenta eliminar al alumno con padrón {string}",
  async function (this: MundoDeLaAplicacion, padron: string) {
    await this.enviarFormulario(`/alumnos/${padron}/eliminar`);
  },
);

When(
  "inicia sesión con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await iniciarSesion(this, email, contrasena);
  },
);

When("cierra la sesión", async function (this: MundoDeLaAplicacion) {
  await this.presionar("Cerrar sesión");
});

// Se le pide que inicie sesión redirigiéndolo a la página de inicio de sesión
Then("se le pide que inicie sesión", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina).toHaveURL("/login");
});
