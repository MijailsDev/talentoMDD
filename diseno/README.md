# Prototipo del panel público — TalentoMDD

Prototipo navegable en **HTML, CSS y JavaScript** (sin frameworks ni instalación) del panel público descrito en [requirements.md RF-6](../requirements.md) y [design.md §7](../design.md). Sirve como **referencia visual y de comportamiento** para el frontend definitivo (React o Vue, aún por decidir — [tech.md §3](../tech.md)).

## Cómo abrirlo

Doble clic en `index.html`. Funciona en cualquier navegador.

Si prefieres un servidor local (recomendado para probar como en producción):

```bash
python -m http.server 5500 --directory diseno
```

y abre <http://localhost:5500>.

## Páginas

| Archivo | Pantalla | Requisitos |
|---|---|---|
| `index.html` | Inicio: buscador destacado, tarjetas de vacantes, "cómo funciona", bloque para empresas | RF-6.1 a RF-6.4 |
| `explorar.html` | Resultados de búsqueda con filtros (modalidad, tipo de oportunidad, carrera) | RF-3.2, RF-6.3 |
| `vacante.html?id=N` | Detalle de la vacante a pantalla completa, con **Postular** y **Contactar** | RF-6.5, RF-6.8 |
| `acceso.html` | Crear cuenta (estudiante o empresa) e iniciar sesión, con regreso a la vacante | RF-6.7, RF-4.2 |
| `completar-perfil.html` | Paso a paso: datos → habilidades (nivel 1–5) → microcertificaciones | RF-1.4, RF-1.5, RF-6.9 |
| `guia-estilos.html` | Paleta, tipografía, botones, campos, etiquetas y Match | design.md §7.1 |

### Panel de empresa

Se entra con "Iniciar sesión como empresa" en el inicio (o directo en `empresa-vacantes.html`). La sesión simulada es de *Selva Digital S.A.C.*

| Archivo | Pantalla | Requisitos |
|---|---|---|
| `empresa-vacantes.html` | Mis vacantes: resumen, vacantes activas/cerradas, cerrar o reabrir | RF-2.1, RF-3.1 |
| `empresa-publicar.html` | Publicar vacante con habilidades del catálogo (obligatoria/deseable), modalidad y jornada, con vista previa | RF-2.2, RF-3.1 |
| `empresa-candidatos.html?id=N` | Candidatos ordenados por Match, aviso de habilidad obligatoria faltante, desglose del cálculo, perfil y cambio de estado | RF-2.3, RF-3.4, RF-3.5, RF-5.2, RF-5.3 |

Lo que la empresa hace (publicar, cerrar vacantes, cambiar estados) se guarda en el `sessionStorage` del navegador: se pierde al cerrar la pestaña.

## Estructura

```
diseno/
├── css/estilos.css      ← tokens de color (:root), componentes y responsive (Mobile-First)
├── js/datos-mock.js     ← DATOS DE EJEMPLO — reemplazar por la API
├── js/matching.js       ← fórmula del Match de design.md §6.1 (referencia; el cálculo oficial es del backend)
├── js/app.js            ← utilidades y páginas públicas (data-pagina en <body>)
├── js/empresa.js        ← páginas del panel de empresa
└── *.html
```

## Qué es simulado (mocks)

Siguiendo la regla del equipo de identificar los mocks (tasks.md 2.18):

- **Vacantes y empresas** salen de `js/datos-mock.js`, no de la base de datos. En pantalla llevan la etiqueta "Datos de ejemplo". Al integrar, reemplazar por `GET /vacantes` y `GET /vacantes/:id` ([design.md §5.2](../design.md)).
- **Registro e inicio de sesión** solo validan el formulario y redirigen; no crean cuentas. Al integrar, usar `/auth/register` y `/auth/login`.
- **El % de Match** se calcula en el navegador con `js/matching.js` solo para mostrarlo en el panel de empresa. En el sistema real lo calcula el backend (`services/matching.py`) y la API lo devuelve. Los visitantes ven la invitación "¿Qué tan compatible eres?" (RF-6.8).
- **Candidatos y postulaciones** vienen de `ESTUDIANTES_MOCK` y `POSTULACIONES_MOCK` (nombres y correos ficticios). Al integrar, usar `GET /vacantes/:id/matches` y `PATCH /postulaciones/:id/estado`.
- **Las transiciones de estado** permitidas copian la regla de `cambiar_estado_postulacion()` en `database/schema.sql`; la validación real la hace la base de datos.

## Decisiones ya aplicadas

- **Paleta Camel / Cocoa / Espresso** con contraste WCAG AA: Camel solo como acento, nunca como color de texto sobre blanco.
- **Mobile-First:** los estilos base son para celular; los `@media` de 768 px y 1024 px amplían a tableta y escritorio.
- **Seguridad:** los datos se insertan con `textContent` (nunca `innerHTML`), y el parámetro `volver` solo acepta rutas internas conocidas, para evitar redirecciones abiertas (tasks.md 2.36).
- **Accesibilidad:** etiquetas en todos los campos, mensajes de error asociados, navegación con teclado, foco visible y áreas táctiles de al menos 44 px.

## Pendientes del equipo que afectan este prototipo

Ver [requirements.md §1.4](../requirements.md):

- **C-3:** el texto del buscador ("…en Madre de Dios") está pendiente.
- **C-4:** "Contactar" hoy lleva al registro; falta decidir qué muestra después.
- **C-5 / C-6:** responsabilidades, requisitos adicionales y tipo de contrato aún no existen en `database/schema.sql` (marcados `[BRECHA]` en `datos-mock.js`).
