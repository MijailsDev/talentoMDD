# Requirements — TalentoMDD

## 1. Introducción

TalentoMDD es una plataforma web (SaaS/HR Tech) que conecta talento joven con empresas mediante un algoritmo de matching basado en habilidades y microcertificaciones. Este documento define el alcance funcional del **MVP (Fase 1)**, construido a partir de tres fuentes, en orden de autoridad:

1. Los **prompts del equipo** ("Prompt Maestro de Contexto" y "Contexto General + Distribución del Equipo") — la fuente más reciente y detallada, escrita por el equipo del proyecto.
2. El **documento maestro** original (`TalentoMDD_Documento_Maestro.docx`).
3. **Investigación externa** de sistemas similares (ATS, portales de empleo, estándares de habilidades).

### 1.1. Convenciones de estado

| Etiqueta | Significado |
|---|---|
| **Equipo** | Viene directamente de los prompts del equipo (fuente más reciente y autoritativa); si contradice al documento maestro, **prevalece el Equipo**. |
| **Definido** | Información planteada formalmente en el documento maestro original. |
| **Propuesta** | Idea presente en las fuentes pero que aún debe validarse. |
| **Pendiente** | Decisión que todavía no se ha tomado y no debe inventarse por adelantado. |
| **Recomendación (investigación)** | Contenido nuevo, basado en el análisis de sistemas similares, para hacer el MVP más fiable. Debe validarse con el equipo. |

### 1.2. Corrección de alcance importante — empresas de alcance NACIONAL

La versión anterior de este documento asumía empresas exclusivamente de Madre de Dios. **El equipo corrigió esto explícitamente**: si la demanda laboral se limita a Madre de Dios, hay sobreoferta de estudiantes y escasez de vacantes reales, lo que frustra a los usuarios. La solución adoptada:

- **Oferta de talento (candidatos):** exclusiva para estudiantes y egresados de la **UNAMAD**, y solo de las escuelas profesionales de **Ingeniería de Sistemas** y **Administración** en esta primera fase (para asegurar perfiles técnicos demandados y una base de datos de calidad). **[Equipo]**
- **Demanda laboral (empresas):** alcance **NACIONAL**. Empresas de cualquier parte del Perú (Lima, Arequipa, etc.) pueden registrarse y publicar vacantes presenciales, híbridas o remotas, incluidas empresas con convenios vigentes con la UNAMAD. **[Equipo]**

Esto reemplaza la sección "Análisis competitivo" y el supuesto de "empresas locales" de la versión anterior de este documento — la diferenciación de TalentoMDD ya no es solo territorial del lado de la demanda, sino que sigue siendo territorial del lado de la oferta de talento (UNAMAD) combinada con alcance nacional del lado empresarial.

### 1.3. Principio general del MVP

> No convertir TalentoMDD en una bolsa de trabajo genérica, ni en una red social, ni en un sistema innecesariamente grande. El concepto central es: **TALENTO UNIVERSITARIO + HABILIDADES + VACANTES + MATCHING + POSTULACIÓN.** **[Equipo]**

## 2. Nomenclatura de entidades (actualizada)

Para alinear el vocabulario de todos los documentos con el que usa el equipo en sus propios prompts (y con el código que generarán), se renombran las siguientes entidades respecto a la versión anterior de este spec:

| Nombre anterior | Nombre actual | Motivo |
|---|---|---|
| PERFILES | **ESTUDIANTES** | El equipo llama a esta entidad `estudiantes` en su propio diseño de referencia; además, en Fase 1 el perfil siempre pertenece a un estudiante/egresado UNAMAD, así que el nombre específico es más claro. |
| OFERTAS | **VACANTES** | Término usado consistentemente en los prompts del equipo y en los endpoints de referencia de JuanG. |
| PERFIL_HABILIDADES | **ESTUDIANTE_HABILIDADES** | Coherencia con el renombre anterior. |
| OFERTA_HABILIDADES | **VACANTE_REQUISITOS** | Coherencia con el renombre anterior; el equipo usa "requisitos" como término de producto. |

Ver el modelo de datos actualizado en [design.md §4](design.md) y el script en [database/schema.sql](database/schema.sql).

## 3. Visión del producto

- **Misión:** conectar a estudiantes y egresados de la UNAMAD con empresas de todo el Perú mediante un sistema de matching basado en habilidades y microcertificaciones, simplificando el reclutamiento juvenil. **[Equipo, ajustado de Definido]**
- **Propuesta de valor (estudiante):** perfil técnico estructurado, habilidades, microcertificaciones, portafolio, y el porcentaje de compatibilidad con cada vacante **antes de postular**. **[Equipo]**
- **Propuesta de valor (empresa):** vacantes parametrizadas (no texto libre) y candidatos ordenados automáticamente por compatibilidad, ahorrando el tiempo de filtrar CVs sin criterio objetivo. **[Equipo]**
- **El problema del CV tradicional:** las empresas pierden tiempo filtrando CVs sin experiencia; TalentoMDD filtra por habilidades técnicas reales, declaradas o certificadas. **[Equipo]**

## 4. Actores y roles del sistema

| Rol | Descripción |
|---|---|
| **Estudiante / Egresado** | Estudiantes y egresados de la UNAMAD, inicialmente de Ingeniería de Sistemas y Administración. |
| **Empresa** | Empresas, startups, corporaciones e instituciones de cualquier región del Perú. |
| **Administrador** | Gestiona usuarios, empresas y publicaciones/vacantes de la plataforma. |

**[Equipo]**

## 5. Requisitos funcionales

Formato: historia de usuario + criterios de aceptación en notación EARS (WHEN/THEN).

### RF-1 · Módulo Estudiante

**Historia:** Como estudiante o egresado de la UNAMAD, quiero registrarme, construir un perfil técnico estructurado y ver mi compatibilidad con las vacantes, para postular con información de mejor calidad que un CV tradicional.

| ID | Criterio de aceptación |
|---|---|
| RF-1.1 | CUANDO un visitante completa el registro con datos válidos, ENTONCES el sistema DEBERÁ crear una cuenta de tipo `estudiante_egresado`. |
| RF-1.2 | CUANDO un usuario introduce credenciales correctas, ENTONCES el sistema DEBERÁ iniciar sesión y otorgar acceso a su cuenta. |
| RF-1.3 | CUANDO un usuario introduce credenciales incorrectas 5 veces en 15 minutos, ENTONCES el sistema DEBERÁ bloquear temporalmente los intentos de ese usuario/IP. **[Recomendación (investigación)]** |
| RF-1.4 | CUANDO un estudiante completa su perfil, ENTONCES el sistema DEBERÁ pedir: carrera (`sistemas`/`administracion` en Fase 1), **ciclo actual**, **disponibilidad de horas**, habilidades con nivel, y opcionalmente un enlace de **portafolio/GitHub**. **[Equipo — amplía RF-1.4 anterior, que solo pedía carrera/experiencia/descripción.]** |
| RF-1.5 | CUANDO un usuario agrega una habilidad a su perfil, ENTONCES el sistema DEBERÁ pedirle seleccionarla de un catálogo estructurado (no texto libre) e indicar un nivel. **[Recomendación (investigación)]** |
| RF-1.6 | CUANDO un usuario sube un archivo de CV, ENTONCES el sistema DEBERÁ validar el tipo (PDF) y tamaño máximo antes de asociarlo a su perfil. |
| RF-1.7 | CUANDO un estudiante visualiza una vacante, ENTONCES el sistema DEBERÁ mostrarle su **porcentaje de Match** antes de que decida postular. **[Equipo — requisito explícito: "mostrar al estudiante su porcentaje de compatibilidad antes de postular".]** |
| RF-1.8 | CUANDO un estudiante consulta "Mis postulaciones", ENTONCES el sistema DEBERÁ listar sus postulaciones con el estado actual de cada una. **[Equipo]** |

### RF-2 · Módulo Empresa

**Historia:** Como empresa de cualquier parte del Perú, quiero crear un perfil empresarial, publicar vacantes con requisitos estructurados (no texto libre) y ver candidatos ordenados por compatibilidad, para reducir el tiempo de filtrado de postulantes.

| ID | Criterio de aceptación |
|---|---|
| RF-2.1 | CUANDO una empresa se registra, ENTONCES el sistema DEBERÁ crear un perfil empresarial vinculado a un usuario administrador de esa empresa, incluyendo su ciudad/región (alcance nacional). **[Equipo]** |
| RF-2.2 | CUANDO una empresa publica una vacante, ENTONCES el sistema DEBERÁ exigir seleccionar etiquetas estructuradas: habilidades requeridas (del catálogo, marcadas obligatoria/deseable), **modalidad** (presencial/híbrido/remoto) y **jornada** (tiempo completo/medio tiempo/prácticas) — nunca texto libre de requisitos. **[Equipo — "La empresa no sube un texto libre, sino que selecciona etiquetas".]** |
| RF-2.3 | CUANDO una empresa consulta una de sus vacantes, ENTONCES el sistema DEBERÁ mostrarle la lista de candidatos que postularon, ordenada por porcentaje de compatibilidad (Match). **[Equipo]** |
| RF-2.4 | CUANDO una empresa tiene un convenio vigente con la UNAMAD, ENTONCES el sistema DEBERÁ permitirle publicar vacantes sin costo durante la fase de tracción. **[Equipo — ver §8 Modelo de negocio.]** |

### RF-3 · Módulo Vacantes y postulaciones

**Historia:** Como estudiante quiero buscar vacantes y postular a las que me interesan, y como empresa quiero dar seguimiento a cada postulación, para gestionar el proceso de selección de forma ordenada.

| ID | Criterio de aceptación |
|---|---|
| RF-3.1 | CUANDO una empresa crea una vacante con título, descripción, modalidad, jornada y habilidades, ENTONCES el sistema DEBERÁ publicarla con estado `activa` y fecha de publicación. |
| RF-3.2 | CUANDO un usuario busca vacantes por palabra clave, carrera, habilidad o modalidad, ENTONCES el sistema DEBERÁ devolver únicamente las vacantes en estado `activa` que coincidan. |
| RF-3.3 | CUANDO un estudiante postula a una vacante, ENTONCES el sistema DEBERÁ crear la postulación con estado inicial `postulado` y no permitir una segunda postulación a la misma vacante. |
| RF-3.4 | CUANDO una empresa cambia el estado de una postulación, ENTONCES el sistema DEBERÁ restringir la transición a los estados válidos de la máquina de estados de [design.md §5](design.md). **[Recomendación (investigación)]** |
| RF-3.5 | CUANDO cambia el estado de una postulación, ENTONCES el sistema DEBERÁ registrar el cambio en un historial auditable. **[Recomendación (investigación)]** |
| RF-3.6 | CUANDO un usuario o una empresa consulta postulaciones, ENTONCES el sistema DEBERÁ mostrar únicamente las relacionadas con su cuenta. |

### RF-4 · Módulo Administración

| ID | Criterio de aceptación |
|---|---|
| RF-4.1 | CUANDO un administrador consulta el panel de usuarios, ENTONCES el sistema DEBERÁ permitirle ver, editar o desactivar cuentas de estudiantes/egresados y empresas. **[Equipo]** |
| RF-4.2 | CUANDO una empresa se registra, ENTONCES el sistema DEBERÁ marcarla como `pendiente de verificación` hasta que un administrador la valide. **[Equipo — "Registro de empresa y validación de identidad".]** |
| RF-4.3 | CUANDO un administrador revisa las vacantes publicadas, ENTONCES el sistema DEBERÁ permitirle ocultar o eliminar publicaciones que incumplan las políticas de la plataforma. |
| RF-4.4 | CUANDO un administrador consulta reportes básicos, ENTONCES el sistema DEBERÁ mostrarle estadísticas generales (usuarios, empresas, vacantes, postulaciones). **[Equipo — "Reportes/estadísticas básicas".]** |
| RF-4.5 | CUANDO un administrador consulta el catálogo de habilidades, ENTONCES el sistema DEBERÁ permitirle agregar o desactivar habilidades. **[Recomendación (investigación)]** |

### RF-5 · Matching (Motor de Compatibilidad)

**Historia:** Como estudiante quiero conocer mi Match antes de postular, y como empresa quiero ver candidatos ordenados por Match — esta es la diferencia principal frente a una bolsa de trabajo tradicional. **[Equipo]**

| ID | Criterio de aceptación |
|---|---|
| RF-5.1 | CUANDO un estudiante visualiza una vacante o postula a ella, ENTONCES el sistema DEBERÁ calcular un porcentaje de compatibilidad según la fórmula ponderada de [design.md §6](design.md) (habilidades, nivel, disponibilidad y modalidad). **[Equipo — fórmula inicial propuesta por Antony, ver design.md.]** |
| RF-5.2 | CUANDO una empresa lista candidatos de una vacante, ENTONCES el sistema DEBERÁ mostrar el porcentaje de cada uno y permitir ordenarlos por ese valor. |
| RF-5.3 | CUANDO una habilidad requerida está marcada como obligatoria y el candidato no la posee, ENTONCES el sistema DEBERÁ señalarlo explícitamente, no solo bajar el porcentaje. |
| RF-5.4 | El cálculo del Match DEBE ser explicable y medible — **no es obligatorio usar IA compleja en el MVP**; un algoritmo de coincidencia claro es suficiente. **[Equipo — "Para el MVP no es obligatorio utilizar una IA compleja para el matching".]** |

## 6. Habilidades y microcertificaciones

- Habilidades del catálogo con nivel (escala 1–5, no ranking comparativo entre usuarios). **[Definido, documento maestro]**
- Microcertificaciones como evidencia complementaria (cursos cortos: Excel básico, SQL básico, atención al cliente, marketing digital). **[Definido]**
- Portafolio/enlace a GitHub como evidencia adicional de habilidades técnicas. **[Equipo]**
- Estructura de certificación inspirada en **Open Badges 3.0** (habilidad, entidad emisora, fecha, evidencia), sin implementar el estándar completo en el MVP. **[Recomendación (investigación)]**

## 7. Fuera de alcance del MVP (Fase 1)

- Mensajería, chat, notificaciones, conexiones tipo red social, feed, likes/comentarios.
- Búsqueda avanzada con filtros combinados complejos.
- Verificación de empresas mediante documentación legal (solo aprobación manual básica, RF-4.2).
- IA compleja para matching (RF-5.4) — el algoritmo ponderado explicable es suficiente para el MVP.
- Otras universidades/institutos fuera de la UNAMAD, y otras carreras fuera de Sistemas/Administración — reservado para una Fase 2 (ver §9). **[Equipo]**

## 8. Modelo de negocio (iterativo)

**Para estudiantes: 100% gratuito**, siempre. **[Equipo]**

**Para empresas — Fase de tracción (MVP):**
- Publicación gratuita para empresas con convenio vigente con la UNAMAD (RF-2.4).
- Primeras vacantes sin costo para el resto de empresas, con el objetivo de generar volumen de ofertas y atraer estudiantes.

**[Equipo — reemplaza el modelo de precios fijos (S/20 Básica, S/40 Destacada, etc.) de la versión anterior, que queda como referencia de una fase posterior, no del MVP.]**

**Vías de monetización futuras (post-MVP, no implementar aún):**
- Publicación destacada o urgente (pago).
- Acceso premium a la base de datos completa de estudiantes ("headhunting" directo).
- Suscripciones mensuales (SaaS) para empresas recurrentes.

**[Equipo]**

## 9. Visión de escalabilidad (fuera del MVP, mantener en mente en el diseño)

El sistema nace con arquitectura preparada para escalar, aunque el lanzamiento (Fase 1) esté hiper-segmentado:

```
UNAMAD → otras universidades → institutos → otras instituciones
```

Esto implica: usar Clean Architecture/capas para poder incorporar nuevas instituciones sin reescribir el sistema base, y un modelo de datos con llaves foráneas preparadas para expandir entidades geográficas y académicas (p. ej. no hardcodear "UNAMAD" ni las dos carreras del MVP en la lógica, sino tratarlas como datos). **[Equipo]** Ver implicancias técnicas en [design.md §2](design.md) y [tech.md](tech.md).

## 10. Requisitos no funcionales

| Categoría | Recomendación | Justificación |
|---|---|---|
| Seguridad de contraseñas | Hash con Argon2id (o bcrypt costo ≥ 12) — nunca texto plano. | Estándar OWASP; explícitamente pedido por el equipo ("No guardar contraseñas en texto plano", rol de Mijail). **[Equipo + Recomendación]** |
| Autenticación | JWT de acceso corto (≤15 min) + refresh, en cookies `httpOnly`. | El equipo deja "JWT/sesiones según lo que decida el equipo" — se recomienda JWT por ser stateless y estándar para APIs REST. **[Equipo (abierto) + Recomendación (elección)]** |
| Autorización | Control de acceso por roles en cada endpoint. | Pedido explícitamente por el equipo (rol de Mijail). **[Equipo]** |
| Fuerza bruta | Rate limiting en `/auth/login` y `/auth/register`. | **[Recomendación]** |
| Transporte | HTTPS obligatorio. | **[Recomendación]** |
| Validación de entradas | Validar y sanear en backend; consultas parametrizadas, protección contra SQL Injection. | Pedido explícitamente por el equipo (rol de Mijail). **[Equipo]** |
| CORS | Configurado correctamente, orígenes específicos. | Pedido explícitamente por el equipo. **[Equipo]** |
| Secretos | Variables de entorno, manejo seguro de secretos, nunca hardcodeados. | Pedido explícitamente por el equipo. **[Equipo]** |
| Diseño | **Mobile-First**, responsive — el 90% de los estudiantes accede desde el celular. | **[Equipo]** |
| Arquitectura | Frontend separado del backend, comunicación por API REST. | **[Equipo]** |

## 11. Equipo y distribución de responsabilidades

El proyecto se desarrolla con 5 integrantes trabajando **en paralelo** (no en cadena secuencial), cada uno responsable de una parte del sistema:

| Persona | Rol | Responsabilidad principal | Sección de este spec que le corresponde |
|---|---|---|---|
| JuanG | Coordinador + Backend + Integración | Arquitectura backend, API REST, autenticación, conecta todos los módulos | [design.md §5](design.md), [tech.md](tech.md) |
| Antony | Motor de Matching + Lógica de negocio | Algoritmo de Match, ponderación, casos de prueba | RF-5, [design.md §6](design.md) |
| Alexandro | Frontend + UX/UI | Todas las pantallas, mobile-first, componentes reutilizables | [design.md §7](design.md) |
| Mijail | Base de datos + Ciberseguridad | Modelo de datos, script SQL, seguridad, hashing, protección de endpoints | [design.md §4](design.md), [database/](database/), §10 de este documento |
| Yeremi | Producto + Requisitos + Validación | Mantener la idea original, requisitos, historias de usuario, criterios de aceptación | Este documento en su totalidad |

**Regla del equipo:** nadie modifica la base de datos importante sin coordinar con Mijail y JuanG; Yeremi valida que el producto no se aleje del concepto central (talento + habilidades + vacantes + matching + postulación). **[Equipo]** Ver el desglose de tareas por persona y por fase en [tasks.md](tasks.md).

## 12. Pendientes relacionados con los requisitos

| Ámbito | Pendiente |
|---|---|
| Software | Ponderación definitiva del algoritmo de Match (60/20/10/10 es una propuesta inicial de Antony, debe validarse con el equipo — ver [design.md §6](design.md)) |
| Software | Estados y reglas exactas de las postulaciones más allá de la propuesta de RF-3.4 |
| Software | Política formal de privacidad y retención de datos (CV, contraseñas, contacto) |
| Negocio | Momento y forma exacta en que arranca cada vía de monetización post-MVP |
| Producto | Criterios exactos para decidir cuándo abrir el MVP a otras universidades/carreras (Fase 2) |

## Fuentes

- Prompt Maestro de Contexto: Proyecto TalentoMDD (Fase MVP) — documento del equipo, 2026.
- TalentoMDD — Contexto General + Distribución del Equipo — documento del equipo, 2026.
- `TalentoMDD_Documento_Maestro.docx` — documento maestro original del proyecto.
- [Applicant tracking system — Wikipedia](https://en.wikipedia.org/wiki/Applicant_tracking_system)
- [Designing a Database for a Recruitment System — Red Gate](https://www.red-gate.com/blog/designing-a-database-for-a-recruitment-system/)
- [How ATS Status Updates Work — Hireflow](https://hireflow.net/blog/how-ats-status-updates-work-us-platforms)
- [What is ESCO? — European Commission](https://esco.ec.europa.eu/en/about-esco/what-esco)
- [Open Badges — 1EdTech](https://www.1edtech.org/standards/open-badges)
