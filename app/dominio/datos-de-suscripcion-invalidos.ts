export default class DatosDeSuscripcionInvalidos extends Error {
  constructor(mensaje: string) {
    super(mensaje);
  }
}
