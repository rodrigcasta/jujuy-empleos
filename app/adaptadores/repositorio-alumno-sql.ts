import Alumno from "../dominio/alumno";
import AlumnoNoEncontradoError from "../dominio/alumno-no-encontrado-error";
import AlumnoYaExisteError from "../dominio/alumno-ya-existe-error";
import pool from "./pool";
import { IRepositorioAlumno } from "../dominio/puerto-repositorio-alumno";
import { DatabaseError } from "pg";

const VIOLACION_DE_UNICIDAD = "23505";

interface FilaAlumno {
  id: number;
  nombre: string;
  apellido: string;
  padron: string;
}

export default class RepositorioAlumnoSql implements IRepositorioAlumno {
  public async guardar(alumno: Alumno): Promise<void> {
    try {
      const resultado = await pool.query<Pick<FilaAlumno, "id">>(
        "INSERT INTO alumnos (nombre, apellido, padron) VALUES ($1, $2, $3) RETURNING id",
        [alumno.getNombre(), alumno.getApellido(), alumno.getPadron()],
      );
      alumno.setId(resultado.rows[0].id);
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === VIOLACION_DE_UNICIDAD) {
        throw new AlumnoYaExisteError(alumno.getPadron());
      }
      throw error;
    }
  }

  async eliminarTodos(): Promise<void> {
    await pool.query("DELETE FROM public.alumnos;");
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
