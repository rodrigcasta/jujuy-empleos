import Alumno from "../../app/dominio/alumno";
import PadronDeAlumnoInvalido from "../../app/dominio/padron-de-alumno-invalido";

describe("Alumno", () => {
  describe("constructor", () => {
    test("deberia crear un alumno con todos los atributos", () => {
      const nombre = "Juan";
      const apellido = "Perez";
      const padron = "12345";

      const alumno = new Alumno(nombre, apellido, padron);

      expect(alumno).toBeDefined();
      expect(alumno.getNombre()).toEqual(nombre);
      expect(alumno.getApellido()).toEqual(apellido);
      expect(alumno.getPadron()).toEqual(padron);
    });

    test("deberia crear un alumno con nombres y apellidos compuestos", () => {
      const nombre = "Ana Maria";
      const apellido = "Garcia Lopez";
      const padron = "67890";

      const alumno = new Alumno(nombre, apellido, padron);

      expect(alumno.getNombre()).toEqual("Ana Maria");
      expect(alumno.getApellido()).toEqual("Garcia Lopez");
      expect(alumno.getPadron()).toEqual("67890");
    });
  });

  describe("validacion del padron", () => {
    test.each(["1", "12345", "100", "9876543210"])("deberia aceptar el padron %s", (padron) => {
      expect(new Alumno("Juan", "Perez", padron).getPadron()).toEqual(padron);
    });

    test("deberia arrojar PadronDeAlumnoInvalido si el padron esta vacio", () => {
      const crear = () => new Alumno("Juan", "Perez", "");

      expect(crear).toThrow(PadronDeAlumnoInvalido);
      expect(crear).toThrow("El campo padron es obligatorio");
    });

    test.each([
      ["cero", "0"],
      ["negativo", "-5"],
      ["con signo +", "+5"],
      ["con punto", "12.345"],
      ["con coma", "12,345"],
      ["con letras", "abc"],
      ["con letras y numeros", "123a"],
      ["en notacion cientifica", "1e5"],
      ["con espacios", " 123 "],
      ["con ceros a la izquierda", "0123"],
    ])("deberia arrojar PadronDeAlumnoInvalido si el padron es %s", (_caso, padron) => {
      const crear = () => new Alumno("Juan", "Perez", padron);

      expect(crear).toThrow(PadronDeAlumnoInvalido);
      expect(crear).toThrow("El padrón debe ser un número mayor a 0, sin puntos ni comas");
    });
  });

  describe("getNombre", () => {
    test("deberia devolver el nombre del alumno", () => {
      const alumno = new Alumno("Carlos", "Martinez", "11111");

      expect(alumno.getNombre()).toEqual("Carlos");
    });
  });

  describe("getApellido", () => {
    test("deberia devolver el apellido del alumno", () => {
      const alumno = new Alumno("Sofia", "Rodriguez", "22222");

      expect(alumno.getApellido()).toEqual("Rodriguez");
    });
  });

  describe("getPadron", () => {
    test("deberia devolver el padron del alumno", () => {
      const alumno = new Alumno("Luis", "Fernandez", "33333");

      expect(alumno.getPadron()).toEqual("33333");
    });
  });
});
