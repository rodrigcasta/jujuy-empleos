import Postulacion from "../../app/dominio/postulacion";
import DatosDePostulacionInvalidos from "../../app/dominio/datos-de-postulacion-invalidos";

describe("Postulacion", () => {
  describe("constructor", () => {
    test("deberia rechazar una fecha de postulacion invalida", () => {
      const crearPostulacion = () => new Postulacion(2, 5, new Date("fecha invalida"));

      expect(crearPostulacion).toThrow(DatosDePostulacionInvalidos);
      expect(crearPostulacion).toThrow("La fecha de postulación es inválida");
    });

    test("deberia crear una postulacion entre un aspirante y una oferta", () => {
      const fechaPostulacion = new Date("2026-11-09T20:00:00.000Z");
      const postulacion = new Postulacion(2, 5, fechaPostulacion, 1);

      expect(postulacion.obtenerIdAspirante()).toBe(2);
      expect(postulacion.obtenerIdOferta()).toBe(5);
      expect(postulacion.obtenerFechaPostulacion()).toEqual(fechaPostulacion);
      expect(postulacion.obtenerId()).toBe(1);
    });

    test("deberia conservar una fecha valida aunque se modifique la fecha recibida", () => {
      const fechaPostulacion = new Date("2026-11-09T20:00:00.000Z");
      const postulacion = new Postulacion(2, 5, fechaPostulacion);

      fechaPostulacion.setTime(NaN);

      expect(postulacion.obtenerFechaPostulacion()).toEqual(new Date("2026-11-09T20:00:00.000Z"));
    });
  });

  describe("obtenerFechaPostulacion", () => {
    test("deberia conservar una fecha valida aunque se modifique la fecha devuelta", () => {
      const postulacion = new Postulacion(2, 5, new Date("2026-11-09T20:00:00.000Z"));

      postulacion.obtenerFechaPostulacion().setTime(NaN);

      expect(postulacion.obtenerFechaPostulacion()).toEqual(new Date("2026-11-09T20:00:00.000Z"));
    });
  });
});
