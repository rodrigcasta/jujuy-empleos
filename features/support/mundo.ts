import { AddressInfo } from "node:net";
import { IWorldOptions, setWorldConstructor, World } from "@cucumber/cucumber";
import { Browser, BrowserContext, Locator, Page } from "@playwright/test";
import { server } from "../../app/programa";

// Las pruebas corren con PORT=0: el sistema operativo le asigna a la aplicación un puerto libre
const urlDeLaAplicacion = () => `http://localhost:${(server.address() as AddressInfo).port}`;

// Tiempo máximo que Playwright espera a que se pueda realizar una acción o se cumpla una verificación
const TIEMPO_DE_ESPERA_MS = 5_000;

// Estado compartido por los steps de un escenario. Cucumber crea un mundo nuevo para cada escenario.
export class MundoDeLaAplicacion extends World {
  // Cada escenario usa su propio contexto del navegador (como una ventana de incógnito): empieza sin cookies
  private contexto?: BrowserContext;
  private paginaAbierta?: Page;
  public emailEmpresario?: string;
  public emailUsuarioRegistrado?: string;
  public emailIntentoInicioSesion?: string;
  public emailUsuarioAutenticado?: string;
  public contrasenasUsuarios = new Map<string, string>();
  public cantidadUsuariosAntes?: number;
  public ultimaOferta?: { titulo: string; descripcion: string; ubicacion: string };
  public cantidadOfertasAntes?: number;

  constructor(opciones: IWorldOptions) {
    super(opciones);
  }

  public async abrirNavegador(navegador: Browser) {
    // Con baseURL, las rutas relativas (por ejemplo en goto o toHaveURL) se resuelven contra la aplicación
    this.contexto = await navegador.newContext({ baseURL: urlDeLaAplicacion() });
    this.contexto.setDefaultTimeout(TIEMPO_DE_ESPERA_MS);
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

  public async seguirEnlace(enlace: string | Locator) {
    const locator = typeof enlace === "string" ? this.pagina.getByRole("link", { name: enlace, exact: true }) : enlace;
    await this.esperarNavegacion(() => locator.click());
  }

  private async esperarNavegacion(accion: () => Promise<unknown>) {
    const navegacion = this.pagina.waitForEvent("framenavigated", (frame) => frame === this.pagina.mainFrame());
    const respuesta = this.pagina.waitForResponse(
      (response) => response.request().isNavigationRequest() && response.frame() === this.pagina.mainFrame(),
    );
    await Promise.all([navegacion, respuesta, accion()]);
    await this.pagina.waitForLoadState("networkidle");
  }
}

setWorldConstructor(MundoDeLaAplicacion);
