export default class PadronDeAlumnoInvalido extends Error {
  constructor(mensaje: string = "El campo padron es obligatorio") {
    super(mensaje);
  }
}
