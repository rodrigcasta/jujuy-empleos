import { app, server } from "../app/programa";
import clienteRedis from "../app/adaptadores/cliente-redis";
import supertest from "supertest";

const requestWithSupertest = supertest(app);

afterEach(async () => {
  // Borrar todos los datos en Redis después de ejecutar cada prueba
  await clienteRedis((cliente) => cliente.flushDb());
});

afterAll(() => {
  server.close();
});

describe("POST /alumnos", () => {
  test("deberia devolver estado OK e incluir los datos del alumno creado en la respuesta", async () => {
    const respuesta = await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "11111", nombre: "Juana", apellido: "Lopez", fechaNacimiento: "01/01/2000" });

    expect(respuesta.status).toEqual(200);
    expect(respuesta.body).not.toBeNull();
    expect(respuesta.body.padron).toEqual("11111");
    expect(respuesta.body.nombre).toEqual("Juana");
    expect(respuesta.body.apellido).toEqual("Lopez");
    expect(respuesta.body.fechaNacimiento).toEqual("01/01/2000");
  });
});

describe("GET /alumnos", () => {
  test("deberia devolver estado OK y una lista vacia si no hay alumnos guardados", async () => {
    const respuesta = await requestWithSupertest.get("/alumnos");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.body).toEqual([]);
  });

  test("deberia devolver estado OK y una lista con un alumno si hay uno guardado", async () => {
    // Primero guardamos un alumno
    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "12345", nombre: "Ana", apellido: "Garcia", fechaNacimiento: "15/05/1995" });

    const respuesta = await requestWithSupertest.get("/alumnos");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].padron).toEqual("12345");
    expect(respuesta.body[0].nombre).toEqual("Ana");
    expect(respuesta.body[0].apellido).toEqual("Garcia");
    expect(respuesta.body[0].fechaNacimiento).toEqual("15/05/1995");
  });

  test("deberia devolver estado OK y una lista con todos los alumnos si hay varios guardados", async () => {
    // Guardamos varios alumnos
    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "11111", nombre: "Juana", apellido: "Lopez", fechaNacimiento: "01/01/2000" });

    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "22222", nombre: "Carlos", apellido: "Martinez", fechaNacimiento: "10/03/1998" });

    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "33333", nombre: "Sofia", apellido: "Rodriguez", fechaNacimiento: "25/07/1999" });

    const respuesta = await requestWithSupertest.get("/alumnos");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.body).toHaveLength(3);

    const padrones = respuesta.body.map((alumno: any) => alumno.padron);
    expect(padrones).toContain("11111");
    expect(padrones).toContain("22222");
    expect(padrones).toContain("33333");

    const nombres = respuesta.body.map((alumno: any) => alumno.nombre);
    expect(nombres).toContain("Juana");
    expect(nombres).toContain("Carlos");
    expect(nombres).toContain("Sofia");
  });
});

describe("GET /alumnos/:padron", () => {
  test("deberia devolver estado OK y los datos del alumno si existe", async () => {
    // Primero guardamos un alumno
    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "12345", nombre: "Ana", apellido: "Garcia", fechaNacimiento: "15/05/1995" });

    const respuesta = await requestWithSupertest.get("/alumnos/12345");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.body).not.toBeNull();
    expect(respuesta.body.padron).toEqual("12345");
    expect(respuesta.body.nombre).toEqual("Ana");
    expect(respuesta.body.apellido).toEqual("Garcia");
    expect(respuesta.body.fechaNacimiento).toEqual("15/05/1995");
  });

  test("deberia devolver el alumno correcto cuando hay varios alumnos guardados", async () => {
    // Guardamos varios alumnos
    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "11111", nombre: "Juana", apellido: "Lopez", fechaNacimiento: "01/01/2000" });

    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "22222", nombre: "Carlos", apellido: "Martinez", fechaNacimiento: "10/03/1998" });

    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "33333", nombre: "Sofia", apellido: "Rodriguez", fechaNacimiento: "25/07/1999" });

    // Buscamos un alumno específico
    const respuesta = await requestWithSupertest.get("/alumnos/22222");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.body.padron).toEqual("22222");
    expect(respuesta.body.nombre).toEqual("Carlos");
    expect(respuesta.body.apellido).toEqual("Martinez");
    expect(respuesta.body.fechaNacimiento).toEqual("10/03/1998");
  });

  test("deberia devolver estado 404 y mensaje de error si el alumno no existe", async () => {
    const padronInexistente = "99999";
    const respuesta = await requestWithSupertest.get(`/alumnos/${padronInexistente}`);

    expect(respuesta.status).toEqual(404);
    expect(respuesta.body).toEqual({
      error: `No se encontró el alumno con padrón ${padronInexistente}`,
    });
  });
});

describe("DELETE /alumnos/:padron", () => {
  test("deberia devolver estado OK y eliminar el alumno si existe", async () => {
    // Primero guardamos un alumno
    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "12345", nombre: "Ana", apellido: "Garcia", fechaNacimiento: "15/05/1995" });

    // Verificamos que existe
    let respuesta = await requestWithSupertest.get("/alumnos/12345");
    expect(respuesta.status).toEqual(200);

    // Eliminamos el alumno
    respuesta = await requestWithSupertest.delete("/alumnos/12345");
    expect(respuesta.status).toEqual(200);

    // Verificamos que ya no existe
    respuesta = await requestWithSupertest.get("/alumnos/12345");
    expect(respuesta.status).toEqual(404);
  });

  test("deberia eliminar solo el alumno especificado cuando hay varios guardados", async () => {
    // Guardamos varios alumnos
    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "11111", nombre: "Juana", apellido: "Lopez", fechaNacimiento: "01/01/2000" });

    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "22222", nombre: "Carlos", apellido: "Martinez", fechaNacimiento: "10/03/1998" });

    await requestWithSupertest
      .post("/alumnos")
      .send({ padron: "33333", nombre: "Sofia", apellido: "Rodriguez", fechaNacimiento: "25/07/1999" });

    // Eliminamos un alumno específico
    const respuesta = await requestWithSupertest.delete("/alumnos/22222");
    expect(respuesta.status).toEqual(200);

    // Verificamos que el alumno eliminado ya no existe
    const respuestaBusqueda = await requestWithSupertest.get("/alumnos/22222");
    expect(respuestaBusqueda.status).toEqual(404);

    // Verificamos que los otros alumnos siguen existiendo
    const respuestaAlumno1 = await requestWithSupertest.get("/alumnos/11111");
    expect(respuestaAlumno1.status).toEqual(200);
    expect(respuestaAlumno1.body.nombre).toEqual("Juana");

    const respuestaAlumno3 = await requestWithSupertest.get("/alumnos/33333");
    expect(respuestaAlumno3.status).toEqual(200);
    expect(respuestaAlumno3.body.nombre).toEqual("Sofia");
  });

  test("deberia devolver estado 404 y mensaje de error si el alumno no existe", async () => {
    const padronInexistente = "99999";
    const respuesta = await requestWithSupertest.delete(`/alumnos/${padronInexistente}`);

    expect(respuesta.status).toEqual(404);
    expect(respuesta.body).toEqual({
      error: `No se encontró el alumno con padrón ${padronInexistente}`,
    });
  });
});
