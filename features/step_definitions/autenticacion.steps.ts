import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import SistemaUsuarios from "../../app/dominio/sistema-usuarios";
import { MundoDeLaAplicacion } from "../support/mundo";

const sistemaUsuarios = () => new SistemaUsuarios(new RepositorioUsuarioSql());

const intentarIniciarSesion = async (mundo: MundoDeLaAplicacion, email: string, contrasena: string) => {
  mundo.emailIntentoInicioSesion = email;
  await mundo.pagina.goto("/login");
  await mundo.pagina.getByLabel("Email").fill(email);
  await mundo.pagina.getByLabel("Contraseña").fill(contrasena);
  await mundo.presionar("Iniciar sesión");
};

// El header muestra al usuario con la sesión iniciada como "Nombre (email)", con el email en minúsculas
const iniciarSesion = async (mundo: MundoDeLaAplicacion, email: string, contrasena: string) => {
  await intentarIniciarSesion(mundo, email, contrasena);
  await expect(mundo.pagina).toHaveURL("/");
  await expect(mundo.pagina.getByRole("banner"), "No se pudo iniciar sesión").toContainText(`(${email})`, {
    ignoreCase: true,
  });
  mundo.emailUsuarioAutenticado = email;
};

Given(
  "que existe un empresario registrado con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await sistemaUsuarios().registrarEmpresario("Marta", "Suarez", email, contrasena, contrasena, "Profesional");
    this.contrasenasUsuarios.set(email, contrasena);
  },
);

Given(
  "existe un aspirante registrado con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await sistemaUsuarios().registrarAspirante("Sofia", "Martinez", email, contrasena, contrasena);
    this.contrasenasUsuarios.set(email, contrasena);
  },
);

Given("que el aspirante {string} está autenticado", async function (this: MundoDeLaAplicacion, email: string) {
  let contrasena = this.contrasenasUsuarios.get(email);
  if (contrasena === undefined) {
    contrasena = "Aspirante2026!#";
    await sistemaUsuarios().registrarAspirante("Sofia", "Martinez", email, contrasena, contrasena);
    this.contrasenasUsuarios.set(email, contrasena);
  }
  await iniciarSesion(this, email, contrasena);
});

Given("que el empresario {string} está autenticado", async function (this: MundoDeLaAplicacion, email: string) {
  const contrasena = this.contrasenasUsuarios.get(email);
  if (!contrasena) {
    throw new Error(`No se prepararon credenciales para ${email}`);
  }
  await iniciarSesion(this, email, contrasena);
});

Given(
  "que inició sesión con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await iniciarSesion(this, email, contrasena);
  },
);

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

When("intenta acceder a la página de inicio de sesión", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/login");
});

// Se le pide que inicie sesión redirigiéndolo a la página de inicio de sesión
Then("se le pide que inicie sesión", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina).toHaveURL("/login");
});

Then("queda autenticado como {string}", async function (this: MundoDeLaAplicacion, email: string) {
  await expect(this.pagina.getByRole("banner")).toContainText(email);
});

Then("es dirigido al inicio", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina).toHaveURL("/");
});

Then("no queda autenticado", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina).toHaveURL("/login");
  await expect(this.pagina.getByRole("link", { name: "Iniciar sesión", exact: true })).toBeVisible();
  await expect(this.pagina.getByLabel("Email")).toHaveValue(this.emailIntentoInicioSesion ?? "");
  await expect(this.pagina.getByLabel("Contraseña")).toHaveValue("");
});

Then("deja de estar autenticado", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina.getByRole("link", { name: "Iniciar sesión", exact: true })).toBeVisible();
  await expect(this.pagina.getByRole("button", { name: "Cerrar sesión", exact: true })).toHaveCount(0);
});
