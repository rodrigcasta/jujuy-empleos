import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { MundoDeLaAplicacion } from "../support/mundo";

When("visita la página de inicio", async function (this: MundoDeLaAplicacion) {
  await this.pagina.goto("/");
});

// Se revisa solo el contenido principal: la barra de navegación siempre tiene links a estas páginas
Then(
  "la página de inicio ofrece el link {string} hacia {destino}",
  async function (this: MundoDeLaAplicacion, texto: string, ruta: string) {
    const link = this.pagina.getByRole("main").getByRole("link", { name: texto, exact: true });
    await expect(link).toHaveAttribute("href", ruta);
  },
);

Then("la página de inicio no ofrece un link hacia {destino}", async function (this: MundoDeLaAplicacion, ruta: string) {
  await expect(this.pagina.getByRole("main").locator(`a[href="${ruta}"]`)).toHaveCount(0);
});
