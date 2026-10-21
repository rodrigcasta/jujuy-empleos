import Usuario from "./usuario";
import UsuarioYaExisteError from "./usuario-ya-existe-error";
import { IRepositorioUsuario } from "./puerto-repositorio-usuario";

export default class SistemaUsuarios {
  private repositorioUsuario: IRepositorioUsuario;

  constructor(repoUsuario: IRepositorioUsuario) {
    this.repositorioUsuario = repoUsuario;
  }

  public async registrar(
    nombre: string,
    apellido: string,
    email: string,
    contrasena: string,
    confirmacion?: string,
  ): Promise<Usuario> {
    const usuario = await Usuario.registrar(nombre, apellido, email, contrasena, confirmacion);

    const existente = await this.repositorioUsuario.recuperarPorEmail(usuario.obtenerEmail());
    if (existente) {
      throw new UsuarioYaExisteError(usuario.obtenerEmail());
    }

    await this.repositorioUsuario.guardar(usuario);
    return usuario;
  }

  // Devuelve null tanto si el usuario no existe como si la contraseña es incorrecta,
  // para no revelar qué emails están registrados
  public async autenticar(email: string, contrasena: string): Promise<Usuario | null> {
    const usuario = await this.repositorioUsuario.recuperarPorEmail(Usuario.normalizarEmail(email));
    if (!usuario) {
      return null;
    }
    return (await usuario.verificarContrasena(contrasena)) ? usuario : null;
  }

  public async obtenerPorId(id: number): Promise<Usuario | null> {
    return this.repositorioUsuario.recuperarPorId(id);
  }
}
