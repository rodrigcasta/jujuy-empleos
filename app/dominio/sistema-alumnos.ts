import Alumno from "./alumno";
import PadronDeAlumnoInvalido from "../dominio/padron-de-alumno-invalido";
import RepositorioAlumno, { NoSePuedeCalcularClaveError } from "../adaptadores/repositorio-alumno";

export default class SistemaAlumnos {
  private repositorioAlumno: RepositorioAlumno;

  constructor() {
    this.repositorioAlumno = new RepositorioAlumno();
  }
  public async crearAlumno(padron: string, nombre: string, apellido: string, fechaNacimiento: string): Promise<Alumno> {
    try {
      const alumnoCreado = new Alumno(nombre, apellido, padron, fechaNacimiento);

      await this.repositorioAlumno.guardar(alumnoCreado);

      return alumnoCreado;
    } catch (error: any) {
      if (error instanceof NoSePuedeCalcularClaveError) {
        throw new PadronDeAlumnoInvalido();
      } else {
        throw error;
      }
    }
  }

  public async obtenerAlumnos(): Promise<Alumno[]> {
    return await this.repositorioAlumno.listarAlumnos();
  }

  public async obtenerAlumnoPorPadron(padron: string): Promise<Alumno> {
    return this.repositorioAlumno.recuperar(padron);
  }

  public async eliminarAlumno(padron: string): Promise<void> {
    return this.repositorioAlumno.eliminar(padron);
  }
}
