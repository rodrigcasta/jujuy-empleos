# language: es
Característica: Detalle de una oferta laboral
  Como aspirante
  Quiero ver los detalles de una oferta
  Para poder contactar al empresario

@wip
Escenario: DET-01 - Consulta el detalle de una oferta existente
  Dado que existe la oferta con titulo "Desarrollador Backend", descripcion "Se busca desarrollador para trabajo remoto" y ubicacion "Pilar"
  Y fue publicada por el empresario con email "empresa1@empresa1.com"
  Y no soy un usuario registrado
  Cuando selecciono la oferta "Desarrollador Backend" desde el listado de ofertas
  Entonces veo que el titulo es "Desarrollador Backend"
  Y la descripcion es "Se busca desarrollador para trabajo remoto"
  Y la ubicacion es "Pilar"
  Y el email del empresario es "empresa1@empresa1.com"
  Y puedo volver al listado de ofertas

@wip
Escenario: DET-02 - Informa cuando la oferta no existe
  Dado que no existe una oferta con id 9999
  Cuando intento consultar el detalle de la oferta con id 9999
  Entonces veo el mensaje "No se encontró la oferta solicitada"
  Y puedo volver al listado de ofertas
