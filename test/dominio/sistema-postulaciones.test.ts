import { Mock, mock } from "ts-jest-mocker";
import PostulacionDuplicadaError from "../../app/dominio/postulacion-duplicada-error";
import PostulacionNoAutorizadaError from "../../app/dominio/postulacion-no-autorizada-error";
import Postulacion from "../../app/dominio/postulacion";
import { IRepositorioPostulacion } from "../../app/dominio/puerto-repositorio-postulacion";
import SistemaPostulaciones from "../../app/dominio/sistema-postulaciones";
import Usuario from "../../app/dominio/usuario";
import DatosDePostulacionInvalidos from "../../app/dominio/datos-de-postulacion-invalidos";
import { ProveedorFecha } from "../../app/dominio/puerto-proveedor-fecha";
import { IRepositorioOferta } from "../../app/dominio/puerto-repositorio-oferta";
import Oferta from "../../app/dominio/oferta";
import OfertaNoEncontradaError from "../../app/dominio/oferta-no-encontrada-error";

describe("SistemaPostulaciones", () => {
  const fechaPostulacion = new Date("2026-11-09T20:00:00.000Z");
  let repositorioPostulacion: Mock<IRepositorioPostulacion>;
  let proveedorFecha: Mock<ProveedorFecha>;
  let repositorioOferta: Mock<IRepositorioOferta>;
  let oferta: Oferta;
  let sistemaPostulaciones: SistemaPostulaciones;

  beforeEach(() => {
    repositorioPostulacion = mock<IRepositorioPostulacion>();
    proveedorFecha = mock<ProveedorFecha>();
    proveedorFecha.obtenerFechaActual.mockReturnValue(fechaPostulacion);
    repositorioOferta = mock<IRepositorioOferta>();
    const titular = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7);
    oferta = new Oferta("Backend", "Desarrollo backend", "Remoto", titular, fechaPostulacion, 5);
    repositorioOferta.recuperarPorId.mockResolvedValue(oferta);
    sistemaPostulaciones = new SistemaPostulaciones(repositorioPostulacion, proveedorFecha, repositorioOferta);
  });

  describe("postular", () => {
    test("deberia rechazar una fecha invalida sin guardar la postulacion", async () => {
      const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 2, null, "Aspirante");
      proveedorFecha.obtenerFechaActual.mockReturnValue(new Date("fecha invalida"));
      repositorioPostulacion.existePara.mockResolvedValue(false);

      await expect(sistemaPostulaciones.postular(aspirante, 5)).rejects.toThrow(DatosDePostulacionInvalidos);
      expect(repositorioPostulacion.guardar).not.toHaveBeenCalled();
    });

    test("deberia registrar una postulacion del aspirante a la oferta", async () => {
      const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 2, null, "Aspirante");
      repositorioPostulacion.existePara.mockResolvedValue(false);
      repositorioPostulacion.guardar.mockResolvedValue(undefined);

      const postulacion = await sistemaPostulaciones.postular(aspirante, 5);

      expect(postulacion.obtenerAspirante()).toBe(aspirante);
      expect(postulacion.obtenerOferta()).toBe(oferta);
      expect(postulacion.obtenerFechaPostulacion()).toEqual(fechaPostulacion);
      expect(postulacion).toBeInstanceOf(Postulacion);
      expect(repositorioPostulacion.existePara).toHaveBeenCalledWith(5, 2);
      expect(repositorioPostulacion.guardar).toHaveBeenCalledWith(postulacion);
      expect(repositorioOferta.recuperarPorId).toHaveBeenCalledWith(5);
    });

    test("deberia rechazar una postulacion si la oferta no existe", async () => {
      const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 2, null, "Aspirante");
      repositorioOferta.recuperarPorId.mockResolvedValue(null);

      await expect(sistemaPostulaciones.postular(aspirante, 5)).rejects.toThrow(OfertaNoEncontradaError);
      expect(repositorioPostulacion.existePara).not.toHaveBeenCalled();
      expect(repositorioPostulacion.guardar).not.toHaveBeenCalled();
    });

    test("deberia impedir que un empresario se postule", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Profesional");

      const postulacion = sistemaPostulaciones.postular(empresario, 5);

      await expect(postulacion).rejects.toThrow(PostulacionNoAutorizadaError);
      await expect(postulacion).rejects.toThrow("Solo los aspirantes pueden postularse a ofertas");
      expect(repositorioPostulacion.existePara).not.toHaveBeenCalled();
      expect(repositorioPostulacion.guardar).not.toHaveBeenCalled();
    });

    test("deberia impedir que un aspirante se postule dos veces a la misma oferta", async () => {
      const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 2, null, "Aspirante");
      repositorioPostulacion.existePara.mockResolvedValue(true);

      const postulacion = sistemaPostulaciones.postular(aspirante, 5);

      await expect(postulacion).rejects.toThrow(PostulacionDuplicadaError);
      await expect(postulacion).rejects.toThrow("Ya te postulaste a esta oferta");
      expect(repositorioPostulacion.existePara).toHaveBeenCalledWith(5, 2);
      expect(repositorioPostulacion.guardar).not.toHaveBeenCalled();
    });
  });

  describe("listarParaEmpresario", () => {
    test("deberia devolver las postulaciones asociadas al titular de la oferta", async () => {
      const empresario = oferta.obtenerTitular();
      const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 2, null, "Aspirante");
      const postulaciones = [new Postulacion(aspirante, oferta, fechaPostulacion, 1)];
      repositorioPostulacion.recuperarPorOferta.mockResolvedValue(postulaciones);

      await expect(sistemaPostulaciones.listarParaEmpresario(empresario, 5, 7)).resolves.toBe(postulaciones);
      expect(repositorioPostulacion.recuperarPorOferta).toHaveBeenCalledWith(5);
    });

    test("deberia devolver una lista vacia para el titular sin postulaciones", async () => {
      repositorioPostulacion.recuperarPorOferta.mockResolvedValue([]);

      await expect(sistemaPostulaciones.listarParaEmpresario(oferta.obtenerTitular(), 5, 7)).resolves.toEqual([]);
    });

    test("deberia impedir que un empresario consulte las postulaciones de una oferta ajena", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Profesional");

      await expect(sistemaPostulaciones.listarParaEmpresario(empresario, 5, 8)).resolves.toBeNull();
      expect(repositorioPostulacion.recuperarPorOferta).not.toHaveBeenCalled();
    });
  });
});
