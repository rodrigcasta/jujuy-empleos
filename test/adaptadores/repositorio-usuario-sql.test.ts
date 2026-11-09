import Usuario from "../../app/dominio/usuario";
import UsuarioYaExisteError from "../../app/dominio/usuario-ya-existe-error";
import { describe, expect, test } from "@jest/globals";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import pool from "../../app/adaptadores/pool";

describe("RepositorioUsuario", () => {
  const repositorioUsuario = new RepositorioUsuarioSql();

  beforeEach(async () => {
    await repositorioUsuario.eliminarTodos();
  });

  afterAll((done) => {
    pool.end();
    done();
  });

  describe("guardar", () => {
    test("deberia persistir un usuario en sql y asignarle un id", async () => {
      const usuario: Usuario = new Usuario("Juana", "Lopez", "juana@example.com", "hash");
      await repositorioUsuario.guardar(usuario);
      expect(usuario.obtenerId()).toBeGreaterThan(0);
    });

    test("deberia arrojar UsuarioYaExisteError si ya existe un usuario con el mismo email", async () => {
      await repositorioUsuario.guardar(new Usuario("Juana", "Lopez", "juana@example.com", "hash"));

      await expect(
        repositorioUsuario.guardar(new Usuario("Otra", "Persona", "juana@example.com", "hash")),
      ).rejects.toThrow(UsuarioYaExisteError);
    });

    test("deberia persistir y recuperar un aspirante sin suscripcion", async () => {
      const aspirante = await Usuario.registrarAspirante(
        "Sofia",
        "Martinez",
        "sofia.martinez@correo-ejemplo.com.ar",
        "Empleo2026!#",
        "Empleo2026!#",
      );

      await repositorioUsuario.guardar(aspirante);
      const resultado = await repositorioUsuario.recuperarPorId(aspirante.obtenerId());

      expect(resultado?.obtenerTipoUsuario()).toBe("Aspirante");
      expect(resultado?.obtenerSuscripcion()).toBeNull();
    });
  });

  describe("recuperarPorEmail", () => {
    test("deberia devolver el usuario almacenado con ese email", async () => {
      const usuario = new Usuario("Juana", "Lopez", "juana@example.com", "hash");
      await repositorioUsuario.guardar(usuario);

      const resultado = await repositorioUsuario.recuperarPorEmail("juana@example.com");

      expect(resultado).not.toBeNull();
      expect(resultado!.obtenerId()).toEqual(usuario.obtenerId());
      expect(resultado!.obtenerNombre()).toEqual("Juana");
      expect(resultado!.obtenerApellido()).toEqual("Lopez");
      expect(resultado!.obtenerHashContrasena()).toEqual("hash");
    });

    test("deberia devolver null si no existe un usuario con ese email", async () => {
      expect(await repositorioUsuario.recuperarPorEmail("nadie@example.com")).toBeNull();
    });
  });

  describe("recuperarPorId", () => {
    test("deberia devolver el usuario almacenado con ese id", async () => {
      const usuario = new Usuario("Juana", "Lopez", "juana@example.com", "hash", 0, "Corporativa");
      await repositorioUsuario.guardar(usuario);

      const resultado = await repositorioUsuario.recuperarPorId(usuario.obtenerId());

      expect(resultado?.obtenerEmail()).toEqual("juana@example.com");
      expect(resultado?.obtenerSuscripcion()).toEqual("Corporativa");
    });

    test("deberia devolver null si no existe un usuario con ese id", async () => {
      expect(await repositorioUsuario.recuperarPorId(999999)).toBeNull();
    });
  });
});
