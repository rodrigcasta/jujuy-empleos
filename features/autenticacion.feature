# language: es
Característica: Autenticación
  Para proteger la información de los alumnos
  Como usuario del sistema
  Quiero tener que iniciar sesión para acceder a los alumnos

  Antecedentes:
    Dado que existe el usuario:
      | nombre     | Marta             |
      | apellido   | Suarez            |
      | email      | marta@example.com |
      | contraseña | Secreta123!#        |

  Escenario: Un usuario anónimo no puede ver el listado de alumnos
    Cuando un usuario anónimo intenta consultar el listado de alumnos
    Entonces se le pide que inicie sesión

  Escenario: Inicio de sesión con credenciales correctas
    Cuando inicia sesión con email "marta@example.com" y contraseña "Secreta123!#"
    Entonces puede ver el listado de alumnos
    Y se le muestra que inició sesión como "Marta (marta@example.com)"

  Escenario: El email no distingue mayúsculas de minúsculas
    Cuando inicia sesión con email "MARTA@Example.com" y contraseña "Secreta123!#"
    Entonces puede ver el listado de alumnos

  Esquema del escenario: Inicio de sesión con credenciales incorrectas
    Cuando intenta iniciar sesión con email "<email>" y contraseña "<contraseña>"
    Entonces ve el mensaje de error "Email o contraseña incorrectos"
    Y no puede ver el listado de alumnos

    Ejemplos:
      | caso                    | email             | contraseña |
      | contraseña incorrecta   | marta@example.com | incorrecta |
      | usuario inexistente     | nadie@example.com | Secreta123!# |

  Escenario: Cierre de sesión
    Dado que inició sesión con email "marta@example.com" y contraseña "Secreta123!#"
    Cuando cierra la sesión
    Entonces se le pide que inicie sesión
    Y no puede ver el listado de alumnos
