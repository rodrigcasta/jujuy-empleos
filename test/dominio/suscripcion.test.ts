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
});
