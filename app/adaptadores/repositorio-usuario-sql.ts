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

export default class RepositorioUsuarioSql implements IRepositorioUsuario {
  guardar(usuario: Usuario): Promise<boolean> {
    const insertUsuario =
      "INSERT INTO usuarios (nombre, apellido, email, hash_contrasena) VALUES ($1, $2, $3, $4) RETURNING id";
    return pool
      .query<Pick<FilaUsuario, "id">>(insertUsuario, [
        usuario.getNombre(),
        usuario.getApellido(),
        usuario.getEmail(),
        usuario.getHashContrasena(),
      ])
      .then((r) => {
        usuario.setId(r.rows[0].id);
        return true;
      })
      .catch((error: unknown) => {
        if (error instanceof DatabaseError && error.code === VIOLACION_DE_UNICIDAD) {
          throw new UsuarioYaExisteError(usuario.getEmail());
        }
        throw error;
      });
  }

  eliminarTodos(): Promise<boolean> {
    return pool
      .query("DELETE FROM public.usuarios;")
      .then(() => true)
      .catch((error: unknown) => {
        console.log(error);
        return false;
      });
  }

  recuperarPorEmail(email: string): Promise<Usuario | null> {
    return pool
      .query<FilaUsuario>("SELECT * FROM public.usuarios WHERE email = $1;", [email])
      .then((result) => (result.rows.length === 0 ? null : this.deserializarUsuario(result.rows[0])));
  }

  recuperarPorId(id: number): Promise<Usuario | null> {
    return pool
      .query<FilaUsuario>("SELECT * FROM public.usuarios WHERE id = $1;", [id])
      .then((result) => (result.rows.length === 0 ? null : this.deserializarUsuario(result.rows[0])));
  }

  private deserializarUsuario(row: FilaUsuario): Usuario {
    return new Usuario(row.nombre, row.apellido, row.email, row.hash_contrasena, row.id);
  }
}
