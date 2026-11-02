CREATE TABLE ofertas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(50) NOT NULL,
  descripcion VARCHAR(250) NOT NULL,
  ubicacion VARCHAR(70) NOT NULL,
  fecha_publicacion TIMESTAMPTZ NOT NULL,
  id_empresario INTEGER NOT NULL REFERENCES usuarios(id)
);
