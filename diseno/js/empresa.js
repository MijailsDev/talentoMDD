/*
 * TalentoMDD — panel de empresa del prototipo (RF-2, RF-3.3 a RF-3.5, RF-5.2, RF-5.3).
 * Usa las utilidades de js/app.js (window.TMDD) y el Match de js/matching.js.
 * Debe cargarse después de app.js.
 */
(function () {
  'use strict';

  var T = window.TMDD;
  var el = T.el;
  var icono = T.icono;
  var EMPRESA = window.EMPRESA_SESION_MOCK;
  var CLAVE_POSTULACIONES = 'tmdd_postulaciones';

  var ESTADOS = {
    postulado: 'Nuevo',
    en_revision: 'En revisión',
    entrevista: 'Entrevista',
    oferta: 'Oferta',
    contratado: 'Contratado',
    rechazado: 'Rechazado',
    retirado: 'Retirado por el estudiante'
  };

  /*
   * Transiciones que puede hacer la EMPRESA. Copia de la regla de
   * cambiar_estado_postulacion() en database/schema.sql, sin 'retirado'
   * (eso solo lo hace el estudiante). La validación real es del backend.
   */
  var TRANSICIONES = {
    postulado: ['en_revision', 'rechazado'],
    en_revision: ['entrevista', 'rechazado'],
    entrevista: ['oferta', 'rechazado'],
    oferta: ['contratado', 'rechazado']
  };

  // ------------------------------------------------------------------
  // Datos
  // ------------------------------------------------------------------

  function vacantesDeEmpresa() {
    return T.todasLasVacantes().filter(function (v) { return v.empresa.nombre === EMPRESA; });
  }

  function postulaciones() {
    var cambios = T.almacen.leer(CLAVE_POSTULACIONES, {});
    return (window.POSTULACIONES_MOCK || []).map(function (p) {
      return cambios[p.id] ? Object.assign({}, p, cambios[p.id]) : p;
    });
  }

  function postulacionesDe(vacanteId) {
    return postulaciones().filter(function (p) { return p.vacanteId === vacanteId; });
  }

  function estudiante(id) {
    return (window.ESTUDIANTES_MOCK || []).filter(function (e) { return e.id === id; })[0];
  }

  function guardarEstadoPostulacion(postulacion, nuevoEstado) {
    var cambios = T.almacen.leer(CLAVE_POSTULACIONES, {});
    cambios[postulacion.id] = {
      estado: nuevoEstado,
      historial: postulacion.historial.concat([{ estado: nuevoEstado, dias: 0 }])
    };
    T.almacen.guardar(CLAVE_POSTULACIONES, cambios);
  }

  function pastillaEstado(estado) {
    return el('span', { class: 'estado estado--' + estado, text: ESTADOS[estado] || estado });
  }

  function plural(n, singular, varios) {
    return n + ' ' + (n === 1 ? singular : varios);
  }

  /** Catálogo de habilidades (en el sistema real: GET /admin/habilidades). */
  function catalogoHabilidades() {
    var catalogo = [];
    (window.VACANTES_MOCK || []).forEach(function (v) {
      T.habilidadesDe(v).forEach(function (h) { if (catalogo.indexOf(h) === -1) catalogo.push(h); });
    });
    (window.ESTUDIANTES_MOCK || []).forEach(function (e) {
      e.habilidades.forEach(function (h) { if (catalogo.indexOf(h.nombre) === -1) catalogo.push(h.nombre); });
    });
    return catalogo.sort(function (a, b) { return a.localeCompare(b, 'es'); });
  }

  // ------------------------------------------------------------------
  // Mis vacantes
  // ------------------------------------------------------------------

  function paginaMisVacantes() {
    var lista = document.getElementById('lista-mis-vacantes');
    var vacio = document.getElementById('vacio-mis-vacantes');
    var filtro = 'activa';

    var publicada = Number(new URLSearchParams(location.search).get('publicada'));
    if (publicada) document.getElementById('aviso-publicada').hidden = false;

    T.grupoFiltros(document.getElementById('filtro-estado-vacante'), function (valor) {
      filtro = valor;
      pintar();
    });

    function cambiarEstadoVacante(v) {
      var estados = T.almacen.leer(T.CLAVE_ESTADO_VACANTES, {});
      estados[v.id] = v.estado === 'activa' ? 'cerrada' : 'activa';
      T.almacen.guardar(T.CLAVE_ESTADO_VACANTES, estados);
      document.getElementById('anuncio').textContent =
        'La vacante ' + v.titulo + (estados[v.id] === 'activa' ? ' se reabrió.' : ' se cerró.');
      pintar();
    }

    function fila(v) {
      var postus = postulacionesDe(v.id);
      var nuevas = postus.filter(function (p) { return p.estado === 'postulado'; }).length;

      var acciones = [
        el('a', { class: 'btn btn--primario', href: 'empresa-candidatos.html?id=' + v.id },
          ['Ver candidatos (' + postus.length + ')'])
      ];
      if (v.estado === 'activa') {
        acciones.push(el('a', { class: 'enlace', href: 'vacante.html?id=' + v.id, text: 'Ver publicación' }));
      }
      var alternar = el('button', {
        type: 'button',
        class: 'boton-texto',
        text: v.estado === 'activa' ? 'Cerrar vacante' : 'Reabrir vacante'
      });
      alternar.addEventListener('click', function () { cambiarEstadoVacante(v); });
      acciones.push(alternar);

      return el('article', { class: 'fila-vacante' }, [
        el('div', { class: 'fila-vacante__principal' }, [
          el('div', { class: 'fila-vacante__titulo' }, [
            el('h3', {}, [el('a', { href: 'empresa-candidatos.html?id=' + v.id, text: v.titulo })]),
            pastillaEstado(v.estado === 'activa' ? 'activa' : 'cerrada')
          ]),
          el('ul', { class: 'meta', 'aria-label': 'Datos de la vacante' }, [
            el('li', {}, [icono('ubicacion'), v.ciudad]),
            el('li', {}, [icono('maletin'), v.modalidad]),
            el('li', {}, [icono('reloj'), v.jornada]),
            el('li', { text: 'Publicada ' + T.textoFecha(v.diasPublicada) })
          ])
        ]),
        el('p', { class: 'fila-vacante__numeros' }, [
          el('strong', { text: plural(postus.length, 'postulación', 'postulaciones') }),
          nuevas ? el('span', { class: 'contador-nuevas', text: plural(nuevas, 'nueva', 'nuevas') }) : ''
        ]),
        el('div', { class: 'fila-vacante__acciones' }, acciones)
      ]);
    }

    function pintar() {
      var vacantes = vacantesDeEmpresa();
      var todas = postulaciones();
      var ids = vacantes.map(function (v) { return v.id; });
      var recibidas = todas.filter(function (p) { return ids.indexOf(p.vacanteId) !== -1; });

      document.getElementById('stat-activas').textContent =
        vacantes.filter(function (v) { return v.estado === 'activa'; }).length;
      document.getElementById('stat-postulaciones').textContent = recibidas.length;
      document.getElementById('stat-nuevas').textContent =
        recibidas.filter(function (p) { return p.estado === 'postulado'; }).length;

      var visibles = vacantes
        .filter(function (v) { return filtro === 'todas' || v.estado === filtro; })
        .sort(function (a, b) { return a.diasPublicada - b.diasPublicada; });
      lista.replaceChildren.apply(lista, visibles.map(fila));
      vacio.hidden = visibles.length > 0;
    }
    pintar();
  }

  // ------------------------------------------------------------------
  // Publicar vacante (RF-2.2: requisitos con etiquetas, nunca texto libre)
  // ------------------------------------------------------------------

  function paginaPublicar() {
    var formulario = document.getElementById('form-publicar');
    var catalogo = catalogoHabilidades();
    var datalist = document.getElementById('pv-catalogo');
    catalogo.forEach(function (h) { datalist.append(el('option', { value: h })); });

    var estado = { modalidad: null, jornada: null, habilidades: [] };
    var campoCiudad = document.getElementById('pv-ciudad');
    var campoHabilidad = document.getElementById('pv-habilidad');
    var listaHabilidades = document.getElementById('pv-lista-habilidades');
    var bloqueHabilidades = document.getElementById('pv-bloque-habilidades');
    var vistaPrevia = document.getElementById('pv-vista-previa');
    var plantillaEmpresa = vacantesDeEmpresa()[0].empresa;

    T.grupoFiltros(document.getElementById('pv-modalidad'), function (valor) {
      estado.modalidad = valor;
      document.getElementById('pv-bloque-modalidad').classList.remove('campo--error');
      var remoto = valor === 'Remoto';
      campoCiudad.disabled = remoto;
      if (remoto) campoCiudad.removeAttribute('data-validar');
      else campoCiudad.setAttribute('data-validar', 'requerido');
      if (remoto) {
        campoCiudad.value = '';
        campoCiudad.closest('.campo').classList.remove('campo--error');
      }
      campoCiudad.placeholder = remoto ? 'No aplica: trabajo remoto' : 'Ej.: Puerto Maldonado';
      pintarVistaPrevia();
    });
    T.grupoFiltros(document.getElementById('pv-jornada'), function (valor) {
      estado.jornada = valor;
      document.getElementById('pv-bloque-jornada').classList.remove('campo--error');
      pintarVistaPrevia();
    });

    function mostrarErrorHabilidad(mensaje) {
      document.getElementById('pv-habilidad-error').textContent = mensaje;
      bloqueHabilidades.classList.add('campo--error');
    }

    function agregar(nombre) {
      var encontrada = catalogo.filter(function (h) { return T.normalizar(h) === T.normalizar(nombre); })[0];
      if (!encontrada) { mostrarErrorHabilidad('Elige una habilidad de la lista del catálogo.'); campoHabilidad.focus(); return; }
      if (estado.habilidades.some(function (h) { return h.nombre === encontrada; })) {
        mostrarErrorHabilidad(encontrada + ' ya está en la lista.');
        return;
      }
      estado.habilidades.push({ nombre: encontrada, obligatoria: true });
      campoHabilidad.value = '';
      bloqueHabilidades.classList.remove('campo--error');
      pintarHabilidades();
    }

    function pintarHabilidades() {
      listaHabilidades.replaceChildren.apply(listaHabilidades, estado.habilidades.map(function (h, idx) {
        var opciones = [[true, 'Obligatoria'], [false, 'Deseable']].map(function (op) {
          var boton = el('button', {
            type: 'button',
            class: 'segmentado__opcion',
            'aria-pressed': String(h.obligatoria === op[0]),
            text: op[1]
          });
          boton.addEventListener('click', function () { h.obligatoria = op[0]; pintarHabilidades(); });
          return boton;
        });
        var quitar = el('button', { type: 'button', class: 'boton-texto', 'aria-label': 'Quitar ' + h.nombre, text: 'Quitar' });
        quitar.addEventListener('click', function () { estado.habilidades.splice(idx, 1); pintarHabilidades(); });
        return el('li', { class: 'habilidad' }, [
          el('span', { class: 'habilidad__nombre', text: h.nombre }),
          el('div', { class: 'segmentado', role: 'group', 'aria-label': 'Importancia de ' + h.nombre }, opciones),
          quitar
        ]);
      }));
      document.getElementById('pv-sin-habilidades').hidden = estado.habilidades.length > 0;
      pintarVistaPrevia();
    }

    function borrador() {
      var valor = function (id) { return document.getElementById(id).value.trim(); };
      var lineas = function (id) {
        return valor(id).split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      };
      var descripcion = valor('pv-descripcion');
      return {
        id: Date.now(), // la API asignará el id real
        estado: 'activa',
        empresa: plantillaEmpresa,
        titulo: valor('pv-titulo') || 'Título del puesto',
        ciudad: estado.modalidad === 'Remoto' ? 'Remoto' : (valor('pv-ciudad') || 'Ciudad'),
        modalidad: estado.modalidad || 'Modalidad',
        jornada: estado.jornada || 'Jornada',
        horas: valor('pv-horas') ? valor('pv-horas') + ' h/semana' : 'Horas por definir',
        tipoContrato: document.getElementById('pv-contrato').value,
        carrera: document.getElementById('pv-carrera').value,
        diasPublicada: 0,
        resumen: descripcion.length > 140 ? descripcion.slice(0, 137) + '…' : (descripcion || 'La descripción breve aparecerá aquí.'),
        descripcion: descripcion,
        responsabilidades: lineas('pv-responsabilidades'),
        requisitos: lineas('pv-requisitos'),
        obligatorias: estado.habilidades.filter(function (h) { return h.obligatoria; }).map(function (h) { return h.nombre; }),
        deseables: estado.habilidades.filter(function (h) { return !h.obligatoria; }).map(function (h) { return h.nombre; }),
        microcertificaciones: []
      };
    }

    function pintarVistaPrevia() {
      vistaPrevia.replaceChildren(T.crearTarjeta(borrador()));
      // En la vista previa el botón no navega.
      var enlace = vistaPrevia.querySelector('a');
      enlace.removeAttribute('href');
      enlace.setAttribute('aria-disabled', 'true');
      enlace.tabIndex = -1;
    }

    document.getElementById('pv-agregar').addEventListener('click', function () { agregar(campoHabilidad.value); });
    campoHabilidad.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); agregar(campoHabilidad.value); }
    });
    formulario.addEventListener('input', pintarVistaPrevia);
    T.limpiarErrorAlEscribir(formulario);

    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      var valido = T.validar(formulario);
      var primerError = valido ? null : document.activeElement;

      [['modalidad', 'pv-bloque-modalidad'], ['jornada', 'pv-bloque-jornada']].forEach(function (par) {
        var falta = !estado[par[0]];
        document.getElementById(par[1]).classList.toggle('campo--error', falta);
        if (falta && !primerError) primerError = document.querySelector('#' + par[1] + ' .filtro');
      });
      if (estado.habilidades.length === 0) {
        // Igual que crear_vacante_con_requisitos(): sin requisitos no se publica.
        mostrarErrorHabilidad('Agrega al menos una habilidad requerida.');
        if (!primerError) primerError = campoHabilidad;
      }
      if (primerError) { primerError.focus(); return; }

      var nueva = borrador();
      var publicadas = T.almacen.leer(T.CLAVE_VACANTES_PUBLICADAS, []);
      publicadas.push(nueva);
      T.almacen.guardar(T.CLAVE_VACANTES_PUBLICADAS, publicadas);
      location.href = 'empresa-vacantes.html?publicada=' + nueva.id;
    });

    pintarHabilidades();
  }

  // ------------------------------------------------------------------
  // Candidatos de una vacante, ordenados por Match (RF-2.3, RF-5.2)
  // ------------------------------------------------------------------

  function paginaCandidatos() {
    var id = Number(new URLSearchParams(location.search).get('id')) || 1;
    var vacante = vacantesDeEmpresa().filter(function (v) { return v.id === id; })[0];
    if (!vacante) {
      document.getElementById('candidatos').hidden = true;
      document.getElementById('no-encontrada').hidden = false;
      return;
    }

    document.title = 'Candidatos: ' + vacante.titulo + ' | TalentoMDD';
    document.getElementById('c-titulo').textContent = vacante.titulo;
    document.getElementById('c-estado').replaceChildren(pastillaEstado(vacante.estado === 'activa' ? 'activa' : 'cerrada'));
    document.getElementById('c-meta').replaceChildren(
      el('li', {}, [icono('ubicacion'), vacante.ciudad]),
      el('li', {}, [icono('maletin'), vacante.modalidad]),
      el('li', {}, [icono('reloj'), vacante.jornada])
    );
    document.getElementById('c-obligatorias').replaceChildren.apply(
      document.getElementById('c-obligatorias'),
      vacante.obligatorias.map(function (h) { return el('li', { class: 'chip chip--obligatoria', text: h }); })
    );
    document.getElementById('c-deseables').replaceChildren.apply(
      document.getElementById('c-deseables'),
      vacante.deseables.map(function (h) { return el('li', { class: 'chip chip--deseable', text: h }); })
    );
    document.getElementById('c-bloque-deseables').hidden = vacante.deseables.length === 0;

    var lista = document.getElementById('lista-candidatos');
    var vacio = document.getElementById('vacio-candidatos');
    var conteo = document.getElementById('c-conteo');
    var anuncio = document.getElementById('anuncio');
    var selectEstado = document.getElementById('filtro-estado');
    var selectOrden = document.getElementById('orden-candidatos');
    selectEstado.addEventListener('change', pintar);
    selectOrden.addEventListener('change', pintar);

    function desglose(match) {
      var filas = [
        ['Habilidades', match.desglose.habilidades, 60],
        ['Nivel', match.desglose.nivel, 20],
        ['Disponibilidad', match.desglose.disponibilidad, 10],
        ['Modalidad', match.desglose.modalidad, 10]
      ];
      return el('dl', { class: 'desglose' }, filas.reduce(function (nodos, f) {
        var puntos = Math.round(f[1] * 10) / 10;
        var barra = el('div', { class: 'desglose__barra', 'aria-hidden': 'true' }, [el('span', {})]);
        barra.firstChild.style.width = (f[1] / f[2] * 100) + '%';
        return nodos.concat([
          el('dt', { text: f[0] }),
          el('dd', {}, [barra, el('span', { class: 'desglose__puntos', text: puntos + ' / ' + f[2] })])
        ]);
      }, []));
    }

    function tarjetaCandidato(p) {
      var e = estudiante(p.estudianteId);
      var match = window.MatchTMDD.calcularMatch(e, vacante);
      var nivel = window.MatchTMDD.nivelMatch(match.porcentaje);
      var niveles = {};
      e.habilidades.forEach(function (h) { niveles[h.nombre] = h.nivel; });

      // Habilidades de la vacante: cuáles cumple (con nivel) y cuáles le faltan.
      var chips = T.habilidadesDe(vacante).map(function (h) {
        return niveles[h] !== undefined
          ? el('li', { class: 'chip chip--cumple' }, [icono('check'), h + ' · ' + niveles[h] + '/5'])
          : el('li', { class: 'chip chip--falta', text: 'Sin ' + h });
      });

      var contenido = [
        el('div', { class: 'candidato__cabecera' }, [
          el('span', { class: 'avatar-empresa avatar-persona', 'aria-hidden': 'true', text: e.iniciales }),
          el('div', { class: 'candidato__nombre' }, [
            el('h3', { text: e.nombre }),
            el('span', { text: e.carrera + ' · ' + e.ciclo + ' · Postuló ' + T.textoFecha(p.diasDesde) })
          ]),
          el('div', { class: 'candidato__indicadores' }, [
            el('span', { class: 'match ' + nivel.clase, text: match.porcentaje + '% · ' + nivel.texto }),
            pastillaEstado(p.estado)
          ])
        ])
      ];

      if (match.faltanObligatorias.length) {
        contenido.push(el('p', { class: 'aviso aviso--alerta' }, [
          icono('alerta'),
          (match.faltanObligatorias.length === 1 ? 'Le falta una habilidad obligatoria: ' : 'Le faltan habilidades obligatorias: ') +
            match.faltanObligatorias.join(', ')
        ]));
      }

      contenido.push(el('ul', { class: 'chips', 'aria-label': 'Habilidades que pide la vacante' }, chips));

      // Perfil completo y desglose del Match
      var perfil = [
        el('div', { class: 'perfil-candidato__bloque' }, [el('h4', { text: '¿Por qué ' + match.porcentaje + '%?' }), desglose(match)]),
        el('div', { class: 'perfil-candidato__bloque' }, [
          el('h4', { text: 'Datos' }),
          el('dl', { class: 'resumen' }, [
            el('dt', { text: 'Disponibilidad' }), el('dd', { text: e.disponibilidad }),
            el('dt', { text: 'Modalidad' }), el('dd', { text: e.modalidad }),
            el('dt', { text: 'Correo' }), el('dd', {}, [el('a', { href: 'mailto:' + e.correo, text: e.correo })]),
            el('dt', { text: 'Portafolio' }),
            el('dd', {}, [e.portafolio
              ? el('a', { href: e.portafolio, target: '_blank', rel: 'noopener noreferrer', text: e.portafolio.replace(/^https?:\/\//, '') })
              : 'No registró'])
          ])
        ]),
        el('div', { class: 'perfil-candidato__bloque' }, [
          el('h4', { text: 'Todas sus habilidades' }),
          el('ul', { class: 'chips' }, e.habilidades.map(function (h) {
            return el('li', { class: 'chip', text: h.nombre + ' · ' + h.nivel + '/5' });
          }))
        ]),
        el('div', { class: 'perfil-candidato__bloque' }, [
          el('h4', { text: 'Microcertificaciones' }),
          e.certificaciones.length
            ? el('ul', { class: 'lista-simple' }, e.certificaciones.map(function (c) {
              return el('li', { text: c.nombre + ' (' + c.habilidad + ') — ' + c.entidad + ', ' + c.fecha });
            }))
            : el('p', { class: 'texto-secundario', text: 'Aún no registra microcertificaciones.' })
        ]),
        el('div', { class: 'perfil-candidato__bloque' }, [el('h4', { text: 'Sobre ' + e.nombre.split(' ')[0] }), el('p', { text: e.descripcion })]),
        el('div', { class: 'perfil-candidato__bloque' }, [
          el('h4', { text: 'Historial de la postulación' }),
          el('ol', { class: 'historial' }, p.historial.map(function (h) {
            return el('li', {}, [el('strong', { text: ESTADOS[h.estado] }), ' · ' + T.textoFecha(h.dias)]);
          }))
        ])
      ];
      contenido.push(el('details', { class: 'candidato__perfil' }, [
        el('summary', {}, ['Ver perfil y desglose del Match', icono('chevron')]),
        el('div', { class: 'perfil-candidato' }, perfil)
      ]));

      // Cambio de estado: solo transiciones válidas (RF-3.4)
      var siguientes = TRANSICIONES[p.estado] || [];
      if (siguientes.length) {
        var idSelect = 'estado-' + p.id;
        var select = el('select', { id: idSelect }, siguientes.map(function (s) {
          return el('option', { value: s, text: ESTADOS[s] });
        }));
        var boton = el('button', { type: 'button', class: 'btn btn--secundario', text: 'Actualizar estado' });
        boton.addEventListener('click', function () {
          var nuevo = select.value;
          if (nuevo === 'rechazado' && !window.confirm('¿Rechazar a ' + e.nombre + '? Esta decisión cierra su proceso para esta vacante.')) return;
          guardarEstadoPostulacion(p, nuevo);
          anuncio.textContent = 'Estado de ' + e.nombre + ' actualizado a ' + ESTADOS[nuevo] + '.';
          pintar();
          var actualizado = document.getElementById('candidato-' + p.id);
          if (actualizado) actualizado.querySelector('h3').focus();
        });
        contenido.push(el('div', { class: 'candidato__acciones' }, [
          el('label', { for: idSelect, text: 'Mover a' }), select, boton
        ]));
      } else {
        contenido.push(el('p', { class: 'candidato__final', text: 'Proceso finalizado para esta vacante.' }));
      }

      var tarjeta = el('li', { class: 'candidato', id: 'candidato-' + p.id }, contenido);
      tarjeta.querySelector('h3').tabIndex = -1;
      return { nodo: tarjeta, match: match.porcentaje, dias: p.diasDesde };
    }

    function pintar() {
      var todas = postulacionesDe(vacante.id);
      var filtro = selectEstado.value;
      var tarjetas = todas
        .filter(function (p) { return filtro === 'todos' || p.estado === filtro; })
        .map(tarjetaCandidato)
        .sort(function (a, b) {
          return selectOrden.value === 'recientes' ? a.dias - b.dias : b.match - a.match;
        });

      conteo.textContent = plural(todas.length, 'postulante', 'postulantes') +
        (filtro === 'todos' ? '' : ' · ' + plural(tarjetas.length, 'coincide', 'coinciden') + ' con el filtro');
      lista.replaceChildren.apply(lista, tarjetas.map(function (t) { return t.nodo; }));
      vacio.hidden = tarjetas.length > 0;
      document.getElementById('vacio-titulo').textContent = todas.length === 0
        ? 'Aún no hay postulantes para esta vacante'
        : 'No hay candidatos en este estado';
      document.getElementById('vacio-ayuda').textContent = todas.length === 0
        ? 'Cuando alguien postule aparecerá aquí, ordenado por Match.'
        : 'Cambia el filtro de estado para ver al resto.';
    }
    pintar();
  }

  T.paginas['empresa-vacantes'] = paginaMisVacantes;
  T.paginas['empresa-publicar'] = paginaPublicar;
  T.paginas['empresa-candidatos'] = paginaCandidatos;
})();
