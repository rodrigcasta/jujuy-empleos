import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { MundoDeLaAplicacion } from "../support/mundo";

const intentarIniciarSesion = async (mundo: MundoDeLaAplicacion, email: string, contrasena: string) => {
  await mundo.pagina.goto("/login");
  await mundo.pagina.getByLabel("Email").fill(email);
  await mundo.pagina.getByLabel("Contraseña").fill(contrasena);
  await mundo.presionar("Ingresar");
};

// El header muestra al usuario con la sesión iniciada como "Nombre (email)", con el email en minúsculas
const iniciarSesion = async (mundo: MundoDeLaAplicacion, email: string, contrasena: string) => {
  await intentarIniciarSesion(mundo, email, contrasena);
  await expect(mundo.pagina.getByRole("banner"), "No se pudo iniciar sesión").toContainText(`(${email})`, {
    ignoreCase: true,
  });
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

When(
  "inicia sesión con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await iniciarSesion(this, email, contrasena);
  },
);

When(
  "intenta iniciar sesión con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await intentarIniciarSesion(this, email, contrasena);
  },
);

When("cierra la sesión", async function (this: MundoDeLaAplicacion) {
  await this.presionar("Cerrar sesión");
});

// Se le pide que inicie sesión redirigiéndolo a la página de inicio de sesión
Then("se le pide que inicie sesión", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina).toHaveURL("/login");
});
