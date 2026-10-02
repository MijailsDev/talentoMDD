# Design — TalentoMDD

> Convenciones: **[Equipo]** viene de los prompts del equipo (fuente más reciente/autoritativa). **[Definido]**/**[Propuesta]**/**[Pendiente]** provienen del documento maestro original. **[Recomendación (investigación)]** es contenido basado en sistemas similares. Ver [requirements.md §2](requirements.md) para el renombre de entidades (PERFILES→ESTUDIANTES, OFERTAS→VACANTES).

## 1. Principio general de diseño

El sistema se diseña **de adentro hacia afuera**: requisitos → modelo de datos → backend → interfaz. **[Definido]** Además, debe usar **Clean Architecture / capas**, para poder incorporar nuevas universidades e institutos en una Fase 2 sin reescribir el sistema base — no hardcodear "UNAMAD" ni las carreras del MVP en la lógica, tratarlas como datos parametrizables. **[Equipo]**

## 2. Arquitectura general

```
┌──────────────┐
│   USUARIO    │
└──────┬───────┘
       ▼
┌──────────────┐
│   FRONTEND   │   React o Vue — Mobile-First
└──────┬───────┘
       │  API (REST, JSON)
       ▼
┌───────────────────────────────────────────┐
│                 BACKEND (FastAPI)          │
│  Routes → Services → Repositories → Models │
└──────┬──────────────────────────────────────┘
       ▼
┌──────────────┐
│ BASE DE DATOS│   PostgreSQL
└──────────────┘
```

Frontend completamente separado del backend, comunicación exclusiva por API REST. **[Equipo]** Diseño **Mobile-First**: el 90% de los estudiantes accederá desde el celular. **[Equipo]**

### 2.1. Capas internas del backend

```
Routes (routers/)      → reciben la petición HTTP, validan con schemas Pydantic
   ↓
Services (services/)   → lógica de negocio: matching, reglas de transición de estado
   ↓
Repositories (database/) → acceso a datos (SQLAlchemy), sin lógica de negocio
   ↓
Models (models/)        → definición de tablas
```

Permite probar el motor de matching (Antony) sin levantar la base de datos, e integrar el trabajo de JuanG (backend), Antony (matching) y Alexandro (frontend) sin bloquearse entre sí. **[Recomendación (investigación), habilitando el trabajo en paralelo pedido por el Equipo.]**

## 3. Roles del sistema

| Rol | Qué puede hacer |
|---|---|
| Estudiante / Egresado | Administrar su perfil (carrera, ciclo, disponibilidad, habilidades, portafolio, CV); buscar vacantes, ver su Match, postular, ver "Mis postulaciones". |
| Empresa | Administrar su perfil empresarial (sujeto a verificación); publicar vacantes con requisitos estructurados; ver candidatos ordenados por Match; gestionar postulaciones. |
| Administrador | Gestionar usuarios, verificar empresas, moderar vacantes, ver reportes básicos. |

**[Equipo]**

## 4. Modelo de datos

### 4.1. Entidades base

**USUARIOS**

| Campo | Descripción |
|---|---|
| id | Identificador único |
| nombre | Nombre del usuario |
| correo | Correo electrónico (único) |
| password_hash | Hash Argon2id — nunca texto plano |
| foto_url | Foto de perfil |
| tipo_usuario | `estudiante_egresado` / `empresa` / `administrador` |
| estado | `activo` / `inactivo` |

**ESTUDIANTES** *(antes PERFILES)*

| Campo | Descripción |
|---|---|
| id | Identificador único |
| usuario_id | Referencia al usuario |
| carrera | `sistemas` / `administracion` en Fase 1 **[Equipo — segmentación académica]** |
| ciclo | Ciclo académico actual **[Equipo]** |
| disponibilidad | `tiempo_completo` / `medio_tiempo` / `practicas` **[Equipo]** |
| modalidad_preferida | `presencial` / `hibrido` / `remoto` — se compara contra la modalidad de la vacante en el Match (§6.1) **[Recomendación (investigación) — campo necesario para poder calcular el componente "Modalidad" de la fórmula del Equipo]** |
| experiencia | Experiencia previa |
| descripcion | Descripción personal |
| portafolio_url | Enlace a GitHub/portafolio **[Equipo]** |
| cv_url | Referencia al archivo de CV |

**EMPRESAS**

| Campo | Descripción |
|---|---|
| id | Identificador único |
| usuario_id | Usuario que la administra |
| nombre | Nombre de la empresa |
| descripcion | Descripción de la empresa |
| ciudad | Ciudad/región — relevante por el alcance nacional **[Equipo]** |
| convenio_unamad | Si tiene convenio vigente con la UNAMAD (publica gratis en Fase de tracción, RF-2.4) **[Equipo]** |
| estado_verificacion | `pendiente` / `verificada` / `rechazada` |

**VACANTES** *(antes OFERTAS)*

| Campo | Descripción |
|---|---|
| id | Identificador único |
| empresa_id | Empresa que publica |
| titulo | Título del puesto |
| descripcion | Descripción del puesto |
| modalidad | `presencial` / `hibrido` / `remoto` **[Equipo]** |
| jornada | `tiempo_completo` / `medio_tiempo` / `practicas` **[Equipo]** |
| ciudad | Ciudad de la vacante (o "remoto") **[Equipo]** |
| fecha_publicacion | Fecha de publicación |
| estado | `activa` / `cerrada` / `oculta` |

### 4.2. Habilidades y matching

**HABILIDADES** (catálogo controlado)

| Campo | Descripción |
|---|---|
| id | Identificador único |
| nombre | Nombre de la habilidad (ej. "SQL", "React") |
| categoria | `tecnica` / `blanda` / `idioma` / `herramienta` |
| activo | Si sigue disponible para seleccionar |

**ESTUDIANTE_HABILIDADES** *(antes PERFIL_HABILIDADES, N:M)*

| Campo | Descripción |
|---|---|
| estudiante_id | Referencia a ESTUDIANTES |
| habilidad_id | Referencia a HABILIDADES |
| nivel | Nivel autodeclarado (1–5) |

**VACANTE_REQUISITOS** *(antes OFERTA_HABILIDADES, N:M)*

| Campo | Descripción |
|---|---|
| vacante_id | Referencia a VACANTES |
| habilidad_id | Referencia a HABILIDADES |
| importancia | `obligatoria` / `deseable` |

**CERTIFICACIONES** (microcertificaciones)

| Campo | Descripción |
|---|---|
| id | Identificador único |
| estudiante_id | Referencia a ESTUDIANTES |
| habilidad_id | Habilidad que certifica |
| entidad_emisora | Quién emite la certificación |
| fecha | Fecha de emisión |
| evidencia_url | Enlace o archivo de respaldo |

### 4.3. POSTULACIONES y máquina de estados

**POSTULACIONES**

| Campo | Descripción |
|---|---|
| id | Identificador único |
| usuario_id | Postulante |
| vacante_id | Vacante a la que postula |
| fecha_postulacion | Fecha de postulación |
| estado | Ver máquina de estados abajo |
| porcentaje_match | Resultado del algoritmo de Match (§6) en el momento de postular |

```
postulado ──► en_revision ──► entrevista ──► oferta ──► contratado
     │              │              │            │
     └──────────────┴──────────────┴────────────┴──► rechazado
     │
     └──► retirado
```

Cada cambio se registra en **POSTULACION_HISTORIAL** (estado_anterior, estado_nuevo, fecha, quién lo hizo) para trazabilidad. **[Recomendación (investigación)]**

### 4.4. Diagrama de relaciones

```
USUARIOS ──1:1── ESTUDIANTES ──N:M── HABILIDADES ──N:M── VACANTES ──N:1── EMPRESAS ──1:1── USUARIOS
                     │                                        │
                CERTIFICACIONES                        VACANTE_REQUISITOS (importancia)
                     │
           ESTUDIANTE_HABILIDADES (nivel)

USUARIOS ──N:1── POSTULACIONES ──N:1── VACANTES
                     │
              POSTULACION_HISTORIAL
```

Script completo en [database/schema.sql](database/schema.sql) (PostgreSQL).

## 5. Diseño del backend

### 5.1. Estructura de carpetas

```
backend/
├── app/
│   ├── main.py
│   ├── models/
│   │   ├── usuario.py
│   │   ├── estudiante.py
│   │   ├── empresa.py
│   │   ├── vacante.py
│   │   ├── habilidad.py
│   │   ├── certificacion.py
│   │   └── postulacion.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── estudiantes.py
│   │   ├── empresas.py
│   │   ├── vacantes.py
│   │   ├── postulaciones.py
│   │   └── admin.py
│   ├── services/
│   │   ├── matching.py
│   │   └── postulacion_estado.py
│   ├── schemas/
│   └── database/
└── requirements.txt
```

### 5.2. Endpoints de la API

Base de referencia de JuanG (Coordinador/Backend), ampliada con lo necesario para el resto de RF:

| Método | Ruta | Función |
|---|---|---|
| POST | `/auth/register` | Registrar un nuevo usuario |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/refresh` | Renovar el access token |
| GET | `/estudiantes/:id` | Consultar un estudiante |
| PUT | `/estudiantes/:id` | Actualizar un estudiante (incluye habilidades, ciclo, disponibilidad, portafolio) |
| GET | `/vacantes` | Listar / buscar vacantes — **público**. Parámetros: `q` (puesto, habilidad, empresa o ubicación), `modalidad`, `jornada`, `carrera` (RF-3.2, RF-6.3) |
| GET | `/vacantes/:id` | Detalle de una vacante — **público**; incluye `porcentaje_match` solo si quien consulta es un estudiante con sesión (RF-6.8) |
| POST | `/vacantes` | Crear vacante (con requisitos) |
| PUT | `/vacantes/:id` | Editar vacante |
| GET | `/vacantes/:id/matches` | Candidatos de una vacante ordenados por Match |
| POST | `/postulaciones` | Postular a una vacante (calcula Match) |
| GET | `/postulaciones` | Ver postulaciones propias/recibidas |
| PATCH | `/postulaciones/:id/estado` | Cambiar estado de una postulación |
| GET | `/empresas/:id/candidatos` | Candidatos compatibles para una empresa |
| GET/PATCH | `/admin/empresas/:id/verificar` | Aprobar/rechazar una empresa |
| GET/POST | `/admin/habilidades` | Gestionar catálogo de habilidades |
| GET | `/admin/reportes` | Estadísticas básicas |

**[Equipo — los endpoints base son los que definió JuanG; se añadieron los de habilidades/admin/reportes necesarios para cubrir RF-4/RF-5.]** Solo `/auth/*` y `GET /vacantes`, `GET /vacantes/:id` son públicos (panel público, RF-6.6); todo lo demás exige sesión.

## 6. Motor de Matching

**Responsable:** Antony. Fórmula inicial propuesta por el equipo — **debe validarse antes de convertirse en regla definitiva**:

| Componente | Peso | Qué mide |
|---|---|---|
| Habilidades (cobertura) | 60% | Proporción de las habilidades requeridas de la vacante que el estudiante posee |
| Nivel de habilidad | 20% | Qué tan bien el nivel declarado del estudiante cubre el nivel esperado, para las habilidades que sí coinciden |
| Disponibilidad | 10% | Si la disponibilidad del estudiante coincide con la jornada de la vacante |
| Modalidad | 10% | Si el estudiante puede cumplir la modalidad de la vacante (siempre compatible si la vacante es remota) |

**[Equipo — ponderación inicial de Antony; ver [requirements.md §12](requirements.md) pendiente de validación final.]**

### 6.1. Fórmula detallada (v2, reemplaza el overlap simple de la versión anterior de este documento)

Sea una vacante con habilidades requeridas `R = {(h_i, peso_i)}` donde `peso_i = 2` si es obligatoria y `1` si es deseable, y un estudiante con habilidades `E = {(h_j, nivel_j)}`:

```
// 1) Cobertura de habilidades (60%)
cobertura = Σ peso_i (para h_i ∈ R ∩ E) / Σ peso_i (para todo h_i ∈ R)

// 2) Nivel (20%) — promedio del nivel declarado, solo sobre las habilidades que coincidieron
nivel_prom = promedio( nivel_j / 5 )  para cada h_i ∈ R ∩ E
             (si no hay coincidencias, nivel_prom = 0)

// 3) Disponibilidad (10%) — coincidencia exacta disponibilidad vs. jornada
disp_score = 1  si estudiante.disponibilidad == vacante.jornada
             0  en caso contrario

// 4) Modalidad (10%) — el estudiante indica su modalidad preferida/posible
mod_score  = 1  si vacante.modalidad == 'remoto' O coincide con la preferencia del estudiante
             0  en caso contrario

porcentaje_match = (cobertura × 60) + (nivel_prom × 20) + (disp_score × 10) + (mod_score × 10)
```

- Ejemplo del equipo: vacante requiere SQL, Git, JavaScript, React; estudiante tiene SQL, Git, JavaScript, Python → 3 de 4 = 75% de cobertura (ejemplo simplificado sin ponderar nivel/disponibilidad/modalidad, ilustrativo del concepto). **[Equipo]**
- Si falta una habilidad **obligatoria**, se muestra igual el porcentaje pero la interfaz debe señalarlo explícitamente (RF-5.3), sin ocultarlo detrás del promedio.
- El cálculo se hace en el **backend** (`services/matching.py`), no en la base de datos, para que sea fácil de ajustar y probar sin migraciones (Antony debe poder iterar la fórmula sin tocar el esquema). **[Equipo — "el código sea fácil de integrar al backend"; Recomendación (investigación) — mantenerlo testeable.]**

### 6.2. Por qué no usar IA compleja en el MVP

El equipo es explícito: "no uses IA compleja si no aporta valor al MVP". El algoritmo ponderado es suficiente porque es explicable (una empresa puede entender por qué un candidato obtuvo 75%), medible y fácil de depurar con casos de prueba. **[Equipo]**

### 6.3. Casos de prueba a diseñar (responsabilidad de Antony)

- Estudiante sin ninguna habilidad de la vacante → 0% (sin división por cero).
- Vacante sin habilidades deseables, solo obligatorias, estudiante cumple todas → cobertura 100%.
- Estudiante con nivel máximo en todas las habilidades coincidentes → nivel_prom 100%.
- Disponibilidad/modalidad no coinciden → penalización de hasta 20 puntos, aunque las habilidades coincidan al 100%.
- Vacante remota → modalidad siempre compatible independientemente de la preferencia del estudiante.

**[Equipo — "Diseñes casos extremos" es un entregable explícito del rol de Antony.]**

## 7. Diseño del frontend

**Responsable:** Alexandro. Requisitos explícitos del equipo: Mobile-First, responsive, profesional, claro, componentes reutilizables, estados de carga/error/éxito, validaciones visuales, mocks identificados mientras la API no exista. **[Equipo]**

```
frontend/
├── src/
│   ├── pages/
│   │   ├── publico/
│   │   │   ├── Inicio (buscador destacado + tarjetas de vacantes)
│   │   │   ├── Explorar (resultados de búsqueda)
│   │   │   ├── DetalleVacante (pantalla completa, sin Match)
│   │   │   └── Acceso (Login / Registro, con regreso a la vacante)
│   │   ├── estudiante/
│   │   │   ├── Login, Registro, Dashboard
│   │   │   ├── Perfil (carrera, ciclo, disponibilidad, habilidades, portafolio)
│   │   │   ├── Vacantes, DetalleVacante (con % Match)
│   │   │   └── MisPostulaciones
│   │   ├── empresa/
│   │   │   ├── Login, Registro, Dashboard
│   │   │   ├── CrearVacante, EditarVacante, MisVacantes
│   │   │   └── Candidatos (ordenados por Match), PerfilCandidato
│   │   └── admin/
│   │       └── Usuarios, Empresas, Reportes
│   ├── components/
│   │   ├── Navbar, SearchBar, CardVacante, CardEstudiante, MatchBadge, Button
│   ├── services/
│   │   └── api.js
│   └── App
```

**[Equipo, con nomenclatura alineada a §2 de requirements.md; `publico/` y `SearchBar` agregados por el documento de interfaz]**

### 7.1. Identidad visual

| Token | Color | Uso |
|---|---|---|
| `--color-espresso` | `#4A342A` | Texto principal, encabezados, Navbar, fondo de la sección principal (con texto blanco) |
| `--color-cocoa` | `#7D5A44` | Botones primarios ("Buscar", "Postular") con texto blanco, enlaces |
| `--color-camel` | `#B2967D` | Acentos: bordes, chips de habilidades, iconos, separadores, fondos decorativos |

**[Equipo — interfaz (paleta)]**

Contraste medido (WCAG 2.1; AA exige ≥ 4.5:1 para texto normal y ≥ 3:1 para texto grande):

| Combinación | Contraste | Uso permitido |
|---|---|---|
| Blanco sobre Espresso | 11.57:1 | Cualquier texto |
| Blanco sobre Cocoa | 6.14:1 | Cualquier texto (botones) |
| Espresso sobre Camel | 4.16:1 | Solo texto grande o en negrita (≥ 18.66 px negrita / 24 px) |
| Blanco sobre Camel | 2.78:1 | **No usar para texto** |
| Cocoa sobre Camel / Espresso sobre Cocoa | 2.21:1 / 1.88:1 | **No usar para texto** |

Para fondos de página y tarjetas se recomienda blanco o un tono claro derivado de Camel (p. ej. `#F7F3EF`), dejando las tres tonalidades para jerarquía y acentos. **[Recomendación]**

### 7.2. Página de inicio (panel público)

Orden de arriba hacia abajo, pensado primero para celular:

1. **Navbar:** logo · Explorar oportunidades · Para empresas · Iniciar sesión · **Registrarse** (botón destacado). En celular, menú colapsable con "Registrarse" siempre visible.
2. **Sección principal:** texto referencial (pendiente C-3 de [requirements.md §1.4](requirements.md)) y **buscador grande** de un solo campo (puesto, habilidad, empresa o ubicación) con filtros rápidos de modalidad y jornada. Botón "Buscar empleo".
3. **Vacantes recientes:** grilla de `CardVacante` (1 columna en celular, 2–3 en escritorio) y enlace "Ver todas" → Explorar.
4. **Para empresas:** bloque breve con acceso a registro de empresa.

**[Equipo — interfaz (contenido) + Recomendación (orden y comportamiento responsive)]**

### 7.3. Tarjeta de vacante (`CardVacante`)

| Campo pedido | Origen en el modelo (§4) |
|---|---|
| Nombre o logotipo de la empresa | `empresas.nombre`; logotipo → ver brecha en §7.4 |
| Puesto | `vacantes.titulo` |
| Ubicación | `vacantes.ciudad` (o "Remoto" si `modalidad = remoto`) |
| Tipo de trabajo | `vacantes.jornada` + `vacantes.modalidad` |
| Habilidades requeridas | `vacante_requisitos` → `habilidades.nombre` (máx. 3–4 chips + "+N") |
| Breve descripción | `vacantes.descripcion`, truncada a ~2 líneas |
| Fecha de publicación | `vacantes.fecha_publicacion` (formato relativo: "hace 3 días") |
| Botón "Ver detalles" | Navega a `DetalleVacante` |

Para un estudiante con sesión, la tarjeta añade `MatchBadge`. **[Equipo — interfaz]**

### 7.4. Detalle de vacante (pantalla completa) y brechas con el modelo de datos

| Campo pedido | Origen en el modelo | Estado |
|---|---|---|
| Puesto, empresa, descripción | `vacantes.titulo`, `empresas.nombre`, `vacantes.descripcion` | Cubierto |
| Habilidades solicitadas | `vacante_requisitos` (obligatoria / deseable) | Cubierto |
| Ubicación, modalidad | `vacantes.ciudad`, `vacantes.modalidad` | Cubierto |
| Información de la empresa | `empresas.descripcion`, `empresas.ciudad` | Cubierto (básico) |
| Microcertificaciones relacionadas | Derivadas de las habilidades requeridas ([requirements.md §6](requirements.md)) | Cubierto sin tabla nueva |
| Responsabilidades | — | **Brecha:** texto descriptivo, no entra al Match (C-5) |
| Requisitos adicionales (no habilidades) | — | **Brecha:** texto descriptivo, no entra al Match (C-5) |
| Tipo de contrato | `vacantes.jornada` cubre parcialmente | **Brecha / Pendiente** (C-6) |
| Logotipo de la empresa | `usuarios.foto_url` del usuario empresa podría reutilizarse | **Brecha menor** |
| Contacto / sitio web de la empresa | — | **Brecha**, depende de C-4 |

Las brechas son propuestas: **no se modificó [database/schema.sql](database/schema.sql)**. Cualquier cambio al esquema lo deciden Mijail y JuanG (regla 3 del equipo). **[Recomendación]**

Acciones en el detalle: **Postular** (botón principal) y **Contactar** (secundario, según C-4). Un visitante ve "Regístrate para ver tu compatibilidad" en lugar del Match (RF-6.8).

### 7.5. Flujo del visitante

```
Inicio
  ├── Buscar empleo / Explorar oportunidades
  │       └── Resultados (tarjetas)
  │               └── Ver detalles (pantalla completa)
  │                       ├── Postular  ─┐
  │                       └── Contactar ─┴─► ¿Tiene sesión?
  │                                            ├── Sí → acción
  │                                            └── No → Registro / Inicio de sesión
  │                                                      └── regresa a la vacante (RF-6.7)
  ├── Iniciar sesión
  └── Registrarse → completar perfil: datos → habilidades → microcertificaciones (RF-6.9)
```

Para no perder la vacante, la pantalla de acceso recibe la ruta de retorno (p. ej. `/acceso?volver=/vacantes/42`), validando que sea una ruta interna para evitar redirecciones abiertas. **[Equipo — interfaz (flujo) + Recomendación (regreso y validación)]**

## 8. Diagramas a elaborar antes de programar

1. **Diagrama de casos de uso** por rol (estudiante, empresa, administrador).
2. **Diagrama entidad-relación**, formaliza §4.
3. **Diagrama de arquitectura**, formaliza §2.

## 9. Riesgos de diseño

| Riesgo | Cómo evitarlo |
|---|---|
| Limitar el MVP a empresas de Madre de Dios y generar sobreoferta de estudiantes | Mantener el alcance nacional de empresas (§1.2 de requirements.md) |
| Convertir TalentoMDD en una bolsa de trabajo genérica o red social | Mantener el concepto central: talento + habilidades + vacantes + matching + postulación |
| Sobre-diseñar el matching con IA antes de validar la fórmula simple | Empezar con la fórmula ponderada explicable (§6) y solo evolucionar si el equipo lo decide |
| Que el mensaje público ("…en Madre de Dios") haga creer que solo hay empleo local, aunque las empresas son nacionales | Resolver el texto del buscador (C-3 de requirements.md §1.4) antes de construir la página de inicio |
| Que "Contactar" termine convirtiéndose en un chat (fuera del MVP) | Limitarlo a mostrar el contacto público de la empresa (C-4) |
| Hardcodear "UNAMAD" o las dos carreras del MVP en la lógica | Tratarlas como datos parametrizables, pensando en la Fase 2 (§9 de requirements.md) |
| Trabajar de forma secuencial (BD → backend → matching → frontend → pruebas) | Trabajar en paralelo por rol, con la separación en capas de §2.1 |

**[Equipo + Recomendación (investigación)]**

## Fuentes

- Prompt Maestro de Contexto: Proyecto TalentoMDD (Fase MVP) — documento del equipo.
- TalentoMDD — Contexto General + Distribución del Equipo — documento del equipo.
- [Designing a Database for a Recruitment System — Red Gate](https://www.red-gate.com/blog/designing-a-database-for-a-recruitment-system/)
- [FastAPI Best Practices — GitHub (zhanymkanov)](https://github.com/zhanymkanov/fastapi-best-practices)
