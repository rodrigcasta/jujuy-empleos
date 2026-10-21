import Alumno from "./alumno";
import { IRepositorioAlumno } from "./puerto-repositorio-alumno";

export default class SistemaAlumnos {
  private repositorioAlumno: IRepositorioAlumno;

  constructor(repoAlumno: IRepositorioAlumno) {
    this.repositorioAlumno = repoAlumno;
  }

  public async crearAlumno(padron: string, nombre: string, apellido: string): Promise<Alumno> {
    const alumnoCreado: Alumno = new Alumno(nombre, apellido, padron);
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
