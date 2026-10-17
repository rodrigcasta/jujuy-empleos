# Ejemplo de aplicación web con Express.js

Esta simple aplicación web permite gestionar alumnos (listar, ver, crear y eliminar) a través de páginas HTML generadas con templates [Handlebars](https://handlebarsjs.com/) (`hbs`). Las páginas de alumnos solo son accesibles para usuarios registrados que hayan iniciado sesión. Se utiliza PostgreSQL como base de datos para persistir la información.

## Setup

Instalar las dependencias con `yarn`:

```
  nvm use
  corepack enable
  yarn install
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

## Ejecutar la aplicación

Para correr la aplicación utilizá el comando `yarn start` y abrí http://localhost:3000 en el navegador.

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

Para agregar una página nueva, crear el template en `app/vistas/` y renderizarlo desde el controlador con `res.render("nombre-del-template", { titulo: "...", ... })`.
