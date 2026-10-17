# Ejemplo de aplicación web con Express.js

Esta simple aplicación web permite gestionar alumnos (listar, ver, crear y eliminar) a través de páginas HTML generadas con templates [Handlebars](https://handlebarsjs.com/) (`hbs`). Se utiliza PostgreSQL como base de datos para persistir la información.

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
```

## PostgreSQL y Flyway

El archivo `compose.yml` define dos bases de datos PostgreSQL, en puertos distintos al default para evitar conflictos con un servidor que pueda estar corriendo en el host:

- `dev_db`: base de desarrollo, en el puerto `5433`.
- `test_db`: base de pruebas, en el puerto `5434`.

Para levantarlas:

```
  docker compose up -d dev_db test_db
```

Las migraciones se encuentran en el directorio `db/` y se aplican con Flyway:

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

## Rutas

| Método | Ruta                         | Descripción                                                                        |
| ------ | ---------------------------- | ---------------------------------------------------------------------------------- |
| GET    | `/`                          | Home page                                                                          |
| GET    | `/version`                   | Devuelve en JSON la versión de la aplicación                                       |
| GET    | `/alumnos`                   | Listado de alumnos y formulario para crear uno nuevo                               |
| GET    | `/alumnos/:padron`           | Detalle de un alumno (404 si no existe)                                            |
| POST   | `/alumnos`                   | Crea un alumno a partir del formulario (`padron`, `nombre`, `apellido`) y redirige a su detalle |
| POST   | `/alumnos/:padron/eliminar`  | Elimina un alumno y redirige al listado (404 si no existe)                         |

Los formularios se envían como `application/x-www-form-urlencoded`. Los HTML forms no soportan el método `DELETE`, por eso la eliminación se hace con un `POST` a `/alumnos/:padron/eliminar`.

El archivo `pruebas.http` contiene ejemplos de requests para cada ruta.

## Vistas

Los templates se encuentran en `app/vistas/`:

- `layout.hbs`: layout común a todas las páginas. El contenido de cada vista se inserta en `{{{body}}}` y el título de la página se toma de la variable `titulo`.
- `inicio.hbs`: home page.
- `alumnos.hbs`: listado y formulario de alta de alumnos.
- `alumno.hbs`: detalle de un alumno.
- `error.hbs`: página de error.

Para agregar una página nueva, crear el template en `app/vistas/` y renderizarlo desde el endpoint con `res.render("nombre-del-template", { titulo: "...", ... })`.
