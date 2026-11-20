import pool from "../../app/adaptadores/pool";
import RepositorioOfertaSql from "../../app/adaptadores/repositorio-oferta-sql";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import Oferta from "../../app/dominio/oferta";
import Usuario from "../../app/dominio/usuario";

describe("RepositorioOfertaSql", () => {
  const repositorioUsuario = new RepositorioUsuarioSql();
  const repositorioOferta = new RepositorioOfertaSql(repositorioUsuario);

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
        empresario,
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
    test("deberia persistir una oferta cerrada como inactiva", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);

      const oferta = new Oferta(
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
        empresario,
        new Date("2026-11-02T15:00:00.000Z"),
      );
      oferta.cerrar();

      await repositorioOferta.guardar(oferta);

      const resultado = await pool.query<{ activa: boolean }>("SELECT activa FROM ofertas WHERE id = $1", [
        oferta.obtenerId(),
      ]);

      expect(resultado.rows[0].activa).toBe(false);
    });
  });

  describe("contarPorEmpresario", () => {
    test("deberia devolver cero si el empresario no publico ofertas", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);

      const cantidad = await repositorioOferta.contarActivasPorEmpresario(empresario.obtenerId());

      expect(cantidad).toBe(0);
    });

    test("deberia contar solamente las ofertas del empresario indicado", async () => {
      const primerEmpresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      const segundoEmpresario = new Usuario("Mario", "Perez", "mario@example.com", "hash");
      await repositorioUsuario.guardar(primerEmpresario);
      await repositorioUsuario.guardar(segundoEmpresario);
      const fechaPublicacion = new Date("2026-11-02T15:00:00.000Z");
      await repositorioOferta.guardar(
        new Oferta("Oferta 1", "Primera oferta", "Buenos Aires", primerEmpresario, fechaPublicacion),
      );
      await repositorioOferta.guardar(
        new Oferta("Oferta 2", "Segunda oferta", "Cordoba", primerEmpresario, fechaPublicacion),
      );
      await repositorioOferta.guardar(
        new Oferta("Oferta 3", "Tercera oferta", "Mendoza", segundoEmpresario, fechaPublicacion),
      );

      const cantidad = await repositorioOferta.contarActivasPorEmpresario(primerEmpresario.obtenerId());

      expect(cantidad).toBe(2);
    });

    test("deberia contar solamente las ofertas activas del empresario indicado", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const fechaPublicacion = new Date("2026-11-02T15:00:00.000Z");
      const ofertaActiva1 = new Oferta("Oferta 1", "Primera oferta", "Buenos Aires", empresario, fechaPublicacion);
      const ofertaActiva2 = new Oferta("Oferta 2", "Segunda oferta", "Cordoba", empresario, fechaPublicacion);
      const ofertaCerrada = new Oferta("Oferta 3", "Tercera oferta", "Mendoza", empresario, fechaPublicacion);
      ofertaCerrada.cerrar();
      await repositorioOferta.guardar(ofertaActiva1);
      await repositorioOferta.guardar(ofertaActiva2);
      await repositorioOferta.guardar(ofertaCerrada);

      const cantidad = await repositorioOferta.contarActivasPorEmpresario(empresario.obtenerId());

      expect(cantidad).toBe(2);
    });
  });

  describe("listarPublicas", () => {
    test("deberia recuperar una sola vez al titular de varias ofertas del listado", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const fechaPublicacion = new Date("2026-11-04T15:00:00.000Z");
      await repositorioOferta.guardar(
        new Oferta("Backend", "Desarrollo backend", "Remoto", empresario, fechaPublicacion),
      );
      await repositorioOferta.guardar(new Oferta("QA", "Pruebas de software", "Remoto", empresario, fechaPublicacion));
      const recuperarTitular = jest.spyOn(repositorioUsuario, "recuperarPorId");

      try {
        const ofertas = await repositorioOferta.listarPublicas();

        expect(ofertas).toHaveLength(2);
        expect(ofertas[0].obtenerTitular()).toEqual(empresario);
        expect(ofertas[1].obtenerTitular()).toBe(ofertas[0].obtenerTitular());
        expect(recuperarTitular).toHaveBeenCalledTimes(1);
        expect(recuperarTitular).toHaveBeenCalledWith(empresario.obtenerId());
      } finally {
        recuperarTitular.mockRestore();
      }
    });

    test("deberia recuperar una oferta persistida", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const fechaPublicacion = new Date("2026-11-04T15:00:00.000Z");
      const oferta = new Oferta(
        "Desarrollador TypeScript",
        "Se busca desarrollador con experiencia en TypeScript",
        "CABA",
        empresario,
        fechaPublicacion,
      );
      await repositorioOferta.guardar(oferta);

      const ofertas = await repositorioOferta.listarPublicas();

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
        empresario,
        new Date("2026-11-03T15:00:00.000Z"),
      );
      const ofertaReciente = new Oferta(
        "Oferta reciente",
        "Esta oferta fue publicada despues",
        "CABA",
        empresario,
        new Date("2026-11-04T15:00:00.000Z"),
      );
      await repositorioOferta.guardar(ofertaAnterior);
      await repositorioOferta.guardar(ofertaReciente);

      const ofertas = await repositorioOferta.listarPublicas();

      expect(ofertas.map((oferta) => oferta.obtenerTitulo())).toEqual(["Oferta reciente", "Oferta anterior"]);
    });

    test("deberia excluir las ofertas cerradas del listado publico", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);

      const ofertaActiva = new Oferta(
        "Oferta activa",
        "Descripcion de la oferta activa",
        "CABA",
        empresario,
        new Date("2026-11-04T15:00:00.000Z"),
      );
      const ofertaCerrada = new Oferta(
        "Oferta cerrada",
        "Descripcion de la oferta cerrada",
        "CABA",
        empresario,
        new Date("2026-11-03T15:00:00.000Z"),
      );
      ofertaCerrada.cerrar();

      await repositorioOferta.guardar(ofertaActiva);
      await repositorioOferta.guardar(ofertaCerrada);

      const ofertas = await repositorioOferta.listarPublicas();

      expect(ofertas.map((oferta) => oferta.obtenerTitulo())).toEqual(["Oferta activa"]);
    });
  });

  describe("listarVisiblesParaEmpresario", () => {
    test("deberia incluir las ofertas cerradas propias junto con las activas", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const ofertaActiva = new Oferta(
        "Oferta activa",
        "Descripcion activa",
        "CABA",
        empresario,
        new Date("2026-11-04T15:00:00.000Z"),
      );
      const ofertaCerrada = new Oferta(
        "Oferta cerrada propia",
        "Descripcion cerrada",
        "CABA",
        empresario,
        new Date("2026-11-03T15:00:00.000Z"),
      );
      ofertaCerrada.cerrar();
      await repositorioOferta.guardar(ofertaActiva);
      await repositorioOferta.guardar(ofertaCerrada);
      const ofertas = await repositorioOferta.listarVisiblesParaEmpresario(empresario.obtenerId());
      expect(ofertas.map((oferta) => oferta.obtenerTitulo())).toEqual(["Oferta activa", "Oferta cerrada propia"]);
    });
    test("deberia excluir las ofertas cerradas de otros empresarios pero incluir sus activas", async () => {
      const dueno = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      const otroEmpresario = new Usuario("Mario", "Perez", "mario@example.com", "hash");
      await repositorioUsuario.guardar(dueno);
      await repositorioUsuario.guardar(otroEmpresario);

      const activaAjena = new Oferta(
        "Activa ajena",
        "Descripcion activa ajena",
        "CABA",
        otroEmpresario,
        new Date("2026-11-04T15:00:00.000Z"),
      );
      const cerradaAjena = new Oferta(
        "Cerrada ajena",
        "Descripcion cerrada ajena",
        "CABA",
        otroEmpresario,
        new Date("2026-11-03T15:00:00.000Z"),
      );
      cerradaAjena.cerrar();

      await repositorioOferta.guardar(activaAjena);
      await repositorioOferta.guardar(cerradaAjena);

      const ofertas = await repositorioOferta.listarVisiblesParaEmpresario(dueno.obtenerId());

      expect(ofertas.map((oferta) => oferta.obtenerTitulo())).toEqual(["Activa ajena"]);
    });
  });

  describe("recuperarDetallePorId", () => {
    test("deberia devolver null sin buscar titular cuando la oferta no existe", async () => {
      const recuperarTitular = jest.spyOn(repositorioUsuario, "recuperarPorId");

      try {
        await expect(repositorioOferta.recuperarDetallePorId(9999)).resolves.toBeNull();
        expect(recuperarTitular).not.toHaveBeenCalled();
      } finally {
        recuperarTitular.mockRestore();
      }
    });

    test("deberia devolver null cuando el repositorio no encuentra al titular", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const oferta = new Oferta(
        "Desarrollador Backend",
        "Desarrollo backend",
        "Remoto",
        empresario,
        new Date("2026-11-04T15:00:00.000Z"),
      );
      await repositorioOferta.guardar(oferta);
      const recuperarTitular = jest.spyOn(repositorioUsuario, "recuperarPorId").mockResolvedValue(null);

      try {
        await expect(repositorioOferta.recuperarDetallePorId(oferta.obtenerId())).resolves.toBeNull();
      } finally {
        recuperarTitular.mockRestore();
      }
    });

    test("deberia obtener el titular mediante el repositorio de usuarios", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const oferta = new Oferta(
        "Desarrollador Backend",
        "Desarrollo backend",
        "Remoto",
        empresario,
        new Date("2026-11-04T15:00:00.000Z"),
      );
      await repositorioOferta.guardar(oferta);
      const recuperarTitular = jest.spyOn(repositorioUsuario, "recuperarPorId");

      try {
        const detalle = await repositorioOferta.recuperarDetallePorId(oferta.obtenerId());

        expect(detalle?.emailEmpresario).toBe(empresario.obtenerEmail());
        expect(recuperarTitular).toHaveBeenCalledWith(empresario.obtenerId());
      } finally {
        recuperarTitular.mockRestore();
      }
    });

    test("deberia indicar que el detalle de una oferta cerrada no esta activa", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "empresa1@empresa1.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const oferta = new Oferta(
        "Desarrollador Backend",
        "Se busca desarrollador para trabajo remoto",
        "Pilar",
        empresario,
        new Date("2026-11-04T15:00:00.000Z"),
      );
      oferta.cerrar();
      await repositorioOferta.guardar(oferta);
      const detalle = await repositorioOferta.recuperarDetallePorId(oferta.obtenerId());
      expect(detalle?.activa).toBe(false);
    });
    test("deberia recuperar el detalle de una oferta con el email del empresario", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "empresa1@empresa1.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const oferta = new Oferta(
        "Desarrollador Backend",
        "Se busca desarrollador para trabajo remoto",
        "Pilar",
        empresario,
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
        activa: true,
      });
    });
  });

  describe("recuperarPorId", () => {
    test("deberia recuperar una oferta persistida por su id", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);
      const oferta = new Oferta(
        "Desarrollador Backend",
        "Se busca desarrollador para trabajo remoto",
        "Pilar",
        empresario,
        new Date("2026-11-04T15:00:00.000Z"),
      );
      await repositorioOferta.guardar(oferta);

      const ofertaRecuperada = await repositorioOferta.recuperarPorId(oferta.obtenerId());

      expect(ofertaRecuperada).toEqual(oferta);
    });

    test("deberia recuperar una oferta cerrada como inactiva", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);

      const oferta = new Oferta(
        "Programador Jr.",
        "Se busca desarrollador backend junior",
        "Tres de Febrero",
        empresario,
        new Date("2026-11-02T15:00:00.000Z"),
      );
      oferta.cerrar();

      await repositorioOferta.guardar(oferta);

      const ofertaRecuperada = await repositorioOferta.recuperarPorId(oferta.obtenerId());

      expect(ofertaRecuperada?.estaActiva()).toBe(false);
    });
  });

  describe("actualizar", () => {
    test("deberia de cerrar una oferta y persistir el nuevo estado", async () => {
      const empresario = new Usuario("Laura", "Fernandez", "laura@example.com", "hash");
      await repositorioUsuario.guardar(empresario);

      const oferta = new Oferta(
        "Desarrollador Backend",
        "Se busca desarrollador para trabajo remoto",
        "Pilar",
        empresario,
        new Date("2026-11-04T15:00:00.000Z"),
      );
      await repositorioOferta.guardar(oferta);
      oferta.cerrar();
      await repositorioOferta.actualizar(oferta);

      const ofertaRecuperada = await repositorioOferta.recuperarPorId(oferta.obtenerId());

      expect(ofertaRecuperada?.estaActiva()).toBe(false);
    });
  });
});
