import Alumno from "../../app/dominio/alumno";
import AlumnoNoEncontradoError from "../../app/dominio/alumno-no-encontrado-error";
import { describe, expect, test } from "@jest/globals";
import RepositorioAlumnoSql from "../../app/adaptadores/repositorio-alumno-sql";
import pool from "../../app/adaptadores/pool";

describe("RepositorioAlumno", () => {
  const repositorioAlumno = new RepositorioAlumnoSql();

  beforeEach(async () => {
    const resultado = await repositorioAlumno.eliminarTodos();
    if (!resultado) {
      throw new Error("setup failed");
    }
  });

  afterAll((done) => {
    pool.end();
    done();
  });

  describe("guardar", () => {
    test("deberia persistir un alumno en sql", async () => {
      const alumna = new Alumno("Juana", "Rodriguez", "123456");
      const resultado = await repositorioAlumno.guardar(alumna);
      expect(resultado).toBeTruthy();
    });
  });

  describe("listar", () => {
    test("deberia devolver todos los objetos almecenados", async () => {
      const alumna = new Alumno("Ana", "Lopez", "123123");
      await repositorioAlumno.guardar(alumna);
      const resultado = await repositorioAlumno.listarAlumnos();
      expect(resultado.length).toBe(1);
    });

    test("deberia devolver una lista vacia si no hay objetos guardados", async () => {
      const resultado = await repositorioAlumno.listarAlumnos();
      expect(resultado.length).toBe(0);
    });
  });

  describe("recuperar", () => {
    test("deberia devolver el objeto almacenado que coincide padron", async () => {
      const padron = "123123";
      const alumna = new Alumno("Ana", "Lopez", padron);
      await repositorioAlumno.guardar(alumna);
      const resultado = await repositorioAlumno.recuperar(padron);
      expect(resultado.getPadron()).toEqual(padron);
      expect(resultado.getNombre()).toEqual(alumna.getNombre());
      expect(resultado.getApellido()).toEqual(alumna.getApellido());
    });

    test("deberia lanzar error si no existe objeto con el padron indicado", async () => {
      await expect(repositorioAlumno.recuperar("no-existe")).rejects.toThrowError(AlumnoNoEncontradoError);
    });
  });
});
