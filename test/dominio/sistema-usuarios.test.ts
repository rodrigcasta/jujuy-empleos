import SistemaUsuarios from "../../app/dominio/sistema-usuarios";
import Usuario from "../../app/dominio/usuario";
import UsuarioYaExisteError from "../../app/dominio/usuario-ya-existe-error";
import DatosDeUsuarioInvalidos from "../../app/dominio/datos-de-usuario-invalidos";
import { IRepositorioUsuario } from "../../app/dominio/puerto-repositorio-usuario";
import { Mock, mock } from "ts-jest-mocker";

describe("SistemaUsuarios", () => {
  let sistemaUsuarios: SistemaUsuarios;
  let mockRepositorioUsuario: Mock<IRepositorioUsuario>;

  beforeEach(() => {
    mockRepositorioUsuario = mock<IRepositorioUsuario>();
    sistemaUsuarios = new SistemaUsuarios(mockRepositorioUsuario);
  });

  describe("registrar", () => {
    test("deberia crear un Usuario con la contraseña hasheada y guardarlo en el repositorio", async () => {
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(null);
      mockRepositorioUsuario.guardar.mockResolvedValue(true);

      const usuario = await sistemaUsuarios.registrar("Juana", "Lopez", "Juana@Example.com", "secreta123");

      expect(mockRepositorioUsuario.guardar).toHaveBeenCalledTimes(1);
      const usuarioGuardado = mockRepositorioUsuario.guardar.mock.calls[0][0];
      expect(usuarioGuardado).toBe(usuario);
      expect(usuarioGuardado.getEmail()).toEqual("juana@example.com");
      expect(usuarioGuardado.getHashContrasena()).not.toEqual("secreta123");
      expect(await usuarioGuardado.verificarContrasena("secreta123")).toBe(true);
    });

    test("deberia arrojar UsuarioYaExisteError si ya hay un usuario con el mismo email", async () => {
      const existente = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "secreta123");
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(existente);

      await expect(sistemaUsuarios.registrar("Otra", "Persona", "juana@example.com", "otra-clave")).rejects.toThrow(
        UsuarioYaExisteError,
      );

      expect(mockRepositorioUsuario.recuperarPorEmail).toHaveBeenCalledWith("juana@example.com");
      expect(mockRepositorioUsuario.guardar).not.toHaveBeenCalled();
    });

    test("deberia arrojar DatosDeUsuarioInvalidos y no guardar si la confirmacion no coincide", async () => {
      await expect(
        sistemaUsuarios.registrar("Juana", "Lopez", "juana@example.com", "secreta123", "distinta123"),
      ).rejects.toThrow("Las contraseñas no coinciden");

      expect(mockRepositorioUsuario.guardar).not.toHaveBeenCalled();
    });

    test("deberia arrojar DatosDeUsuarioInvalidos y no guardar si los datos son invalidos", async () => {
      await expect(sistemaUsuarios.registrar("Juana", "Lopez", "juana@example.com", "corta")).rejects.toThrow(
        DatosDeUsuarioInvalidos,
      );

      expect(mockRepositorioUsuario.guardar).not.toHaveBeenCalled();
    });
  });

  describe("autenticar", () => {
    let usuario: Usuario;

    beforeEach(async () => {
      usuario = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "secreta123");
    });

    test("deberia devolver el usuario si el email y la contraseña son correctos", async () => {
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(usuario);

      const resultado = await sistemaUsuarios.autenticar(" JUANA@example.com ", "secreta123");

      expect(resultado).toBe(usuario);
      expect(mockRepositorioUsuario.recuperarPorEmail).toHaveBeenCalledWith("juana@example.com");
    });

    test("deberia devolver null si la contraseña es incorrecta", async () => {
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(usuario);

      expect(await sistemaUsuarios.autenticar("juana@example.com", "otra-clave")).toBeNull();
    });

    test("deberia devolver null si el usuario no existe", async () => {
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(null);

      expect(await sistemaUsuarios.autenticar("nadie@example.com", "secreta123")).toBeNull();
    });
  });

  describe("obtenerPorId", () => {
    test("deberia devolver el usuario que devuelve el repositorio", async () => {
      const usuario = new Usuario("Juana", "Lopez", "juana@example.com", "hash", 3);
      mockRepositorioUsuario.recuperarPorId.mockResolvedValue(usuario);

      expect(await sistemaUsuarios.obtenerPorId(3)).toBe(usuario);
      expect(mockRepositorioUsuario.recuperarPorId).toHaveBeenCalledWith(3);
    });
  });
});
