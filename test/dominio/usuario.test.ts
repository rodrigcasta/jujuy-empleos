import Usuario from "../../app/dominio/usuario";
import DatosDeUsuarioInvalidos from "../../app/dominio/datos-de-usuario-invalidos";

describe("Usuario", () => {
  describe("constructor", () => {
    test("deberia crear un usuario con todos los atributos", () => {
      const usuario = new Usuario("Juana", "Lopez", "juana@example.com", "hash", 7);

      expect(usuario.obtenerNombre()).toEqual("Juana");
      expect(usuario.obtenerApellido()).toEqual("Lopez");
      expect(usuario.obtenerEmail()).toEqual("juana@example.com");
      expect(usuario.obtenerHashContrasena()).toEqual("hash");
      expect(usuario.obtenerId()).toEqual(7);
    });

    test("deberia normalizar el email a minusculas y sin espacios", () => {
      const usuario = new Usuario("Juana", "Lopez", "  Juana@Example.COM ", "hash");

      expect(usuario.obtenerEmail()).toEqual("juana@example.com");
    });

    test("deberia quitar los espacios al principio y al final del nombre y apellido", () => {
      const usuario = new Usuario("  Juana ", " Lopez  ", "juana@example.com", "hash");

      expect(usuario.obtenerNombre()).toEqual("Juana");
      expect(usuario.obtenerApellido()).toEqual("Lopez");
    });

    test.each([
      ["nombre vacio", "", "Lopez", "juana@example.com", "El campo nombre es obligatorio"],
      ["nombre con solo espacios", "   ", "Lopez", "juana@example.com", "El campo nombre es obligatorio"],
      ["apellido vacio", "Juana", "", "juana@example.com", "El campo apellido es obligatorio"],
      ["nombre demasiado largo", "a".repeat(21), "Lopez", "juana@example.com", "no puede tener más de 20"],
      ["apellido demasiado largo", "Juana", "a".repeat(21), "juana@example.com", "no puede tener más de 20"],
      ["email sin arroba", "Juana", "Lopez", "juana.example.com", "El email no es válido"],
      ["email sin dominio", "Juana", "Lopez", "juana@", "El email no es válido"],
      ["email vacio", "Juana", "Lopez", "", "El email no es válido"],
    ])("deberia arrojar DatosDeUsuarioInvalidos con %s", (_caso, nombre, apellido, email, mensaje) => {
      const crear = () => new Usuario(nombre, apellido, email, "hash");

      expect(crear).toThrow(DatosDeUsuarioInvalidos);
      expect(crear).toThrow(mensaje);
    });

    test("deberia arrojar DatosDeUsuarioInvalidos si no tiene hash de contraseña", () => {
      expect(() => new Usuario("Juana", "Lopez", "juana@example.com", "")).toThrow(DatosDeUsuarioInvalidos);
    });
  });

  describe("registrar", () => {
    test("deberia guardar un hash de la contraseña y no la contraseña en texto plano", async () => {
      const usuario = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "secreta123");

      expect(usuario.obtenerHashContrasena()).not.toEqual("secreta123");
      expect(usuario.obtenerHashContrasena()).not.toContain("secreta123");
      expect(usuario.obtenerHashContrasena()).toMatch(/^\$2[aby]\$/);
    });

    test("deberia generar hashes distintos para la misma contraseña", async () => {
      const usuario1 = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "secreta123");
      const usuario2 = await Usuario.registrar("Ana", "Garcia", "ana@example.com", "secreta123");

      expect(usuario1.obtenerHashContrasena()).not.toEqual(usuario2.obtenerHashContrasena());
    });

    test("deberia arrojar DatosDeUsuarioInvalidos si la contraseña tiene menos de 8 caracteres", async () => {
      await expect(Usuario.registrar("Juana", "Lopez", "juana@example.com", "corta")).rejects.toThrow(
        "La contraseña debe tener al menos 8 caracteres",
      );
    });

    test("deberia arrojar DatosDeUsuarioInvalidos si los demas datos son invalidos", async () => {
      await expect(Usuario.registrar("Juana", "Lopez", "no-es-un-email", "secreta123")).rejects.toThrow(
        DatosDeUsuarioInvalidos,
      );
    });

    test("deberia registrar un usuario con suscripcion Profesional", async () => {
      const usuario = await Usuario.registrar(
        "Laura",
        "Fernandez",
        "laura.fernandez@empresa-ejemplo.com.ar",
        "Empresa2026!#",
        "Empresa2026!#",
        "Profesional",
      );

      expect(usuario.obtenerSuscripcion()).toBe("Profesional");
    });

    test("deberia rechazar un email de mas de 254 caracteres", async () => {
      const email = `${"a".repeat(243)}@ejemplo.com`;
      const usuario = Usuario.registrar("Laura", "Fernandez", email, "Empresa2026!#", "Empresa2026!#", "Profesional");

      await expect(usuario).rejects.toThrow("El email no puede tener mas de 254 caracteres");
    });
  });

  describe("registrar con confirmacion de contraseña", () => {
    test("deberia registrar al usuario si la confirmacion coincide con la contraseña", async () => {
      const usuario = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "secreta123", "secreta123");

      expect(await usuario.verificarContrasena("secreta123")).toBe(true);
    });

    test("deberia arrojar DatosDeUsuarioInvalidos si la confirmacion no coincide con la contraseña", async () => {
      const registrar = Usuario.registrar("Juana", "Lopez", "juana@example.com", "secreta123", "distinta123");

      await expect(registrar).rejects.toThrow(DatosDeUsuarioInvalidos);
      await expect(registrar).rejects.toThrow("Las contraseñas no coinciden");
    });

    test("deberia validar la confirmacion aunque este vacia", async () => {
      await expect(Usuario.registrar("Juana", "Lopez", "juana@example.com", "secreta123", "")).rejects.toThrow(
        "Las contraseñas no coinciden",
      );
    });

    test("no deberia validar la confirmacion si no esta presente", async () => {
      const usuario = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "secreta123", undefined);

      expect(usuario.obtenerEmail()).toEqual("juana@example.com");
    });

    test("deberia validar el largo de la contraseña antes que la confirmacion", async () => {
      await expect(Usuario.registrar("Juana", "Lopez", "juana@example.com", "corta", "otra")).rejects.toThrow(
        "La contraseña debe tener al menos 8 caracteres",
      );
    });
  });

  describe("verificarContrasena", () => {
    test("deberia devolver true si la contraseña es correcta", async () => {
      const usuario = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "secreta123");

      expect(await usuario.verificarContrasena("secreta123")).toBe(true);
    });

    test("deberia devolver false si la contraseña es incorrecta", async () => {
      const usuario = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "secreta123");

      expect(await usuario.verificarContrasena("otra-clave")).toBe(false);
    });
  });
});
