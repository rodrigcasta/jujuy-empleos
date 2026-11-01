import Oferta from "../../app/dominio/oferta";

describe("Oferta", () => {
  describe("constructor", () => {
    test("deberia realizar una oferta con sus atributos correspondientes", async () => {
      const oferta = new Oferta(
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
        1,
        new Date("2026-11-01T15:00:00.000Z"),
      );

      expect(oferta.obtenerTitulo()).toEqual("Programador Jr.");

      expect(oferta.obtenerDescripcion()).toEqual("Se busca desarrollador backend junior");

      expect(oferta.obtenerUbicacion()).toEqual("Tres de Febrero");
    });
  });
});
