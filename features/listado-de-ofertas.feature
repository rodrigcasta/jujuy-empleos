# language: es
Característica: Listado de ofertas laborales
  Como aspirante
  Quiero consultar las ofertas laborales publicadas
  Para conocer las oportunidades disponibles

Escenario: LIST-01 - Muestra una oferta existente
  Dado que existe la oferta con titulo "Desarrollador Sr Java", descripcion "Se busca desarrollador con experiencia en Java" y ubicacion "Moreno"
  Y no soy un usuario registrado
  Cuando visualizo la lista de ofertas
  Entonces se muestra la oferta con titulo "Desarrollador Sr Java", descripcion "Se busca desarrollador con experiencia en Java" y ubicacion "Moreno"

Escenario: LIST-02 - Muestra la lista vacia cuando no hay ofertas
  Dado que no existen ofertas
  Cuando visualizo la lista de ofertas
  Entonces la lista se muestra vacia

@wip
Escenario: LIST-03 - Muestra las ofertas ordenadas de mas reciente a mas antigua
  Dado que existe la oferta con titulo "Desarrollador Sr Java" que fue creada hace 2 dias
  Y que existe la oferta con titulo "Product owner" que fue creada hace 1 dia
  Cuando visualizo la lista de ofertas
  Entonces la oferta con titulo "Product owner" se muestra primera
  Y la oferta con titulo "Desarrollador Sr Java" se muestra segunda

@wip
Escenario: LIST-04 - Muestra todas las ofertas en la lista
  Dado que existen 20 ofertas
  Cuando visualizo la lista de ofertas
  Entonces la lista muestra las 20 ofertas

@wip
Escenario: LIST-05 - Trunca una descripcion extensa
  Dado que existe la oferta con titulo "Desarrollador backend", descripcion "Buscamos desarrollador con experiencia en TypeScript y PostgreSQL" y ubicacion "CABA"
  Cuando visualizo la lista de ofertas
  Entonces se muestra la descripcion "Buscamos desarrollador con experiencia en TypeScri..."
  Y se muestran 50 caracteres de la descripcion original antes de los tres puntos finales
