import Alumno from "../dominio/alumno";
import AlumnoNoEncontradoError from "../dominio/alumno-no-encontrado-error";
import pool from "./pool";
import { IRepositorioAlumno, NoSePuedeCalcularClaveError } from "../dominio/puerto-repositorio-alumno";

const OPERACION_REDIS_EXITOSA = "OK";

export default class RepositorioAlumnoSql implements IRepositorioAlumno {
  
  guardar(alumno: Alumno): Promise<boolean> {
    const insertAlumno =
        "INSERT INTO alumnos (nombre, apellido, padron) VALUES ($1, $2, $3) RETURNING id";
    return pool.query(insertAlumno, [alumno.getNombre(), alumno.getApellido(), alumno.getPadron()])
      .then((r)=>{
        alumno.setId(r.rows[0].id);
        return true
      });
  }

  eliminarTodos() : Promise<Boolean> {
    return pool.query('DELETE FROM public.alumnos;')
      .then(result => true)
      .catch(result => {
        console.log(result);
        return false;
      })
  }

  listarAlumnos() : Promise<Alumno[]> {
      return pool.query('SELECT * FROM public.alumnos;').then(result => {
        let alumnos: Alumno[] = [];
        for (const row of result.rows) {
          let nombre = row['nombre'];
          let apellido = row['apellido'];
          let padron = row['padron'];
          const alumno = new Alumno(nombre, apellido, padron);
          alumnos.push(alumno);
        }
        return alumnos;
    });
  }

  recuperar(padron: string): Promise<Alumno> {
    return pool.query('SELECT * FROM public.alumnos WHERE padron = $1;', [padron]).then(result => {
      if (result.rows.length === 0) {
        throw new AlumnoNoEncontradoError(padron);
      }
      let nombre = result.rows[0]['nombre'];
      let apellido = result.rows[0]['apellido'];
      let id = result.rows[0]['id'];
      const alumno = new Alumno(nombre, apellido, padron, id);
      return alumno;
    });
  }

  eliminar(padron: string): Promise<void> {
    return this.recuperar(padron)
      .then(() => pool.query('DELETE FROM public.alumnos WHERE padron = $1;', [padron]))
      .then(() => undefined);
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
      alumnoComoJson["padron"]
    );
  }
}
