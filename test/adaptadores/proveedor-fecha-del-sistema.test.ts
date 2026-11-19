import ProveedorFechaDelSistema from "../../app/adaptadores/proveedor-fecha-del-sistema";

describe("ProveedorFechaDelSistema", () => {
  test("deberia consultar el reloj del sistema en cada solicitud", () => {
    const fechaInicial = new Date("2026-11-19T17:00:00.000Z");
    const fechaSiguiente = new Date("2026-11-19T17:01:00.000Z");
    jest.useFakeTimers().setSystemTime(fechaInicial);
    const proveedorFecha = new ProveedorFechaDelSistema();

    expect(proveedorFecha.obtenerFechaActual()).toEqual(fechaInicial);

    jest.setSystemTime(fechaSiguiente);

    expect(proveedorFecha.obtenerFechaActual()).toEqual(fechaSiguiente);
  });
});
