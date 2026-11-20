import { mock } from "ts-jest-mocker";
import pool from "../../app/adaptadores/pool";
import RepositorioOfertaSql from "../../app/adaptadores/repositorio-oferta-sql";
import RepositorioPostulacionSql from "../../app/adaptadores/repositorio-postulacion-sql";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import Oferta from "../../app/dominio/oferta";
import Postulacion from "../../app/dominio/postulacion";
import Usuario from "../../app/dominio/usuario";
import SistemaPostulaciones from "../../app/dominio/sistema-postulaciones";
import { ProveedorFecha } from "../../app/dominio/puerto-proveedor-fecha";

describe("RepositorioPostulacionSql", () => {
  const fechaPostulacion = new Date("2026-11-09T20:00:00.000Z");
  const repositorioUsuario = new RepositorioUsuarioSql();
  const repositorioOferta = new RepositorioOfertaSql(repositorioUsuario);
  const repositorioPostulacion = new RepositorioPostulacionSql(repositorioUsuario, repositorioOferta);

  beforeEach(async () => {
    await repositorioPostulacion.eliminarTodos();
    await repositorioOferta.eliminarTodos();
    await repositorioUsuario.eliminarTodos();
  });

  afterEach(async () => {
    await repositorioPostulacion.eliminarTodos();
    await repositorioOferta.eliminarTodos();
    await repositorioUsuario.eliminarTodos();
  });

  afterAll((done) => {
    pool.end();
    done();
  });

  describe("guardar", () => {
    test("deberia persistir una postulacion con la fecha del proveedor y asignarle un id", async () => {
      const aspirante = await crearAspirante();
      const oferta = await crearOferta();
      const proveedorFecha = mock<ProveedorFecha>();
      proveedorFecha.obtenerFechaActual.mockReturnValue(fechaPostulacion);
      const sistemaPostulaciones = new SistemaPostulaciones(repositorioPostulacion, proveedorFecha, repositorioOferta);

      const postulacion = await sistemaPostulaciones.postular(aspirante, oferta.obtenerId());

      expect(postulacion.obtenerId()).toBeGreaterThan(0);
      const resultado = await pool.query("SELECT * FROM postulaciones WHERE id = $1", [postulacion.obtenerId()]);
      expect(resultado.rows[0]).toMatchObject({
        id_aspirante: aspirante.obtenerId(),
        id_oferta: oferta.obtenerId(),
        fecha_postulacion: fechaPostulacion,
      });
      const postulaciones = await repositorioPostulacion.listarPorOferta(oferta.obtenerId());
      expect(postulaciones[0].fechaPostulacion).toEqual(fechaPostulacion);
    });
  });

  describe("existePara", () => {
    test("deberia devolver falso si el aspirante no se postulo a la oferta", async () => {
      const aspirante = await crearAspirante();
      const oferta = await crearOferta();

      const existe = await repositorioPostulacion.existePara(oferta.obtenerId(), aspirante.obtenerId());

      expect(existe).toBe(false);
    });

    test("deberia devolver verdadero si el aspirante ya se postulo a la oferta", async () => {
      const aspirante = await crearAspirante();
      const oferta = await crearOferta();
      await repositorioPostulacion.guardar(new Postulacion(aspirante, oferta, fechaPostulacion));

      const existe = await repositorioPostulacion.existePara(oferta.obtenerId(), aspirante.obtenerId());

      expect(existe).toBe(true);
    });
  });

  describe("listarPorOferta", () => {
    test("deberia listar los datos de los aspirantes postulados a una oferta", async () => {
      const aspirante = await crearAspirante();
      const oferta = await crearOferta();
      await repositorioPostulacion.guardar(new Postulacion(aspirante, oferta, fechaPostulacion));

      const postulaciones = await repositorioPostulacion.listarPorOferta(oferta.obtenerId());

      expect(postulaciones).toEqual([
        {
          nombre: "Sofia",
          apellido: "Martinez",
          email: "sofia@example.com",
          fechaPostulacion,
        },
      ]);
    });
  });

  describe("recuperarPorOferta", () => {
    test("deberia reconstruir la postulacion con aspirante, oferta, fecha e identidad", async () => {
      const aspirante = await crearAspirante();
      const oferta = await crearOferta();
      const postulacion = new Postulacion(aspirante, oferta, fechaPostulacion);
      await repositorioPostulacion.guardar(postulacion);

      const recuperadas = await repositorioPostulacion.recuperarPorOferta(oferta.obtenerId());

      expect(recuperadas).toHaveLength(1);
      expect(recuperadas[0]).toBeInstanceOf(Postulacion);
      expect(recuperadas[0]).toEqual(postulacion);
    });

    test("deberia devolver una lista vacia sin recuperar relaciones si no hay postulaciones", async () => {
      const recuperarOferta = jest.spyOn(repositorioOferta, "recuperarPorId");
      const recuperarUsuario = jest.spyOn(repositorioUsuario, "recuperarPorId");

      try {
        await expect(repositorioPostulacion.recuperarPorOferta(9999)).resolves.toEqual([]);
        expect(recuperarOferta).not.toHaveBeenCalled();
        expect(recuperarUsuario).not.toHaveBeenCalled();
      } finally {
        recuperarOferta.mockRestore();
        recuperarUsuario.mockRestore();
      }
    });
  });

  async function crearOferta(): Promise<Oferta> {
    const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
    await repositorioUsuario.guardar(empresario);
    const oferta = new Oferta(
      "Desarrollador Backend",
      "Se busca desarrollador para trabajo remoto",
      "Pilar",
      empresario,
      new Date("2026-11-09T15:00:00.000Z"),
    );
    await repositorioOferta.guardar(oferta);
    return oferta;
  }

  async function crearAspirante(email: string = "sofia@example.com"): Promise<Usuario> {
    const aspirante = new Usuario("Sofia", "Martinez", email, "hash", 0, null, "Aspirante");
    await repositorioUsuario.guardar(aspirante);
    return aspirante;
  }
});
