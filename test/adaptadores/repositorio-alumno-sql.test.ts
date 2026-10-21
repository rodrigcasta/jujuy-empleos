import Alumno from "../../app/dominio/alumno";
import AlumnoNoEncontradoError from "../../app/dominio/alumno-no-encontrado-error";
import { describe, expect, test } from "@jest/globals";
import RepositorioAlumnoSql from "../../app/adaptadores/repositorio-alumno-sql";
import pool from "../../app/adaptadores/pool";
import AlumnoYaExisteError from "../../app/dominio/alumno-ya-existe-error";

describe("RepositorioAlumno", () => {
  const repositorioAlumno = new RepositorioAlumnoSql();

  beforeEach(async () => {
    await repositorioAlumno.eliminarTodos();
  });

  afterAll((done) => {
    pool.end();
    done();
  });

  describe("guardar", () => {
    test("deberia persistir un alumno en sql", async () => {
      const alumna: Alumno = new Alumno("Juana", "Rodriguez", "123456");
      await repositorioAlumno.guardar(alumna);
      expect(alumna.Id()).toBeGreaterThan(0);
    });

    test("debería lanzar AlumnoYaExisteError si ya existe un alumno con el mismo padrón", async () => {
      await repositorioAlumno.guardar(new Alumno("Ana", "Lopez", "123123"));
      const otraAlumna: Alumno = new Alumno("Juana", "Rodriguez", "123123");
      await expect(repositorioAlumno.guardar(otraAlumna)).rejects.toThrowError(AlumnoYaExisteError);
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
