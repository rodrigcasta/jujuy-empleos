import Alumno from "../dominio/alumno";
import AlumnoNoEncontradoError from "../dominio/alumno-no-encontrado-error";
import pool from "./pool";
import { IRepositorioAlumno } from "../dominio/puerto-repositorio-alumno";

// Fila de la tabla alumnos
interface FilaAlumno {
  id: number;
  nombre: string;
  apellido: string;
  padron: string;
}

export default class RepositorioAlumnoSql implements IRepositorioAlumno {
  guardar(alumno: Alumno): Promise<boolean> {
    const insertAlumno = "INSERT INTO alumnos (nombre, apellido, padron) VALUES ($1, $2, $3) RETURNING id";
    return pool
      .query<Pick<FilaAlumno, "id">>(insertAlumno, [alumno.getNombre(), alumno.getApellido(), alumno.getPadron()])
      .then((r) => {
        alumno.setId(r.rows[0].id);
        return true;
      });
  }

  eliminarTodos(): Promise<boolean> {
    return pool
      .query("DELETE FROM public.alumnos;")
      .then(() => true)
      .catch((error: unknown) => {
        console.log(error);
        return false;
      });
  }

  listarAlumnos(): Promise<Alumno[]> {
    return pool.query<FilaAlumno>("SELECT * FROM public.alumnos;").then((result) => {
      const alumnos: Alumno[] = [];
      for (const row of result.rows) {
        const nombre = row.nombre;
        const apellido = row.apellido;
        const padron = row.padron;
        const alumno = new Alumno(nombre, apellido, padron);
        alumnos.push(alumno);
      }
      return alumnos;
    });
  }

  recuperar(padron: string): Promise<Alumno> {
    return pool.query<FilaAlumno>("SELECT * FROM public.alumnos WHERE padron = $1;", [padron]).then((result) => {
      if (result.rows.length === 0) {
        throw new AlumnoNoEncontradoError(padron);
      }
      const nombre = result.rows[0].nombre;
      const apellido = result.rows[0].apellido;
      const id = result.rows[0].id;
      const alumno = new Alumno(nombre, apellido, padron, id);
      return alumno;
    });
  }

  eliminar(padron: string): Promise<void> {
    return this.recuperar(padron)
      .then(() => pool.query("DELETE FROM public.alumnos WHERE padron = $1;", [padron]))
      .then(() => undefined);
  }
}
