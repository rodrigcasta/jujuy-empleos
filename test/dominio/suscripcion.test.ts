import Suscripcion from "../../app/dominio/suscripcion";
import DatosDeSuscripcionInvalidos from "../../app/dominio/datos-de-suscripcion-invalidos";

describe("Suscripcion", () => {
  describe("constructor", () => {
    test("deberia conservar el plan Profesional", () => {
      const suscripcion = new Suscripcion("Profesional");

      expect(suscripcion.obtenerPlan()).toBe("Profesional");
    });

    test("deberia rechazar un plan desconocido", () => {
      const crearSuscripcion = () => new Suscripcion("Desconocido");

      expect(crearSuscripcion).toThrow(DatosDeSuscripcionInvalidos);
      expect(crearSuscripcion).toThrow("La suscripción es inválida");
    });
  });

  describe("puedePublicar con Gratuita", () => {
    test("deberia permitir publicar sin ofertas activas", () => {
      const suscripcion = new Suscripcion("Gratuita");

      expect(suscripcion.puedePublicar(0)).toBe(true);
    });

    test("deberia impedir publicar cuando ya tiene una oferta activa", () => {
      const suscripcion = new Suscripcion("Gratuita");

      expect(suscripcion.puedePublicar(1)).toBe(false);
    });
  });

  describe("puedePublicar con Profesional", () => {
    test("deberia permitir publicar cuando tiene cuatro ofertas activas", () => {
      const suscripcion = new Suscripcion("Profesional");

      expect(suscripcion.puedePublicar(4)).toBe(true);
    });

    test("deberia impedir publicar cuando ya tiene cinco ofertas activas", () => {
      const suscripcion = new Suscripcion("Profesional");

      expect(suscripcion.puedePublicar(5)).toBe(false);
    });
  });

  describe("puedePublicar con Corporativa", () => {
    test("deberia permitir publicar cuando tiene cinco ofertas activas", () => {
      const suscripcion = new Suscripcion("Corporativa");

      expect(suscripcion.puedePublicar(5)).toBe(true);
    });

    test("deberia permitir publicar cuando tiene cincuenta ofertas activas", () => {
      const suscripcion = new Suscripcion("Corporativa");

      expect(suscripcion.puedePublicar(50)).toBe(true);
    });
  });

  describe("puedePublicar con cantidades invalidas", () => {
    test("deberia rechazar una cantidad negativa", () => {
      const suscripcion = new Suscripcion("Gratuita");

      const consultarCapacidad = () => suscripcion.puedePublicar(-1);

      expect(consultarCapacidad).toThrow(DatosDeSuscripcionInvalidos);
      expect(consultarCapacidad).toThrow("La cantidad de ofertas activas es inválida");
    });

    test("deberia rechazar una cantidad fraccionaria aunque el plan no tenga limite", () => {
      const suscripcion = new Suscripcion("Corporativa");

      const consultarCapacidad = () => suscripcion.puedePublicar(1.5);

      expect(consultarCapacidad).toThrow(DatosDeSuscripcionInvalidos);
      expect(consultarCapacidad).toThrow("La cantidad de ofertas activas es inválida");
    });
  });
});
