import pool from "../../app/adaptadores/pool";
import RepositorioOfertaSql from "../../app/adaptadores/repositorio-oferta-sql";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import Oferta from "../../app/dominio/oferta";
import Usuario from "../../app/dominio/usuario";

describe("RepositorioOfertaSql", () => {
  const repositorioOferta = new RepositorioOfertaSql();
  const repositorioUsuario = new RepositorioUsuarioSql();

  beforeEach(async () => {
    await repositorioOferta.eliminarTodos();
    await repositorioUsuario.eliminarTodos();
  });

  afterEach(async () => {
    await repositorioOferta.eliminarTodos();
    await repositorioUsuario.eliminarTodos();
  });

  afterAll((done) => {
    pool.end();
    done();
  });

  describe("guardar", () => {
    test("deberia persistir una oferta y asignarle un id", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const fechaPublicacion = new Date("2026-11-02T15:00:00.000Z");
      const oferta = new Oferta(
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
        empresario.obtenerId(),
        fechaPublicacion,
      );

      await repositorioOferta.guardar(oferta);

      expect(oferta.obtenerId()).toBeGreaterThan(0);
      const resultado = await pool.query("SELECT * FROM ofertas WHERE id = $1", [oferta.obtenerId()]);
      expect(resultado.rows[0]).toMatchObject({
        titulo: "Programador Jr.",
        descripcion: "Se busca desarrollador backend junior",
        ubicacion: "Tres de Febrero",
        id_empresario: empresario.obtenerId(),
        fecha_publicacion: fechaPublicacion,
      });
    });
  });

  describe("contarPorEmpresario", () => {
    test("deberia devolver cero si el empresario no publico ofertas", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);

      const cantidad = await repositorioOferta.contarPorEmpresario(empresario.obtenerId());

      expect(cantidad).toBe(0);
    });

    test("deberia contar solamente las ofertas del empresario indicado", async () => {
      const primerEmpresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      const segundoEmpresario = new Usuario("Mario", "Perez", "mario@example.com", "hash");
      await repositorioUsuario.guardar(primerEmpresario);
      await repositorioUsuario.guardar(segundoEmpresario);
      const fechaPublicacion = new Date("2026-11-02T15:00:00.000Z");
      await repositorioOferta.guardar(
        new Oferta("Oferta 1", "Primera oferta", "Buenos Aires", primerEmpresario.obtenerId(), fechaPublicacion),
      );
      await repositorioOferta.guardar(
        new Oferta("Oferta 2", "Segunda oferta", "Cordoba", primerEmpresario.obtenerId(), fechaPublicacion),
      );
      await repositorioOferta.guardar(
        new Oferta("Oferta 3", "Tercera oferta", "Mendoza", segundoEmpresario.obtenerId(), fechaPublicacion),
      );

      const cantidad = await repositorioOferta.contarPorEmpresario(primerEmpresario.obtenerId());

      expect(cantidad).toBe(2);
    });
  });

  describe("listar", () => {
    test("deberia recuperar una oferta persistida", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const fechaPublicacion = new Date("2026-11-04T15:00:00.000Z");
      const oferta = new Oferta(
        "Desarrollador TypeScript",
        "Se busca desarrollador con experiencia en TypeScript",
        "CABA",
        empresario.obtenerId(),
        fechaPublicacion,
      );
      await repositorioOferta.guardar(oferta);

      const ofertas = await repositorioOferta.listar();

      expect(ofertas).toHaveLength(1);
      expect(ofertas[0]).toMatchObject(oferta);
    });

    test("deberia ordenar las ofertas desde la mas reciente", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const ofertaAnterior = new Oferta(
        "Oferta anterior",
        "Esta oferta fue publicada primero",
        "CABA",
        empresario.obtenerId(),
        new Date("2026-11-03T15:00:00.000Z"),
      );
      const ofertaReciente = new Oferta(
        "Oferta reciente",
        "Esta oferta fue publicada despues",
        "CABA",
        empresario.obtenerId(),
        new Date("2026-11-04T15:00:00.000Z"),
      );
      await repositorioOferta.guardar(ofertaAnterior);
      await repositorioOferta.guardar(ofertaReciente);

      const ofertas = await repositorioOferta.listar();

      expect(ofertas.map((oferta) => oferta.obtenerTitulo())).toEqual(["Oferta reciente", "Oferta anterior"]);
    });
  });

  describe("recuperarDetallePorId", () => {
    test("deberia recuperar el detalle de una oferta con el email del empresario", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "empresa1@empresa1.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const oferta = new Oferta(
        "Desarrollador Backend",
        "Se busca desarrollador para trabajo remoto",
        "Pilar",
        empresario.obtenerId(),
        new Date("2026-11-04T15:00:00.000Z"),
      );
      await repositorioOferta.guardar(oferta);

      const detalle = await repositorioOferta.recuperarDetallePorId(oferta.obtenerId());

      expect(detalle).toEqual({
        id: oferta.obtenerId(),
        idEmpresario: empresario.obtenerId(),
        titulo: "Desarrollador Backend",
        descripcion: "Se busca desarrollador para trabajo remoto",
        ubicacion: "Pilar",
        emailEmpresario: "empresa1@empresa1.com",
      });
    });
  });
});
