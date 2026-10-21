export default class AlumnoConPadronDuplicadoError extends Error {
  constructor(padron: string) {
    super(`Ya existe un alumno con el padrón ${padron}`);
  }
}
