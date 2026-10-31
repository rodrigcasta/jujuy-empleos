export default class UsuarioYaExisteError extends Error {
  constructor() {
    super("El email es inválido");
  }
}
