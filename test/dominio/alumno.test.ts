import Alumno from "../../app/dominio/alumno";

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
      const fechaNacimiento = "15/12/1995";

      const alumno = new Alumno(nombre, apellido, padron);

      expect(alumno.getNombre()).toEqual("Ana Maria");
      expect(alumno.getApellido()).toEqual("Garcia Lopez");
      expect(alumno.getPadron()).toEqual("67890");
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
