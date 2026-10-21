import Alumno from "../dominio/alumno";
import AlumnoNoEncontradoError from "../dominio/alumno-no-encontrado-error";
import AlumnoYaExisteError from "../dominio/alumno-ya-existe-error";
import pool from "./pool";
import { IRepositorioAlumno } from "../dominio/puerto-repositorio-alumno";
import ErrorPostgres from "./error-postgres";

interface FilaAlumno {
  id: number;
  nombre: string;
  apellido: string;
  padron: string;
}

const COLUMNAS = "id, nombre, apellido, padron";

const alumno = (fila: FilaAlumno): Alumno => new Alumno(fila.nombre, fila.apellido, fila.padron, fila.id);

export default class RepositorioAlumnoSql implements IRepositorioAlumno {
  public async guardar(alumno: Alumno): Promise<void> {
    try {
      const resultado = await pool.query<Pick<FilaAlumno, "id">>(
        "INSERT INTO alumnos (nombre, apellido, padron) VALUES ($1, $2, $3) RETURNING id",
        [alumno.obtenerNombre(), alumno.obtenerApellido(), alumno.obtenerPadron()],
      );
      alumno.cambiarId(resultado.rows[0].id);
    } catch (error: unknown) {
      if (ErrorPostgres.esViolacionDeUnicidad(error)) {
        throw new AlumnoYaExisteError(alumno.obtenerPadron());
      }
      throw error;
    }
  }

  public async eliminarTodos(): Promise<void> {
    await pool.query("DELETE FROM public.alumnos;");
  }

  public async listarAlumnos(): Promise<Alumno[]> {
    const resultado = await pool.query<FilaAlumno>(`SELECT ${COLUMNAS} FROM public.alumnos;`);
    return resultado.rows.map(alumno);
  }

  public async recuperar(padron: string): Promise<Alumno> {
    const resultado = await pool.query<FilaAlumno>(`SELECT ${COLUMNAS} FROM public.alumnos WHERE padron = $1;`, [
      padron,
    ]);
    if (resultado.rows.length === 0) {
      throw new AlumnoNoEncontradoError(padron);
    }
    return alumno(resultado.rows[0]);
  }

  public async eliminar(padron: string): Promise<void> {
    const resultado = await pool.query("DELETE FROM public.alumnos WHERE padron = $1", [padron]);
    if (resultado.rowCount === 0) {
      throw new AlumnoNoEncontradoError(padron);
    }
  }
}
