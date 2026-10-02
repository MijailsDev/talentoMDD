# Implementation Plan — TalentoMDD

> Reestructurado según la organización real del equipo: **trabajo en paralelo por rol**, no en cadena secuencial (BD → backend → matching → frontend → pruebas), que genera esperas innecesarias. **[Equipo]** Cada tarea referencia la sección de [requirements.md](requirements.md) / [design.md](design.md) que la sustenta.

## FASE 1 — Definición (todo el equipo, junta)

- [ ] 1.1 Validar el alcance del MVP: empresas de alcance nacional, estudiantes solo UNAMAD (Sistemas/Administración) — ver [requirements.md §1.2](requirements.md)
- [ ] 1.2 Validar los módulos, historias de usuario y criterios de aceptación (Yeremi presenta, el equipo confirma) — [requirements.md §5](requirements.md)
- [ ] 1.3 Validar las entidades y la arquitectura general — [design.md §2, §4](design.md)
- [ ] 1.4 Validar el flujo general estudiante/empresa — [design.md §7](design.md)
- [ ] 1.5 Resolver los conflictos C-1 a C-9 del documento de interfaz (texto del buscador, alcance de "Contactar", tipo de contrato, etc.) — [requirements.md §1.4](requirements.md)

## FASE 2 — Trabajo en paralelo por rol

### JuanG — Coordinador + Backend + Integración

- [ ] 2.1 Definir la arquitectura backend en capas (routes/services/database/models) — [design.md §2.1, §5.1](design.md)
- [ ] 2.2 Crear la API REST base — [design.md §5.2](design.md)
- [ ] 2.3 Implementar autenticación (`/auth/register`, `/auth/login`, `/auth/refresh`) junto con Mijail — [requirements.md RF-1.1, RF-1.2](requirements.md), [tech.md §2](tech.md)
- [ ] 2.4 Implementar manejo de roles y protección de endpoints
- [ ] 2.5 Conectar con PostgreSQL (SQLAlchemy + Alembic) usando el esquema de Mijail — [database/schema.sql](database/schema.sql)
- [ ] 2.6 Configurar Git/GitHub: ramas `main`/`develop`/`feature/*`, convención de commits — [tech.md §6.1](tech.md)
- [ ] 2.7 Coordinar prioridades y supervisar la integración de matching (Antony) y frontend (Alexandro)
- [ ] 2.8 Escribir el README técnico del backend

### Antony — Motor de Matching + Lógica de negocio

- [ ] 2.9 Documentar la fórmula de Match (cobertura 60% + nivel 20% + disponibilidad 10% + modalidad 10%) — [design.md §6](design.md)
- [ ] 2.10 Implementar `services/matching.py` de forma aislada (testeable sin base de datos)
- [ ] 2.11 Diseñar y programar los casos de prueba extremos — [design.md §6.3](design.md)
- [ ] 2.12 Preparar ejemplos de entrada/salida documentados para que JuanG integre el módulo
- [ ] 2.13 Validar la ponderación 60/20/10/10 con el equipo antes de cerrarla — [requirements.md §12](requirements.md)
- [ ] 2.14 Documentar posibles mejoras futuras del algoritmo (fuera del MVP)

### Alexandro — Frontend + UX/UI

- [ ] 2.15 Construir las pantallas de Estudiante: Login, Registro, Dashboard, Perfil (carrera/ciclo/disponibilidad/habilidades/portafolio), Vacantes, DetalleVacante (con % Match), MisPostulaciones — [design.md §7](design.md)
- [ ] 2.16 Construir las pantallas de Empresa: Login, Registro, Dashboard, CrearVacante, EditarVacante, MisVacantes, Candidatos (ordenados por Match), PerfilCandidato
- [ ] 2.17 Construir componentes reutilizables: Navbar, CardVacante, CardEstudiante, MatchBadge, Button
- [ ] 2.18 Usar mocks claramente identificados mientras la API de JuanG no esté lista; reemplazarlos cuando exista
- [ ] 2.19 Implementar estados de carga/error/éxito y validaciones visuales en cada formulario
- [ ] 2.20 Verificar Mobile-First en cada pantalla (probar primero en viewport de celular)
- [ ] 2.32 Definir los tokens de la paleta Camel/Cocoa/Espresso y respetar las reglas de contraste — [design.md §7.1](design.md)
- [ ] 2.33 Construir el panel público: Inicio (buscador destacado + tarjetas), Explorar, DetalleVacante a pantalla completa y Acceso con regreso a la vacante — [requirements.md RF-6](requirements.md), [design.md §7.2–§7.5](design.md)
- [ ] 2.34 Construir el onboarding posterior al registro (datos → habilidades → microcertificaciones) — [requirements.md RF-6.9](requirements.md)

### Mijail — Base de datos + Ciberseguridad

- [ ] 2.21 Confirmar el modelo de datos y el diagrama ER — [design.md §4.4](design.md)
- [ ] 2.22 Ejecutar y validar [database/schema.sql](database/schema.sql) en PostgreSQL real (este entorno no tiene PostgreSQL instalado, así que el script no fue probado contra un motor real — ver nota en [database/database-design.md](database/database-design.md))
- [ ] 2.23 Cargar los datos de prueba y correr las consultas de [database/seed_and_queries.sql](database/seed_and_queries.sql)
- [ ] 2.24 Revisar y, si es necesario, endurecer: hashing de contraseñas, protección contra SQL Injection, CORS, variables de entorno — [tech.md §5](tech.md)
- [ ] 2.25 Ejecutar pruebas de seguridad básicas antes de que cada módulo se fusione a `develop`
- [ ] 2.26 Entregar un informe de problemas encontrados y soluciones aplicadas
- [ ] 2.35 Decidir con JuanG las brechas del detalle de vacante (responsabilidades, requisitos adicionales, `tipo_contrato`, logotipo, contacto de empresa) — [design.md §7.4](design.md)
- [ ] 2.36 Revisar que los endpoints públicos (`GET /vacantes`, `GET /vacantes/:id`) no expongan datos sensibles y que la ruta de retorno del login no permita redirecciones abiertas — [design.md §5.2, §7.5](design.md)

### Yeremi — Producto + Requisitos + Validación

- [ ] 2.27 Mantener actualizado [requirements.md](requirements.md) a medida que el equipo toma decisiones
- [ ] 2.28 Revisar que las pantallas de Alexandro representen fielmente las historias de usuario
- [ ] 2.29 Revisar que el Match de Antony realmente responda al problema (no solo que funcione técnicamente)
- [ ] 2.30 Preparar los criterios de aceptación y casos de prueba de aceptación para la Fase 6
- [ ] 2.31 Vigilar que el producto no se convierta en una bolsa de trabajo genérica ni en una red social — [requirements.md §1.3](requirements.md)
- [ ] 2.37 Proponer al equipo la resolución de los conflictos C-1 a C-9 y actualizar [requirements.md §1.4](requirements.md) con lo decidido

## FASE 3 — Primera integración

- [ ] 3.1 Base de datos conectada al backend (Mijail + JuanG)
- [ ] 3.2 Login y registro funcionando de extremo a extremo
- [ ] 3.3 Módulo Estudiante funcionando (perfil, habilidades, CV, portafolio)
- [ ] 3.4 Módulo Empresa funcionando (perfil, verificación pendiente/verificada)
- [ ] 3.5 Módulo Vacantes funcionando (crear, listar, buscar)

## FASE 4 — Matching

- [ ] 4.1 Vacante con requisitos estructurados (habilidades, modalidad, jornada) integrada en el backend
- [ ] 4.2 Estudiante con habilidades, disponibilidad y nivel integrado
- [ ] 4.3 Cálculo del porcentaje de Match funcionando de extremo a extremo (RF-5.1)
- [ ] 4.4 Lista de candidatos por vacante ordenada por Match (RF-2.3, RF-5.2)
- [ ] 4.5 Señalización explícita de habilidades obligatorias faltantes (RF-5.3)

## FASE 5 — Postulación

- [ ] 5.1 Estudiante postula a una vacante (RF-3.3)
- [ ] 5.2 Empresa visualiza candidatos y su Match (RF-2.3)
- [ ] 5.3 Cambio de estado de postulación con la máquina de estados validada (RF-3.4) y su historial (RF-3.5)
- [ ] 5.4 "Mis postulaciones" del estudiante (RF-1.8)

## FASE 6 — Pruebas

- [ ] 6.1 Pruebas funcionales de cada módulo (Yeremi valida contra los criterios de aceptación)
- [ ] 6.2 Pruebas de integración de los endpoints críticos
- [ ] 6.3 Pruebas de seguridad (Mijail): SQL Injection, CORS, exposición de datos sensibles, fuerza bruta en login
- [ ] 6.4 Pruebas responsive/Mobile-First en cada pantalla (Alexandro)
- [ ] 6.5 Casos negativos: doble postulación, transición de estado inválida, empresa no verificada publicando, habilidad inexistente

## FASE 7 — Demo

- [ ] 7.1 Flujo completo de estudiante (registro → perfil → buscar vacante → ver Match → postular → ver estado)
- [ ] 7.2 Flujo completo de empresa (registro → verificación → crear vacante → ver candidatos → gestionar postulaciones)
- [ ] 7.3 Explicación del motor de Match con datos reales
- [ ] 7.4 Explicación de la base de datos y las medidas de seguridad
- [ ] 7.5 Explicación de la arquitectura y cómo está preparada para escalar a otras instituciones (Fase 2)

## Reglas internas del equipo (recordatorio)

1. Toda persona debe poder explicar lo que hizo.
2. El código generado por IA debe revisarse y probarse antes de integrarse.
3. Nadie modifica la BD importante sin coordinar con Mijail y JuanG.
4. Antony define el motor de Match junto con JuanG.
5. Alexandro respeta los requisitos definidos por Yeremi.
6. Mijail revisa seguridad antes de cerrar cada módulo.
7. Yeremi valida que el producto no se aleje de la idea original.
8. JuanG integra todo.
9. Se hacen pruebas antes de fusionar ramas.
10. El MVP tiene prioridad sobre funciones adicionales.

**[Equipo]**
