import RepositorioAlumno from "../adaptadores/repositorio-alumno";
import Alumno from "./alumno";

export default class SistemaAlumnos {
  private repositorioAlumno: RepositorioAlumno;

  constructor() {
    this.repositorioAlumno = new RepositorioAlumno();
  }
  public async crearAlumno(padron: string, nombre: string, apellido: string, fechaNacimiento: string): Promise<Alumno> {
    const alumnoCreado = new Alumno(nombre, apellido, padron, fechaNacimiento);

    await this.repositorioAlumno.guardar(alumnoCreado);

    return alumnoCreado;
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
