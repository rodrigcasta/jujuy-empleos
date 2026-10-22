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
      | contraseña | secreta123        |

  Esquema del escenario: Un usuario anónimo no puede consultar alumnos
    Dado que existen los alumnos:
      | padrón | nombre | apellido |
      | 11111  | Juana  | Lopez    |
    Cuando un usuario anónimo intenta <acción>
    Entonces se le pide que inicie sesión

    Ejemplos:
      | acción                               |
      | consultar el listado de alumnos      |
      | comenzar el alta de un alumno        |
      | consultar el alumno con padrón 11111 |

  Escenario: Un usuario anónimo no puede dar de alta alumnos
    Cuando un usuario anónimo intenta dar de alta al alumno con padrón "12345", nombre "Ana" y apellido "Garcia"
    Entonces se le pide que inicie sesión
    Y no se registró ningún alumno

  Escenario: Un usuario anónimo no puede eliminar alumnos
    Dado que existen los alumnos:
      | padrón | nombre | apellido |
      | 11111  | Juana  | Lopez    |
    Cuando un usuario anónimo intenta eliminar al alumno con padrón "11111"
    Entonces se le pide que inicie sesión
    Y el alumno con padrón "11111" sigue registrado

  Escenario: Inicio de sesión con credenciales correctas
    Cuando inicia sesión con email "marta@example.com" y contraseña "secreta123"
    Entonces puede ver el listado de alumnos
    Y se le muestra que inició sesión como "Marta (marta@example.com)"

  Escenario: El email no distingue mayúsculas de minúsculas
    Cuando inicia sesión con email "MARTA@Example.com" y contraseña "secreta123"
    Entonces puede ver el listado de alumnos

  Esquema del escenario: Inicio de sesión con credenciales incorrectas
    Cuando inicia sesión con email "<email>" y contraseña "<contraseña>"
    Entonces ve el mensaje de error "Email o contraseña incorrectos"
    Y no puede ver el listado de alumnos

    Ejemplos:
      | caso                    | email             | contraseña |
      | contraseña incorrecta   | marta@example.com | incorrecta |
      | usuario inexistente     | nadie@example.com | secreta123 |

  Escenario: Cierre de sesión
    Dado que inició sesión con email "marta@example.com" y contraseña "secreta123"
    Cuando cierra la sesión
    Entonces se le pide que inicie sesión
    Y no puede ver el listado de alumnos
