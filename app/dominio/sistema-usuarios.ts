import Usuario from "./usuario";
import UsuarioYaExisteError from "./usuario-ya-existe-error";
import { IRepositorioUsuario } from "./puerto-repositorio-usuario";

export default class SistemaUsuarios {
  private repositorioUsuario: IRepositorioUsuario;

  constructor(repoUsuario: IRepositorioUsuario) {
    this.repositorioUsuario = repoUsuario;
  }

  public async registrarSegunTipo(
    tipoUsuario: string | undefined,
    nombre: string,
    apellido: string,
    email: string,
    contrasena: string,
    confirmacion?: string,
    suscripcion?: string,
  ): Promise<Usuario> {
    const tipoValidado = Usuario.resolverTipoUsuario(tipoUsuario);
    if (tipoValidado === "Aspirante") {
      return this.registrarAspirante(nombre, apellido, email, contrasena, confirmacion);
    }
    return this.registrarEmpresario(nombre, apellido, email, contrasena, confirmacion, suscripcion);
  }

  public async registrarEmpresario(
    nombre: string,
    apellido: string,
    email: string,
    contrasena: string,
    confirmacion?: string,
    suscripcion?: string,
  ): Promise<Usuario> {
    const usuario = await Usuario.registrarEmpresario(nombre, apellido, email, contrasena, confirmacion, suscripcion);
    return this.guardarSiNoExiste(usuario);
  }

  public async registrarAspirante(
    nombre: string,
    apellido: string,
    email: string,
    contrasena: string,
    confirmacion?: string,
  ): Promise<Usuario> {
    const aspirante = await Usuario.registrarAspirante(nombre, apellido, email, contrasena, confirmacion);
    return this.guardarSiNoExiste(aspirante);
  }

  private async guardarSiNoExiste(usuario: Usuario): Promise<Usuario> {
    const existente = await this.repositorioUsuario.recuperarPorEmail(usuario.obtenerEmail());
    if (existente) {
      throw new UsuarioYaExisteError();
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
