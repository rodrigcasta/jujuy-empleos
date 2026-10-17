export default class UsuarioYaExisteError extends Error {
  constructor(email: string) {
    super(`Ya existe un usuario registrado con el email ${email}`);
  }
}
