import { app, server } from "../app/programa";
import supertest from "supertest";
import RepositorioAlumnoSql from "../app/adaptadores/repositorio-alumno-sql";
import pool from "../app/adaptadores/pool";

const requestWithSupertest = supertest(app);

const crearAlumno = (datos: Record<string, string>) => requestWithSupertest.post("/alumnos").type("form").send(datos);

beforeEach(async () => {
  const repositorioAlumno = new RepositorioAlumnoSql();
  const resultado = await repositorioAlumno.eliminarTodos();
  if (!resultado) {
    throw new Error("setup failed");
  }
});

afterAll((done) => {
  pool.end();
  server.close();
  done();
});

describe("GET /", () => {
  test("deberia devolver la home page en HTML", async () => {
    const respuesta = await requestWithSupertest.get("/");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain("Hola mundo");
  });
});

describe("POST /alumnos", () => {
  test("deberia redirigir al detalle del alumno creado", async () => {
    const respuesta = await crearAlumno({
      nombre: "Juana",
      apellido: "Lopez",
      padron: "11111",
    });

    expect(respuesta.status).toEqual(303);
    expect(respuesta.headers.location).toEqual("/alumnos/11111");

    const detalle = await requestWithSupertest.get(respuesta.headers.location);
    expect(detalle.status).toEqual(200);
    expect(detalle.text).toContain("11111");
    expect(detalle.text).toContain("Juana");
    expect(detalle.text).toContain("Lopez");
  });

  test("deberia devolver estado 400 y mensaje de error si no se incluye el campo padron", async () => {
    const respuesta = await crearAlumno({ nombre: "Juana", apellido: "Lopez" });

    expect(respuesta.status).toEqual(400);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain("El campo padron es obligatorio");
  });

  test("deberia devolver estado 400 si el campo padron esta vacio", async () => {
    const respuesta = await crearAlumno({
      nombre: "Juana",
      apellido: "Lopez",
      padron: "",
    });

    expect(respuesta.status).toEqual(400);
    expect(respuesta.text).toContain("El campo padron es obligatorio");
  });

  test("deberia conservar los datos ingresados en el formulario si hay un error", async () => {
    const respuesta = await crearAlumno({ nombre: "Juana", apellido: "Lopez" });

    expect(respuesta.text).toContain('value="Juana"');
    expect(respuesta.text).toContain('value="Lopez"');
  });
});

describe("GET /alumnos", () => {
  test("deberia devolver estado OK e indicar que no hay alumnos si no hay alumnos guardados", async () => {
    const respuesta = await requestWithSupertest.get("/alumnos");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain("No hay alumnos cargados.");
  });

  test("deberia incluir el formulario para crear alumnos", async () => {
    const respuesta = await requestWithSupertest.get("/alumnos");

    expect(respuesta.text).toContain('<form method="post" action="/alumnos">');
    expect(respuesta.text).toContain('name="padron"');
    expect(respuesta.text).toContain('name="nombre"');
    expect(respuesta.text).toContain('name="apellido"');
  });

  test("deberia devolver estado OK y una lista con un alumno si hay uno guardado", async () => {
    await crearAlumno({ padron: "12345", nombre: "Ana", apellido: "Garcia" });

    const respuesta = await requestWithSupertest.get("/alumnos");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.text).toContain("12345");
    expect(respuesta.text).toContain("Ana");
    expect(respuesta.text).toContain("Garcia");
    expect(respuesta.text).not.toContain("No hay alumnos cargados.");
  });

  test("deberia devolver estado OK y una lista con todos los alumnos si hay varios guardados", async () => {
    await crearAlumno({ padron: "11111", nombre: "Juana", apellido: "Lopez" });
    await crearAlumno({
      padron: "22222",
      nombre: "Carlos",
      apellido: "Martinez",
    });
    await crearAlumno({
      padron: "33333",
      nombre: "Sofia",
      apellido: "Rodriguez",
    });

    const respuesta = await requestWithSupertest.get("/alumnos");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.text).toContain("11111");
    expect(respuesta.text).toContain("22222");
    expect(respuesta.text).toContain("33333");
    expect(respuesta.text).toContain("Juana");
    expect(respuesta.text).toContain("Carlos");
    expect(respuesta.text).toContain("Sofia");
  });

  test("deberia escapar el HTML de los datos del alumno", async () => {
    await crearAlumno({
      padron: "12345",
      nombre: "<script>alert(1)</script>",
      apellido: "Garcia",
    });

    const respuesta = await requestWithSupertest.get("/alumnos");

    expect(respuesta.text).not.toContain("<script>alert(1)</script>");
    expect(respuesta.text).toContain("&lt;script&gt;");
  });
});

describe("GET /alumnos/:padron", () => {
  test("deberia devolver estado OK y los datos del alumno si existe", async () => {
    await crearAlumno({ padron: "12345", nombre: "Ana", apellido: "Garcia" });

    const respuesta = await requestWithSupertest.get("/alumnos/12345");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain("12345");
    expect(respuesta.text).toContain("Ana");
    expect(respuesta.text).toContain("Garcia");
  });

  test("deberia devolver el alumno correcto cuando hay varios alumnos guardados", async () => {
    await crearAlumno({ padron: "11111", nombre: "Juana", apellido: "Lopez" });
    await crearAlumno({
      padron: "22222",
      nombre: "Carlos",
      apellido: "Martinez",
    });
    await crearAlumno({
      padron: "33333",
      nombre: "Sofia",
      apellido: "Rodriguez",
    });

    const respuesta = await requestWithSupertest.get("/alumnos/22222");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.text).toContain("Carlos");
    expect(respuesta.text).toContain("Martinez");
    expect(respuesta.text).not.toContain("Juana");
    expect(respuesta.text).not.toContain("Sofia");
  });

  test("deberia devolver estado 404 y mensaje de error si el alumno no existe", async () => {
    const padronInexistente = "99999";
    const respuesta = await requestWithSupertest.get(`/alumnos/${padronInexistente}`);

    expect(respuesta.status).toEqual(404);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain(`No se encontró el alumno con padrón ${padronInexistente}`);
  });
});

describe("POST /alumnos/:padron/eliminar", () => {
  test("deberia redirigir al listado y eliminar el alumno si existe", async () => {
    await crearAlumno({ padron: "12345", nombre: "Ana", apellido: "Garcia" });

    let respuesta = await requestWithSupertest.get("/alumnos/12345");
    expect(respuesta.status).toEqual(200);

    respuesta = await requestWithSupertest.post("/alumnos/12345/eliminar");
    expect(respuesta.status).toEqual(303);
    expect(respuesta.headers.location).toEqual("/alumnos");

    respuesta = await requestWithSupertest.get("/alumnos/12345");
    expect(respuesta.status).toEqual(404);
  });

  test("deberia eliminar solo el alumno especificado cuando hay varios guardados", async () => {
    await crearAlumno({ padron: "11111", nombre: "Juana", apellido: "Lopez" });
    await crearAlumno({
      padron: "22222",
      nombre: "Carlos",
      apellido: "Martinez",
    });
    await crearAlumno({
      padron: "33333",
      nombre: "Sofia",
      apellido: "Rodriguez",
    });

    const respuesta = await requestWithSupertest.post("/alumnos/22222/eliminar");
    expect(respuesta.status).toEqual(303);

    const respuestaBusqueda = await requestWithSupertest.get("/alumnos/22222");
    expect(respuestaBusqueda.status).toEqual(404);

    const respuestaAlumno1 = await requestWithSupertest.get("/alumnos/11111");
    expect(respuestaAlumno1.status).toEqual(200);
    expect(respuestaAlumno1.text).toContain("Juana");

    const respuestaAlumno3 = await requestWithSupertest.get("/alumnos/33333");
    expect(respuestaAlumno3.status).toEqual(200);
    expect(respuestaAlumno3.text).toContain("Sofia");
  });

  test("deberia devolver estado 404 y mensaje de error si el alumno no existe", async () => {
    const padronInexistente = "99999";
    const respuesta = await requestWithSupertest.post(`/alumnos/${padronInexistente}/eliminar`);

    expect(respuesta.status).toEqual(404);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain(`No se encontró el alumno con padrón ${padronInexistente}`);
  });
});
