import Alumno from "../dominio/alumno";
import AlumnoNoEncontradoError from "../dominio/alumno-no-encontrado-error";
import clienteRedis from "./cliente-redis";
import { IRepositorioAlumno, NoSePuedeCalcularClaveError } from "../dominio/puerto-repositorio-alumno";

const OPERACION_REDIS_EXITOSA = "OK";

export default class RepositorioAlumno implements IRepositorioAlumno {
  guardar(alumno: Alumno): Promise<boolean> {
    return clienteRedis(async (cliente) => {
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

  recuperar(padron: string): Promise<Alumno> {
    return clienteRedis(async (cliente) => {
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

  listarAlumnos(): Promise<Alumno[]> {
    return clienteRedis(async (cliente) => {
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

  eliminar(padron: string): Promise<void> {
    return clienteRedis(async (cliente) => {
      const clave = this.obtenerClaveParaPadronDeAlumno(padron);
      const resultado = await cliente.del(clave);

      if (resultado === 0) {
        throw new AlumnoNoEncontradoError(padron);
      }
    });
  }

  public obtenerClaveParaPadronDeAlumno(padron: string): string {
    if (padron?.length > 0) {
      return `a:${padron}`;
    }

    throw new NoSePuedeCalcularClaveError();
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
