import pool from "../../app/adaptadores/pool";
import RepositorioOfertaSql from "../../app/adaptadores/repositorio-oferta-sql";
import RepositorioPostulacionSql from "../../app/adaptadores/repositorio-postulacion-sql";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import Oferta from "../../app/dominio/oferta";
import Postulacion from "../../app/dominio/postulacion";
import Usuario from "../../app/dominio/usuario";

describe("RepositorioPostulacionSql", () => {
  const fechaPostulacion = new Date("2026-11-09T20:00:00.000Z");
  const repositorioPostulacion = new RepositorioPostulacionSql();
  const repositorioOferta = new RepositorioOfertaSql();
  const repositorioUsuario = new RepositorioUsuarioSql();

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
    test("deberia persistir una postulacion y asignarle un id", async () => {
      const { aspirante, oferta } = await crearAspiranteYOferta();
      const postulacion = new Postulacion(aspirante.obtenerId(), oferta.obtenerId(), fechaPostulacion);

      await repositorioPostulacion.guardar(postulacion);

      expect(postulacion.obtenerId()).toBeGreaterThan(0);
      const resultado = await pool.query("SELECT * FROM postulaciones WHERE id = $1", [postulacion.obtenerId()]);
      expect(resultado.rows[0]).toMatchObject({
        id_aspirante: aspirante.obtenerId(),
        id_oferta: oferta.obtenerId(),
        fecha_postulacion: fechaPostulacion,
      });
    });
  });

  describe("existePara", () => {
    test("deberia devolver falso si el aspirante no se postulo a la oferta", async () => {
      const { aspirante, oferta } = await crearAspiranteYOferta();

      const existe = await repositorioPostulacion.existePara(oferta.obtenerId(), aspirante.obtenerId());

      expect(existe).toBe(false);
    });

    test("deberia devolver verdadero si el aspirante ya se postulo a la oferta", async () => {
      const { aspirante, oferta } = await crearAspiranteYOferta();
      await repositorioPostulacion.guardar(
        new Postulacion(aspirante.obtenerId(), oferta.obtenerId(), fechaPostulacion),
      );

      const existe = await repositorioPostulacion.existePara(oferta.obtenerId(), aspirante.obtenerId());

      expect(existe).toBe(true);
    });
  });

  async function crearAspiranteYOferta(): Promise<{ aspirante: Usuario; oferta: Oferta }> {
    const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
    const aspirante = new Usuario("Sofia", "Martinez", "sofia@example.com", "hash", 0, null, "Aspirante");
    await repositorioUsuario.guardar(empresario);
    await repositorioUsuario.guardar(aspirante);
    const oferta = new Oferta(
      "Desarrollador Backend",
      "Se busca desarrollador para trabajo remoto",
      "Pilar",
      empresario.obtenerId(),
      new Date("2026-11-09T15:00:00.000Z"),
    );
    await repositorioOferta.guardar(oferta);
    return { aspirante, oferta };
  }
});
