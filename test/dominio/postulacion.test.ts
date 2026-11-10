import Postulacion from "../../app/dominio/postulacion";

describe("Postulacion", () => {
  describe("constructor", () => {
    test("deberia crear una postulacion entre un aspirante y una oferta", () => {
      const postulacion = new Postulacion(2, 5, 1);

      expect(postulacion.obtenerIdAspirante()).toBe(2);
      expect(postulacion.obtenerIdOferta()).toBe(5);
      expect(postulacion.obtenerId()).toBe(1);
    });
  });
});
