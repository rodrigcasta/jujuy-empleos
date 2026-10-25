import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { MundoDeLaAplicacion } from "../support/mundo";

When("visita la página de inicio", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/");
});

// Se revisa solo el contenido principal: la barra de navegación siempre tiene links a estas páginas
Then("se le ofrece iniciar sesión", async function (this: MundoDeLaAplicacion) {
  const link = this.pagina.getByRole("main").getByRole("link", { name: "iniciar sesión", exact: true });
  await expect(link).toHaveAttribute("href", "/login");
});

Then("se le ofrece consultar el listado de alumnos", async function (this: MundoDeLaAplicacion) {
  const link = this.pagina.getByRole("main").getByRole("link", { name: "listado de alumnos", exact: true });
  await expect(link).toHaveAttribute("href", "/alumnos");
});

Then("no se le ofrece iniciar sesión", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina.getByRole("main").locator('a[href="/login"]')).toHaveCount(0);
});

Then("no se le ofrece consultar el listado de alumnos", async function (this: MundoDeLaAplicacion) {
  await expect(this.pagina.getByRole("main").locator('a[href="/alumnos"]')).toHaveCount(0);
});
