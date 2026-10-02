# Tech Stack — TalentoMDD

> Convenciones: **[Equipo]** viene de los prompts del equipo. **[Recomendación (investigación)]** es contenido nuevo basado en buenas prácticas de la industria, a validar.

## 0. Cambio importante: motor de base de datos → PostgreSQL

La primera versión de este documento recomendaba MySQL (elegido sin más contexto que "MySQL o SQL Server"). Los prompts del equipo piden **PostgreSQL explícitamente y varias veces** (visión técnica general y, en concreto, la instrucción #2 del rol de Mijail: "Implementar PostgreSQL"). **Se corrige: el motor es PostgreSQL 15+.** El script completo ya está reescrito en [database/schema.sql](database/schema.sql). **[Equipo]**

## 1. Resumen del stack

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | React **o** Vue, Mobile-First | Equipo (sin decidir cuál de los dos) |
| Comunicación | API REST (JSON) | Equipo |
| Backend | Python + FastAPI | Propuesta (documento maestro), compatible con lo pedido por el equipo |
| ORM / migraciones | SQLAlchemy 2.x (dialecto `postgresql`) + Alembic | Recomendación |
| Validación | Pydantic v2 | Recomendación |
| Base de datos | **PostgreSQL 15+** | **Equipo (explícito)** |
| Autenticación | JWT (access + refresh) + Argon2id | Equipo (JWT) + Recomendación (Argon2id) |
| Contenedores (desarrollo) | Docker + docker-compose | Recomendación |
| Pruebas backend | pytest + httpx `TestClient` | Recomendación |

## 2. Backend

- **Lenguaje/framework:** Python + FastAPI.
- **Rol:** concentra la lógica de negocio (autenticación, gestión de usuarios/empresas/vacantes/postulaciones, matching) siguiendo la separación en capas de [design.md §2.1](design.md).
- **ORM:** SQLAlchemy 2.x con el driver `psycopg[binary]` (o `asyncpg` si el equipo decide ir 100% async); Alembic para versionar el esquema a partir de [database/schema.sql](database/schema.sql).
- **Validación:** un schema Pydantic de entrada y uno de salida por endpoint — nunca exponer el modelo de base de datos directamente (evita filtrar `password_hash`).
- **Autenticación y autorización** (pedido explícito del equipo, rol de Mijail):
  - Contraseñas con **Argon2id** (`argon2-cffi`); nunca texto plano.
  - JWT de acceso corto (≤15 min) + refresh token, en cookies `httpOnly`.
  - Control de acceso por roles en cada endpoint (`estudiante_egresado` / `empresa` / `administrador`).
  - *Rate limiting* en `/auth/login` y `/auth/register` (p. ej. `slowapi`).
  - CORS configurado a los orígenes conocidos del frontend, nunca `*`.
  - Variables de entorno para todos los secretos (`DATABASE_URL`, `JWT_SECRET`, etc.), nunca hardcodeados — usar `.env` + `python-dotenv` o `pydantic-settings`.
  **[Equipo (los puntos de seguridad son instrucción directa) + Recomendación (las herramientas concretas)]**

## 3. Frontend

- **Framework:** React o Vue — **[Pendiente]** decidir según conocimientos del equipo (Alexandro).
- **Mobile-First / responsive:** requisito explícito, no opcional — el 90% de los estudiantes usará el celular. **[Equipo]**
- **Build:** Vite. **[Recomendación]**
- **Datos remotos:** TanStack Query (React) o Pinia + composables (Vue) para manejar estados de carga/error/éxito de forma consistente — requisito explícito del equipo. **[Equipo + Recomendación de herramienta]**
- **Mientras la API no exista:** usar mocks claramente identificados y reemplazarlos cuando el backend esté listo — instrucción explícita para Alexandro. **[Equipo]**

## 4. Base de datos — PostgreSQL

- **Motor:** PostgreSQL 15+ (recomendado 16). **[Equipo]**
- **Diseño:** ver entidades renombradas y campos nuevos en [design.md §4](design.md); script ejecutable en [database/schema.sql](database/schema.sql).
- **Tipos ENUM nativos de Postgres** (`CREATE TYPE ... AS ENUM`) para todos los campos de estado/categoría (tipo_usuario, modalidad, jornada, estado_postulacion, etc.), evitando cadenas inconsistentes como `Activo`/`activo`/`ACTIVO`.
- **Semilla del catálogo de habilidades:** considerar un subconjunto curado de la taxonomía pública **ESCO** filtrado a los sectores relevantes, en vez de construir el catálogo desde cero. **[Recomendación (investigación)]**

## 5. Seguridad — resumen ejecutivo (pedido explícito del equipo, rol de Mijail)

| Medida | Detalle |
|---|---|
| Contraseñas | Argon2id; nunca texto plano ni cifrado reversible |
| Sesión | JWT de corta duración + refresh en cookie `httpOnly` |
| Autorización | Roles verificados en cada endpoint, no solo en el frontend |
| Entradas | Validación con Pydantic; consultas parametrizadas vía ORM — nunca SQL concatenado (protección contra SQL Injection) |
| CORS | Restringido a los orígenes del frontend |
| Secretos | Variables de entorno, nunca en el repositorio |
| Endpoints | Protegidos por defecto; públicos solo los explícitamente necesarios (`/auth/*`, listado de vacantes) |
| Datos sensibles | CV y contacto visibles solo a empresas con postulación activa del candidato |

Al cerrar cada módulo, Mijail debe revisarlo por vulnerabilidades antes de fusionar la rama — regla explícita del equipo (§12, regla 6). **[Equipo]**

## 6. Entorno de desarrollo, Git y despliegue

### 6.1. Ramas y commits (pedido explícito del equipo)

```
main
develop
feature/backend
feature/matching
feature/frontend
feature/database-security
feature/product-docs
```

Convención de commits: `feat: add student profile endpoint`, `fix: validate duplicate applications`, `docs: add user stories`, `test: add matching test cases`. Evitar commits como "cosas", "avance", "prueba", "update", "ya", "terminado". **[Equipo]**

### 6.2. Entorno local y despliegue

| Necesidad | Opción recomendada |
|---|---|
| Desarrollo local | Docker + `docker-compose` (backend + PostgreSQL en contenedores) |
| Integración continua | GitHub Actions (lint + tests en cada push) |
| Despliegue de bajo costo | Railway, Render o Fly.io para backend + PostgreSQL gestionado; Vercel/Netlify para el frontend |

**[Recomendación (investigación)]**

## 7. Pendientes tecnológicos

| Ámbito | Pendiente |
|---|---|
| Software | Decisión final entre React y Vue (Alexandro) |
| Software | JWT vs. sesiones tradicionales — el equipo lo deja abierto ("según lo que decida el equipo"); este documento recomienda JWT pero no está cerrado |
| Software | Proveedor de almacenamiento de archivos (CV, evidencias, portafolio) |
| Software | Proveedor de despliegue definitivo y su costo |

## Fuentes

- Prompt Maestro de Contexto: Proyecto TalentoMDD (Fase MVP) — documento del equipo.
- TalentoMDD — Contexto General + Distribución del Equipo — documento del equipo.
- [Password Hashing in 2026: Argon2 vs bcrypt vs scrypt — Reintech](https://reintech.io/blog/password-hashing-2026-argon2-bcrypt-scrypt-comparison)
- [What is ESCO? — European Commission](https://esco.ec.europa.eu/en/about-esco/what-esco)
