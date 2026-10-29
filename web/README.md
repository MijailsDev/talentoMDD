# TalentoMDD · Portal de empleabilidad de la UNAMAD

Portal que conecta a estudiantes y egresados de la Universidad Nacional Amazónica de Madre de Dios con empresas verificadas que ofrecen prácticas, empleos y voluntariados.

**Stack:** Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS v4 · Supabase (PostgreSQL, Auth, Storage, RLS) · Leaflet + OpenStreetMap · despliegue en Vercel.

## Qué incluye

| Rol | Funciones |
|---|---|
| Visitante | Portada con buscador, estadísticas animadas, ofertas destacadas, carreras, carrusel de empresas, testimonios y preguntas frecuentes · listado de ofertas con filtros y vista de mapa · ficha completa de la oferta y de la empresa (galería, mapa, contacto, representante) |
| Estudiante / egresado | Registro solo con correo `@unamad.edu.pe` · perfil con foto, portada, CV en PDF, experiencia, proyectos, certificaciones e idiomas · indicador de fortaleza del perfil · postular con mensaje · guardar ofertas · seguimiento con línea de tiempo · comunidad (directorio y conexiones) |
| Docente | Perfil y comunidad |
| Empresa | Registro con correo corporativo · ficha de empresa con logo, portada, galería y ubicación en mapa · tras ser verificada: publicar, editar, pausar y eliminar ofertas · revisar postulantes, ver su CV y cambiar el estado del proceso |
| Administrador (Oficina de Empleabilidad) | Verificar, rechazar o suspender empresas · destacar u ocultar ofertas · cambiar roles de usuarios · publicar novedades · gestionar facultades y carreras · métricas |

La seguridad vive en la base de datos (Row Level Security). Por ejemplo, una empresa solo ve los perfiles y CVs de quienes postularon a sus ofertas, nadie puede autoasignarse el rol de administrador y una empresa no puede autoverificarse. Las reglas están probadas en `scripts/verify-db.mjs`.

---

## Puesta en marcha (desarrollo local)

Requisitos: Node.js 20.9 o superior y Docker Desktop (para Supabase local).

```bash
npm install
npm run db:start        # levanta Supabase local y aplica migración + datos de ejemplo
```

`db:start` imprime la **API URL** y la **Publishable key**. Copia `.env.example` como `.env.local` y pega esos valores:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev             # http://localhost:3000
```

- Correos de confirmación locales: http://127.0.0.1:54324 (Mailpit).
- Panel de Supabase local (Studio): http://127.0.0.1:54323.
- `npm run db:reset` borra la base local y vuelve a cargar la migración y el seed.
- `npm run db:verify` prueba la migración, el seed y las políticas RLS en un Postgres embebido (no necesita Docker).

**Cuentas de prueba creadas en la base local** (solo existen en tu Supabase local; `db:reset` las borra):

| Rol | Correo | Contraseña |
|---|---|---|
| Estudiante | `23221001@unamad.edu.pe` | `PruebaLocal2026` |
| Empresa (Amazonía Code Lab) | `rrhh@selvadigital-prueba.pe` | `EmpresaLocal2026` |
| Administrador | `empleabilidad.prueba@unamad.edu.pe` | `AdminLocal2026` |

---

## Despliegue en producción: Supabase + Vercel

### 1. Crear el proyecto en Supabase

1. Entra a https://supabase.com, crea una organización y un proyecto nuevo. Región recomendada: **South America (São Paulo)**.
2. Guarda la contraseña de la base de datos en un lugar seguro.

### 2. Crear las tablas y cargar los datos

**Opción A, desde el panel (más simple):**
1. Supabase → **SQL Editor** → *New query*.
2. Pega todo el contenido de `supabase/migrations/20261029000000_init.sql` y pulsa **Run**.
3. Abre otra consulta, pega `supabase/seed.sql` y pulsa **Run**. Carga las 11 empresas y 16 ofertas de ejemplo; omite este paso si quieres empezar vacío, pero ejecuta al menos el bloque de `faculties` y `careers`.

**Opción B, con la CLI:**
```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push            # aplica la migración
npx supabase db push --include-seed   # opcional: también el seed
```

### 3. Configurar la autenticación

Supabase → **Authentication**:
- **URL Configuration**
  - *Site URL*: `https://TU-DOMINIO` (por ejemplo `https://talentomdd.vercel.app`).
  - *Redirect URLs*: agrega `https://TU-DOMINIO/auth/callback`. Si quieres que funcionen las vistas previas de Vercel, agrega también `https://*-TU-EQUIPO.vercel.app/auth/callback`.
- **Sign In / Providers → Email**: deja activado *Confirm email*.
- **Contraseña**: en *Password requirements*, longitud mínima **8**.
- **Correos (SMTP)**: el servidor de correo incluido en Supabase solo envía unos pocos correos por hora. Para producción configura un SMTP propio en *Authentication → Emails → SMTP Settings* (Resend, Brevo, o el correo de la universidad).
- **Plantillas** (opcional): traduce al español los textos de *Confirm signup* y *Reset password*.

**Google (opcional, recomendado si la UNAMAD usa Google Workspace):**
1. En Google Cloud Console crea un *OAuth Client ID* (tipo Web) con el URI de redirección `https://TU_PROJECT_REF.supabase.co/auth/v1/callback`.
2. Supabase → Authentication → Providers → **Google**: pega el Client ID y el Secret y actívalo.
3. En Vercel, define `NEXT_PUBLIC_ENABLE_GOOGLE=true`.

La base de datos rechaza cualquier cuenta de estudiante, egresado o docente que no sea `@unamad.edu.pe`, también con Google.

### 4. Crear el primer administrador

1. Regístrate en el portal con tu correo institucional, con cualquier rol.
2. En Supabase → SQL Editor ejecuta:
   ```sql
   update public.profiles set role = 'admin' where email = 'tu-correo@unamad.edu.pe';
   ```
3. Cierra sesión y vuelve a entrar: verás el menú **Administración**.

### 5. Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub. En Vercel configura *Root Directory* = `web` (la app vive en esa carpeta del repositorio).
2. En https://vercel.com → **Add New → Project** → importa el repositorio. Vercel detecta Next.js automáticamente.
3. En **Environment Variables** agrega:

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → *Publishable key* |
   | `NEXT_PUBLIC_SITE_URL` | `https://TU-DOMINIO` |
   | `NEXT_PUBLIC_INSTITUTIONAL_DOMAIN` | `unamad.edu.pe` |
   | `NEXT_PUBLIC_ENABLE_GOOGLE` | `true` o `false` |

4. Pulsa **Deploy**. Cuando termine, actualiza la *Site URL* de Supabase (paso 3) con la URL final.
5. **Dominio propio** (por ejemplo `talento.unamad.edu.pe`): Vercel → Project → Settings → Domains → agrega el dominio y pide a la OTI que cree el registro DNS `CNAME` que indica Vercel.

> Nunca uses la clave `service_role` / *secret key* en este proyecto ni en Vercel: la app solo necesita la clave pública porque toda la seguridad está en las políticas RLS.

---

## Personalización

- **Colores y tipografías**: `src/app/globals.css` (bloque `@theme`).
- **Nombre, universidad y dominio**: variables `NEXT_PUBLIC_*` y `src/lib/constants.ts`. Si cambias el dominio institucional, cámbialo también en la función SQL `public.institutional_domain()`.
- **Testimonios y preguntas frecuentes**: `src/lib/constants.ts`.
- **Facultades, carreras y novedades**: desde el panel de administración.

## Estructura

```
supabase/
  migrations/…_init.sql   tablas, triggers, RLS, buckets de Storage
  seed.sql                facultad, carreras, empresas y ofertas de ejemplo
  config.toml             configuración de Supabase local
scripts/verify-db.mjs     pruebas de la base de datos y de RLS
src/
  proxy.ts                refresco de sesión y protección de rutas privadas
  lib/                    clientes de Supabase, tipos, acceso a datos, utilidades
  app/actions/            server actions (auth, estudiante, empresa, admin, archivos)
  app/                    páginas (públicas, perfil, postulaciones, comunidad, empresa, admin)
  components/             UI reutilizable (tarjetas, mapa, formularios, subida de archivos…)
```
