import { Mock, mock } from "ts-jest-mocker";
import Postulacion from "../../app/dominio/postulacion";
import { IRepositorioPostulacion } from "../../app/dominio/puerto-repositorio-postulacion";
import SistemaPostulaciones from "../../app/dominio/sistema-postulaciones";
import Usuario from "../../app/dominio/usuario";

describe("SistemaPostulaciones", () => {
  let repositorioPostulacion: Mock<IRepositorioPostulacion>;
  let sistemaPostulaciones: SistemaPostulaciones;

  beforeEach(() => {
    repositorioPostulacion = mock<IRepositorioPostulacion>();
    sistemaPostulaciones = new SistemaPostulaciones(repositorioPostulacion);
  });

  describe("postular", () => {
    test("deberia registrar una postulacion del aspirante a la oferta", async () => {
      const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 2, null, "Aspirante");
      repositorioPostulacion.guardar.mockResolvedValue(undefined);

      const postulacion = await sistemaPostulaciones.postular(aspirante, 5);

      expect(postulacion.obtenerIdAspirante()).toBe(2);
      expect(postulacion.obtenerIdOferta()).toBe(5);
      expect(postulacion).toBeInstanceOf(Postulacion);
      expect(repositorioPostulacion.guardar).toHaveBeenCalledWith(postulacion);
    });
  });
});
