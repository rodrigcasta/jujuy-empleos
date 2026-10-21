import Usuario from "./usuario";

export interface IRepositorioUsuario {
  guardar(usuario: Usuario): Promise<void>;

  recuperarPorEmail(email: string): Promise<Usuario | null>;

  recuperarPorId(id: number): Promise<Usuario | null>;
}
