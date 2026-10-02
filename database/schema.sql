-- ============================================================================
-- TalentoMDD — Esquema de base de datos
-- Motor: PostgreSQL 15+ (recomendado 16). Pedido explícito del equipo.
-- Ejecutar sobre una base de datos vacía, con psql o cualquier cliente SQL:
--   createdb talentomdd_db
--   psql -d talentomdd_db -f schema.sql
-- Orden respeta dependencias FK.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TIPOS ENUM — evitan estados inconsistentes ('Activo' / 'activo' / 'ACTIVO')
-- ----------------------------------------------------------------------------
CREATE TYPE tipo_usuario_enum        AS ENUM ('estudiante_egresado','empresa','administrador');
CREATE TYPE estado_usuario_enum      AS ENUM ('activo','inactivo');
CREATE TYPE estado_verificacion_enum AS ENUM ('pendiente','verificada','rechazada');
CREATE TYPE categoria_habilidad_enum AS ENUM ('tecnica','blanda','idioma','herramienta');
CREATE TYPE carrera_enum             AS ENUM ('sistemas','administracion');
CREATE TYPE jornada_enum             AS ENUM ('tiempo_completo','medio_tiempo','practicas');
CREATE TYPE modalidad_enum           AS ENUM ('presencial','hibrido','remoto');
CREATE TYPE estado_vacante_enum      AS ENUM ('activa','cerrada','oculta');
CREATE TYPE importancia_enum         AS ENUM ('obligatoria','deseable');
CREATE TYPE estado_postulacion_enum  AS ENUM ('postulado','en_revision','entrevista','oferta','contratado','rechazado','retirado');

-- ----------------------------------------------------------------------------
-- Función reutilizable para fecha_actualizacion (Postgres no tiene
-- "ON UPDATE CURRENT_TIMESTAMP" como columna, se hace con un trigger)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. USUARIOS — cuenta base de cualquier actor del sistema
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id                   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre               VARCHAR(120)  NOT NULL,
    correo               VARCHAR(150)  NOT NULL UNIQUE,
    password_hash        VARCHAR(255)  NOT NULL,          -- hash Argon2id, nunca texto plano
    foto_url             VARCHAR(255)  NULL,
    tipo_usuario         tipo_usuario_enum NOT NULL,
    estado               estado_usuario_enum NOT NULL DEFAULT 'activo',
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT now(),
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);

CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. ESTUDIANTES — 1:1 con usuarios de tipo estudiante_egresado (antes PERFILES)
-- ----------------------------------------------------------------------------
CREATE TABLE estudiantes (
    id                   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id           INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    carrera              carrera_enum NULL,               -- segmentación académica de Fase 1
    ciclo                SMALLINT NULL CHECK (ciclo BETWEEN 1 AND 14),
    disponibilidad       jornada_enum NULL,               -- comparable con vacantes.jornada (RF matching)
    modalidad_preferida  modalidad_enum NULL,              -- comparable con vacantes.modalidad (RF matching)
    experiencia          TEXT NULL,
    descripcion          TEXT NULL,
    portafolio_url       VARCHAR(255) NULL,               -- GitHub / portafolio
    cv_url               VARCHAR(255) NULL,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT now(),
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_estudiantes_updated_at
    BEFORE UPDATE ON estudiantes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. EMPRESAS — 1:1 con usuarios de tipo empresa; alcance NACIONAL
-- ----------------------------------------------------------------------------
CREATE TABLE empresas (
    id                   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id           INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    nombre               VARCHAR(150) NOT NULL,
    descripcion          TEXT NULL,
    ciudad               VARCHAR(100) NULL,               -- relevante por alcance nacional
    convenio_unamad      BOOLEAN NOT NULL DEFAULT FALSE,  -- publica gratis en Fase de tracción
    estado_verificacion  estado_verificacion_enum NOT NULL DEFAULT 'pendiente',
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT now(),
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_empresas_estado ON empresas(estado_verificacion);

CREATE TRIGGER trg_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. HABILIDADES — catálogo maestro
-- ----------------------------------------------------------------------------
CREATE TABLE habilidades (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL UNIQUE,
    categoria  categoria_habilidad_enum NOT NULL,
    activo     BOOLEAN NOT NULL DEFAULT TRUE
);

-- ----------------------------------------------------------------------------
-- 5. ESTUDIANTE_HABILIDADES — N:M estudiantes <-> habilidades, con nivel
--    (antes PERFIL_HABILIDADES)
-- ----------------------------------------------------------------------------
CREATE TABLE estudiante_habilidades (
    estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    habilidad_id  INTEGER NOT NULL REFERENCES habilidades(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    nivel         SMALLINT NOT NULL CHECK (nivel BETWEEN 1 AND 5),
    PRIMARY KEY (estudiante_id, habilidad_id)
);

-- ----------------------------------------------------------------------------
-- 6. VACANTES (antes OFERTAS)
-- ----------------------------------------------------------------------------
CREATE TABLE vacantes (
    id                   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empresa_id           INTEGER NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    titulo               VARCHAR(150) NOT NULL,
    descripcion          TEXT NOT NULL,
    modalidad            modalidad_enum NOT NULL,
    jornada              jornada_enum NOT NULL,
    ciudad               VARCHAR(100) NULL,               -- NULL o 'Remoto' si modalidad = remoto
    fecha_publicacion    DATE NOT NULL,
    estado               estado_vacante_enum NOT NULL DEFAULT 'activa',
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT now(),
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_vacantes_estado_fecha ON vacantes(estado, fecha_publicacion);
CREATE INDEX idx_vacantes_empresa ON vacantes(empresa_id);
CREATE INDEX idx_vacantes_modalidad ON vacantes(modalidad);

CREATE TRIGGER trg_vacantes_updated_at
    BEFORE UPDATE ON vacantes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. VACANTE_REQUISITOS — N:M vacantes <-> habilidades (antes OFERTA_HABILIDADES)
-- ----------------------------------------------------------------------------
CREATE TABLE vacante_requisitos (
    vacante_id    INTEGER NOT NULL REFERENCES vacantes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    habilidad_id  INTEGER NOT NULL REFERENCES habilidades(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    importancia   importancia_enum NOT NULL,
    PRIMARY KEY (vacante_id, habilidad_id)
);

-- ----------------------------------------------------------------------------
-- 8. CERTIFICACIONES — microcertificaciones (registro append-only)
-- ----------------------------------------------------------------------------
CREATE TABLE certificaciones (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    estudiante_id    INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    habilidad_id     INTEGER NOT NULL REFERENCES habilidades(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    entidad_emisora  VARCHAR(150) NOT NULL,
    fecha_emision    DATE NOT NULL,
    evidencia_url    VARCHAR(255) NULL,
    fecha_creacion   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_cert_estudiante ON certificaciones(estudiante_id);

-- ----------------------------------------------------------------------------
-- 9. POSTULACIONES
-- ----------------------------------------------------------------------------
CREATE TABLE postulaciones (
    id                    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id            INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    vacante_id            INTEGER NOT NULL REFERENCES vacantes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_postulacion     TIMESTAMP NOT NULL DEFAULT now(),
    estado                estado_postulacion_enum NOT NULL DEFAULT 'postulado',
    porcentaje_match      NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (porcentaje_match BETWEEN 0 AND 100),
    fecha_actualizacion   TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (usuario_id, vacante_id)
);

CREATE INDEX idx_post_vacante_match ON postulaciones(vacante_id, porcentaje_match DESC);
CREATE INDEX idx_post_usuario ON postulaciones(usuario_id);

CREATE TRIGGER trg_postulaciones_updated_at
    BEFORE UPDATE ON postulaciones
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 10. POSTULACION_HISTORIAL — auditoría de cambios de estado (append-only)
-- ----------------------------------------------------------------------------
CREATE TABLE postulacion_historial (
    id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    postulacion_id      INTEGER NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE ON UPDATE CASCADE,
    estado_anterior     estado_postulacion_enum NULL,
    estado_nuevo        estado_postulacion_enum NOT NULL,
    usuario_cambio_id   INTEGER NULL REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
    fecha_cambio        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_hist_postulacion ON postulacion_historial(postulacion_id);

-- ============================================================================
-- VISTAS
-- ============================================================================

CREATE VIEW vw_vacantes_activas AS
SELECT v.id, v.titulo, v.descripcion, v.modalidad, v.jornada, v.ciudad, v.fecha_publicacion,
       e.id AS empresa_id, e.nombre AS empresa_nombre
FROM vacantes v
JOIN empresas e ON e.id = v.empresa_id
WHERE v.estado = 'activa' AND e.estado_verificacion = 'verificada';

CREATE VIEW vw_candidatos_por_vacante AS
SELECT p.vacante_id, p.id AS postulacion_id, u.id AS usuario_id, u.nombre AS candidato,
       est.carrera, est.ciclo, p.porcentaje_match, p.estado, p.fecha_postulacion
FROM postulaciones p
JOIN usuarios u ON u.id = p.usuario_id
JOIN estudiantes est ON est.usuario_id = u.id;

CREATE VIEW vw_estudiante_completo AS
SELECT est.id AS estudiante_id, u.nombre, u.correo, est.carrera, est.ciclo,
       est.disponibilidad, est.modalidad_preferida, est.descripcion, est.portafolio_url,
       STRING_AGG(h.nombre || ' (' || eh.nivel || '/5)', ', ' ORDER BY h.nombre) AS habilidades
FROM estudiantes est
JOIN usuarios u ON u.id = est.usuario_id
LEFT JOIN estudiante_habilidades eh ON eh.estudiante_id = est.id
LEFT JOIN habilidades h ON h.id = eh.habilidad_id
GROUP BY est.id, u.nombre, u.correo, est.carrera, est.ciclo, est.disponibilidad,
         est.modalidad_preferida, est.descripcion, est.portafolio_url;

-- ============================================================================
-- TRIGGERS DE REGLAS DE NEGOCIO
-- ============================================================================

-- Solo empresas verificadas pueden publicar vacantes
CREATE OR REPLACE FUNCTION trg_fn_valida_empresa_verificada() RETURNS TRIGGER AS $$
DECLARE
    v_estado estado_verificacion_enum;
BEGIN
    SELECT estado_verificacion INTO v_estado FROM empresas WHERE id = NEW.empresa_id;
    IF v_estado IS DISTINCT FROM 'verificada' THEN
        RAISE EXCEPTION 'Solo empresas verificadas pueden publicar vacantes.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_valida_empresa_verificada
    BEFORE INSERT ON vacantes
    FOR EACH ROW EXECUTE FUNCTION trg_fn_valida_empresa_verificada();

-- Registra automáticamente cada cambio de estado de una postulación.
-- 'talentomdd.actor_id' es un parámetro de sesión que cambiar_estado_postulacion()
-- fija antes del UPDATE, para dejar constancia de quién hizo el cambio.
CREATE OR REPLACE FUNCTION trg_fn_postulacion_historial() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO postulacion_historial (postulacion_id, estado_anterior, estado_nuevo, usuario_cambio_id)
        VALUES (NEW.id, OLD.estado, NEW.estado,
                NULLIF(current_setting('talentomdd.actor_id', true), '')::INTEGER);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_postulacion_historial
    AFTER UPDATE ON postulaciones
    FOR EACH ROW EXECUTE FUNCTION trg_fn_postulacion_historial();

-- ============================================================================
-- FUNCIONES (equivalentes a procedimientos almacenados)
-- ============================================================================

-- Cambia el estado de una postulación validando la máquina de estados
-- (design.md §4.3). Si la transición no es válida, RAISE EXCEPTION revierte
-- automáticamente todo lo que la función haya hecho (comportamiento estándar
-- de Postgres: una excepción no capturada aborta la transacción actual).
CREATE OR REPLACE FUNCTION cambiar_estado_postulacion(
    p_postulacion_id    INTEGER,
    p_estado_nuevo      estado_postulacion_enum,
    p_usuario_cambio_id INTEGER
) RETURNS VOID AS $$
DECLARE
    v_estado_actual estado_postulacion_enum;
    v_valida BOOLEAN := FALSE;
BEGIN
    SELECT estado INTO v_estado_actual
    FROM postulaciones WHERE id = p_postulacion_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La postulación % no existe.', p_postulacion_id;
    END IF;

    IF (v_estado_actual = 'postulado'   AND p_estado_nuevo IN ('en_revision','rechazado','retirado')) OR
       (v_estado_actual = 'en_revision' AND p_estado_nuevo IN ('entrevista','rechazado','retirado')) OR
       (v_estado_actual = 'entrevista'  AND p_estado_nuevo IN ('oferta','rechazado','retirado')) OR
       (v_estado_actual = 'oferta'      AND p_estado_nuevo IN ('contratado','rechazado','retirado')) THEN
        v_valida := TRUE;
    END IF;

    IF NOT v_valida THEN
        RAISE EXCEPTION 'Transición de % a % no permitida.', v_estado_actual, p_estado_nuevo;
    END IF;

    PERFORM set_config('talentomdd.actor_id', p_usuario_cambio_id::TEXT, true);
    UPDATE postulaciones SET estado = p_estado_nuevo WHERE id = p_postulacion_id;
END;
$$ LANGUAGE plpgsql;

-- Crea una vacante junto con sus requisitos (habilidades) en una sola
-- operación atómica. Si no hay al menos un requisito, revierte todo
-- (equivalente a "una venta debe tener al menos un detalle").
-- p_requisitos: JSONB array, ej. '[{"habilidad_id":1,"importancia":"obligatoria"}]'
CREATE OR REPLACE FUNCTION crear_vacante_con_requisitos(
    p_empresa_id        INTEGER,
    p_titulo            VARCHAR,
    p_descripcion       TEXT,
    p_modalidad         modalidad_enum,
    p_jornada           jornada_enum,
    p_ciudad            VARCHAR,
    p_fecha_publicacion DATE,
    p_requisitos        JSONB
) RETURNS INTEGER AS $$
DECLARE
    v_vacante_id INTEGER;
BEGIN
    IF jsonb_array_length(p_requisitos) = 0 THEN
        RAISE EXCEPTION 'Una vacante debe tener al menos una habilidad requerida.';
    END IF;

    INSERT INTO vacantes (empresa_id, titulo, descripcion, modalidad, jornada, ciudad, fecha_publicacion)
    VALUES (p_empresa_id, p_titulo, p_descripcion, p_modalidad, p_jornada, p_ciudad, p_fecha_publicacion)
    RETURNING id INTO v_vacante_id;

    INSERT INTO vacante_requisitos (vacante_id, habilidad_id, importancia)
    SELECT v_vacante_id,
           (elem->>'habilidad_id')::INTEGER,
           (elem->>'importancia')::importancia_enum
    FROM jsonb_array_elements(p_requisitos) AS elem;

    RETURN v_vacante_id;
END;
$$ LANGUAGE plpgsql;

-- Candidatos de una vacante ordenados por porcentaje de Match
CREATE OR REPLACE FUNCTION candidatos_por_vacante(p_vacante_id INTEGER)
RETURNS TABLE (
    vacante_id INTEGER, postulacion_id INTEGER, usuario_id INTEGER, candidato VARCHAR,
    carrera carrera_enum, ciclo SMALLINT, porcentaje_match NUMERIC,
    estado estado_postulacion_enum, fecha_postulacion TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT vc.vacante_id, vc.postulacion_id, vc.usuario_id, vc.candidato,
           vc.carrera, vc.ciclo, vc.porcentaje_match, vc.estado, vc.fecha_postulacion
    FROM vw_candidatos_por_vacante vc
    WHERE vc.vacante_id = p_vacante_id
    ORDER BY vc.porcentaje_match DESC;
END;
$$ LANGUAGE plpgsql;
