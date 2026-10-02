-- ============================================================================
-- TalentoMDD — Datos de prueba + consultas de verificación + pruebas de
-- integridad. PostgreSQL 15+. Ejecutar DESPUÉS de schema.sql:
--   psql -d talentomdd_db -f seed_and_queries.sql
-- Contexto: estudiantes UNAMAD (Sistemas/Administración) + empresas de
-- alcance nacional. Los password_hash son marcadores ilustrativos, NO
-- contraseñas reales.
-- ============================================================================

-- ============================================================================
-- SECCIÓN A — DATOS DE PRUEBA
-- ============================================================================

-- ---- Catálogo de habilidades --------------------------------------------
INSERT INTO habilidades (nombre, categoria) VALUES
('SQL', 'tecnica'),
('Excel', 'herramienta'),
('C#', 'tecnica'),
('Power BI', 'herramienta'),
('Python', 'tecnica'),
('Inglés', 'idioma'),
('Comunicación', 'blanda'),
('Trabajo en equipo', 'blanda'),
('Atención al cliente', 'blanda'),
('Marketing digital', 'tecnica'),
('Contabilidad básica', 'tecnica'),
('Git', 'herramienta'),
('JavaScript', 'tecnica'),
('React', 'tecnica');

-- ---- Usuarios -------------------------------------------------------------
-- Hash de ejemplo (Argon2id ilustrativo, NO usar en producción).
INSERT INTO usuarios (nombre, correo, password_hash, tipo_usuario) VALUES
('Administrador Principal',        'admin@talentomdd.pe',           '$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$ZmFrZTAw', 'administrador'),
('Kevin Huamán Rojas',             'kevin.huaman@unamad.edu.pe',     '$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$ZmFrZTAx', 'estudiante_egresado'),
('Diana Paredes Vela',             'diana.paredes@unamad.edu.pe',    '$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$ZmFrZTAy', 'estudiante_egresado'),
('Renzo Cusipuma Silva',           'renzo.cusipuma@unamad.edu.pe',   '$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$ZmFrZTAz', 'estudiante_egresado'),
('Milagros Ttito Fasabi',          'milagros.ttito@gmail.com',       '$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$ZmFrZTA0', 'estudiante_egresado'),
('Jhon Apaza Mamani',              'jhon.apaza@unamad.edu.pe',       '$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$ZmFrZTA1', 'estudiante_egresado'),
('Contacto Andina Software',       'contacto@andinasoftware.pe',     '$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$ZmFrZTA2', 'empresa'),
('RRHH Corp. Amazónica de Insumos','rrhh@amazonicainsumos.pe',       '$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$ZmFrZTA3', 'empresa'),
('Admin ConsultoraPeru BPO',       'admin@consultoraperu.pe',        '$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$ZmFrZTA4', 'empresa');

-- ---- Estudiantes (usuarios 2-6) --------------------------------------------
INSERT INTO estudiantes (usuario_id, carrera, ciclo, disponibilidad, modalidad_preferida, experiencia, descripcion, portafolio_url, cv_url) VALUES
(2, 'sistemas',       8,    'practicas',        'remoto',    'Prácticas en soporte TI (3 meses)', 'Estudiante de 8vo ciclo interesado en desarrollo backend.', 'https://github.com/kevinhuaman', 'https://cdn.talentomdd.pe/cv/kevin_huaman.pdf'),
(3, 'administracion', 10,   'medio_tiempo',     'hibrido',   'Asistente administrativa en negocio familiar (6 meses)', 'Egresada con interés en gestión comercial y atención al cliente.', NULL, 'https://cdn.talentomdd.pe/cv/diana_paredes.pdf'),
(4, 'sistemas',       6,    'tiempo_completo',  'hibrido',   NULL, 'Estudiante de 6to ciclo, enfocado en análisis de datos.', 'https://github.com/renzocs', 'https://cdn.talentomdd.pe/cv/renzo_cusipuma.pdf'),
(5, 'administracion', NULL, 'tiempo_completo',  'remoto',    'Asistente administrativa junior (1 año)', 'Egresada de Administración con interés en atención al cliente y marketing.', NULL, 'https://cdn.talentomdd.pe/cv/milagros_ttito.pdf'),
(6, 'sistemas',       5,    'medio_tiempo',     'presencial','', 'Estudiante de 5to ciclo, primeros pasos en BI.', NULL, NULL);

-- ---- Empresas (usuarios 7-9), alcance nacional -----------------------------
-- "Corporación Amazónica de Insumos EIRL" queda 'pendiente' a propósito,
-- para probar el flujo de verificación (RF-4.2) y el trigger
-- trg_valida_empresa_verificada.
INSERT INTO empresas (usuario_id, nombre, descripcion, ciudad, convenio_unamad, estado_verificacion) VALUES
(7, 'Andina Software Solutions SAC',    'Consultora de software que contrata talento junior de todo el Perú de forma remota.', 'Lima',             FALSE, 'verificada'),
(8, 'Corporación Amazónica de Insumos EIRL', 'Distribuidora de insumos con sede en Puerto Maldonado.',                      'Puerto Maldonado', FALSE, 'pendiente'),
(9, 'ConsultoraPeru BPO SAC',           'Empresa de servicios administrativos con convenio de prácticas vigente con la UNAMAD.', 'Arequipa',      TRUE,  'verificada');

-- ---- Habilidades por estudiante (nivel 1-5) --------------------------------
INSERT INTO estudiante_habilidades (estudiante_id, habilidad_id, nivel) VALUES
-- Kevin (estudiante 1): SQL, Git, JavaScript, Python, Inglés
(1, 1, 4), (1, 12, 4), (1, 13, 3), (1, 5, 3), (1, 6, 3),
-- Diana (estudiante 2): Excel, Atención al cliente, Comunicación, Contabilidad básica
(2, 2, 5), (2, 9, 5), (2, 7, 5), (2, 11, 4),
-- Renzo (estudiante 3): SQL, JavaScript, Python, Trabajo en equipo
(3, 1, 3), (3, 13, 2), (3, 5, 4), (3, 8, 4),
-- Milagros (estudiante 4): Atención al cliente, Comunicación, Marketing digital, Excel
(4, 9, 5), (4, 7, 4), (4, 10, 3), (4, 2, 3),
-- Jhon (estudiante 5): SQL, Excel, Power BI, Inglés
(5, 1, 2), (5, 2, 3), (5, 4, 3), (5, 6, 2);

-- ---- Certificaciones --------------------------------------------------------
INSERT INTO certificaciones (estudiante_id, habilidad_id, entidad_emisora, fecha_emision, evidencia_url) VALUES
(1, 1, 'Centro de Capacitación Digital MDD', '2026-03-15', 'https://cdn.talentomdd.pe/cert/kevin_sql_basico.pdf'),
(2, 2, 'Instituto Superior Madre de Dios',   '2025-11-20', 'https://cdn.talentomdd.pe/cert/diana_excel_intermedio.pdf'),
(4, 9, 'Cámara de Comercio de Madre de Dios','2025-08-05', 'https://cdn.talentomdd.pe/cert/milagros_atencion_cliente.pdf');

-- ---- Vacantes (solo empresas verificadas pueden publicar, ver trigger) -----
-- v1: réplica del ejemplo ilustrativo del equipo (SQL, Git, JavaScript, React)
SELECT crear_vacante_con_requisitos(
    1, 'Practicante de Desarrollo de Software',
    'Apoyo en el desarrollo de módulos backend/frontend para clientes de Andina Software, 100% remoto.',
    'remoto', 'practicas', NULL, '2026-09-01',
    '[
        {"habilidad_id": 1,  "importancia": "obligatoria"},
        {"habilidad_id": 12, "importancia": "obligatoria"},
        {"habilidad_id": 13, "importancia": "obligatoria"},
        {"habilidad_id": 14, "importancia": "obligatoria"}
    ]'::jsonb
);

-- v2: Analista de BI, empresa 1 (Andina Software)
SELECT crear_vacante_con_requisitos(
    1, 'Analista de Business Intelligence Jr',
    'Elaboración de tableros y reportes para decisiones comerciales de clientes de Andina Software.',
    'hibrido', 'tiempo_completo', 'Lima', '2026-09-05',
    '[
        {"habilidad_id": 1, "importancia": "obligatoria"},
        {"habilidad_id": 4, "importancia": "obligatoria"},
        {"habilidad_id": 2, "importancia": "deseable"}
    ]'::jsonb
);

-- v3: Asistente Administrativo, empresa 3 (ConsultoraPeru BPO, con convenio UNAMAD)
SELECT crear_vacante_con_requisitos(
    3, 'Asistente Administrativo — Prácticas Remotas',
    'Apoyo administrativo y atención a clientes de ConsultoraPeru BPO, modalidad remota.',
    'remoto', 'practicas', NULL, '2026-09-10',
    '[
        {"habilidad_id": 9,  "importancia": "obligatoria"},
        {"habilidad_id": 7,  "importancia": "obligatoria"},
        {"habilidad_id": 2,  "importancia": "deseable"},
        {"habilidad_id": 11, "importancia": "deseable"}
    ]'::jsonb
);

-- ---- Postulaciones (porcentaje_match calculado externamente por el backend
--      con la fórmula ponderada de design.md §6.1; aquí ya vienen calculados) --
-- Kevin    -> v1 (Practicante Desarrollo): 79.67%  (cobertura 75% + nivel 73.33% + disp 100% + modalidad 100%)
INSERT INTO postulaciones (usuario_id, vacante_id, porcentaje_match) VALUES (2, 1, 79.67);
-- Renzo    -> v1: 50.00%  (cobertura 50% + nivel 50% + disp 0% + modalidad 100%)
INSERT INTO postulaciones (usuario_id, vacante_id, porcentaje_match) VALUES (4, 1, 50.00);
-- Jhon     -> v2 (Analista BI): 70.67%  (cobertura 100% + nivel 53.33% + disp 0% + modalidad 0%)
INSERT INTO postulaciones (usuario_id, vacante_id, porcentaje_match) VALUES (6, 2, 70.67);
-- Milagros -> v3 (Asistente Administrativo): 76.00%  (cobertura 83.33% + nivel 80% + disp 0% + modalidad 100%)
INSERT INTO postulaciones (usuario_id, vacante_id, porcentaje_match) VALUES (5, 3, 76.00);
-- Diana    -> v3: 89.00%  (cobertura 100% + nivel 95% + disp 0% + modalidad 100%)
INSERT INTO postulaciones (usuario_id, vacante_id, porcentaje_match) VALUES (3, 3, 89.00);

-- ---- Avanzar estados con cambiar_estado_postulacion() — alimenta
--      automáticamente postulacion_historial vía el trigger --------------
-- Kevin (postulación 1): postulado -> en_revision (revisado por Andina, usuario 7)
SELECT cambiar_estado_postulacion(1, 'en_revision', 7);
-- Jhon (postulación 3): postulado -> en_revision (Andina, usuario 7)
SELECT cambiar_estado_postulacion(3, 'en_revision', 7);
-- Diana (postulación 5, el match más alto): avanza hasta entrevista (ConsultoraPeru, usuario 9)
SELECT cambiar_estado_postulacion(5, 'en_revision', 9);
SELECT cambiar_estado_postulacion(5, 'entrevista', 9);
-- Milagros (postulación 4): en_revision -> rechazado (ConsultoraPeru, usuario 9)
SELECT cambiar_estado_postulacion(4, 'en_revision', 9);
SELECT cambiar_estado_postulacion(4, 'rechazado', 9);
-- Renzo (postulación 2) permanece en 'postulado' (caso de prueba de estado inicial)

-- ============================================================================
-- SECCIÓN B — CONSULTAS DE PRUEBA
-- ============================================================================

-- ---- B.1 Consultas básicas --------------------------------------------------
SELECT id, nombre, correo, tipo_usuario, estado FROM usuarios WHERE estado = 'activo';
SELECT * FROM usuarios WHERE id = 2;
SELECT id, titulo, modalidad, jornada, estado FROM vacantes WHERE titulo ILIKE '%Desarrollo%';
SELECT nombre, ciudad, estado_verificacion FROM empresas WHERE estado_verificacion = 'pendiente';

-- ---- B.2 Consultas relacionadas (JOIN) --------------------------------------
SELECT * FROM vw_estudiante_completo WHERE estudiante_id = 1;
SELECT * FROM vw_candidatos_por_vacante WHERE vacante_id = 1 ORDER BY porcentaje_match DESC;

SELECT p.id AS postulacion_id, u.nombre AS candidato, v.titulo AS vacante,
       e.nombre AS empresa, p.estado, p.porcentaje_match, p.fecha_postulacion
FROM postulaciones p
JOIN usuarios u ON u.id = p.usuario_id
JOIN vacantes v ON v.id = p.vacante_id
JOIN empresas e ON e.id = v.empresa_id
ORDER BY p.porcentaje_match DESC;

SELECT v.titulo, h.nombre AS habilidad, vr.importancia
FROM vacante_requisitos vr
JOIN vacantes v ON v.id = vr.vacante_id
JOIN habilidades h ON h.id = vr.habilidad_id
WHERE v.id = 1;

SELECT ph.estado_anterior, ph.estado_nuevo, u.nombre AS cambiado_por, ph.fecha_cambio
FROM postulacion_historial ph
LEFT JOIN usuarios u ON u.id = ph.usuario_cambio_id
WHERE ph.postulacion_id = 5
ORDER BY ph.fecha_cambio;

-- ---- B.3 Consultas estadísticas ---------------------------------------------
SELECT v.titulo, COUNT(p.id) AS total_postulaciones
FROM vacantes v
LEFT JOIN postulaciones p ON p.vacante_id = v.id
GROUP BY v.id, v.titulo;

SELECT v.titulo, ROUND(AVG(p.porcentaje_match), 2) AS match_promedio,
       MIN(p.porcentaje_match) AS match_minimo, MAX(p.porcentaje_match) AS match_maximo
FROM vacantes v
JOIN postulaciones p ON p.vacante_id = v.id
GROUP BY v.id, v.titulo;

SELECT estado_verificacion, COUNT(*) AS total FROM empresas GROUP BY estado_verificacion;

-- ---- B.4 Consultas de negocio (reportes) ------------------------------------
SELECT * FROM vw_vacantes_activas;

SELECT vc.candidato, v.titulo, vc.porcentaje_match
FROM vw_candidatos_por_vacante vc
JOIN vacantes v ON v.id = vc.vacante_id
WHERE vc.porcentaje_match >= 70
ORDER BY vc.porcentaje_match DESC;

SELECT h.nombre, COUNT(*) AS veces_requerida
FROM vacante_requisitos vr
JOIN vacantes v ON v.id = vr.vacante_id AND v.estado = 'activa'
JOIN habilidades h ON h.id = vr.habilidad_id
GROUP BY h.id, h.nombre
ORDER BY veces_requerida DESC;

-- Empresas nacionales por ciudad (para medir la distribución geográfica de la demanda)
SELECT ciudad, COUNT(*) AS total_empresas FROM empresas GROUP BY ciudad ORDER BY total_empresas DESC;

-- Uso de la función de candidatos por vacante
SELECT * FROM candidatos_por_vacante(1);

-- ============================================================================
-- SECCIÓN C — PRUEBAS DE INTEGRIDAD
-- Cada bloque: qué se prueba -> qué debería suceder -> cómo verificarlo.
-- La mayoría están comentadas a propósito (fallan por diseño); descoméntalas
-- una por una para verificar el mensaje de error esperado.
-- ============================================================================

-- C.1 Correo duplicado
-- Qué se prueba: UNIQUE en usuarios.correo
-- Debería suceder: error "duplicate key value violates unique constraint"
-- INSERT INTO usuarios (nombre, correo, password_hash, tipo_usuario)
-- VALUES ('Duplicado Prueba', 'kevin.huaman@unamad.edu.pe', 'x', 'estudiante_egresado');

-- C.2 Doble postulación a la misma vacante
-- Qué se prueba: UNIQUE (usuario_id, vacante_id) en postulaciones
-- Debería suceder: error de restricción única
-- INSERT INTO postulaciones (usuario_id, vacante_id, porcentaje_match) VALUES (2, 1, 50.00);

-- C.3 Nivel de habilidad fuera de rango
-- Qué se prueba: CHECK (nivel BETWEEN 1 AND 5)
-- Debería suceder: error "new row violates check constraint"
-- INSERT INTO estudiante_habilidades (estudiante_id, habilidad_id, nivel) VALUES (1, 5, 9);

-- C.4 Porcentaje de match fuera de rango
-- Qué se prueba: CHECK (porcentaje_match BETWEEN 0 AND 100)
-- Debería suceder: error de check constraint
-- INSERT INTO postulaciones (usuario_id, vacante_id, porcentaje_match) VALUES (3, 1, 150.00);

-- C.5 Empresa no verificada intenta publicar una vacante
-- Qué se prueba: trigger trg_valida_empresa_verificada
-- Debería suceder: 'Solo empresas verificadas pueden publicar vacantes.'
-- SELECT crear_vacante_con_requisitos(2, 'Vendedor de mostrador', 'Atención en tienda',
--      'presencial', 'tiempo_completo', 'Puerto Maldonado', CURRENT_DATE,
--      '[{"habilidad_id": 9, "importancia": "obligatoria"}]'::jsonb);

-- C.6 Postulación a una vacante o usuario inexistente
-- Qué se prueba: integridad referencial (FK)
-- Debería suceder: error "violates foreign key constraint"
-- INSERT INTO postulaciones (usuario_id, vacante_id, porcentaje_match) VALUES (999, 1, 50.00);

-- C.7 Transición de estado inválida (saltar de 'postulado' a 'contratado')
-- Qué se prueba: validación de la máquina de estados en cambiar_estado_postulacion()
-- Debería suceder: 'Transición de postulado a contratado no permitida.'
-- SELECT cambiar_estado_postulacion(2, 'contratado', 7);

-- C.8 Intentar eliminar una habilidad en uso
-- Qué se prueba: FK con ON DELETE RESTRICT desde estudiante_habilidades/vacante_requisitos
-- Debería suceder: error "violates foreign key constraint"
-- DELETE FROM habilidades WHERE id = 1;  -- SQL, usada en varias tablas

-- C.9 Eliminar un usuario con historial de postulaciones
-- Qué se prueba: FK postulaciones.usuario_id con ON DELETE RESTRICT (preserva historial)
-- Debería suceder: error de FK
-- DELETE FROM usuarios WHERE id = 2;  -- Kevin, tiene una postulación

-- C.10 Vacante sin ningún requisito
-- Qué se prueba: validación explícita dentro de crear_vacante_con_requisitos()
-- Debería suceder: 'Una vacante debe tener al menos una habilidad requerida.'
-- SELECT crear_vacante_con_requisitos(1, 'Vacante sin requisitos', 'Prueba',
--      'remoto', 'practicas', NULL, CURRENT_DATE, '[]'::jsonb);

-- C.11 Verificación del historial automático
-- Qué se prueba: que trg_postulacion_historial haya registrado los cambios de Diana (postulación 5)
-- Debería suceder: al menos 2 filas
SELECT COUNT(*) AS eventos_historial FROM postulacion_historial WHERE postulacion_id = 5;
