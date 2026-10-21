import Alumno from "./alumno";

export interface IRepositorioAlumno {
  guardar(alumno: Alumno): Promise<void>;

  recuperar(padron: string): Promise<Alumno>;

  listarAlumnos(): Promise<Alumno[]>;

  eliminar(padron: string): Promise<void>;
}
