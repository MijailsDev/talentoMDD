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

## Estructura

```
diseno/
├── css/estilos.css      ← tokens de color (:root), componentes y responsive (Mobile-First)
├── js/datos-mock.js     ← DATOS DE EJEMPLO — reemplazar por la API
├── js/app.js            ← comportamiento de cada página (data-pagina en <body>)
└── *.html
```

## Qué es simulado (mocks)

Siguiendo la regla del equipo de identificar los mocks (tasks.md 2.18):

- **Vacantes y empresas** salen de `js/datos-mock.js`, no de la base de datos. En pantalla llevan la etiqueta "Datos de ejemplo". Al integrar, reemplazar por `GET /vacantes` y `GET /vacantes/:id` ([design.md §5.2](../design.md)).
- **Registro e inicio de sesión** solo validan el formulario y redirigen; no crean cuentas. Al integrar, usar `/auth/register` y `/auth/login`.
- **El % de Match** no se calcula: los visitantes ven la invitación "¿Qué tan compatible eres?" (RF-6.8).

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
