export default class DatosDeUsuarioInvalidos extends Error {
  constructor(mensaje: string) {
    super(mensaje);
  }
}
