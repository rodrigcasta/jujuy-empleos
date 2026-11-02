import { Mock, mock } from "ts-jest-mocker";
import { IRepositorioOferta } from "../../app/dominio/puerto-repositorio-oferta";
import SistemaOfertas from "../../app/dominio/sistema-ofertas";
import Usuario from "../../app/dominio/usuario";

describe("SistemaOfertas", () => {
  const FECHA_ACTUAL = new Date("2026-11-02T15:00:00.000Z");
  let repositorioOferta: Mock<IRepositorioOferta>;
  let sistemaOfertas: SistemaOfertas;

  beforeEach(() => {
    repositorioOferta = mock<IRepositorioOferta>();
    sistemaOfertas = new SistemaOfertas(repositorioOferta, () => FECHA_ACTUAL);
  });

  describe("publicar", () => {
    test("deberia publicar y guardar una oferta asociada al empresario", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Gratuita");
      repositorioOferta.guardar.mockResolvedValue(undefined);

      const oferta = await sistemaOfertas.publicar(
        empresario,
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
      );

      expect(oferta.obtenerIdEmpresario()).toBe(7);
      expect(oferta.obtenerFechaPublicacion()).toEqual(FECHA_ACTUAL);
      expect(repositorioOferta.guardar).toHaveBeenCalledWith(oferta);
    });
  });
});
