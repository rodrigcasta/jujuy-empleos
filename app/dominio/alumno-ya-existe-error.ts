export default class AlumnoYaExisteError extends Error {
  constructor(padron: string) {
    super(`Ya existe un alumno con el padrón ${padron}`);
  }
}
