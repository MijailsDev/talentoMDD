/*
 * ============================================================
 *  DATOS DE EJEMPLO (MOCK) — NO SON VACANTES REALES
 * ============================================================
 * Reemplazar por la respuesta de GET /vacantes y GET /vacantes/:id
 * cuando la API exista (tasks.md 2.18, design.md §5.2).
 *
 * Los nombres de campo siguen el modelo de datos (design.md §4):
 *   titulo → vacantes.titulo, modalidad → vacantes.modalidad, etc.
 * Campos marcados [BRECHA] todavía no existen en database/schema.sql
 * (ver design.md §7.4); se muestran para validar el diseño.
 */
window.VACANTES_MOCK = [
  {
    id: 1,
    empresa: {
      nombre: 'Selva Digital S.A.C.',
      iniciales: 'SD',
      rubro: 'Desarrollo de software',
      ciudad: 'Puerto Maldonado',
      descripcion: 'Empresa de desarrollo de software que crea soluciones web para comercios y negocios de turismo de la región.',
      verificada: true
    },
    titulo: 'Practicante de Desarrollo Web',
    ciudad: 'Puerto Maldonado',
    modalidad: 'Híbrido',
    jornada: 'Prácticas',
    horas: '20 h/semana',
    tipoContrato: 'Convenio de prácticas preprofesionales', // [BRECHA] C-6
    carrera: 'Ingeniería de Sistemas',
    diasPublicada: 3,
    resumen: 'Apoya al equipo en el desarrollo y mantenimiento de aplicaciones web para clientes de la región.',
    descripcion: 'Buscamos estudiantes de Ingeniería de Sistemas que quieran ganar experiencia real desarrollando aplicaciones web para clientes de la región. Trabajarás junto a un desarrollador sénior con mentoría semanal.',
    responsabilidades: [ // [BRECHA] C-5
      'Desarrollar componentes de interfaz con React.',
      'Corregir errores y mantener aplicaciones existentes.',
      'Escribir consultas SQL para reportes sencillos.',
      'Documentar el código y trabajar con Git en el flujo del equipo.'
    ],
    requisitos: [ // [BRECHA] C-5
      'Estudiante de Ingeniería de Sistemas desde el 6.º ciclo.',
      'Disponibilidad de 20 horas semanales.',
      'Conocimientos básicos de HTML, CSS y JavaScript.'
    ],
    obligatorias: ['JavaScript', 'React', 'Git'],
    deseables: ['SQL'],
    microcertificaciones: [
      { nombre: 'SQL básico', habilidad: 'SQL' },
      { nombre: 'Git y GitHub esencial', habilidad: 'Git' }
    ]
  },
  {
    id: 2,
    empresa: {
      nombre: 'Comercial Amazónica E.I.R.L.',
      iniciales: 'CA',
      rubro: 'Comercio mayorista',
      ciudad: 'Puerto Maldonado',
      descripcion: 'Distribuidora de abarrotes y artículos de ferretería para tiendas de Madre de Dios.',
      verificada: true
    },
    titulo: 'Asistente Administrativo',
    ciudad: 'Puerto Maldonado',
    modalidad: 'Presencial',
    jornada: 'Medio tiempo',
    horas: '24 h/semana',
    tipoContrato: 'Contrato a plazo fijo',
    carrera: 'Administración',
    diasPublicada: 1,
    resumen: 'Gestión de documentos, registro de ventas y atención a proveedores.',
    descripcion: 'Buscamos un estudiante o egresado de Administración para ordenar la gestión documentaria y apoyar el registro diario de ventas.',
    responsabilidades: [
      'Registrar ventas y compras en hojas de cálculo.',
      'Archivar y digitalizar documentos.',
      'Atender a proveedores por teléfono y correo.'
    ],
    requisitos: [
      'Estudiante de Administración desde el 4.º ciclo, o egresado.',
      'Disponibilidad por las mañanas.'
    ],
    obligatorias: ['Excel', 'Atención al cliente'],
    deseables: ['Redacción'],
    microcertificaciones: [
      { nombre: 'Excel básico', habilidad: 'Excel' },
      { nombre: 'Atención al cliente', habilidad: 'Atención al cliente' }
    ]
  },
  {
    id: 3,
    empresa: {
      nombre: 'Andina Analytics S.A.C.',
      iniciales: 'AA',
      rubro: 'Consultoría de datos',
      ciudad: 'Lima',
      descripcion: 'Consultora que ayuda a empresas medianas a tomar decisiones con datos.',
      verificada: true
    },
    titulo: 'Analista de Datos Junior',
    ciudad: 'Lima',
    modalidad: 'Remoto',
    jornada: 'Tiempo completo',
    horas: '40 h/semana',
    tipoContrato: 'Contrato a plazo fijo',
    carrera: 'Ingeniería de Sistemas',
    diasPublicada: 5,
    resumen: 'Construcción de reportes y tableros de indicadores para el área comercial.',
    descripcion: 'Formarás parte del equipo de analítica construyendo reportes y tableros para clientes del sector comercial. Trabajo 100% remoto.',
    responsabilidades: [
      'Escribir consultas SQL para extraer y limpiar datos.',
      'Construir tableros en Power BI.',
      'Presentar hallazgos al equipo comercial.'
    ],
    requisitos: [
      'Egresado o estudiante de últimos ciclos de Ingeniería de Sistemas.',
      'Conexión a internet estable.'
    ],
    obligatorias: ['SQL', 'Excel'],
    deseables: ['Power BI', 'Python'],
    microcertificaciones: [
      { nombre: 'SQL básico', habilidad: 'SQL' },
      { nombre: 'Excel básico', habilidad: 'Excel' }
    ]
  },
  {
    id: 4,
    empresa: {
      nombre: 'Inversiones Río Madre S.A.',
      iniciales: 'RM',
      rubro: 'Servicios',
      ciudad: 'Puerto Maldonado',
      descripcion: 'Grupo empresarial con oficinas en Puerto Maldonado e Iberia.',
      verificada: true
    },
    titulo: 'Soporte Técnico TI',
    ciudad: 'Puerto Maldonado',
    modalidad: 'Presencial',
    jornada: 'Tiempo completo',
    horas: '48 h/semana',
    tipoContrato: 'Contrato a plazo fijo',
    carrera: 'Ingeniería de Sistemas',
    diasPublicada: 7,
    resumen: 'Soporte a usuarios, mantenimiento de equipos y redes de oficina.',
    descripcion: 'Serás el primer punto de contacto para los problemas técnicos de las oficinas: equipos, impresoras y red.',
    responsabilidades: [
      'Atender incidencias de usuarios.',
      'Mantener equipos y red de oficina.',
      'Llevar el inventario de equipos.'
    ],
    requisitos: [
      'Egresado de Ingeniería de Sistemas.',
      'Disponibilidad para trasladarse entre oficinas.'
    ],
    obligatorias: ['Redes', 'Windows'],
    deseables: ['Atención al cliente'],
    microcertificaciones: [
      { nombre: 'Redes básicas', habilidad: 'Redes' }
    ]
  },
  {
    id: 5,
    empresa: {
      nombre: 'Castaña Sur Exportaciones',
      iniciales: 'CS',
      rubro: 'Agroexportación',
      ciudad: 'Arequipa',
      descripcion: 'Empresa exportadora de castaña y productos amazónicos.',
      verificada: true
    },
    titulo: 'Asistente de Marketing Digital',
    ciudad: 'Arequipa',
    modalidad: 'Híbrido',
    jornada: 'Prácticas',
    horas: '20 h/semana',
    tipoContrato: 'Convenio de prácticas preprofesionales',
    carrera: 'Administración',
    diasPublicada: 2,
    resumen: 'Planificación de contenidos y campañas para redes sociales de la marca.',
    descripcion: 'Apoyarás al área comercial con contenidos y campañas para las redes sociales de la marca.',
    responsabilidades: [
      'Planificar el calendario de publicaciones.',
      'Diseñar piezas gráficas sencillas.',
      'Medir los resultados de cada campaña.'
    ],
    requisitos: [
      'Estudiante de Administración desde el 5.º ciclo.'
    ],
    obligatorias: ['Marketing digital', 'Redes sociales'],
    deseables: ['Canva'],
    microcertificaciones: [
      { nombre: 'Marketing digital', habilidad: 'Marketing digital' }
    ]
  },
  {
    id: 6,
    empresa: {
      nombre: 'Servicios Contables del Sur',
      iniciales: 'SC',
      rubro: 'Contabilidad',
      ciudad: 'Puerto Maldonado',
      descripcion: 'Estudio contable que atiende a pequeñas empresas de la región.',
      verificada: true
    },
    titulo: 'Practicante Contable',
    ciudad: 'Puerto Maldonado',
    modalidad: 'Presencial',
    jornada: 'Prácticas',
    horas: '24 h/semana',
    tipoContrato: 'Convenio de prácticas preprofesionales',
    carrera: 'Administración',
    diasPublicada: 4,
    resumen: 'Registro de operaciones, conciliaciones y apoyo en declaraciones mensuales.',
    descripcion: 'Aprenderás el día a día de un estudio contable apoyando en el registro de operaciones de nuestros clientes.',
    responsabilidades: [
      'Registrar compras y ventas.',
      'Preparar conciliaciones bancarias.',
      'Apoyar en las declaraciones mensuales.'
    ],
    requisitos: [
      'Estudiante de Administración desde el 6.º ciclo.'
    ],
    obligatorias: ['Excel', 'Contabilidad básica'],
    deseables: ['Facturación electrónica'],
    microcertificaciones: [
      { nombre: 'Excel básico', habilidad: 'Excel' }
    ]
  }
];
