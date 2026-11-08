# Jujuy Empleos

Aplicación web para registrar empresarios, publicar ofertas laborales y consultar las oportunidades disponibles. Está desarrollada en TypeScript con Express y Handlebars, utiliza PostgreSQL para persistir los datos y Flyway para versionar el esquema.

## Preparación

Instalar las dependencias:

```bash
nvm use
corepack enable
yarn install
```

`yarn install` también descarga Chromium, utilizado por las pruebas de aceptación mediante Playwright. En Linux, si faltan las bibliotecas necesarias para ejecutar el navegador:

```bash
yarn playwright install-deps chromium
```

Crear un archivo `.env` en el directorio raíz con la configuración de la base de desarrollo:

```dotenv
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=example
POSTGRES_DB=postgres
POSTGRES_PORT=5433
SESSION_SECRET=un-valor-largo-y-aleatorio
```

`SESSION_SECRET` firma la cookie de sesión. Si no se define, la aplicación genera un valor temporal y las sesiones abiertas se pierden al reiniciar el proceso.

## PostgreSQL y Flyway

`compose.yml` define dos bases PostgreSQL:

- `dev_db`: desarrollo, publicada en el puerto `5433`.
- `test_db`: pruebas, publicada en el puerto `5434`.

Para levantar ambas bases y aplicar las migraciones:

```bash
docker compose up -d dev_db test_db
docker compose run --rm flyway-dev
docker compose run --rm flyway-test
```

Las migraciones están en `db/`. El historial conserva las migraciones heredadas ya aplicadas y agrega nuevas migraciones para evolucionar el esquema sin modificar sus checksums.

## Ejecutar la aplicación

```bash
yarn start
```

La aplicación queda disponible en <http://localhost:3000>. Para utilizar otro puerto se puede definir `PORT`, por ejemplo `PORT=4000 yarn start`.

El servidor usa el modo `watch`: reinicia el proceso al modificar archivos TypeScript. Las vistas Handlebars se vuelven a leer en cada solicitud.

## Ejecutar las pruebas

El build completo instala dependencias, ejecuta el linter, las pruebas Jest y las pruebas de aceptación:

```bash
./build.sh
```

También se pueden ejecutar por separado:

```bash
POSTGRES_PORT=5434 yarn test
POSTGRES_PORT=5434 yarn test:aceptacion
```

Las pruebas unitarias verifican el dominio y los adaptadores PostgreSQL. Los escenarios de aceptación están escritos en Gherkin y recorren la aplicación mediante un navegador Chromium controlado por Playwright.

Las principales ubicaciones son:

- `test/dominio/`: reglas de usuarios y ofertas.
- `test/adaptadores/`: persistencia PostgreSQL.
- `features/*.feature`: escenarios de aceptación.
- `features/step_definitions/`: implementación de los pasos.
- `features/support/`: navegador, contexto y preparación de cada escenario.

Cada escenario usa un contexto de navegador aislado y la base de pruebas se limpia antes de su ejecución. El reporte HTML se genera en `reports/aceptacion.html`.

Para investigar una prueba de aceptación:

```bash
MOSTRAR_NAVEGADOR=1 POSTGRES_PORT=5434 yarn test:aceptacion
MOSTRAR_LOG=1 POSTGRES_PORT=5434 yarn test:aceptacion
```

## Autenticación

La autenticación utiliza Passport con su estrategia local:

- El usuario se identifica mediante email y contraseña.
- Las contraseñas se almacenan como hashes de bcrypt con un salt propio.
- La sesión se guarda en una cookie firmada con `SESSION_SECRET`.
- La cookie contiene únicamente el identificador del usuario y el vencimiento de la sesión.
- Los campos sensibles se ocultan en el registro de solicitudes.

## Estructura

- `app/programa.ts`: configura Express, autenticación, dependencias y controladores.
- `app/dominio/`: entidades, reglas de negocio, sistemas y puertos de persistencia.
- `app/adaptadores/`: repositorios PostgreSQL y traducción de errores técnicos.
- `app/controladores/`: rutas de inicio, autenticación y ofertas.
- `app/web/`: autenticación, estados HTTP, logs y manejo común de excepciones.
- `app/vistas/`: páginas Handlebars y layout compartido.
- `db/`: migraciones versionadas de Flyway.

El dominio contiene `Usuario`, `Oferta`, `SistemaUsuarios` y `SistemaOfertas`. Los sistemas dependen de puertos y los adaptadores PostgreSQL implementan esos contratos.

## Funcionalidades disponibles

- Registro de empresarios con selección de suscripción.
- Inicio y cierre de sesión.
- Publicación de ofertas respetando el límite de la suscripción.
- Listado público de ofertas.
- Consulta del detalle de una oferta.

Las vistas se agrupan en `inicio/`, `autenticacion/` y `ofertas/`. `layout.hbs` define la navegación compartida y `error.hbs` presenta los errores no recuperables.
