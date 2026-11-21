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

  describe("registrarSegunTipo", () => {
    test.each<[string, string | null]>([
      ["Aspirante", null],
      ["Empresario", "Corporativa"],
    ])("deberia guardar un %s con su suscripcion correspondiente", async (tipoUsuario, planEsperado) => {
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(null);
      mockRepositorioUsuario.guardar.mockResolvedValue(undefined);

      const usuario = await sistemaUsuarios.registrarSegunTipo(
        tipoUsuario,
        "Juana",
        "Lopez",
        "juana@example.com",
        "Secreta123!#",
        "Secreta123!#",
        "Corporativa",
      );

      expect(usuario.obtenerTipoUsuario()).toBe(tipoUsuario);
      expect(usuario.obtenerSuscripcion()?.obtenerPlan() ?? null).toBe(planEsperado);
      expect(mockRepositorioUsuario.guardar).toHaveBeenCalledTimes(1);
      expect(mockRepositorioUsuario.guardar).toHaveBeenCalledWith(usuario);
    });

    test("deberia rechazar un tipo desconocido antes de acceder al repositorio", async () => {
      const registrar = sistemaUsuarios.registrarSegunTipo(
        "Administrador",
        "Juana",
        "Lopez",
        "juana@example.com",
        "Secreta123!#",
      );

      await expect(registrar).rejects.toThrow(DatosDeUsuarioInvalidos);
      await expect(registrar).rejects.toThrow("Debe seleccionar un tipo de usuario");
      expect(mockRepositorioUsuario.recuperarPorEmail).not.toHaveBeenCalled();
      expect(mockRepositorioUsuario.guardar).not.toHaveBeenCalled();
    });
  });

  describe("registrarEmpresario", () => {
    test("deberia crear un Usuario con la contraseña hasheada y guardarlo en el repositorio", async () => {
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(null);
      mockRepositorioUsuario.guardar.mockResolvedValue(undefined);

      const usuario = await sistemaUsuarios.registrarEmpresario(
        "Juana",
        "Lopez",
        "Juana@Example.com",
        "Secreta123!#",
        "Secreta123!#",
        "Corporativa",
      );

      expect(mockRepositorioUsuario.guardar).toHaveBeenCalledTimes(1);
      const usuarioGuardado = mockRepositorioUsuario.guardar.mock.calls[0][0];
      expect(usuarioGuardado).toBe(usuario);
      expect(usuarioGuardado.obtenerEmail()).toEqual("juana@example.com");
      expect(usuarioGuardado.obtenerHashContrasena()).not.toEqual("Secreta123!#");
      expect(usuarioGuardado.obtenerSuscripcion()?.obtenerPlan()).toEqual("Corporativa");
      expect(await usuarioGuardado.verificarContrasena("Secreta123!#")).toBe(true);
    });

    test("deberia arrojar UsuarioYaExisteError si ya hay un usuario con el mismo email", async () => {
      const existente = await Usuario.registrarEmpresario("Juana", "Lopez", "juana@ejemplo.com", "Secreta123!#");
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(existente);

      const registrar = sistemaUsuarios.registrarEmpresario("Otra", "Persona", "JUANA@EJEMPLO.COM", "Otra-clave1!#");

      await expect(registrar).rejects.toThrow(UsuarioYaExisteError);

      await expect(registrar).rejects.toThrow("Este email ya está en uso");

      expect(mockRepositorioUsuario.recuperarPorEmail).toHaveBeenCalledWith("juana@ejemplo.com");

      expect(mockRepositorioUsuario.guardar).not.toHaveBeenCalled();
    });

    test("deberia arrojar DatosDeUsuarioInvalidos y no guardar si la confirmacion no coincide", async () => {
      await expect(
        sistemaUsuarios.registrarEmpresario("Juana", "Lopez", "juana@example.com", "Secreta123!#", "Distinta123!#"),
      ).rejects.toThrow("Las contraseñas no coinciden");

      expect(mockRepositorioUsuario.guardar).not.toHaveBeenCalled();
    });

    test("deberia arrojar DatosDeUsuarioInvalidos y no guardar si los datos son invalidos", async () => {
      await expect(sistemaUsuarios.registrarEmpresario("Juana", "Lopez", "juana@example.com", "Corta")).rejects.toThrow(
        DatosDeUsuarioInvalidos,
      );

      expect(mockRepositorioUsuario.guardar).not.toHaveBeenCalled();
    });
  });

  describe("registrarAspirante", () => {
    test("deberia guardar un aspirante sin suscripcion", async () => {
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(null);
      mockRepositorioUsuario.guardar.mockResolvedValue(undefined);

      const aspirante = await sistemaUsuarios.registrarAspirante(
        "Sofia",
        "Martinez",
        "sofia.martinez@correo-ejemplo.com.ar",
        "Empleo2026!#",
        "Empleo2026!#",
      );

      expect(aspirante.obtenerTipoUsuario()).toBe("Aspirante");
      expect(aspirante.obtenerSuscripcion()).toBeNull();
      expect(mockRepositorioUsuario.guardar).toHaveBeenCalledWith(aspirante);
    });
  });

  describe("autenticar", () => {
    let usuario: Usuario;

    beforeEach(async () => {
      usuario = await Usuario.registrarEmpresario("Juana", "Lopez", "juana@example.com", "Secreta123!#");
    });

    test("deberia devolver el usuario si el email y la contraseña son correctos", async () => {
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(usuario);

      const resultado = await sistemaUsuarios.autenticar(" JUANA@example.com ", "Secreta123!#");

      expect(resultado).toBe(usuario);
      expect(mockRepositorioUsuario.recuperarPorEmail).toHaveBeenCalledWith("juana@example.com");
    });

    test("deberia devolver null si la contraseña es incorrecta", async () => {
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(usuario);

      expect(await sistemaUsuarios.autenticar("juana@example.com", "otra-clave")).toBeNull();
    });

    test("deberia devolver null si el usuario no existe", async () => {
      mockRepositorioUsuario.recuperarPorEmail.mockResolvedValue(null);

      expect(await sistemaUsuarios.autenticar("nadie@example.com", "Secreta123!#")).toBeNull();
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
