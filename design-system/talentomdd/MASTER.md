# TalentoMDD · Sistema de diseño (MASTER)

Fuente única de verdad para la interfaz. Los tokens viven en `src/app/globals.css` (`@theme`); este documento explica cómo usarlos. Si una página necesita reglas propias, créalas en `pages/<página>.md`: lo que diga esa página manda sobre este archivo.

## Identidad

Portal de empleabilidad universitario (UNAMAD, Madre de Dios). Tono cálido, cercano y confiable, con identidad andino-amazónica: carmesí y azul noche sobre crema, textiles tejidos (cinta, franja textil) y grano fino de papel.

- **Producto:** bolsa de trabajo con dos lados (estudiantes y empresas) más un panel de administración.
- **Estilo:** editorial cálido y con textura. Sin glassmorphism decorativo y sin emojis como iconos.
- **Iconos:** solo `lucide-react`, un mismo trazo, tamaños de 16 a 21 px.

## Color

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `primary` | `#c80036` | CTA, enlaces activos, foco | 5.7:1 sobre `bg` |
| `primary-hover` / `secondary` | `#a1002c` | Hover, eyebrow | 7.9:1 sobre `bg` |
| `primary-soft` | `#fdece2` | Fondo de chips o alertas informativas | `primary` encima: 5.2:1 |
| `dark` | `#0c1844` | Héroe, pie de página, botón oscuro | blanco encima: 17:1 |
| `bg` | `#fff9ef` | Fondo de la página | — |
| `surface` / `surface-2` | `#fff` / `#fffcf5` | Tarjetas, menús | — |
| `ink` | `#1f1f1f` | Texto principal | 15.7:1 |
| `ink-2` | `#4f4a5c` | Texto secundario | 8.1:1 |
| `line` / `line-strong` | `#efe0d6` / `#d2b8aa` | Divisores y bordes decorativos (no son controles) | — |
| `line-field` | `#9c8174` | Borde de inputs, selects y textareas | 3.6:1 (≥3:1 WCAG 1.4.11) |
| `success` / `warning` / `error` | `#2e7048` / `#8a5300` / `#b3261e` | Estados; siempre sobre su `-soft` | ≥5.2:1 |

Reglas:
- No escribas hex sueltos en los componentes: usa tokens. Las excepciones son los colores de marca de cada empresa (`company.color`) y los degradados del héroe.
- Un color de estado siempre va acompañado de un icono o un texto, nunca solo.
- Texto de ejemplo dentro de un campo: `ink-2/80` (4.95:1). No bajes de esa opacidad.
- `--grad-brand` empieza en coral `#e0705a`: el texto blanco solo cumple 4.5:1 desde el tramo carmesí. No pongas texto pequeño sobre el extremo coral.

## Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Display | Bricolage Grotesque 700/800, tracking negativo | `h1`–`h3`, `section-title`, cifras |
| Texto | Hanken Grotesk 400–800 | Todo lo demás; base de 15–16 px, interlineado de 1.5 a 1.65 |
| Acento | Instrument Serif itálica | Una o dos palabras destacadas en titulares |

- Los títulos usan `text-wrap: balance`, ya aplicado de forma global.
- Tamaño mínimo para texto de lectura: 12 px (`text-xs`) en metadatos; 11 px solo en el contador de la campana.
- Usa `tabular-nums` en cifras que cambian: contadores, estadísticas.

## Espaciado, radios y elevación

- Escala de Tailwind basada en 4 px. Separación entre secciones: `clamp(56px, 7vw, 96px)`.
- Contenedor: `container-x` (`max-w-7xl`, márgenes laterales de 16, 24 y 32 px).
- Radios: campos `rounded-xl` (12 px) · tarjetas `rounded-2xl` (16 px) · destacadas `--radius-card` (22 px) · botones y chips `rounded-full`.
- Sombras: solo `--shadow-card` (tarjetas que se elevan) y `--shadow-pop` (menús y diálogos).
- Capas (z-index): contenido `0–10` · encabezado fijo `40` · diálogos `50` · grano de la página `200` (no recibe clics).

## Componentes base (utilidades en `globals.css`)

| Utilidad | Notas |
|---|---|
| `btn` | 44 px de alto y respuesta al presionar (`scale 0.97`). Base de todas las variantes. |
| `btn-primary` | Un solo CTA principal por pantalla. |
| `btn-line`, `btn-outline`, `btn-dark`, `btn-ghost` | Acciones secundarias. `btn-sm` mide 36 px: no lo uses como única acción en el celular. |
| `field` | Borde `line-field`, anillo de foco carmesí y borde rojo automático con `aria-invalid`. |
| `label`, `hint`, `chip`, `card`, `eyebrow`, `section-title` | — |
| `snap-row` | Fila deslizable en el celular con scroll snap. |

Los botones de solo icono necesitan `aria-label` y como mínimo 32 px de área (de preferencia 40–44 px).

## Formularios

- La etiqueta siempre está visible (`label` + `htmlFor`) y los campos obligatorios llevan `*` en carmesí.
- El error aparece debajo del campo, con `FieldError` o `Field` (id `<name>-error`).
- `useFormAction` hace tres cosas por sí solo tras un envío con errores: marca `aria-invalid`, enlaza `aria-describedby` al mensaje y lleva el foco al primer campo inválido. No hace falta repetirlo en cada formulario.
- Mensajes generales: `FormMessage` (`role="alert"` en errores, `role="status"` en éxito).
- Durante el envío, `SubmitButton` se desactiva y muestra un spinner.
- Usa los tipos de input correctos (`email`, `tel`, `url`) y `autoComplete`.

## Movimiento

- Respuesta a la interacción: 150–200 ms, `ease-out`. Menús: entran en 200 ms y salen en 120 ms.
- Aparición al hacer scroll (`.reveal`, `animate-rise`): solo en la portada y en uno o dos elementos por vista.
- Anima solo `transform` y `opacity`.
- `prefers-reduced-motion` desactiva las animaciones de forma global.
- El carrusel de empresas (`.marquee`) se detiene con hover y con foco de teclado.

## Accesibilidad (mínimos que no se negocian)

- Contraste de 4.5:1 en texto, 3:1 en bordes de controles y en el anillo de foco.
- Anillo de foco: 3 px carmesí; sobre `.bg-dark`, `.bg-hero` y `.bg-textil(-dark)` cambia a blanco automáticamente.
- Enlace «Saltar al contenido» en el layout y `aria-current="page"` en la navegación.
- Menús desplegables con el patrón *disclosure* (`aria-expanded` + `aria-controls`) y cierre con Escape. No uses `role="menu"` sin navegación con flechas.
- `min-h-dvh` en lugar de `100vh`.
