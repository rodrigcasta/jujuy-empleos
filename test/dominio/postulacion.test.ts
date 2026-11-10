import Postulacion from "../../app/dominio/postulacion";

describe("Postulacion", () => {
  describe("constructor", () => {
    test("deberia crear una postulacion entre un aspirante y una oferta", () => {
      const fechaPostulacion = new Date("2026-11-09T20:00:00.000Z");
      const postulacion = new Postulacion(2, 5, fechaPostulacion, 1);

      expect(postulacion.obtenerIdAspirante()).toBe(2);
      expect(postulacion.obtenerIdOferta()).toBe(5);
      expect(postulacion.obtenerFechaPostulacion()).toEqual(fechaPostulacion);
      expect(postulacion.obtenerId()).toBe(1);
    });
  });
});
