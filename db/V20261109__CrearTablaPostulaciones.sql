CREATE TABLE postulaciones (
  id SERIAL PRIMARY KEY,
  id_aspirante INTEGER NOT NULL REFERENCES usuarios(id),
  id_oferta INTEGER NOT NULL REFERENCES ofertas(id),
  CONSTRAINT postulaciones_aspirante_oferta_unicos UNIQUE (id_aspirante, id_oferta)
);
