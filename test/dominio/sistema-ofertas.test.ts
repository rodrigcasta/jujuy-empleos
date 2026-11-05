import { Mock, mock } from "ts-jest-mocker";
import LimiteDeOfertasAlcanzadoError from "../../app/dominio/limite-de-ofertas-alcanzado-error";
import Oferta from "../../app/dominio/oferta";
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
      repositorioOferta.contarPorEmpresario.mockResolvedValue(0);
      repositorioOferta.guardar.mockResolvedValue(undefined);

      const oferta = await sistemaOfertas.publicar(
        empresario,
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
      );

      expect(oferta.obtenerIdEmpresario()).toBe(7);
      expect(oferta.obtenerFechaPublicacion()).toEqual(FECHA_ACTUAL);
      expect(repositorioOferta.contarPorEmpresario).toHaveBeenCalledWith(7);
      expect(repositorioOferta.guardar).toHaveBeenCalledWith(oferta);
    });

    test("deberia rechazar la publicacion y no guardar cuando la suscripcion alcanzo su limite", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Gratuita");
      repositorioOferta.contarPorEmpresario.mockResolvedValue(1);

      const publicacion = sistemaOfertas.publicar(
        empresario,
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
      );

      await expect(publicacion).rejects.toThrow(LimiteDeOfertasAlcanzadoError);
      expect(repositorioOferta.guardar).not.toHaveBeenCalled();
    });
  });

  describe("puedePublicar", () => {
    test("deberia permitir publicar si la suscripcion conserva capacidad", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Profesional");
      repositorioOferta.contarPorEmpresario.mockResolvedValue(4);

      const puedePublicar = await sistemaOfertas.puedePublicar(empresario);

      expect(puedePublicar).toBe(true);
    });

    test("deberia rechazar publicar si la suscripcion agoto su capacidad", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Gratuita");
      repositorioOferta.contarPorEmpresario.mockResolvedValue(1);

      const puedePublicar = await sistemaOfertas.puedePublicar(empresario);

      expect(puedePublicar).toBe(false);
    });
  });

  describe("listar", () => {
    test("deberia listar todas las ofertas publicadas", async () => {
      const ofertasPublicadas = [
        new Oferta("Oferta reciente", "Descripcion reciente", "CABA", 7, FECHA_ACTUAL, 2),
        new Oferta("Oferta anterior", "Descripcion anterior", "Moron", 8, new Date("2026-11-01T15:00:00.000Z"), 1),
      ];
      repositorioOferta.listar.mockResolvedValue(ofertasPublicadas);

      const ofertas = await sistemaOfertas.listar();

      expect(ofertas).toEqual(ofertasPublicadas);
      expect(repositorioOferta.listar).toHaveBeenCalledTimes(1);
    });
  });
});
