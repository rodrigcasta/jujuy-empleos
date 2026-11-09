import { DataTable, Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import RepositorioUsuarioSql from "../../app/adaptadores/repositorio-usuario-sql";
import SistemaUsuarios from "../../app/dominio/sistema-usuarios";
import { MundoDeLaAplicacion } from "../support/mundo";

// Steps usados tanto por la autenticación como por el registro de usuarios

// Se guarda directamente, sin pasar por la interfaz, para que el navegador del escenario siga sin sesión
Given("que existe el usuario:", async function (datos: DataTable) {
  const usuario = datos.rowsHash();
  await new SistemaUsuarios(new RepositorioUsuarioSql()).registrarEmpresario(
    usuario["nombre"],
    usuario["apellido"],
    usuario["email"],
    usuario["contraseña"],
  );
});

// La barra de navegación muestra al usuario con la sesión iniciada como "Nombre (email)"
Then("se le muestra que inició sesión como {string}", async function (this: MundoDeLaAplicacion, usuario: string) {
  await expect(this.pagina).toHaveURL("/");
  await expect(this.pagina.getByText(usuario)).toBeVisible();
});

Then("ve el mensaje de error {string}", async function (this: MundoDeLaAplicacion, mensaje: string) {
  await expect(this.pagina.getByRole("alert")).toContainText(mensaje);
});
