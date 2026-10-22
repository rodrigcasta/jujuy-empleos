# language: es
Característica: Gestión de alumnos
  Para llevar el registro de los alumnos del curso
  Como usuario del sistema
  Quiero poder consultar, dar de alta y eliminar alumnos

  Antecedentes:
    Dado que inició sesión un usuario registrado

  Escenario: Listado sin alumnos
    Cuando consulta el listado de alumnos
    Entonces ve que no hay alumnos cargados

  Escenario: Listado con alumnos
    Dado que existen los alumnos:
      | padrón | nombre | apellido  |
      |  11111 | Juana  | Lopez     |
      |  22222 | Carlos | Martinez  |
      |  33333 | Sofia  | Rodriguez |
    Cuando consulta el listado de alumnos
    Entonces ve en el listado a los alumnos:
      | padrón | nombre | apellido  |
      |  11111 | Juana  | Lopez     |
      |  22222 | Carlos | Martinez  |
      |  33333 | Sofia  | Rodriguez |

  Escenario: Alta de un alumno
    Cuando da de alta al alumno con padrón "12345", nombre "Ana" y apellido "Garcia"
    Entonces ve el detalle del alumno con padrón "12345", nombre "Ana" y apellido "Garcia"
    Y el alumno con padrón "12345" aparece en el listado

  Escenario: No se puede dar de alta un alumno sin padrón
    Cuando da de alta al alumno con padrón "", nombre "Ana" y apellido "Garcia"
    Entonces ve el mensaje de error "El campo padron es obligatorio"
    Y no se registró ningún alumno

  Escenario: No se puede dar de alta un alumno con un padrón que ya existe
    Dado que existen los alumnos:
      | padrón | nombre | apellido |
      |  12345 | Juana  | Lopez    |
    Cuando da de alta al alumno con padrón "12345", nombre "Ana" y apellido "Garcia"
    Entonces ve el mensaje de error "Ya existe un alumno con el padrón 12345"

  Esquema del escenario: No se puede dar de alta un alumno con un padrón inválido
    Cuando da de alta al alumno con padrón "<padrón>", nombre "Ana" y apellido "Garcia"
    Entonces ve el mensaje de error "El padrón debe ser un número mayor a 0, sin puntos ni comas"
    Y no se registró ningún alumno

    Ejemplos:
      | caso                 | padrón |
      | con punto            | 12.345 |
      | con coma             | 12,345 |
      | con letras           | abc    |
      | cero                 |      0 |
      | negativo             |     -5 |
      | ceros a la izquierda |   0123 |

  Escenario: Los datos del alumno se muestran tal como fueron ingresados
    Cuando da de alta al alumno con padrón "12345", nombre "<script>alert(1)</script>" y apellido "Garcia"
    Entonces ve el nombre "<script>alert(1)</script>" tal como fue ingresado

  Escenario: Consulta de un alumno
    Dado que existen los alumnos:
      | padrón | nombre | apellido |
      |  11111 | Juana  | Lopez    |
      |  22222 | Carlos | Martinez |
    Cuando consulta el alumno con padrón "22222"
    Entonces ve el detalle del alumno con padrón "22222", nombre "Carlos" y apellido "Martinez"

  Escenario: Consulta de un alumno inexistente
    Cuando consulta el alumno con padrón "99999"
    Entonces ve el mensaje de error "No se encontró el alumno con padrón 99999"

  Escenario: Baja de un alumno
    Dado que existen los alumnos:
      | padrón | nombre | apellido  |
      |  11111 | Juana  | Lopez     |
      |  22222 | Carlos | Martinez  |
      |  33333 | Sofia  | Rodriguez |
    Cuando elimina al alumno con padrón "22222"
    Entonces el alumno con padrón "22222" no aparece en el listado
    Y el alumno con padrón "11111" aparece en el listado
    Y el alumno con padrón "33333" aparece en el listado

  Escenario: Baja de un alumno inexistente
    Cuando elimina al alumno con padrón "99999"
    Entonces ve el mensaje de error "No se encontró el alumno con padrón 99999"
