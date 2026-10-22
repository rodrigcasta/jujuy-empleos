import { IWorldOptions, setWorldConstructor, World } from "@cucumber/cucumber";
import { Browser, BrowserContext, Locator, Page } from "@playwright/test";
import { port } from "../../app/programa";

const URL_DE_LA_APLICACION = `http://localhost:${port}`;

// Tiempo máximo que Playwright espera a que se pueda realizar una acción o se cumpla una verificación
const TIEMPO_DE_ESPERA_MS = 5_000;

// Estado compartido por los steps de un escenario. Cucumber crea un mundo nuevo para cada escenario.
export class MundoDeLaAplicacion extends World {
  // Cada escenario usa su propio contexto del navegador (como una ventana de incógnito): empieza sin cookies
  private contexto?: BrowserContext;
  private paginaAbierta?: Page;

  constructor(opciones: IWorldOptions) {
    super(opciones);
  }

  public async abrirNavegador(navegador: Browser) {
    // Con baseURL, las rutas relativas (por ejemplo en goto o toHaveURL) se resuelven contra la aplicación
    this.contexto = await navegador.newContext({ baseURL: URL_DE_LA_APLICACION });
    this.contexto.setDefaultTimeout(TIEMPO_DE_ESPERA_MS);
    // Desactiva la validación de los formularios en el navegador (required, pattern, minlength, etc.) para que los
    // datos inválidos lleguen al servidor: los escenarios verifican las reglas del sistema, no las del navegador
    await this.contexto.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        for (const formulario of document.forms) {
          formulario.noValidate = true;
        }
      });
    });
    this.paginaAbierta = await this.contexto.newPage();
  }

  public async cerrarNavegador() {
    await this.contexto?.close();
  }

  // La pestaña del navegador del escenario
  public get pagina(): Page {
    if (!this.paginaAbierta) {
      throw new Error("El navegador del escenario no está abierto");
    }
    return this.paginaAbierta;
  }

  // Presiona un botón que envía un formulario (por su texto, o un Locator si hay varios con el mismo texto) y espera
  // a que cargue la página de la respuesta, para que el siguiente step no se ejecute antes de que el servidor la procese
  public async presionar(boton: string | Locator) {
    const locator = typeof boton === "string" ? this.pagina.getByRole("button", { name: boton, exact: true }) : boton;
    await this.esperarNavegacion(() => locator.click());
  }

  // Envía desde el navegador un formulario que la página no ofrece, por ejemplo para intentar una acción
  // que la interfaz no le permite a un usuario anónimo
  public async enviarFormulario(accion: string, campos: Record<string, string> = {}) {
    // La cookie de sesión (sameSite: lax) solo se envía en un POST que sale de una página de la aplicación
    if (!this.pagina.url().startsWith(URL_DE_LA_APLICACION)) {
      await this.pagina.goto("/");
    }
    await this.esperarNavegacion(() =>
      this.pagina.evaluate(
        ({ accion, campos }) => {
          const formulario = document.createElement("form");
          formulario.method = "post";
          formulario.action = accion;
          for (const [nombre, valor] of Object.entries(campos)) {
            const campo = document.createElement("input");
            campo.type = "hidden";
            campo.name = nombre;
            campo.value = valor;
            formulario.append(campo);
          }
          document.body.append(formulario);
          formulario.submit();
        },
        { accion, campos },
      ),
    );
  }

  private async esperarNavegacion(accion: () => Promise<unknown>) {
    const navegacion = this.pagina.waitForEvent("framenavigated", (frame) => frame === this.pagina.mainFrame());
    await Promise.all([navegacion, accion()]);
    await this.pagina.waitForLoadState();
  }
}

setWorldConstructor(MundoDeLaAplicacion);
