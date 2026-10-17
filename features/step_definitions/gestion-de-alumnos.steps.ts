import assert from "node:assert/strict";
import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import Alumno from "../../app/dominio/alumno";
import AlumnoNoEncontradoError from "../../app/dominio/alumno-no-encontrado-error";
import RepositorioAlumnoSql from "../../app/adaptadores/repositorio-alumno-sql";
import { MundoDeLaAplicacion } from "../support/mundo";
import { debeContener } from "../support/verificaciones";

interface DatosDeAlumno {
  padron: string;
  nombre: string;
  apellido: string;
}

const repositorioAlumnos = new RepositorioAlumnoSql();

const alumnosDeLaTabla = (tabla: DataTable): DatosDeAlumno[] =>
  tabla.hashes().map((fila) => ({ padron: fila["padrón"], nombre: fila["nombre"], apellido: fila["apellido"] }));

// Mismo escape que aplica Handlebars al mostrar un valor con {{ }}
const ESCAPES_HTML: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;",
  "=": "&#x3D;",
};
const escaparHtml = (texto: string) => texto.replace(/[&<>"'`=]/g, (caracter) => ESCAPES_HTML[caracter]);

Given("que inició sesión un usuario registrado", async function (this: MundoDeLaAplicacion) {
  // Registrarse inicia la sesión en el navegador del escenario
  const respuesta = await this.navegador.post("/registro").type("form").send({
    nombre: "Marta",
    apellido: "Suarez",
    email: "marta@example.com",
    contrasena: "secreta123",
  });
  assert.equal(respuesta.status, 303, "No se pudo registrar el usuario");
});

// Los alumnos de los antecedentes se guardan directamente, sin pasar por la interfaz
Given("que existen los alumnos:", async function (tabla: DataTable) {
  for (const { padron, nombre, apellido } of alumnosDeLaTabla(tabla)) {
    await repositorioAlumnos.guardar(new Alumno(nombre, apellido, padron));
  }
});

When("consulta el listado de alumnos", async function (this: MundoDeLaAplicacion) {
  this.registrarRespuesta(await this.navegador.get("/alumnos"));
});

When("consulta el alumno con padrón {string}", async function (this: MundoDeLaAplicacion, padron: string) {
  this.registrarRespuesta(await this.navegador.get(`/alumnos/${padron}`));
});

// Como un navegador, sigue la redirección al detalle del alumno creado
When(
  "da de alta al alumno con padrón {string}, nombre {string} y apellido {string}",
  async function (this: MundoDeLaAplicacion, padron: string, nombre: string, apellido: string) {
    const respuesta = await this.navegador
      .post("/alumnos")
      .type("form")
      .redirects(1)
      .send({ padron, nombre, apellido });
    this.registrarRespuesta(respuesta);
  },
);

// Como un navegador, sigue la redirección al listado
When("elimina al alumno con padrón {string}", async function (this: MundoDeLaAplicacion, padron: string) {
  this.registrarRespuesta(await this.navegador.post(`/alumnos/${padron}/eliminar`).redirects(1));
});

Then("ve que no hay alumnos cargados", function (this: MundoDeLaAplicacion) {
  debeContener(this.respuesta(), "No hay alumnos cargados.");
});

Then("ve en el listado a los alumnos:", function (this: MundoDeLaAplicacion, tabla: DataTable) {
  const respuesta = this.respuesta();
  assert.equal(respuesta.status, 200);
  for (const { padron, nombre, apellido } of alumnosDeLaTabla(tabla)) {
    debeContener(respuesta, `href="/alumnos/${padron}"`);
    debeContener(respuesta, nombre);
    debeContener(respuesta, apellido);
  }
});

Then("puede ir al formulario de alta de alumnos", async function (this: MundoDeLaAplicacion) {
  debeContener(this.respuesta(), 'href="/alumnos/nuevo"');
  const formulario = await this.navegador.get("/alumnos/nuevo");
  assert.equal(formulario.status, 200);
  for (const campo of ["padron", "nombre", "apellido"]) {
    debeContener(formulario, `name="${campo}"`);
  }
});

Then(
  "ve el detalle del alumno con padrón {string}, nombre {string} y apellido {string}",
  function (this: MundoDeLaAplicacion, padron: string, nombre: string, apellido: string) {
    const respuesta = this.respuesta();
    assert.equal(respuesta.status, 200);
    debeContener(respuesta, `Alumno ${padron}`);
    debeContener(respuesta, nombre);
    debeContener(respuesta, apellido);
  },
);

Then("el alumno con padrón {string} aparece en el listado", async function (this: MundoDeLaAplicacion, padron: string) {
  debeContener(await this.navegador.get("/alumnos"), `href="/alumnos/${padron}"`);
});

Then(
  "el alumno con padrón {string} no aparece en el listado",
  async function (this: MundoDeLaAplicacion, padron: string) {
    const listado = await this.navegador.get("/alumnos");
    assert.equal(listado.status, 200);
    assert.ok(!listado.text.includes(`href="/alumnos/${padron}"`), `El alumno ${padron} sigue en el listado`);
  },
);

Then(
  "el formulario conserva el nombre {string} y el apellido {string}",
  function (this: MundoDeLaAplicacion, nombre: string, apellido: string) {
    debeContener(this.respuesta(), `value="${nombre}"`);
    debeContener(this.respuesta(), `value="${apellido}"`);
  },
);

Then(
  "la página muestra el texto {string} sin interpretarlo como HTML",
  function (this: MundoDeLaAplicacion, texto: string) {
    const respuesta = this.respuesta();
    debeContener(respuesta, escaparHtml(texto));
    assert.ok(!respuesta.text.includes(texto), `La página incluye "${texto}" sin escapar`);
  },
);

// Verificaciones sobre los datos guardados, útiles también cuando el usuario no puede ver el listado
Then("no se registró ningún alumno", async function () {
  assert.equal((await repositorioAlumnos.listarAlumnos()).length, 0);
});

Then("el alumno con padrón {string} sigue registrado", async function (padron: string) {
  try {
    await repositorioAlumnos.recuperar(padron);
  } catch (error: unknown) {
    if (error instanceof AlumnoNoEncontradoError) {
      assert.fail(`El alumno ${padron} fue eliminado`);
    }
    throw error;
  }
});
