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
      expect(alumna.obtenerId()).toBeGreaterThan(0);
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

    test("deberia devolver los alumnos con su id", async () => {
      const alumna: Alumno = new Alumno("Ana", "Lopez", "123123");
      await repositorioAlumno.guardar(alumna);
      const alumnos: Alumno[] = await repositorioAlumno.listarAlumnos();
      expect(alumnos[0].obtenerId()).toBeGreaterThan(0);
      expect(alumnos[0].obtenerId()).toEqual(alumna.obtenerId());
    });
  });

  describe("recuperar", () => {
    test("deberia devolver el objeto almacenado que coincide padron", async () => {
      const padron = "123123";
      const alumna = new Alumno("Ana", "Lopez", padron);
      await repositorioAlumno.guardar(alumna);
      const resultado = await repositorioAlumno.recuperar(padron);
      expect(resultado.obtenerPadron()).toEqual(padron);
      expect(resultado.obtenerNombre()).toEqual(alumna.obtenerNombre());
      expect(resultado.obtenerApellido()).toEqual(alumna.obtenerApellido());
    });

    test("deberia lanzar error si no existe objeto con el padron indicado", async () => {
      await expect(repositorioAlumno.recuperar("no-existe")).rejects.toThrowError(AlumnoNoEncontradoError);
    });
  });

  describe("eliminar", (): void => {
    test("debería eliminar el alumno con el padron indicado y conservar los demás", async (): Promise<void> => {
      await repositorioAlumno.guardar(new Alumno("Ana", "Lopez", "123123"));
      await repositorioAlumno.guardar(new Alumno("Juana", "Rodriguez", "456456"));

      await repositorioAlumno.eliminar("123123");

      const restantes = await repositorioAlumno.listarAlumnos();
      expect(restantes.map((alumno) => alumno.obtenerPadron())).toEqual(["456456"]);
    });

    test("debería lanzar error si no existe el alumno con el padrón indicado", async (): Promise<void> => {
      await expect(repositorioAlumno.eliminar("99999")).rejects.toThrowError(AlumnoNoEncontradoError);
    });
  });
});
