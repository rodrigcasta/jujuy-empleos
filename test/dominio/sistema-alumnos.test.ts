import SistemaAlumnos from "../../app/dominio/sistema-alumnos";
import Alumno from "../../app/dominio/alumno";
import AlumnoNoEncontradoError from "../../app/dominio/alumno-no-encontrado-error";
import PadronDeAlumnoInvalido from "../../app/dominio/padron-de-alumno-invalido";
import { IRepositorioAlumno, NoSePuedeCalcularClaveError } from "../../app/dominio/puerto-repositorio-alumno";
import { Mock, mock } from "ts-jest-mocker";

describe("SistemaAlumnos", () => {
  let sistemaAlumnos: SistemaAlumnos;
  let mockRepositorioAlumno: Mock<IRepositorioAlumno>;

  beforeEach(() => {
    mockRepositorioAlumno = mock<IRepositorioAlumno>();
    sistemaAlumnos = new SistemaAlumnos(mockRepositorioAlumno);
  });

  describe("crearAlumno", () => {
    test("deberia crear un objeto Alumno y guardarlo en el repositorio", async () => {
      mockRepositorioAlumno.guardar.mockResolvedValue(true);

      const alumnoCreado = await sistemaAlumnos.crearAlumno("12345", "Juan", "Perez");

      expect(mockRepositorioAlumno.guardar).toHaveBeenCalledTimes(1);

      const alumnoGuardado = mockRepositorioAlumno.guardar.mock.calls[0][0];
      expect(alumnoGuardado.getNombre()).toEqual("Juan");
      expect(alumnoGuardado.getApellido()).toEqual("Perez");
      expect(alumnoGuardado.getPadron()).toEqual("12345");

      expect(alumnoCreado.getNombre()).toEqual("Juan");
      expect(alumnoCreado.getApellido()).toEqual("Perez");
      expect(alumnoCreado.getPadron()).toEqual("12345");
    });

    test("deberia arrojar PadronDeAlumnoInvalido si el repositorio arroja una excepcion de tipo NoSePuedeCalcularClaveError", async () => {
      mockRepositorioAlumno.guardar.mockRejectedValue(new NoSePuedeCalcularClaveError());

      await expect(sistemaAlumnos.crearAlumno("", "Juan", "Perez")).rejects.toThrow(
        PadronDeAlumnoInvalido,
      );

      expect(mockRepositorioAlumno.guardar).toHaveBeenCalledTimes(1);
    });
  });

  describe("obtenerAlumnos", () => {
    test("deberia devolver lista vacia si el repositorio devuelve una lista vacia", async () => {
      mockRepositorioAlumno.listarAlumnos.mockResolvedValue([]);

      const resultado = await sistemaAlumnos.obtenerAlumnos();

      expect(mockRepositorioAlumno.listarAlumnos).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual([]);
    });

    test("deberia devolver la lista de alumnos devuelta por el repositorio", async () => {
      const alumnosMock = [
        new Alumno("Juan", "Perez", "12345"),
        new Alumno("Ana", "Garcia", "67890"),
      ];
      mockRepositorioAlumno.listarAlumnos.mockResolvedValue(alumnosMock);

      const resultado = await sistemaAlumnos.obtenerAlumnos();

      expect(mockRepositorioAlumno.listarAlumnos).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(alumnosMock);
      expect(resultado).toHaveLength(2);
    });
  });

  describe("obtenerAlumnoPorPadron", () => {
    test("deberia devolver el alumno obtenido a traves del repositorio", async () => {
      const alumnoMock = new Alumno("Juan", "Perez", "12345");
      mockRepositorioAlumno.recuperar.mockResolvedValue(alumnoMock);

      const resultado = await sistemaAlumnos.obtenerAlumnoPorPadron("12345");

      expect(mockRepositorioAlumno.recuperar).toHaveBeenCalledTimes(1);
      expect(mockRepositorioAlumno.recuperar).toHaveBeenCalledWith("12345");
      expect(resultado).toEqual(alumnoMock);
    });

    test("deberia arrojar AlumnoNoEncontradoError si el alumno no existe", async () => {
      mockRepositorioAlumno.recuperar.mockRejectedValue(new AlumnoNoEncontradoError("99999"));

      await expect(sistemaAlumnos.obtenerAlumnoPorPadron("99999")).rejects.toThrow(AlumnoNoEncontradoError);

      expect(mockRepositorioAlumno.recuperar).toHaveBeenCalledTimes(1);
      expect(mockRepositorioAlumno.recuperar).toHaveBeenCalledWith("99999");
    });
  });

  describe("eliminarAlumno", () => {
    test("deberia eliminar el registro del alumno a traves del repositorio", async () => {
      mockRepositorioAlumno.eliminar.mockResolvedValue();

      await sistemaAlumnos.eliminarAlumno("12345");

      expect(mockRepositorioAlumno.eliminar).toHaveBeenCalledTimes(1);
      expect(mockRepositorioAlumno.eliminar).toHaveBeenCalledWith("12345");
    });

    test("deberia arrojar AlumnoNoEncontradoError si el alumno no existe", async () => {
      mockRepositorioAlumno.eliminar.mockRejectedValue(new AlumnoNoEncontradoError("99999"));

      await expect(sistemaAlumnos.eliminarAlumno("99999")).rejects.toThrow(AlumnoNoEncontradoError);

      expect(mockRepositorioAlumno.eliminar).toHaveBeenCalledTimes(1);
      expect(mockRepositorioAlumno.eliminar).toHaveBeenCalledWith("99999");
    });
  });
});
