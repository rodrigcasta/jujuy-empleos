ALTER TABLE usuarios
ALTER COLUMN suscripcion DROP NOT NULL;

ALTER TABLE usuarios
ADD COLUMN tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'Empresario';

ALTER TABLE usuarios
ADD CONSTRAINT usuarios_tipo_y_suscripcion_validos CHECK (
    (tipo_usuario = 'Empresario' AND suscripcion IS NOT NULL)
    OR (tipo_usuario = 'Aspirante' AND suscripcion IS NULL)
);
