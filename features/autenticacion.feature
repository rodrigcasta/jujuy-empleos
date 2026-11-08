# language: es
Característica: Autenticación
  Para proteger la información del sistema
  Como usuario del sistema
  Quiero iniciar y cerrar mi sesión

  Antecedentes:
    Dado que existe el usuario:
      | nombre     | Marta             |
      | apellido   | Suarez            |
      | email      | marta@example.com |
      | contraseña | Secreta123!#        |

  Escenario: Inicio de sesión con credenciales correctas
    Cuando inicia sesión con email "marta@example.com" y contraseña "Secreta123!#"
    Entonces se le muestra que inició sesión como "Marta (marta@example.com)"

  Escenario: El email no distingue mayúsculas de minúsculas
    Cuando inicia sesión con email "MARTA@Example.com" y contraseña "Secreta123!#"
    Entonces se le muestra que inició sesión como "Marta (marta@example.com)"

  Esquema del escenario: Inicio de sesión con credenciales incorrectas
    Cuando intenta iniciar sesión con email "<email>" y contraseña "<contraseña>"
    Entonces ve el mensaje de error "Email o contraseña incorrectos"

    Ejemplos:
      | caso                    | email             | contraseña |
      | contraseña incorrecta   | marta@example.com | incorrecta |
      | usuario inexistente     | nadie@example.com | Secreta123!# |

  Escenario: Cierre de sesión
    Dado que inició sesión con email "marta@example.com" y contraseña "Secreta123!#"
    Cuando cierra la sesión
    Entonces se le pide que inicie sesión
