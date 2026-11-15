import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import SistemaUsuarios from "../../app/dominio/sistema-usuarios";
import { MundoDeLaAplicacion } from "../support/mundo";

const sistemaUsuarios = () => new SistemaUsuarios(new RepositorioUsuarioSql());

const CONTRASENA_EMPRESARIO = "Empresa2026!#";
const CONTRASENA_ASPIRANTE = "Empleo2026!#";

const iniciarSesion = async (mundo: MundoDeLaAplicacion, email: string, contrasena: string) => {
  await mundo.pagina.goto("/login");
  await mundo.pagina.getByLabel("Email").fill(email);
  await mundo.pagina.getByLabel("Contraseña").fill(contrasena);
  await mundo.presionar("Iniciar sesión");
  await expect(mundo.pagina).toHaveURL("/");
  await expect(mundo.pagina.getByRole("banner")).toContainText(`(${email})`, { ignoreCase: true });
  mundo.emailUsuarioAutenticado = email;
};

Given(
  "que existe un aspirante registrado con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await sistemaUsuarios().registrarAspirante("Sofía", "Martínez", email, contrasena, contrasena);
    this.contrasenasUsuarios.set(email, contrasena);
  },
);

Given(
  "inició sesión con email {string} y contraseña {string}",
  async function (this: MundoDeLaAplicacion, email: string, contrasena: string) {
    await iniciarSesion(this, email, contrasena);
  },
);

Given(
  "que existe un {word} registrado con nombre {string}, apellido {string} y email {string}",
  async function (this: MundoDeLaAplicacion, tipo: string, nombre: string, apellido: string, email: string) {
    if (tipo === "empresario") {
      await sistemaUsuarios().registrarEmpresario(
        nombre,
        apellido,
        email,
        CONTRASENA_EMPRESARIO,
        CONTRASENA_EMPRESARIO,
        "Profesional",
      );
      this.contrasenasUsuarios.set(email, CONTRASENA_EMPRESARIO);
      return;
    }
    if (tipo === "aspirante") {
      await sistemaUsuarios().registrarAspirante(nombre, apellido, email, CONTRASENA_ASPIRANTE, CONTRASENA_ASPIRANTE);
      this.contrasenasUsuarios.set(email, CONTRASENA_ASPIRANTE);
      return;
    }
    throw new Error(`Tipo de usuario no soportado: ${tipo}`);
  },
);

Given(
  "existe otro usuario registrado con nombre {string}, apellido {string} y email {string}",
  async function (nombre: string, apellido: string, email: string) {
    await sistemaUsuarios().registrarEmpresario(
      nombre,
      apellido,
      email,
      CONTRASENA_EMPRESARIO,
      CONTRASENA_EMPRESARIO,
      "Profesional",
    );
  },
);

Given("el usuario {string} tiene la sesión iniciada", async function (this: MundoDeLaAplicacion, email: string) {
  const contrasena = this.contrasenasUsuarios.get(email);
  if (!contrasena) {
    throw new Error(`No se prepararon credenciales para ${email}`);
  }
  await iniciarSesion(this, email, contrasena);
});

When('intenta acceder a la sección "Mi cuenta"', async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/mi-cuenta");
});

When('accede a la sección "Mi cuenta"', async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/mi-cuenta");
});

When('selecciona "Mi cuenta" desde el header', async function (this: MundoDeLaAplicacion) {
  await this.seguirEnlace(this.pagina.getByRole("banner").getByRole("link", { name: "Mi cuenta", exact: true }));
});

Then("no visualiza datos de cuenta", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina.getByRole("heading", { name: "Mi cuenta", exact: true })).toHaveCount(0);
});

Then("visualiza la página de su cuenta", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina).toHaveURL("/mi-cuenta");
  await expect(this.pagina.getByRole("heading", { name: "Mi cuenta", exact: true })).toBeVisible();
});

Then("ve los datos de su cuenta:", async function (this: MundoDeLaAplicacion, datos: DataTable) {
  const contenidoPrincipal = this.pagina.getByRole("main");
  const esperados = datos.rowsHash();

  await expect(contenidoPrincipal).toContainText(esperados["nombre"]);
  await expect(contenidoPrincipal).toContainText(esperados["apellido"]);
  await expect(contenidoPrincipal).toContainText(esperados["email"]);
});

Then("no visualiza el email {string}", async function (this: MundoDeLaAplicacion, email: string) {
  await expect(this.pagina.locator("body")).not.toContainText(email);
});

Then("los datos de cuenta se muestran en modo de solo lectura", async function (this: MundoDeLaAplicacion) {
  const contenidoPrincipal = this.pagina.getByRole("main");

  await expect(contenidoPrincipal.locator("input, textarea, select, form")).toHaveCount(0);
  await expect(contenidoPrincipal.locator("[contenteditable='true']")).toHaveCount(0);
});
