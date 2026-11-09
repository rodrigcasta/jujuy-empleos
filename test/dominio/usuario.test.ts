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
      ["email vacio", "Juana", "Lopez", "", "El email es obligatorio"],
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
      const usuario = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "Secreta123!#");

      expect(usuario.obtenerHashContrasena()).not.toEqual("Secreta123!#");
      expect(usuario.obtenerHashContrasena()).not.toContain("Secreta123!#");
      expect(usuario.obtenerHashContrasena()).toMatch(/^\$2[aby]\$/);
    });

    test("deberia generar hashes distintos para la misma contraseña", async () => {
      const usuario1 = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "Secreta123!#");
      const usuario2 = await Usuario.registrar("Ana", "Garcia", "ana@example.com", "Secreta123!#");

      expect(usuario1.obtenerHashContrasena()).not.toEqual(usuario2.obtenerHashContrasena());
    });

    test("deberia arrojar DatosDeUsuarioInvalidos si la contraseña tiene menos de 8 caracteres", async () => {
      await expect(Usuario.registrar("Juana", "Lopez", "juana@example.com", "corta")).rejects.toThrow(
        "La contraseña debe tener al menos 8 caracteres",
      );
    });

    test("deberia arrojar DatosDeUsuarioInvalidos si los demas datos son invalidos", async () => {
      await expect(Usuario.registrar("Juana", "Lopez", "no-es-un-email", "Secreta123!#")).rejects.toThrow(
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

    test("deberia registrar un usuario con una contraseña de 20 caracteres", async () => {
      const contrasena = "EmpresaSegura2026!#$";

      const usuario = await Usuario.registrar(
        "Laura",
        "Fernandez",
        "laura.fernandez@empresa-ejemplo.com.ar",
        contrasena,
        contrasena,
        "Profesional",
      );

      expect(await usuario.verificarContrasena(contrasena)).toBe(true);
    });

    test("deberia rechazar una contraseña de mas de 20 caracteres", async () => {
      const contrasena = "EmpresaSegura2026!#$A";

      const usuario = Usuario.registrar(
        "Laura",
        "Fernandez",
        "laura.fernandez@empresa-ejemplo.com.ar",
        contrasena,
        contrasena,
        "Profesional",
      );

      await expect(usuario).rejects.toThrow("La contraseña no puede tener mas de 20 caracteres");
    });

    test("deberia rechazar la contraseña vacia", async () => {
      const usuario = Usuario.registrar(
        "Laura",
        "Fernandez",
        "laura.fernandez@empresa-ejemplo.com.ar",
        "",
        "",
        "Profesional",
      );

      await expect(usuario).rejects.toThrow("La contraseña es obligatoria");
    });

    test("deberia rechazar una contraseña sin letra minuscula", async () => {
      const contrasena = "EMPRESA2026!#";

      const usuario = Usuario.registrar(
        "Laura",
        "Fernandez",
        "laura.fernandez@empresa-ejemplo.com.ar",
        contrasena,
        contrasena,
        "Profesional",
      );

      await expect(usuario).rejects.toThrow("La contraseña debe tener al menos una letra minúscula");
    });

    test("deberia rechazar una contraseña sin al menos una letra mayúscula", async () => {
      const contrasena = "empresa2026!#";

      const usuario = Usuario.registrar(
        "Laura",
        "Fernandez",
        "laura.fernandez@empresa-ejemplo.com.ar",
        contrasena,
        contrasena,
        "Profesional",
      );

      await expect(usuario).rejects.toThrow("La contraseña debe tener al menos una letra mayúscula");
    });

    test("deberia rechazar una contraseña sin al menos un numero", async () => {
      const contrasena = "Empresa!#";

      const usuario = Usuario.registrar(
        "Laura",
        "Fernandez",
        "laura.fernandez@empresa-ejemplo.com.ar",
        contrasena,
        contrasena,
        "Profesional",
      );

      await expect(usuario).rejects.toThrow("La contraseña debe tener al menos un número");
    });

    test("deberia rechazar una contraseña sin al menos dos símbolos", async () => {
      const contrasena = "Empresa2026!";

      const usuario = Usuario.registrar(
        "Laura",
        "Fernandez",
        "laura.fernandez@empresa-ejemplo.com.ar",
        contrasena,
        contrasena,
        "Profesional",
      );

      await expect(usuario).rejects.toThrow("La contraseña debe tener al menos 2 símbolos");
    });

    test.each([".,", "()", "[]", "¿?", "+*", "_-"])(
      "deberia aceptar %s como simbolos de la contraseña",
      async (simbolos) => {
        const contrasena = `Empresa2026${simbolos}`;

        const usuario = await Usuario.registrar(
          "Laura",
          "Fernandez",
          "laura.fernandez@empresa-ejemplo.com.ar",
          contrasena,
          contrasena,
          "Profesional",
        );

        expect(await usuario.verificarContrasena(contrasena)).toBe(true);
      },
    );

    test.each(["Gratuita", "Corporativa"])("deberia registrar un usuario con suscripcion %s", async (suscripcion) => {
      const usuario = await Usuario.registrar(
        "Laura",
        "Fernandez",
        "laura.fernandez@empresa-ejemplo.com.ar",
        "Empresa2026!#",
        "Empresa2026!#",
        suscripcion,
      );

      expect(usuario.obtenerSuscripcion()).toBe(suscripcion);
    });

    test("deberia registrar un usuario con suscripcion profesional de forma predeterminada", async () => {
      const usuario = await Usuario.registrar(
        "Laura",
        "Fernandez",
        "laura.fernandez@empresa-ejemplo.com.ar",
        "Empresa2026!#",
        "Empresa2026!#",
      );

      expect(usuario.obtenerSuscripcion()).toBe("Profesional");
    });

    test("deberia registrar un aspirante sin suscripcion", async () => {
      const usuario = await Usuario.registrarAspirante(
        "Sofia",
        "Martinez",
        "sofia.martinez@correo-ejemplo.com.ar",
        "Empleo2026!#",
        "Empleo2026!#",
      );

      expect(usuario.obtenerTipoUsuario()).toBe("Aspirante");
      expect(usuario.obtenerSuscripcion()).toBeNull();
    });
  });

  describe("registrar con confirmacion de contraseña", () => {
    test("deberia registrar al usuario si la confirmacion coincide con la contraseña", async () => {
      const usuario = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "Secreta123!#", "Secreta123!#");

      expect(await usuario.verificarContrasena("Secreta123!#")).toBe(true);
    });

    test("deberia arrojar DatosDeUsuarioInvalidos si la confirmacion no coincide con la contraseña", async () => {
      const registrar = Usuario.registrar("Juana", "Lopez", "juana@example.com", "Secreta123!#", "Distinta123");

      await expect(registrar).rejects.toThrow(DatosDeUsuarioInvalidos);
      await expect(registrar).rejects.toThrow("Las contraseñas no coinciden");
    });

    test("deberia validar la confirmacion aunque este vacia", async () => {
      await expect(Usuario.registrar("Juana", "Lopez", "juana@example.com", "Secreta123!#", "")).rejects.toThrow(
        "Las contraseñas no coinciden",
      );
    });

    test("no deberia validar la confirmacion si no esta presente", async () => {
      const usuario = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "Secreta123!#", undefined);

      expect(usuario.obtenerEmail()).toEqual("juana@example.com");
    });

    test("deberia validar el largo de la contraseña antes que la confirmacion", async () => {
      await expect(Usuario.registrar("Juana", "Lopez", "juana@example.com", "Corta", "Otra")).rejects.toThrow(
        "La contraseña debe tener al menos 8 caracteres",
      );
    });
  });

  describe("verificarContrasena", () => {
    test("deberia devolver true si la contraseña es correcta", async () => {
      const usuario = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "Secreta123!#");

      expect(await usuario.verificarContrasena("Secreta123!#")).toBe(true);
    });

    test("deberia devolver false si la contraseña es incorrecta", async () => {
      const usuario = await Usuario.registrar("Juana", "Lopez", "juana@example.com", "Secreta123!#");

      expect(await usuario.verificarContrasena("otra-clave")).toBe(false);
    });

    describe("puedePublicar", () => {
      test.each([
        ["Gratuita", 0, true],
        ["Gratuita", 1, false],
        ["Profesional", 4, true],
        ["Profesional", 5, false],
        ["Corporativa", 5, true],
        ["Corporativa", 50, true],
      ])(
        "con suscripcion %s y %i ofertas publicadas deberia devolver %s",
        (suscripcion, cantidadOfertasPublicadas, esperado) => {
          const usuario = new Usuario(
            "Laura",
            "Fernandez",
            "laura.fernandez@empresa-ejemplo.com.ar",
            "Empresa2026!#",
            1,
            suscripcion,
          );

          expect(usuario.puedePublicar(cantidadOfertasPublicadas)).toBe(esperado);
        },
      );
    });
  });
});
