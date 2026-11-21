import Oferta from "../../app/dominio/oferta";
import DatosDeOfertaInvalidos from "../../app/dominio/datos-de-oferta-invalidos";
import OfertaYaCerradaError from "../../app/dominio/oferta-ya-cerrada-error";
import Usuario from "../../app/dominio/usuario";

describe("Oferta", () => {
  const titular = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 1);
  describe("constructor", () => {
    test("deberia rechazar una fecha de publicacion invalida", () => {
      const crearOferta = () =>
        new Oferta("Backend", "Desarrollo backend", "Remoto", titular, new Date("fecha invalida"));

      expect(crearOferta).toThrow(DatosDeOfertaInvalidos);
      expect(crearOferta).toThrow("La fecha de publicación es inválida");
    });

    test("deberia conservar al empresario titular como objeto asociado", () => {
      const titular = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7);

      const oferta = new Oferta("Backend", "Desarrollo backend", "Remoto", titular, new Date("2026-11-01"));

      expect(oferta.obtenerTitular()).toBe(titular);
      expect(oferta.obtenerTitular().obtenerEmail()).toBe("laura@example.com");
    });

    test("deberia rechazar una oferta cuyo titular es aspirante", () => {
      const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 9, null, "Aspirante");
      const crearOferta = () =>
        new Oferta("Backend", "Desarrollo backend", "Remoto", aspirante, new Date("2026-11-01"));

      expect(crearOferta).toThrow(DatosDeOfertaInvalidos);
      expect(crearOferta).toThrow("El titular de la oferta debe ser empresario");
    });

    test("deberia realizar una oferta con sus atributos correspondientes", () => {
      const fechaPublicacion = new Date("2026-11-01T15:00:00.000Z");

      const oferta = new Oferta(
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
        titular,
        fechaPublicacion,
      );

      expect(oferta.obtenerTitulo()).toBe("Programador Jr.");
      expect(oferta.obtenerDescripcion()).toBe("Se busca desarrollador backend junior");
      expect(oferta.obtenerUbicacion()).toBe("Tres de Febrero");
      expect(oferta.obtenerTitular().obtenerId()).toBe(1);
      expect(oferta.obtenerFechaPublicacion()).toEqual(fechaPublicacion);
    });

    test.each([
      ["titulo", "", "Descripcion valida", "Ubicacion valida"],
      ["titulo", "   ", "Descripcion valida", "Ubicacion valida"],
      ["descripcion", "Titulo valido", "", "Ubicacion valida"],
      ["descripcion", "Titulo valido", "   ", "Ubicacion valida"],
      ["ubicacion", "Titulo valido", "Descripcion valida", ""],
      ["ubicacion", "Titulo valido", "Descripcion valida", "   "],
    ])("deberia rechazar %s vacio", (campo, titulo, descripcion, ubicacion) => {
      const crearOferta = () =>
        new Oferta(titulo, descripcion, ubicacion, titular, new Date("2026-11-01T15:00:00.000Z"));

      expect(crearOferta).toThrow(DatosDeOfertaInvalidos);
      expect(crearOferta).toThrow(`${campo} es obligatorio`);
    });

    test("deberia rechazar un titulo con 51 caracteres o mas", () => {
      const fechaPublicacion = new Date("2026-11-01T15:00:00.000Z");

      const crearOferta = () =>
        new Oferta(
          "a".repeat(51),
          "Se busca desarrollador backend junior",
          "Tres de Febrero",
          titular,
          fechaPublicacion,
        );

      expect(crearOferta).toThrow(DatosDeOfertaInvalidos);
      expect(crearOferta).toThrow("El titulo tiene más de 50 caracteres");
    });

    test("deberia aceptar un titulo con exactamente 50 caracteres", () => {
      const titulo = "a".repeat(50);

      const oferta = new Oferta(
        titulo,
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
        titular,
        new Date("2026-11-01T15:00:00.000Z"),
      );

      expect(oferta.obtenerTitulo()).toBe(titulo);
    });

    test("deberia rechazar una descripcion de 251 caracteres", () => {
      const crearOferta = () =>
        new Oferta(
          "Programador Jr.",
          "a".repeat(251),
          "Tres de Febrero",
          titular,
          new Date("2026-11-01T15:00:00.000Z"),
        );

      expect(crearOferta).toThrow(DatosDeOfertaInvalidos);
      expect(crearOferta).toThrow("La descripción tiene mas de 250 caracteres");
    });

    test("deberia aceptar una descripcion con exactamente 250 caracteres", () => {
      const descripcion = "a".repeat(250);

      const oferta = new Oferta(
        "Desarrollador backend",
        descripcion,
        "Tres de Febrero",
        titular,
        new Date("2026-11-01T15:00:00.000Z"),
      );

      expect(oferta.obtenerDescripcion()).toBe(descripcion);
    });

    test("deberia rechazar una ubicacion de 71 caracteres", () => {
      const crearOferta = () =>
        new Oferta(
          "Programador Jr.",
          "Se busca desarrollador backend junior",
          "a".repeat(71),
          titular,
          new Date("2026-11-01T15:00:00.000Z"),
        );

      expect(crearOferta).toThrow(DatosDeOfertaInvalidos);
      expect(crearOferta).toThrow("La ubicación tiene más de 70 caracteres");
    });

    test("deberia aceptar una ubicacion con exactamente 70 caracteres", () => {
      const ubicacion = "a".repeat(70);

      const oferta = new Oferta(
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        ubicacion,
        titular,
        new Date("2026-11-01T15:00:00.000Z"),
      );

      expect(oferta.obtenerUbicacion()).toBe(ubicacion);
    });

    test("deberia normalizar los espacios exteriores de titulo, descripcion y ubicacion", () => {
      const fechaPublicacion = new Date("2026-11-01T15:00:00.000Z");

      const oferta = new Oferta(
        "  Desarrollador backend  ",
        "  Se busca desarrollador backend junior  ",
        "  Tres de Febrero  ",
        titular,
        fechaPublicacion,
      );
      expect(oferta.obtenerTitulo()).toBe("Desarrollador backend");
      expect(oferta.obtenerDescripcion()).toBe("Se busca desarrollador backend junior");
      expect(oferta.obtenerUbicacion()).toBe("Tres de Febrero");
    });
  });

  describe("fechaPublicacion", () => {
    test("deberia conservar la fecha aunque se modifique la recibida al construir", () => {
      const fechaPublicacion = new Date("2026-11-01T15:00:00.000Z");
      const oferta = new Oferta("Backend", "Desarrollo backend", "Remoto", titular, fechaPublicacion);

      fechaPublicacion.setTime(NaN);

      expect(oferta.obtenerFechaPublicacion()).toEqual(new Date("2026-11-01T15:00:00.000Z"));
    });

    test("deberia conservar la fecha aunque se modifique la devuelta", () => {
      const oferta = new Oferta(
        "Backend",
        "Desarrollo backend",
        "Remoto",
        titular,
        new Date("2026-11-01T15:00:00.000Z"),
      );

      oferta.obtenerFechaPublicacion().setTime(NaN);

      expect(oferta.obtenerFechaPublicacion()).toEqual(new Date("2026-11-01T15:00:00.000Z"));
    });
  });

  describe("estadoOferta", () => {
    test("deberia crear una oferta en estado activo", () => {
      const oferta = new Oferta(
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
        titular,
        new Date("2026-11-01T15:00:00.000Z"),
      );

      expect(oferta.estaActiva()).toBe(true);
    });

    test("deberia cambiar el estado de una oferta activa a cerrada", () => {
      const oferta = new Oferta(
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
        titular,
        new Date("2026-11-01T15:00:00.000Z"),
      );

      oferta.cerrar();

      expect(oferta.estaActiva()).toBe(false);
    });

    test("no deberia permitir cerrar una oferta que ya esta cerrada", () => {
      const oferta = new Oferta(
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
        titular,
        new Date("2026-11-01T15:00:00.000Z"),
      );

      oferta.cerrar();

      expect(() => oferta.cerrar()).toThrow(OfertaYaCerradaError);
    });
  });
});
