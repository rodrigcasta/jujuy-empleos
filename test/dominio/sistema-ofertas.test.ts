import { Mock, mock } from "ts-jest-mocker";
import CierreNoAutorizadoError from "../../app/dominio/cierre-no-autorizado-error";
import LimiteDeOfertasAlcanzadoError from "../../app/dominio/limite-de-ofertas-alcanzado-error";
import Oferta from "../../app/dominio/oferta";
import OfertaNoEncontradaError from "../../app/dominio/oferta-no-encontrada-error";
import { IRepositorioOferta } from "../../app/dominio/puerto-repositorio-oferta";
import PublicacionNoAutorizadaError from "../../app/dominio/publicacion-no-autorizada-error";
import SistemaOfertas from "../../app/dominio/sistema-ofertas";
import Usuario from "../../app/dominio/usuario";

describe("SistemaOfertas", () => {
  const titular = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7);
  const otroTitular = new Usuario("Mario", "Perez", "mario@example.com", "hash", 8);
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
      repositorioOferta.contarActivasPorEmpresario.mockResolvedValue(0);
      repositorioOferta.guardar.mockResolvedValue(undefined);

      const oferta = await sistemaOfertas.publicar(
        empresario,
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
      );

      expect(oferta.obtenerTitular().obtenerId()).toBe(7);
      expect(oferta.obtenerTitular()).toBe(empresario);
      expect(oferta.obtenerFechaPublicacion()).toEqual(FECHA_ACTUAL);
      expect(repositorioOferta.contarActivasPorEmpresario).toHaveBeenCalledWith(7);
      expect(repositorioOferta.guardar).toHaveBeenCalledWith(oferta);
    });

    test("deberia rechazar la publicacion y no guardar cuando la suscripcion alcanzo su limite", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Gratuita");
      repositorioOferta.contarActivasPorEmpresario.mockResolvedValue(1);

      const publicacion = sistemaOfertas.publicar(
        empresario,
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
      );

      await expect(publicacion).rejects.toThrow(LimiteDeOfertasAlcanzadoError);
      expect(repositorioOferta.guardar).not.toHaveBeenCalled();
    });

    test("deberia impedir que un aspirante publique ofertas", async () => {
      const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 7, null, "Aspirante");

      const publicacion = sistemaOfertas.publicar(
        aspirante,
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
      );

      await expect(publicacion).rejects.toThrow(PublicacionNoAutorizadaError);
      expect(repositorioOferta.contarActivasPorEmpresario).not.toHaveBeenCalled();
      expect(repositorioOferta.guardar).not.toHaveBeenCalled();
    });
  });

  describe("puedePublicar", () => {
    test("deberia permitir publicar si la suscripcion conserva capacidad", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Profesional");
      repositorioOferta.contarActivasPorEmpresario.mockResolvedValue(4);

      const puedePublicar = await sistemaOfertas.puedePublicar(empresario);

      expect(puedePublicar).toBe(true);
    });

    test("deberia rechazar publicar si la suscripcion agoto su capacidad", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Gratuita");
      repositorioOferta.contarActivasPorEmpresario.mockResolvedValue(1);

      const puedePublicar = await sistemaOfertas.puedePublicar(empresario);

      expect(puedePublicar).toBe(false);
    });
  });

  describe("listar", () => {
    test("deberia listar solo las ofertas publicas cuando no hay usuario autenticado", async () => {
      const ofertasPublicas = [new Oferta("Oferta reciente", "Descripcion reciente", "CABA", titular, FECHA_ACTUAL, 2)];
      repositorioOferta.listarPublicas.mockResolvedValue(ofertasPublicas);

      const ofertas = await sistemaOfertas.listar();

      expect(ofertas).toEqual(ofertasPublicas);
      expect(repositorioOferta.listarPublicas).toHaveBeenCalledTimes(1);
    });

    test("deberia listar las ofertas visibles para un empresario autenticado", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Gratuita");
      const ofertasVisibles = [
        new Oferta("Oferta activa", "Descripcion", "CABA", otroTitular, FECHA_ACTUAL, 2),
        new Oferta("Oferta cerrada propia", "Descripcion", "CABA", titular, FECHA_ACTUAL, 1, false),
      ];
      repositorioOferta.listarVisiblesParaEmpresario.mockResolvedValue(ofertasVisibles);

      const ofertas = await sistemaOfertas.listar(empresario);

      expect(ofertas).toEqual(ofertasVisibles);
      expect(repositorioOferta.listarVisiblesParaEmpresario).toHaveBeenCalledWith(7);
      expect(repositorioOferta.listarPublicas).not.toHaveBeenCalled();
    });

    test("deberia listar solo las ofertas publicas cuando el usuario es aspirante", async () => {
      const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 9, null, "Aspirante");
      const ofertasPublicas = [new Oferta("Oferta activa", "Descripcion", "CABA", titular, FECHA_ACTUAL, 2)];
      repositorioOferta.listarPublicas.mockResolvedValue(ofertasPublicas);

      const ofertas = await sistemaOfertas.listar(aspirante);

      expect(ofertas).toEqual(ofertasPublicas);
      expect(repositorioOferta.listarPublicas).toHaveBeenCalledTimes(1);
      expect(repositorioOferta.listarVisiblesParaEmpresario).not.toHaveBeenCalled();
    });
  });

  describe("obtenerDetallePorId", () => {
    test("deberia obtener el detalle de una oferta existente", async () => {
      const detalleEsperado = {
        id: 2,
        idEmpresario: 7,
        titulo: "Desarrollador Backend",
        descripcion: "Se busca desarrollador para trabajo remoto",
        ubicacion: "Pilar",
        emailEmpresario: "empresa1@empresa1.com",
        activa: true,
      };
      repositorioOferta.recuperarDetallePorId.mockResolvedValue(detalleEsperado);

      const detalle = await sistemaOfertas.obtenerDetallePorId(2);

      expect(detalle).toEqual(detalleEsperado);
      expect(repositorioOferta.recuperarDetallePorId).toHaveBeenCalledWith(2);
    });

    test("deberia informar si la oferta no existe", async () => {
      repositorioOferta.recuperarDetallePorId.mockResolvedValue(null);

      const consulta = sistemaOfertas.obtenerDetallePorId(9999);

      await expect(consulta).rejects.toThrow(OfertaNoEncontradaError);
      await expect(consulta).rejects.toThrow("No se encontró la oferta solicitada");
    });
  });
  describe("cerrar", () => {
    test("deberia cerrar una oferta existente y persistirla", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Gratuita");
      const oferta = new Oferta("Programador Jr.", "Backend junior", "CABA", titular, FECHA_ACTUAL, 12);
      repositorioOferta.recuperarPorId.mockResolvedValue(oferta);
      repositorioOferta.actualizar.mockResolvedValue(undefined);
      await sistemaOfertas.cerrar(empresario, 12);
      expect(oferta.estaActiva()).toBe(false);
      expect(repositorioOferta.recuperarPorId).toHaveBeenCalledWith(12);
      expect(repositorioOferta.actualizar).toHaveBeenCalledWith(oferta);
    });

    test("deberia impedir que otro empresario cierre una oferta ajena", async () => {
      const otroEmpresario = new Usuario("Mario", "Perez", "mario@example.com", "hash", 8, "Profesional");
      const oferta = new Oferta("Programador Jr.", "Backend junior", "CABA", titular, FECHA_ACTUAL, 12);
      repositorioOferta.recuperarPorId.mockResolvedValue(oferta);

      await expect(sistemaOfertas.cerrar(otroEmpresario, 12)).rejects.toThrow(CierreNoAutorizadoError);

      expect(oferta.estaActiva()).toBe(true);
      expect(repositorioOferta.actualizar).not.toHaveBeenCalled();
    });

    test("deberia impedir que un aspirante cierre una oferta", async () => {
      const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 7, null, "Aspirante");

      await expect(sistemaOfertas.cerrar(aspirante, 12)).rejects.toThrow(CierreNoAutorizadoError);

      expect(repositorioOferta.recuperarPorId).not.toHaveBeenCalled();
      expect(repositorioOferta.actualizar).not.toHaveBeenCalled();
    });

    test("deberia informar si la oferta no existe", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash", 7, "Gratuita");
      repositorioOferta.recuperarPorId.mockResolvedValue(null);
      await expect(sistemaOfertas.cerrar(empresario, 999)).rejects.toThrow(OfertaNoEncontradaError);
      expect(repositorioOferta.actualizar).not.toHaveBeenCalled();
    });
  });
});
