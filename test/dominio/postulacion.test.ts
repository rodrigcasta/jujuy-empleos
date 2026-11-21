import OfertaYaCerradaError from "../../app/dominio/oferta-ya-cerrada-error";
import Postulacion from "../../app/dominio/postulacion";
import DatosDePostulacionInvalidos from "../../app/dominio/datos-de-postulacion-invalidos";
import Usuario from "../../app/dominio/usuario";
import Oferta from "../../app/dominio/oferta";
import PostulacionNoAutorizadaError from "../../app/dominio/postulacion-no-autorizada-error";

describe("Postulacion", () => {
  const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 2, null, "Aspirante");
  const titular = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7);
  const oferta = new Oferta("Backend", "Desarrollo backend", "Remoto", titular, new Date("2026-11-09"), 5);

  describe("crear", () => {
    test("deberia rechazar una nueva postulacion a una oferta cerrada", () => {
      const ofertaCerrada = new Oferta("Backend", "Desarrollo backend", "Remoto", titular, new Date("2026-11-09"), 5);
      ofertaCerrada.cerrar();

      const crearPostulacion = () => Postulacion.crear(aspirante, ofertaCerrada, new Date("2026-11-09"));

      expect(crearPostulacion).toThrow(OfertaYaCerradaError);
      expect(crearPostulacion).toThrow("La oferta ya se encuentra cerrada");
    });

    test("deberia rechazar una postulacion cuyo postulante no es aspirante", () => {
      const crearPostulacion = () => Postulacion.crear(titular, oferta, new Date("2026-11-09"));

      expect(crearPostulacion).toThrow(PostulacionNoAutorizadaError);
    });
    test("deberia rechazar una fecha de postulacion invalida", () => {
      const crearPostulacion = () => Postulacion.crear(aspirante, oferta, new Date("fecha invalida"));

      expect(crearPostulacion).toThrow(DatosDePostulacionInvalidos);
      expect(crearPostulacion).toThrow("La fecha de postulación es inválida");
    });

    test("deberia crear una postulacion entre un aspirante y una oferta", () => {
      const fechaPostulacion = new Date("2026-11-09T20:00:00.000Z");
      const postulacion = Postulacion.crear(aspirante, oferta, fechaPostulacion);

      expect(postulacion.obtenerAspirante()).toBe(aspirante);
      expect(postulacion.obtenerOferta()).toBe(oferta);
      expect(postulacion.obtenerFechaPostulacion()).toEqual(fechaPostulacion);
      expect(postulacion.obtenerId()).toBe(0);
    });

    test("deberia conservar una fecha valida aunque se modifique la fecha recibida", () => {
      const fechaPostulacion = new Date("2026-11-09T20:00:00.000Z");
      const postulacion = Postulacion.crear(aspirante, oferta, fechaPostulacion);

      fechaPostulacion.setTime(NaN);

      expect(postulacion.obtenerFechaPostulacion()).toEqual(new Date("2026-11-09T20:00:00.000Z"));
    });
  });

  describe("reconstruir", () => {
    test("deberia reconstruir una postulacion existente aunque su oferta haya cerrado", () => {
      const ofertaCerrada = new Oferta("Backend", "Desarrollo backend", "Remoto", titular, new Date("2026-11-09"), 5);
      ofertaCerrada.cerrar();
      const fechaPostulacion = new Date("2026-11-09T20:00:00.000Z");

      const postulacion = Postulacion.reconstruir(aspirante, ofertaCerrada, fechaPostulacion, 1);

      expect(postulacion.obtenerAspirante()).toBe(aspirante);
      expect(postulacion.obtenerOferta()).toBe(ofertaCerrada);
      expect(postulacion.obtenerFechaPostulacion()).toEqual(fechaPostulacion);
      expect(postulacion.obtenerId()).toBe(1);
    });
  });

  describe("obtenerFechaPostulacion", () => {
    test("deberia conservar una fecha valida aunque se modifique la fecha devuelta", () => {
      const postulacion = Postulacion.crear(aspirante, oferta, new Date("2026-11-09T20:00:00.000Z"));

      postulacion.obtenerFechaPostulacion().setTime(NaN);

      expect(postulacion.obtenerFechaPostulacion()).toEqual(new Date("2026-11-09T20:00:00.000Z"));
    });
  });
});
