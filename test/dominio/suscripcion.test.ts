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
});
