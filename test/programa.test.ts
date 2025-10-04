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
