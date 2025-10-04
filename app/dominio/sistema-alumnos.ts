import RepositorioAlumno from "../adaptadores/repositorio-alumno";
import Alumno from "./alumno";

export default class SistemaAlumnos {
  public async crearAlumno(padron: string, nombre: string, apellido: string, fechaNacimiento: string): Promise<Alumno> {
    const repositorioAlumno = new RepositorioAlumno();

    const alumnoCreado = new Alumno(nombre, apellido, padron, fechaNacimiento);

    await repositorioAlumno.guardar(alumnoCreado);

    return alumnoCreado;
  }

  public async obtenerAlumnos(): Promise<Alumno[]> {
    const repositorioAlumno = new RepositorioAlumno();

    return await repositorioAlumno.listarAlumnos();
  }
}
