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
    estado: 'activa', // vacantes.estado: activa | cerrada | oculta
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
    estado: 'activa', // vacantes.estado: activa | cerrada | oculta
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
    estado: 'activa', // vacantes.estado: activa | cerrada | oculta
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
    estado: 'activa', // vacantes.estado: activa | cerrada | oculta
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
    estado: 'activa', // vacantes.estado: activa | cerrada | oculta
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
    estado: 'activa', // vacantes.estado: activa | cerrada | oculta
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
  },
  {
    id: 7,
    estado: 'activa',
    empresa: {
      nombre: 'Selva Digital S.A.C.',
      iniciales: 'SD',
      rubro: 'Desarrollo de software',
      ciudad: 'Puerto Maldonado',
      descripcion: 'Empresa de desarrollo de software que crea soluciones web para comercios y negocios de turismo de la región.',
      verificada: true
    },
    titulo: 'Practicante de Soporte de Sistemas',
    ciudad: 'Puerto Maldonado',
    modalidad: 'Presencial',
    jornada: 'Prácticas',
    horas: '20 h/semana',
    tipoContrato: 'Convenio de prácticas preprofesionales',
    carrera: 'Ingeniería de Sistemas',
    diasPublicada: 10,
    resumen: 'Soporte a los equipos de la oficina y a los clientes que usan nuestros sistemas.',
    descripcion: 'Atenderás las consultas técnicas de nuestros clientes y mantendrás los equipos de la oficina.',
    responsabilidades: [
      'Atender consultas de clientes por teléfono y correo.',
      'Instalar y configurar equipos de la oficina.'
    ],
    requisitos: [
      'Estudiante de Ingeniería de Sistemas desde el 4.º ciclo.'
    ],
    obligatorias: ['Windows', 'Redes'],
    deseables: ['Atención al cliente'],
    microcertificaciones: [
      { nombre: 'Redes básicas', habilidad: 'Redes' }
    ]
  },
  {
    id: 8,
    estado: 'cerrada', // no aparece en el panel público (RF-6.10)
    empresa: {
      nombre: 'Selva Digital S.A.C.',
      iniciales: 'SD',
      rubro: 'Desarrollo de software',
      ciudad: 'Puerto Maldonado',
      descripcion: 'Empresa de desarrollo de software que crea soluciones web para comercios y negocios de turismo de la región.',
      verificada: true
    },
    titulo: 'Diseñador UI Junior',
    ciudad: 'Remoto',
    modalidad: 'Remoto',
    jornada: 'Medio tiempo',
    horas: '24 h/semana',
    tipoContrato: 'Contrato a plazo fijo',
    carrera: 'Ingeniería de Sistemas',
    diasPublicada: 30,
    resumen: 'Diseño de pantallas para aplicaciones web y móviles.',
    descripcion: 'Diseñarás pantallas y prototipos para los proyectos de nuestros clientes.',
    responsabilidades: ['Diseñar pantallas en Figma.', 'Preparar prototipos para pruebas con usuarios.'],
    requisitos: ['Portafolio con al menos dos proyectos.'],
    obligatorias: ['Figma'],
    deseables: ['HTML y CSS'],
    microcertificaciones: []
  }
];

/*
 * ============================================================
 *  PANEL DE EMPRESA — DATOS DE EJEMPLO (MOCK)
 * ============================================================
 * Empresa con sesión iniciada en el prototipo. Reemplazar por la empresa
 * del usuario autenticado (JWT) cuando exista /auth/login.
 */
window.EMPRESA_SESION_MOCK = 'Selva Digital S.A.C.';

/*
 * Estudiantes que postularon (tabla estudiantes + estudiante_habilidades
 * + certificaciones). Nombres y correos ficticios.
 * disponibilidad ↔ vacantes.jornada; modalidad ↔ vacantes.modalidad (Match).
 */
window.ESTUDIANTES_MOCK = [
  {
    id: 101, nombre: 'Luis Quispe Mamani', iniciales: 'LQ', correo: 'luis.quispe@correo.example',
    carrera: 'Ingeniería de Sistemas', ciclo: '8.º ciclo', disponibilidad: 'Prácticas', modalidad: 'Híbrido',
    portafolio: 'https://github.com/ejemplo-luis',
    descripcion: 'Me interesa el desarrollo web. Hice el sistema de reservas de un hospedaje como proyecto de curso.',
    habilidades: [{ nombre: 'JavaScript', nivel: 4 }, { nombre: 'React', nivel: 3 }, { nombre: 'Git', nivel: 4 }, { nombre: 'SQL', nivel: 3 }],
    certificaciones: [{ nombre: 'SQL básico', habilidad: 'SQL', entidad: 'Centro de Idiomas y Cómputo', fecha: '2026-05' }]
  },
  {
    id: 102, nombre: 'Ana Lucía Torres', iniciales: 'AT', correo: 'ana.torres@correo.example',
    carrera: 'Ingeniería de Sistemas', ciclo: '9.º ciclo', disponibilidad: 'Prácticas', modalidad: 'Remoto',
    portafolio: 'https://github.com/ejemplo-ana',
    descripcion: 'Desarrolladora frontend con interés en diseño de interfaces.',
    habilidades: [{ nombre: 'JavaScript', nivel: 5 }, { nombre: 'React', nivel: 4 }, { nombre: 'Git', nivel: 3 }, { nombre: 'SQL', nivel: 2 }, { nombre: 'Figma', nivel: 4 }, { nombre: 'HTML y CSS', nivel: 5 }],
    certificaciones: [{ nombre: 'Git y GitHub esencial', habilidad: 'Git', entidad: 'Plataforma de cursos en línea', fecha: '2026-03' }]
  },
  {
    id: 103, nombre: 'Jorge Ccori Apaza', iniciales: 'JC', correo: 'jorge.ccori@correo.example',
    carrera: 'Ingeniería de Sistemas', ciclo: '6.º ciclo', disponibilidad: 'Medio tiempo', modalidad: 'Híbrido',
    portafolio: '',
    descripcion: 'Estudiante de sexto ciclo, aprendiendo React por mi cuenta.',
    habilidades: [{ nombre: 'JavaScript', nivel: 2 }, { nombre: 'React', nivel: 2 }, { nombre: 'Git', nivel: 2 }, { nombre: 'Windows', nivel: 4 }, { nombre: 'Redes', nivel: 3 }],
    certificaciones: []
  },
  {
    id: 104, nombre: 'María Fernanda Huamán', iniciales: 'MH', correo: 'maria.huaman@correo.example',
    carrera: 'Ingeniería de Sistemas', ciclo: '7.º ciclo', disponibilidad: 'Prácticas', modalidad: 'Presencial',
    portafolio: 'https://github.com/ejemplo-maria',
    descripcion: 'Me gusta trabajar con datos y bases de datos.',
    habilidades: [{ nombre: 'JavaScript', nivel: 3 }, { nombre: 'Git', nivel: 3 }, { nombre: 'SQL', nivel: 4 }, { nombre: 'Python', nivel: 3 }],
    certificaciones: [{ nombre: 'SQL básico', habilidad: 'SQL', entidad: 'Centro de Idiomas y Cómputo', fecha: '2026-02' }]
  },
  {
    id: 105, nombre: 'Rosa Condori Vargas', iniciales: 'RC', correo: 'rosa.condori@correo.example',
    carrera: 'Ingeniería de Sistemas', ciclo: '6.º ciclo', disponibilidad: 'Prácticas', modalidad: 'Híbrido',
    portafolio: '',
    descripcion: 'Busco mis primeras prácticas en desarrollo web.',
    habilidades: [{ nombre: 'JavaScript', nivel: 3 }, { nombre: 'Git', nivel: 2 }, { nombre: 'HTML y CSS', nivel: 4 }, { nombre: 'Atención al cliente', nivel: 3 }],
    certificaciones: []
  },
  {
    id: 106, nombre: 'Diego Ramírez Soto', iniciales: 'DR', correo: 'diego.ramirez@correo.example',
    carrera: 'Administración', ciclo: 'Egresado', disponibilidad: 'Tiempo completo', modalidad: 'Presencial',
    portafolio: '',
    descripcion: 'Egresado de Administración con interés en análisis de datos.',
    habilidades: [{ nombre: 'Excel', nivel: 4 }, { nombre: 'SQL', nivel: 3 }],
    certificaciones: [{ nombre: 'Excel básico', habilidad: 'Excel', entidad: 'Centro de Idiomas y Cómputo', fecha: '2025-11' }]
  }
];

/*
 * Postulaciones (tabla postulaciones + postulacion_historial).
 * estado: postulado | en_revision | entrevista | oferta | contratado | rechazado | retirado
 * El % de Match NO se guarda aquí: se calcula con js/matching.js (design.md §6).
 */
window.POSTULACIONES_MOCK = [
  { id: 1, estudianteId: 101, vacanteId: 1, estado: 'entrevista', diasDesde: 3,
    historial: [{ estado: 'postulado', dias: 3 }, { estado: 'en_revision', dias: 2 }, { estado: 'entrevista', dias: 1 }] },
  { id: 2, estudianteId: 102, vacanteId: 1, estado: 'en_revision', diasDesde: 2,
    historial: [{ estado: 'postulado', dias: 2 }, { estado: 'en_revision', dias: 1 }] },
  { id: 3, estudianteId: 103, vacanteId: 1, estado: 'postulado', diasDesde: 1,
    historial: [{ estado: 'postulado', dias: 1 }] },
  { id: 4, estudianteId: 104, vacanteId: 1, estado: 'postulado', diasDesde: 1,
    historial: [{ estado: 'postulado', dias: 1 }] },
  { id: 5, estudianteId: 105, vacanteId: 1, estado: 'postulado', diasDesde: 0,
    historial: [{ estado: 'postulado', dias: 0 }] },
  { id: 6, estudianteId: 106, vacanteId: 1, estado: 'rechazado', diasDesde: 3,
    historial: [{ estado: 'postulado', dias: 3 }, { estado: 'rechazado', dias: 2 }] },
  { id: 7, estudianteId: 103, vacanteId: 7, estado: 'en_revision', diasDesde: 6,
    historial: [{ estado: 'postulado', dias: 6 }, { estado: 'en_revision', dias: 4 }] },
  { id: 8, estudianteId: 105, vacanteId: 7, estado: 'postulado', diasDesde: 2,
    historial: [{ estado: 'postulado', dias: 2 }] },
  { id: 9, estudianteId: 102, vacanteId: 8, estado: 'contratado', diasDesde: 28,
    historial: [{ estado: 'postulado', dias: 28 }, { estado: 'en_revision', dias: 26 }, { estado: 'entrevista', dias: 22 }, { estado: 'oferta', dias: 18 }, { estado: 'contratado', dias: 15 }] }
];
