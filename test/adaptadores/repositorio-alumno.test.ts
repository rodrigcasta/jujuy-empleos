import Alumno from "../../app/dominio/alumno";
import { createClient, RedisClientType } from "redis";
import { describe, expect, test } from "@jest/globals";
import RepositorioAlumno, {
  AlumnoNoEncontradoError,
  NoSePuedeCalcularClaveError,
} from "../../app/adaptadores/repositorio-alumno";

describe("RepositorioAlumno", () => {
  beforeEach(async () => {
    // Borrar todos los datos en Redis antes de ejecutar cada prueba
    await clienteRedis((cliente) => cliente.flushDb());
  });

  const repositorioAlumno = new RepositorioAlumno();

  describe("obtenerClaveParaPadronDeAlumno", () => {
    test("la clave deberia ser el padron con el sufijo 'a:'", () => {
      const claveParaAlumno = repositorioAlumno.obtenerClaveParaPadronDeAlumno("555");

      expect(claveParaAlumno).toBe("a:555");
    });

    test("deberia arrojar una excepcion si el padron del alumno es ''", () => {
      expect(() => {
        repositorioAlumno.obtenerClaveParaPadronDeAlumno("");
      }).toThrowError(NoSePuedeCalcularClaveError);
    });
  });

  describe("guardar", () => {
    test("deberia persistir un alumno en un SET de redis", async () => {
      const alumna = new Alumno("Juana", "Rodriguez", "123456", "01/01/2000");

      const resultado = await repositorioAlumno.guardar(alumna);

      expect(resultado).toBeTruthy();
      await clienteRedis(async (cliente) => {
        const registroAlumna = await cliente.get(repositorioAlumno.obtenerClaveParaPadronDeAlumno("123456"));

        expect(registroAlumna).not.toBeNull();
        expect(registroAlumna).not.toEqual("");
        const datosAlumnoDeserializados = JSON.parse(registroAlumna!);
        expect(datosAlumnoDeserializados.padron).toBe("123456");
        expect(datosAlumnoDeserializados.nombre).toBe("Juana");
        expect(datosAlumnoDeserializados.apellido).toBe("Rodriguez");
        expect(datosAlumnoDeserializados.fechaNacimiento).toBe("01/01/2000");
      });
    });

    test("deberia poder persistir más de un alumno sin sobreescribir los datos", async () => {
      const alumna1 = new Alumno("Juana", "Rodriguez", "123456", "01/01/2000");
      let resultado = await repositorioAlumno.guardar(alumna1);
      expect(resultado).toBeTruthy();

      const alumna2 = new Alumno("Ana", "Lopez", "987654", "31/12/2000");
      resultado = await repositorioAlumno.guardar(alumna2);
      expect(resultado).toBeTruthy();

      await clienteRedis(async (cliente) => {
        const clavesRegistrosAlumnos = await cliente.keys("a:*");

        expect(clavesRegistrosAlumnos).toContain("a:123456");
        expect(clavesRegistrosAlumnos).toContain("a:987654");

        const registroAlumna1 = await cliente.get(repositorioAlumno.obtenerClaveParaPadronDeAlumno("123456"));
        const datosDeserializadosAlumna1 = JSON.parse(registroAlumna1!);
        expect(datosDeserializadosAlumna1.nombre).toBe("Juana");
        const registroAlumna2 = await cliente.get(repositorioAlumno.obtenerClaveParaPadronDeAlumno("987654"));
        const datosDeserializadosAlumna2 = JSON.parse(registroAlumna2!);
        expect(datosDeserializadosAlumna2.nombre).toBe("Ana");
      });
    });
  });

  describe("recuperar", () => {
    test("deberia devolver un objeto alumno con los datos recuperados del SET de redis", async () => {
      const padronAlumna = "987654";
      const alumna = new Alumno("Ana", "Lopez", padronAlumna, "31/12/2000");
      const resultado = await repositorioAlumno.guardar(alumna);
      expect(resultado).toBeTruthy();

      const alumnaRecuperada = await repositorioAlumno.recuperar(padronAlumna);

      expect(alumnaRecuperada).not.toBeNull();
      expect(alumnaRecuperada.getPadron()).toBe(padronAlumna);
      expect(alumnaRecuperada.getNombre()).toBe("Ana");
      expect(alumnaRecuperada.getApellido()).toBe("Lopez");
      expect(alumnaRecuperada.getFechaNacimiento()).toBe("31/12/2000");
    });

    test("deberia encontrar el registro si existe más de un alumno persistido", async () => {
      const alumna1 = new Alumno("Juana", "Rodriguez", "123456", "01/01/2000");
      await repositorioAlumno.guardar(alumna1);
      const alumna2 = new Alumno("Ana", "Lopez", "987654", "31/12/2000");
      await repositorioAlumno.guardar(alumna2);

      const alumnaRecuperada1 = await repositorioAlumno.recuperar("123456");
      expect(alumnaRecuperada1.getPadron()).toBe("123456");

      const alumnaRecuperada2 = await repositorioAlumno.recuperar("987654");
      expect(alumnaRecuperada2.getPadron()).toBe("987654");
    });

    test("deberia arrojar una excepción de tipo AlumnoNoEncontradoError si no se encuentra el registro del alumno en redis", async () => {
      await expect(repositorioAlumno.recuperar("no-existe")).rejects.toThrowError(AlumnoNoEncontradoError);
    });
  });

  describe("listarAlumnos", () => {
    test("deberia devolver un arreglo vacio si no hay alumnos guardados", async () => {
      const listaAlumnos = await repositorioAlumno.listarAlumnos();

      expect(listaAlumnos.length).toBe(0);
    });

    test("debería devolver arreglo con un único elemento cuando hay un solo alumno guardado", async () => {
      const alumna = new Alumno("Ana", "Lopez", "123456", "31/12/2000");
      await repositorioAlumno.guardar(alumna);

      const listaAlumnos = await repositorioAlumno.listarAlumnos();

      expect(listaAlumnos.length).toBe(1);
      expect(listaAlumnos[0].getPadron()).toBe("123456");
    });

    test("deberia devolver arreglo con todos los alumnos guardados si hay mas de uno", async () => {
      const alumna1 = new Alumno("Juana", "Rodriguez", "123456", "01/01/2000");
      await repositorioAlumno.guardar(alumna1);
      const alumna2 = new Alumno("Ana", "Lopez", "987654", "31/12/2000");
      await repositorioAlumno.guardar(alumna2);
      const alumno3 = new Alumno("Federico", "Garcia", "456123", "01/06/2000");
      await repositorioAlumno.guardar(alumno3);

      const listaAlumnos = await repositorioAlumno.listarAlumnos();

      expect(listaAlumnos.length).toBe(3);
      const padronDeAlumnosListados = listaAlumnos.map((alumno) => alumno.getPadron());
      expect(padronDeAlumnosListados).toContain("123456");
      expect(padronDeAlumnosListados).toContain("987654");
      expect(padronDeAlumnosListados).toContain("456123");
    });
  });
});

async function clienteRedis<T>(callback: (cliente: RedisClientType<any>) => Promise<T>): Promise<T> {
  const url = process.env.REDIS_URL;
  const cliente: RedisClientType<any> = createClient({ url });
  await cliente.connect();
  try {
    return await callback(cliente);
  } finally {
    await cliente.quit();
  }
}
