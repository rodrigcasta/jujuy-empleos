import Oferta from "../../app/dominio/oferta";
import DatosDeOfertaInvalidos from "../../app/dominio/datos-de-oferta-invalidos";

describe("Oferta", () => {
  describe("constructor", () => {
    test("deberia realizar una oferta con sus atributos correspondientes", () => {
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

    test.each([
      ["titulo", "", "Descripcion valida", "Ubicacion valida"],
      ["titulo", "   ", "Descripcion valida", "Ubicacion valida"],
      ["descripcion", "Titulo valido", "", "Ubicacion valida"],
      ["descripcion", "Titulo valido", "   ", "Ubicacion valida"],
      ["ubicacion", "Titulo valido", "Descripcion valida", ""],
      ["ubicacion", "Titulo valido", "Descripcion valida", "   "],
    ])("deberia rechazar %s vacio", (campo, titulo, descripcion, ubicacion) => {
      const crearOferta = () => new Oferta(titulo, descripcion, ubicacion, 1, new Date("2026-11-01T15:00:00.000Z"));

      expect(crearOferta).toThrow(DatosDeOfertaInvalidos);
      expect(crearOferta).toThrow(`${campo} es obligatorio`);
    });

    test("deberia rechazar un titulo con 51 caracteres o mas", () => {
      const fechaPublicacion = new Date("2026-11-01T15:00:00.000Z");

      const crearOferta = () =>
        new Oferta("a".repeat(51), "Se busca desarrollador backend junior", "Tres de Febrero", 1, fechaPublicacion);

      expect(crearOferta).toThrow(DatosDeOfertaInvalidos);
      expect(crearOferta).toThrow("El titulo tiene más de 50 caracteres");
    });

    test("deberia aceptar un titulo con exactamente 50 caracteres", () => {
      const titulo = "a".repeat(50);

      const oferta = new Oferta(
        titulo,
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
        1,
        new Date("2026-11-01T15:00:00.000Z"),
      );

      expect(oferta.obtenerTitulo()).toBe(titulo);
    });
  });
});
