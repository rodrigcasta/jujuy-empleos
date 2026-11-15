export default class UsuarioYaExisteError extends Error {
  constructor() {
    super("Este email ya está en uso");
  }
}
