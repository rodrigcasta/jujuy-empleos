import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect, Page } from "@playwright/test";
import Alumno from "../../app/dominio/alumno";
import RepositorioAlumnoSql from "../../app/adaptadores/repositorio-alumno-sql";
import { registrarse, USUARIO_REGISTRADO } from "../support/acciones";
import { MundoDeLaAplicacion } from "../support/mundo";

interface DatosDeAlumno {
  padron: string;
  nombre: string;
  apellido: string;
}

const repositorioAlumnos = new RepositorioAlumnoSql();

const alumnosDeLaTabla = (tabla: DataTable): DatosDeAlumno[] =>
  tabla.hashes().map((fila) => ({ padron: fila["padrón"], nombre: fila["nombre"], apellido: fila["apellido"] }));

// La fila del listado cuyo link lleva al detalle del alumno
const filaDelAlumno = (pagina: Page, padron: string) =>
  pagina.getByRole("row").filter({ has: pagina.getByRole("link", { name: padron, exact: true }) });

Given("que inició sesión un usuario registrado", async function (this: MundoDeLaAplicacion) {
  // Registrarse inicia la sesión en el navegador del escenario
  await registrarse(this, { ...USUARIO_REGISTRADO, confirmación: USUARIO_REGISTRADO.contraseña });
  await expect(this.pagina, "No se pudo registrar el usuario").toHaveURL("/alumnos");
});

// Los alumnos de los antecedentes se guardan directamente, sin pasar por la interfaz
Given("que existen los alumnos:", async function (tabla: DataTable) {
  for (const { padron, nombre, apellido } of alumnosDeLaTabla(tabla)) {
    await repositorioAlumnos.guardar(new Alumno(nombre, apellido, padron));
  }
});

When("consulta el listado de alumnos", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/alumnos");
});

When("consulta el alumno con padrón {string}", async function (this: MundoDeLaAplicacion, padron: string) {
  await this.pagina.goto(`/alumnos/${padron}`);
});

When(
  "da de alta al alumno con padrón {string}, nombre {string} y apellido {string}",
  async function (this: MundoDeLaAplicacion, padron: string, nombre: string, apellido: string) {
    await this.pagina.goto("/alumnos/nuevo");
    await this.pagina.getByLabel("Padrón").fill(padron);
    await this.pagina.getByLabel("Nombre").fill(nombre);
    await this.pagina.getByLabel("Apellido").fill(apellido);
    await this.presionar("Crear");
  },
);

When("elimina al alumno con padrón {string}", async function (this: MundoDeLaAplicacion, padron: string) {
  await this.pagina.goto("/alumnos");
  await this.presionar(filaDelAlumno(this.pagina, padron).getByRole("button", { name: "Eliminar" }));
});

Then("ve que no hay alumnos cargados", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina.getByText("No hay alumnos cargados.")).toBeVisible();
});

Then("ve en el listado a los alumnos:", async function (this: MundoDeLaAplicacion, tabla: DataTable) {
  for (const { padron, nombre, apellido } of alumnosDeLaTabla(tabla)) {
    const fila = filaDelAlumno(this.pagina, padron);
    await expect(fila).toContainText(nombre);
    await expect(fila).toContainText(apellido);
  }
});

Then(
  "ve el detalle del alumno con padrón {string}, nombre {string} y apellido {string}",
  async function (this: MundoDeLaAplicacion, padron: string, nombre: string, apellido: string) {
    await expect(this.pagina.getByRole("heading", { name: `Alumno ${padron}` })).toBeVisible();
    await expect(this.pagina.getByRole("main")).toContainText(nombre);
    await expect(this.pagina.getByRole("main")).toContainText(apellido);
  },
);

Then("el alumno con padrón {string} aparece en el listado", async function (this: MundoDeLaAplicacion, padron: string) {
  await this.pagina.goto("/alumnos");
  await expect(filaDelAlumno(this.pagina, padron)).toBeVisible();
});

Then(
  "el alumno con padrón {string} no aparece en el listado",
  async function (this: MundoDeLaAplicacion, padron: string) {
    await this.pagina.goto("/alumnos");
    await expect(filaDelAlumno(this.pagina, padron)).toHaveCount(0);
  },
);
