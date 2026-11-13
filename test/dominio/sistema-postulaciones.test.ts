import { Mock, mock } from "ts-jest-mocker";
import PostulacionDuplicadaError from "../../app/dominio/postulacion-duplicada-error";
import PostulacionNoAutorizadaError from "../../app/dominio/postulacion-no-autorizada-error";
import Postulacion from "../../app/dominio/postulacion";
import { IRepositorioPostulacion } from "../../app/dominio/puerto-repositorio-postulacion";
import SistemaPostulaciones from "../../app/dominio/sistema-postulaciones";
import Usuario from "../../app/dominio/usuario";

describe("SistemaPostulaciones", () => {
  const fechaPostulacion = new Date("2026-11-09T20:00:00.000Z");
  let repositorioPostulacion: Mock<IRepositorioPostulacion>;
  let sistemaPostulaciones: SistemaPostulaciones;

  beforeEach(() => {
    repositorioPostulacion = mock<IRepositorioPostulacion>();
    sistemaPostulaciones = new SistemaPostulaciones(repositorioPostulacion, () => fechaPostulacion);
  });

  describe("postular", () => {
    test("deberia registrar una postulacion del aspirante a la oferta", async () => {
      const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 2, null, "Aspirante");
      repositorioPostulacion.existePara.mockResolvedValue(false);
      repositorioPostulacion.guardar.mockResolvedValue(undefined);

      const postulacion = await sistemaPostulaciones.postular(aspirante, 5);

      expect(postulacion.obtenerIdAspirante()).toBe(2);
      expect(postulacion.obtenerIdOferta()).toBe(5);
      expect(postulacion.obtenerFechaPostulacion()).toEqual(fechaPostulacion);
      expect(postulacion).toBeInstanceOf(Postulacion);
      expect(repositorioPostulacion.existePara).toHaveBeenCalledWith(5, 2);
      expect(repositorioPostulacion.guardar).toHaveBeenCalledWith(postulacion);
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
    test("deberia impedir que un empresario consulte las postulaciones de una oferta ajena", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Profesional");

      await expect(sistemaPostulaciones.listarParaEmpresario(empresario, 5, 8)).resolves.toBeNull();
      expect(repositorioPostulacion.listarPorOferta).not.toHaveBeenCalled();
    });
  });
});
