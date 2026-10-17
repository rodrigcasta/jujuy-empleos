import Usuario from "./usuario";

export interface IRepositorioUsuario {
  guardar(usuario: Usuario): Promise<boolean>;

  recuperarPorEmail(email: string): Promise<Usuario | null>;

  recuperarPorId(id: number): Promise<Usuario | null>;
}
