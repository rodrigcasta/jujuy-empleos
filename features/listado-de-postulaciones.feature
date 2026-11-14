# language: es
@wip
Característica: Listado de postulaciones
  Como empresario
  Quiero ver las postulaciones de mi oferta
  Para contratar a un aspirante

  Antecedentes:
    Dado que existe la oferta "Desarrollador Backend" publicada por "empresa@ejemplo.com.ar"
    Y la oferta "Desarrollador Backend" recibió una postulación de "Juan" "Pérez" con email "juan@gmail.com" el "2026-11-02"

  Escenario: LPO-01 - El empresario dueño ve las postulaciones de su oferta
    Dado que el empresario "empresa@ejemplo.com.ar" está autenticado
    Cuando accede al detalle de la oferta "Desarrollador Backend"
    Entonces ve la sección "Postulaciones"

  Escenario: LPO-02 - Una persona no dueña no ve las postulaciones de una oferta
    Dado que existe un empresario registrado con email "otro@ejemplo.com.ar" y contraseña "Empresa2026!#"
    Y que el empresario "otro@ejemplo.com.ar" está autenticado
    Cuando accede al detalle de la oferta "Desarrollador Backend"
    Entonces ve el detalle de la oferta
    Y no ve la sección "Postulaciones"

  Escenario: LPO-03 - El dueño ve los datos de los postulantes en una tabla
    Dado que el empresario "empresa@ejemplo.com.ar" está autenticado
    Cuando accede al detalle de la oferta "Desarrollador Backend"
    Entonces ve la tabla de postulaciones:
      | Fecha de postulación | Nombre | Apellido | Email          |
      | 2026-11-02           | Juan   | Pérez    | juan@gmail.com |