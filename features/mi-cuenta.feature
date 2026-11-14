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

  Esquema del escenario: DAT-02 - Acceso a Mi cuenta desde el header
    Dado que existe un <tipo> registrado con nombre "<nombre>", apellido "<apellido>" y email "<email>"
    Y el usuario "<email>" tiene la sesión iniciada
    Cuando selecciona "Mi cuenta" desde el header
    Entonces ve la sección "Mi cuenta"
    Y ve los datos de su cuenta:
      | nombre   | <nombre>   |
      | apellido | <apellido> |
      | email    | <email>    |

    Ejemplos:
      | tipo       | nombre | apellido | email                       |
      | empresario | Marta  | Suarez   | empresa@ejemplo.com.ar      |
      | aspirante  | Sofia  | Martinez | sofia@correo-ejemplo.com.ar |