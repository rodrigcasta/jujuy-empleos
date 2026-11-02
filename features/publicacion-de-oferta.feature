# language: es
Característica: Publicacion de ofertas laborales
  Para conseguir empleados
  Como empresario registrado
  Quiero publicar una oferta laboral 

Escenario: PUB-01 - Publicacion exitosa con suscripcion Gratuita
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y tiene una suscripcion "Gratuita"
  Y todavia no publico ninguna oferta
  Cuando publica una oferta con titulo "Programador Jr.", descripcion "Se busca desarrollador backend junior" y ubicacion "Tres de Febrero"
  Entonces la oferta se publica exitosamente
  Y queda asociada al empresario "laura.fernandez@empresa-ejemplo.com.ar"

@wip
Escenario: PUB-02 - Publicacion rechazada por titulo vacio
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y su suscripcion permite publicar una nueva oferta
  Cuando intenta publicar una oferta con titulo "", descripcion "Se busca desarrollador frontend" y ubicacion "Moron"
  Entonces la publicacion es rechazada porque el titulo es obligatorio

@wip
Escenario: PUB-03 - Publicacion rechazada por titulo demasiado largo
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y su suscripcion permite publicar una nueva oferta
  Cuando intenta publicar una oferta con titulo "Desarrollador backend Java para plataforma de pagos", descripcion "Se busca desarrollador para integrar el equipo" y ubicacion "CABA"
  Entonces la publicacion es rechazada porque el titulo supera los 50 caracteres

@wip
Escenario: PUB-04 - Publicacion rechazada por descripcion vacia
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y su suscripcion permite publicar una nueva oferta
  Cuando intenta publicar una oferta con titulo "Analista funcional", descripcion "" y ubicacion "Pilar"
  Entonces la publicacion es rechazada porque la descripcion es obligatoria

@wip
Escenario: PUB-05 - Publicacion rechazada por ubicacion vacia
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y su suscripcion permite publicar una nueva oferta
  Cuando intenta publicar una oferta con titulo "Analista funcional", descripcion "Se busca analista con experiencia" y ubicacion ""
  Entonces la publicacion es rechazada porque la ubicacion es obligatoria

Escenario: PUB-06 - Un usuario no autenticado no puede publicar
  Dado que el usuario no esta autenticado
  Cuando intenta acceder a la publicacion de ofertas
  Entonces debe autenticarse antes de publicar una oferta

@wip
Escenario: PUB-07 - La suscripcion Gratuita no permite una segunda oferta
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y tiene una suscripcion "Gratuita"
  Y ya publico 1 oferta
  Cuando intenta publicar una oferta con titulo "Programador Jr.", descripcion "Se busca profesional freelance" y ubicacion "Pilar"
  Entonces la publicacion es rechazada porque su suscripcion no permite publicar mas ofertas

@wip
Escenario: PUB-08 - La suscripcion Profesional permite una quinta oferta
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y tiene una suscripcion "Profesional"
  Y ya publico 4 ofertas
  Cuando publica una oferta con titulo "Desarrollador TypeScript", descripcion "Se busca desarrollador para aplicacion web" y ubicacion "CABA"
  Entonces la oferta se publica exitosamente

@wip
Escenario: PUB-09 - La suscripcion Profesional no permite una sexta oferta
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y tiene una suscripcion "Profesional"
  Y ya publico 5 ofertas
  Cuando intenta publicar una oferta con titulo "Desarrollador TypeScript", descripcion "Se busca desarrollador para aplicacion web" y ubicacion "CABA"
  Entonces la publicacion es rechazada porque su suscripcion no permite publicar mas ofertas

@wip
Escenario: PUB-10 - La suscripcion Corporativa permite publicar mas de cinco ofertas
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y tiene una suscripcion "Corporativa"
  Y ya publico 5 ofertas
  Cuando publica una oferta con titulo "Lider tecnico", descripcion "Se busca lider para equipo de desarrollo" y ubicacion "CABA"
  Entonces la oferta se publica exitosamente

@wip
Escenario: PUB-11 - Se acepta un titulo de exactamente 50 caracteres
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y su suscripcion permite publicar una nueva oferta
  Cuando publica una oferta con titulo "Desarrollador backend Java para plataforma de pago", descripcion "Se busca desarrollador para integrar el equipo" y ubicacion "CABA"
  Entonces la oferta se publica exitosamente

@wip
Escenario: PUB-12 - Publicacion rechazada por descripcion demasiado larga
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y su suscripcion permite publicar una nueva oferta
  Cuando intenta publicar una oferta con titulo "Desarrollador backend", descripcion "Buscamos desarrollador/a backend con experiencia en TypeScript, Node.js y PostgreSQL para integrarse a un equipo interdisciplinario. Se valoran conocimientos de pruebas automatizadas, arquitectura hexagonal, metodologias agiles y trabajo colaborativo." y ubicacion "CABA"
  Entonces la publicacion es rechazada porque la descripcion supera los 250 caracteres

@wip
Escenario: PUB-13 - Publicacion rechazada por ubicacion demasiado larga
  Dado que el empresario "laura.fernandez@empresa-ejemplo.com.ar" esta autenticado
  Y su suscripcion permite publicar una nueva oferta
  Cuando intenta publicar una oferta con titulo "Desarrollador backend", descripcion "Se busca desarrollador para integrar el equipo" y ubicacion "Avenida Siempre Viva 742, Ciudad Autonoma de Buenos Aires, Buenos Aires"
  Entonces la publicacion es rechazada porque la ubicacion supera los 70 caracteres