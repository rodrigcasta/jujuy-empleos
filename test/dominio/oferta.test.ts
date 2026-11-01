import Oferta from "../../app/dominio/oferta";

describe("Oferta", () => {
  describe("constructor", () => {
    test("deberia realizar una oferta con sus atributos correspondientes", async () => {
      const fechaPublicacion = new Date("2026-11-01T15:00:00.000Z");

      const oferta = new Oferta(
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
        1,
        fechaPublicacion,
      );

      expect(oferta.obtenerTitulo()).toBe("Programador Jr.");
      expect(oferta.obtenerDescripcion()).toBe("Se busca desarrollador backend junior");
      expect(oferta.obtenerUbicacion()).toBe("Tres de Febrero");
      expect(oferta.obtenerIdEmpresario()).toBe(1);
      expect(oferta.obtenerFechaPublicacion()).toBe(fechaPublicacion);
    });
  });
});
