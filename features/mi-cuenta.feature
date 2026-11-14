# language: es
Característica: Datos de cuenta
  Como usuario registrado
  Quiero acceder a una sección donde pueda visualizar mis datos de cuenta
  Para consultar mi información personal registrada en el sistema

  Escenario: DAT-01 - Un usuario no autenticado no puede acceder a Mi cuenta
    Dado que no hay un usuario autenticado
    Entonces no ve la opcion "Mi cuenta"
    Cuando intenta acceder a la sección "Mi cuenta"
    Entonces se le pide que inicie sesión
    Y no visualiza datos de cuenta