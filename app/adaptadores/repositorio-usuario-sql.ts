import Usuario from "../dominio/usuario";
import UsuarioYaExisteError from "../dominio/usuario-ya-existe-error";
import { DatabaseError } from "pg";
import pool from "./pool";
import { IRepositorioUsuario } from "../dominio/puerto-repositorio-usuario";

const VIOLACION_DE_UNICIDAD = "23505";

// Fila de la tabla usuarios
interface FilaUsuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  hash_contrasena: string;
}

const COLUMNAS = "id, nombre, apellido, email, hash_contrasena";

export default class RepositorioUsuarioSql implements IRepositorioUsuario {
  public async guardar(usuario: Usuario): Promise<void> {
    try {
      const resultado = await pool.query<Pick<FilaUsuario, "id">>(
        "INSERT INTO usuarios (nombre, apellido, email, hash_contrasena) VALUES ($1, $2, $3, $4) RETURNING id",
        [usuario.obtenerNombre(), usuario.obtenerApellido(), usuario.obtenerEmail(), usuario.obtenerHashContrasena()],
      );
      usuario.cambiarId(resultado.rows[0].id);
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === VIOLACION_DE_UNICIDAD) {
        throw new UsuarioYaExisteError(usuario.obtenerEmail());
      }
      throw error;
    }
  }

  public async eliminarTodos(): Promise<void> {
    await pool.query("DELETE FROM public.usuarios;");
  }

  public async recuperarPorEmail(email: string): Promise<Usuario | null> {
    const resultado = await pool.query<FilaUsuario>(`SELECT ${COLUMNAS} FROM public.usuarios WHERE email = $1;`, [
      email,
    ]);
    return resultado.rows.length === 0 ? null : this.deserializarUsuario(resultado.rows[0]);
  }

  public async recuperarPorId(id: number): Promise<Usuario | null> {
    const resultado = await pool.query<FilaUsuario>(`SELECT ${COLUMNAS} FROM public.usuarios WHERE id = $1;`, [id]);
    return resultado.rows.length === 0 ? null : this.deserializarUsuario(resultado.rows[0]);
  }

  private deserializarUsuario(row: FilaUsuario): Usuario {
    return new Usuario(row.nombre, row.apellido, row.email, row.hash_contrasena, row.id);
  }
}
