import Alumno from "../dominio/alumno";
import { createClient, RedisClientType } from "redis";

const OPERACION_REDIS_EXITOSA = "OK";

export class AlumnoNoEncontradoError extends Error {
  constructor(padronAlumno: string) {
    super(`No se encontró el alumno con padron ${padronAlumno}`);
  }
}

export class NoSePuedeCalcularClaveError extends Error {
  constructor() {
    super("No se puede calcular la clave para persistir al alumno, el Padrón debe ser un string no vacío");
  }
}

export default class RepositorioAlumno {
  public guardar(alumno: Alumno): Promise<boolean> {
    return this.clienteRedis(async (cliente) => {
      const clave = this.obtenerClaveParaPadronDeAlumno(alumno.getPadron());
      const alumnoSerializado = {
        nombre: alumno.getNombre(),
        apellido: alumno.getApellido(),
        padron: alumno.getPadron(),
        fechaNacimiento: alumno.getFechaNacimiento(),
      };
      const res = await cliente.set(clave, JSON.stringify(alumnoSerializado));
      return res === OPERACION_REDIS_EXITOSA;
    });
  }

  public recuperar(padron: string): Promise<Alumno> {
    return this.clienteRedis(async (cliente) => {
      const clave = this.obtenerClaveParaPadronDeAlumno(padron);
      const alumnoComoString = await cliente.get(clave);

      if (alumnoComoString) {
        const alumnoComoJson = JSON.parse(alumnoComoString);
        return this.deserializarAlumno(alumnoComoJson);
      } else {
        throw new AlumnoNoEncontradoError(padron);
      }
    });
  }

  public listarAlumnos(): Promise<Alumno[]> {
    return this.clienteRedis(async (cliente) => {
      const clavesDeAlumnosExistentes = await cliente.keys("a:*");

      if (clavesDeAlumnosExistentes.length === 0) {
        return [];
      }

      const values = await cliente.mGet(clavesDeAlumnosExistentes);
      return values
        .filter((v) => v !== null)
        .map((alumnoComoString) => this.deserializarAlumno(JSON.parse(alumnoComoString!)));
    });
  }

  public obtenerClaveParaPadronDeAlumno(padron: string): string {
    if (padron?.length > 0) {
      return `a:${padron}`;
    }

    throw new NoSePuedeCalcularClaveError();
  }

  private async clienteRedis<T>(callback: (cliente: RedisClientType<any>) => Promise<T>): Promise<T> {
    const url = process.env.REDIS_URL;
    const cliente: RedisClientType<any> = createClient({ url });

    await cliente.connect();
    try {
      return await callback(cliente);
    } finally {
      await cliente.quit();
    }
  }

  private deserializarAlumno(alumnoComoJson: any): Alumno {
    return new Alumno(
      alumnoComoJson["nombre"],
      alumnoComoJson["apellido"],
      alumnoComoJson["padron"],
      alumnoComoJson["fechaNacimiento"],
    );
  }
}
