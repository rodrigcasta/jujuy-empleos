# Ejemplo de aplicación web con Express.js

Esta simple aplicación web permite gestionar alumnos (listar, ver, crear y eliminar) a través de páginas HTML generadas con templates [Handlebars](https://handlebarsjs.com/) (`hbs`). Las páginas de alumnos solo son accesibles para usuarios registrados que hayan iniciado sesión. Se utiliza PostgreSQL como base de datos para persistir la información.

## Setup

Instalar las dependencias con `yarn`:

```
  nvm use
  corepack enable
  yarn install
```

`yarn install` también descarga el navegador (Chromium) que usan las pruebas de aceptación (ver [Pruebas de aceptación](#pruebas-de-aceptación)). Se guarda fuera del proyecto, en `~/.cache/ms-playwright`, y solo se descarga la primera vez o cuando cambia la versión de Playwright. En Linux, si al correr las pruebas Chromium no inicia porque faltan bibliotecas del sistema, en Debian o Ubuntu se pueden instalar con (pide la contraseña de `sudo` para usar `apt-get`):

```
  yarn playwright install-deps chromium
```

Crear un archivo `.env` en el directorio raíz del proyecto con las variables de ambiente para acceder a la BD de desarrollo:

```
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=example
POSTGRES_DB=postgres
POSTGRES_PORT=5433
SESSION_SECRET=un-valor-largo-y-aleatorio
```

`SESSION_SECRET` se usa para firmar la cookie de sesión. Si no está definido se genera uno aleatorio al iniciar la aplicación (se imprime un aviso) y las sesiones abiertas se pierden cada vez que se reinicia. Para generar un valor:

```
  node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'
```

## PostgreSQL y Flyway

El archivo `compose.yml` define dos bases de datos PostgreSQL, en puertos distintos al default para evitar conflictos con un servidor que pueda estar corriendo en el host:

- `dev_db`: base de desarrollo, en el puerto `5433`.
- `test_db`: base de pruebas, en el puerto `5434`.

Para levantarlas:

```
  docker compose up -d dev_db test_db
```

Las migraciones se encuentran en el directorio `db/` (tablas `alumnos` y `usuarios`) y se aplican con Flyway:

```
  docker compose run --rm flyway-dev
  docker compose run --rm flyway-test
```

## Ejecutar las pruebas

Las pruebas usan la base `test_db`. Como el archivo `.env` apunta a la base de desarrollo, hay que indicar el puerto de la base de pruebas al correrlas (las variables definidas en el ambiente tienen prioridad sobre las del `.env`):

```
  POSTGRES_PORT=5434 yarn test
```

### Pruebas de aceptación

Las pruebas de aceptación están escritas en [Gherkin](https://cucumber.io/docs/gherkin/) (en español, con `# language: es`) y se ejecutan con [Cucumber.js](https://github.com/cucumber/cucumber-js). Las step definitions están escritas en TypeScript y se cargan con `ts-node`. Usan la aplicación a través de un navegador real (Chromium sin ventana), que controlan con [Playwright](https://playwright.dev/). También usan la base `test_db`:

```
  POSTGRES_PORT=5434 yarn test:aceptacion
```

- `features/*.feature`: define los escenarios como ejemplos.
- `features/step_definitions/`: la implementación de los steps. Los que comparten varias features están en `comunes.steps.ts`.
- `features/support/`: el _world_ de Cucumber (`mundo.ts`, con el navegador del escenario), los hooks (`hooks.ts`), las acciones en la interfaz que usan steps de distintas features (`acciones.ts`) y los tipos de parámetro propios (`parametros.ts`, por ejemplo `{destino}`).
- La configuración está en `cucumber.json` y el reporte HTML se genera en `reports/aceptacion.html`.

#### Cómo funcionan

- **La aplicación** corre en el mismo proceso que las pruebas: `hooks.ts` importa `app/programa.ts`, que inicia el servidor. El script `test:aceptacion` define `PORT=0` para que el sistema operativo le asigne un puerto libre; así las pruebas se pueden correr aunque esté corriendo `yarn start` (o cualquier otra aplicación en el puerto 3000).
- **El navegador** se abre una sola vez (en `BeforeAll`) y cada escenario usa un _contexto_ propio (`Before`), equivalente a una ventana de incógnito: empieza sin cookies y, por lo tanto, sin sesión. Antes de cada escenario también se vacía la base de datos.
- **Los steps** usan la pestaña del escenario, `this.pagina`, que es una [`Page`](https://playwright.dev/docs/api/class-page) de Playwright. Las rutas son relativas a la aplicación (`this.pagina.goto("/alumnos")`). Los elementos se buscan como los encontraría un usuario: los campos por su etiqueta (`getByLabel("Nombre")`) y los botones, links y títulos por su rol y su texto (`getByRole("link", { name: "Nuevo alumno" })`), en lugar de por selectores CSS o por el HTML de la respuesta.
- **Las verificaciones** usan `expect` de `@playwright/test`, por ejemplo `await expect(this.pagina.getByRole("alert")).toContainText(mensaje)` o `await expect(this.pagina).toHaveURL("/login")`. Reintentan hasta que se cumplen o pasan 5 segundos, así que no hace falta esperar a que cargue la página. Para verificar los datos guardados se usan los repositorios con `assert` de Node.
- **Los antecedentes** (`Dado que existen los alumnos:`, `Dado que existe el usuario:`) se guardan directamente con los repositorios o el dominio, sin pasar por la interfaz.

`MundoDeLaAplicacion` agrega dos métodos para enviar formularios:

- `this.presionar("Crear")` presiona el botón con ese texto (o el `Locator` que se le pase, si hay varios botones con el mismo texto) y espera a que cargue la página de la respuesta. Hay que usarlo en lugar de `click()` en los botones que envían un formulario. Si no, el step siguiente podría ejecutarse antes de que el servidor procese el request.
- `this.enviarFormulario("/alumnos", { padron, nombre, apellido })` envía desde el navegador un formulario que la página no ofrece. Se usa para las acciones que la interfaz no permite, como un usuario anónimo intentando dar de alta un alumno, o eliminar un alumno que ya no está en el listado.

Los formularios tienen validaciones del navegador (`required`, `pattern`, `minlength`, `type="email"`) que impiden enviarlos con datos inválidos, igual que le pasaría a un usuario. Por eso los escenarios solo usan datos que el formulario deja enviar. Las reglas sobre esos datos, como el formato del padrón o el largo mínimo de la contraseña, las vuelve a validar el dominio, y se prueban con los tests de `test/dominio/`.

Los steps tienen hasta 15 segundos para terminar (`setDefaultTimeout` en `hooks.ts`), más que los 5 segundos que espera Playwright, para que un step que falla lo informe Playwright (indicando qué esperaba encontrar en la página) en lugar de Cucumber.

#### Investigar un escenario que falla

- El reporte `reports/aceptacion.html` incluye una captura de la página en el momento en que falló cada escenario.
- `MOSTRAR_NAVEGADOR=1` abre la ventana del navegador y demora cada acción 300 ms, para poder seguir lo que hace cada escenario: `MOSTRAR_NAVEGADOR=1 POSTGRES_PORT=5434 yarn test:aceptacion`.
- Durante la ejecución se oculta el log de requests de la aplicación. Para verlo: `MOSTRAR_LOG=1 POSTGRES_PORT=5434 yarn test:aceptacion`.

#### En el servidor de CI

El job de GitLab (`.gitlab-ci.yml`) levanta `compose-ci.yml`, que corre `run_ci.sh` en la imagen `node:22.13.1-slim`. `yarn install` descarga Chromium, pero esa imagen no trae las bibliotecas del sistema que necesita, así que `run_ci.sh` las instala con `yarn playwright install-deps chromium` (usa `apt-get`, y en total agrega menos de un minuto al job). La imagen oficial de Playwright (`mcr.microsoft.com/playwright`) ya las trae, pero se descartó porque usa otra versión de Node (24) y pesa unos 2 GB, que se descargarían en cada ejecución porque `docker:dind` empieza sin imágenes.

La versión de `@playwright/test` está fijada en `package.json` (sin `^`). Al actualizarla, `yarn install` descarga la versión de Chromium que le corresponde.

## Ejecutar la aplicación

Para correr la aplicación utilizá el comando `yarn start` y abrí http://localhost:3000 en el navegador. Para usar otro puerto, definí la variable `PORT` (por ejemplo `PORT=4000 yarn start`).

El servidor corre en modo _watch_ (`node --watch`): cuando se modifica un archivo `.ts` de la aplicación, el proceso se reinicia automáticamente con los cambios. Los templates `.hbs` no necesitan reinicio, ya que Express los vuelve a leer en cada request. Las sesiones se mantienen entre reinicios siempre que `SESSION_SECRET` esté definido, porque se guardan en una cookie del lado del cliente.

## Autenticación

Se implementa con [Passport](https://www.passportjs.org/) y su estrategia `passport-local` (email y contraseña):

- Las sesiones se guardan **del lado del cliente**, con [`cookie-session`](https://www.npmjs.com/package/cookie-session): el servidor no guarda ningún dato de sesión. La cookie `sesion` contiene solo el id del usuario y el vencimiento de la sesión; va firmada con `SESSION_SECRET` (cookie `sesion.sig`), así que el cliente puede leerla pero no modificarla. Es `httpOnly` y `sameSite: lax`.
- Las sesiones vencen a las 8 horas de iniciadas. El vencimiento se guarda dentro de la cookie firmada y se valida en cada request, porque la fecha de expiración de la cookie la controla el navegador.
- `app/web/autenticacion.ts` agrega a la sesión los métodos `regenerate()` y `save()` que Passport 0.7 usa al iniciar y cerrar sesión, y que `cookie-session` no implementa.
- Las contraseñas nunca se guardan en texto plano: se guarda un hash calculado con [bcrypt](https://www.npmjs.com/package/bcryptjs) (`bcryptjs`), con un salt distinto para cada usuario.
- En el log de requests los campos `contrasena` y `confirmacion` se imprimen como `***`.

## Estructura

- `app/programa.ts`: arma la aplicación (configuración, middlewares y controladores) e inicia el servidor.
- `app/controladores/`: un controlador por grupo de rutas (`controlador-inicio.ts`, `controlador-autenticacion.ts`, `controlador-alumnos.ts`). Cada uno exporta una función que recibe sus dependencias y devuelve un `express.Router`.
- `app/web/`: middlewares y utilidades web (configuración de la autenticación, log de requests, manejo de errores).
- `app/dominio/`: entidades, servicios (`SistemaAlumnos`, `SistemaUsuarios`) y puertos de los repositorios.
- `app/adaptadores/`: implementaciones de los repositorios con PostgreSQL.

## Vistas

Los templates se encuentran en `app/vistas/`. El template `layout.hbs` define el layout común a todas las páginas. El contenido de cada vista se inserta en `{{{body}}}` y el título de la página se toma de la variable `titulo`. Muestra el usuario logueado (`Nombre (email)`) y el botón para cerrar sesión, o los links para iniciar sesión y registrarse.

Las vistas de cada controlador están en un subdirectorio propio (`inicio/`, `autenticacion/`, `alumnos/`). En la raíz quedan solo las compartidas: `layout.hbs` (que `hbs` siempre busca en la raíz) y `error.hbs` (que usan todos los controladores a través de `renderizarError`).

Para agregar una página nueva, crear el template en el subdirectorio del controlador y renderizarlo con la ruta relativa a `app/vistas/`, por ejemplo `res.render("alumnos/nuevo", { titulo: "...", ... })`.
