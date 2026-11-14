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
    Entonces visualiza la página de su cuenta
    Y ve los datos de su cuenta:
      | nombre   | <nombre>   |
      | apellido | <apellido> |
      | email    | <email>    |

    Ejemplos:
      | tipo       | nombre | apellido | email                       |
      | empresario | Marta  | Suarez   | empresa@ejemplo.com.ar      |
      | aspirante  | Sofia  | Martinez | sofia@correo-ejemplo.com.ar |


Esquema del escenario: DAT-03 - Visualización en solo lectura de los datos propios de cuenta
    Dado que existe un <tipo> registrado con nombre "<nombre>", apellido "<apellido>" y email "<email>"
    Y existe otro usuario registrado con nombre "Otro", apellido "Usuario" y email "otro@ejemplo.com.ar"
    Y el usuario "<email>" tiene la sesión iniciada
    Cuando accede a la sección "Mi cuenta"
    Entonces ve los datos de su cuenta:
      | nombre   | <nombre>   |
      | apellido | <apellido> |
      | email    | <email>    |
    Y no visualiza el email "otro@ejemplo.com.ar"
    Y los datos de cuenta se muestran en modo de solo lectura

    Ejemplos:
      | tipo       | nombre | apellido | email          |
      | empresario | Juan   | Pérez    | juan@gmail.com |
      | aspirante  | Sofía  | Martínez | sofia@mail.com |
