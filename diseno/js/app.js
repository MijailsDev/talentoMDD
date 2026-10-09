/*
 * TalentoMDD — comportamiento del prototipo del panel público.
 * JavaScript sin dependencias. Cada página declara <body data-pagina="...">.
 *
 * Seguridad: los datos (que en el futuro vendrán de la API) se insertan
 * siempre con textContent, nunca con innerHTML. El único innerHTML del
 * archivo es el de los iconos, que son constantes de este mismo archivo.
 */
(function () {
  'use strict';

  /**
   * Almacén de la sesión del navegador: guarda lo que la empresa hace en el
   * prototipo (publicar, cerrar vacantes, cambiar estados) mientras no exista
   * la API. Puede fallar (modo privado, almacenamiento bloqueado): en ese caso
   * el prototipo sigue funcionando sin recordar los cambios.
   */
  var almacen = {
    leer: function (clave, porDefecto) {
      try {
        var valor = sessionStorage.getItem(clave);
        return valor ? JSON.parse(valor) : porDefecto;
      } catch (e) {
        return porDefecto;
      }
    },
    guardar: function (clave, valor) {
      try { sessionStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin persistencia */ }
    }
  };
  var CLAVE_VACANTES_PUBLICADAS = 'tmdd_vacantes_publicadas';
  var CLAVE_ESTADO_VACANTES = 'tmdd_estado_vacantes';

  /** Vacantes de ejemplo + las publicadas en esta sesión, con su estado actual. */
  function todasLasVacantes() {
    var estados = almacen.leer(CLAVE_ESTADO_VACANTES, {});
    return (window.VACANTES_MOCK || []).concat(almacen.leer(CLAVE_VACANTES_PUBLICADAS, []))
      .map(function (v) { return estados[v.id] ? Object.assign({}, v, { estado: estados[v.id] }) : v; });
  }

  // El panel público solo muestra vacantes activas (RF-6.10).
  var VACANTES = todasLasVacantes().filter(function (v) { return v.estado === 'activa'; });

  // ------------------------------------------------------------------
  // Utilidades
  // ------------------------------------------------------------------

  var ICONOS = {
    lupa: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',
    ubicacion: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"></path><circle cx="12" cy="9.5" r="2.5"></circle>',
    maletin: '<rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>',
    reloj: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"></path>',
    medalla: '<circle cx="12" cy="9" r="6"></circle><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"></path>',
    verificado: '<circle cx="12" cy="12" r="9"></circle><path d="m8 12 3 3 5-6"></path>',
    check: '<path d="m5 12 5 5L20 7"></path>',
    alerta: '<path d="M12 3 2 20h20L12 3z"></path><path d="M12 10v4M12 17h.01"></path>',
    chevron: '<path d="m6 9 6 6 6-6"></path>'
  };

  function icono(nombre) {
    var plantilla = document.createElement('template');
    plantilla.innerHTML = '<svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      ICONOS[nombre] + '</svg>';
    return plantilla.content.firstChild;
  }

  /** Crea un elemento. `hijos` puede incluir textos (se insertan como texto plano). */
  function el(etiqueta, atributos, hijos) {
    var nodo = document.createElement(etiqueta);
    Object.keys(atributos || {}).forEach(function (clave) {
      var valor = atributos[clave];
      if (clave === 'class') nodo.className = valor;
      else if (clave === 'text') nodo.textContent = valor;
      else nodo.setAttribute(clave, valor);
    });
    (hijos || []).forEach(function (hijo) {
      nodo.append(typeof hijo === 'string' ? document.createTextNode(hijo) : hijo);
    });
    return nodo;
  }

  function textoFecha(dias) {
    if (dias <= 0) return 'hoy';
    if (dias === 1) return 'hace 1 día';
    if (dias < 7) return 'hace ' + dias + ' días';
    if (dias < 14) return 'hace 1 semana';
    return 'hace ' + Math.floor(dias / 7) + ' semanas';
  }

  function habilidadesDe(v) {
    return v.obligatorias.concat(v.deseables);
  }

  function normalizar(texto) {
    return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }

  function buscarVacante(id) {
    return VACANTES.filter(function (v) { return v.id === id; })[0] || null;
  }

  /**
   * Solo se permite volver a páginas internas conocidas, para evitar
   * redirecciones abiertas (tasks.md 2.36).
   */
  var RUTAS_DE_RETORNO = /^(index\.html|explorar\.html|vacante\.html\?id=\d+)$/;
  function rutaDeRetorno(valor) {
    return valor && RUTAS_DE_RETORNO.test(valor) ? valor : null;
  }

  function idDeRuta(ruta) {
    var coincidencia = /id=(\d+)/.exec(ruta || '');
    return coincidencia ? Number(coincidencia[1]) : null;
  }

  // ------------------------------------------------------------------
  // Componentes
  // ------------------------------------------------------------------

  /** Tarjeta de vacante (design.md §7.3). */
  function crearTarjeta(v) {
    var habilidades = habilidadesDe(v);
    var chips = habilidades.slice(0, 3).map(function (h) {
      return el('li', { class: 'chip', text: h });
    });
    if (habilidades.length > 3) {
      chips.push(el('li', { class: 'chip chip--mas', text: '+' + (habilidades.length - 3) }));
    }

    var enlace = el('a', {
      class: 'btn btn--secundario',
      href: 'vacante.html?id=' + v.id,
      'aria-label': 'Ver detalles: ' + v.titulo + ', ' + v.empresa.nombre
    }, ['Ver detalles', icono('flecha')]);

    return el('article', { class: 'tarjeta' }, [
      el('div', { class: 'tarjeta__cabecera' }, [
        el('span', { class: 'avatar-empresa', 'aria-hidden': 'true', text: v.empresa.iniciales }),
        el('div', { class: 'tarjeta__empresa' }, [
          el('strong', { text: v.empresa.nombre }),
          el('span', { class: 'tarjeta__fecha', text: 'Publicado ' + textoFecha(v.diasPublicada) })
        ])
      ]),
      el('h3', { text: v.titulo }),
      el('ul', { class: 'meta', 'aria-label': 'Datos de la vacante' }, [
        el('li', {}, [icono('ubicacion'), v.ciudad]),
        el('li', {}, [icono('maletin'), v.modalidad]),
        el('li', {}, [icono('reloj'), v.jornada])
      ]),
      el('p', { class: 'tarjeta__descripcion', text: v.resumen }),
      el('ul', { class: 'chips', 'aria-label': 'Habilidades requeridas' }, chips),
      enlace
    ]);
  }

  function pintarLista(contenedor, lista, vacio) {
    contenedor.replaceChildren.apply(contenedor, lista.map(crearTarjeta));
    if (vacio) vacio.hidden = lista.length > 0;
  }

  /** Grupo de píldoras de filtro (botones con aria-pressed, selección única). */
  function grupoFiltros(contenedor, alCambiar) {
    var botones = Array.prototype.slice.call(contenedor.querySelectorAll('.filtro'));
    function marcar(valor) {
      botones.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.valor === valor)); });
    }
    botones.forEach(function (boton) {
      boton.addEventListener('click', function () {
        marcar(boton.dataset.valor);
        alCambiar(boton.dataset.valor);
      });
    });
    return { marcar: marcar };
  }

  /** Menú de navegación en celular. */
  function iniciarMenu() {
    var boton = document.querySelector('.menu-boton');
    var menu = document.getElementById('menu-principal');
    if (!boton || !menu) return;

    function cerrar() {
      menu.classList.remove('menu--abierto');
      boton.setAttribute('aria-expanded', 'false');
      boton.setAttribute('aria-label', 'Abrir menú');
    }
    boton.addEventListener('click', function () {
      var abierto = menu.classList.toggle('menu--abierto');
      boton.setAttribute('aria-expanded', String(abierto));
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('menu--abierto')) {
        cerrar();
        boton.focus();
      }
    });
  }

  /**
   * Validación visual de formularios. Solo revisa campos visibles.
   * Reglas: data-validar="requerido" | "correo" | "clave" | "url" | "casilla".
   */
  function validar(formulario) {
    var primeroInvalido = null;
    var campos = formulario.querySelectorAll('[data-validar]');
    Array.prototype.forEach.call(campos, function (campo) {
      if (campo.closest('[hidden]')) return;
      var valor = campo.type === 'checkbox' ? campo.checked : campo.value.trim();
      var valido;
      switch (campo.dataset.validar) {
        case 'correo': valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor); break;
        case 'clave': valido = valor.length >= 8; break;
        case 'url': valido = valor === '' || /^https?:\/\/\S+\.\S+/.test(valor); break;
        case 'casilla': valido = valor === true; break;
        case 'ruc': valido = /^\d{11}$/.test(valor); break;
        default: valido = valor !== '';
      }
      var contenedor = campo.closest('.campo') || campo.closest('.casilla');
      if (contenedor) contenedor.classList.toggle('campo--error', !valido);
      campo.setAttribute('aria-invalid', String(!valido));
      if (!valido && !primeroInvalido) primeroInvalido = campo;
    });
    if (primeroInvalido) primeroInvalido.focus();
    return !primeroInvalido;
  }

  function limpiarErrorAlEscribir(formulario) {
    formulario.addEventListener('input', function (e) {
      var contenedor = e.target.closest('.campo--error');
      if (contenedor) {
        contenedor.classList.remove('campo--error');
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }

  // ------------------------------------------------------------------
  // Páginas
  // ------------------------------------------------------------------

  function paginaInicio() {
    var lista = document.getElementById('lista-recientes');
    var vacio = document.getElementById('vacio-recientes');
    var recientes = VACANTES.slice().sort(function (a, b) { return a.diasPublicada - b.diasPublicada; });

    function pintar(modalidad) {
      var filtradas = recientes.filter(function (v) {
        return modalidad === 'todas' || v.modalidad === modalidad;
      });
      pintarLista(lista, filtradas.slice(0, 6), vacio);
    }
    grupoFiltros(document.getElementById('filtro-modalidad'), pintar);
    pintar('todas');
  }

  function paginaExplorar() {
    var params = new URLSearchParams(location.search);
    var tipo = params.get('tipo');
    var estado = {
      q: params.get('q') || '',
      donde: params.get('donde') || '',
      modalidad: params.get('modalidad') || 'todas',
      jornada: tipo && tipo !== 'Todas' ? tipo : 'todas',
      carrera: 'todas'
    };

    var formulario = document.getElementById('form-buscar');
    var campoQ = document.getElementById('q');
    var campoDonde = document.getElementById('donde');
    var selectCarrera = document.getElementById('carrera');
    var lista = document.getElementById('lista-resultados');
    var vacio = document.getElementById('vacio-resultados');
    var conteo = document.getElementById('conteo');
    var panel = document.getElementById('panel-filtros');

    campoQ.value = estado.q;
    campoDonde.value = estado.donde;

    var filtrosModalidad = grupoFiltros(document.getElementById('filtro-modalidad'), function (valor) {
      estado.modalidad = valor; pintar();
    });
    var filtrosJornada = grupoFiltros(document.getElementById('filtro-jornada'), function (valor) {
      estado.jornada = valor; pintar();
    });
    filtrosModalidad.marcar(estado.modalidad);
    filtrosJornada.marcar(estado.jornada);

    selectCarrera.addEventListener('change', function () {
      estado.carrera = selectCarrera.value; pintar();
    });

    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      estado.q = campoQ.value.trim();
      estado.donde = campoDonde.value.trim();
      var url = new URL(location.href);
      url.search = '';
      if (estado.q) url.searchParams.set('q', estado.q);
      if (estado.donde) url.searchParams.set('donde', estado.donde);
      history.replaceState(null, '', url);
      pintar();
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-accion="limpiar"]'), function (boton) {
      boton.addEventListener('click', function () {
        estado = { q: '', donde: '', modalidad: 'todas', jornada: 'todas', carrera: 'todas' };
        campoQ.value = '';
        campoDonde.value = '';
        selectCarrera.value = 'todas';
        filtrosModalidad.marcar('todas');
        filtrosJornada.marcar('todas');
        history.replaceState(null, '', location.pathname);
        pintar();
      });
    });

    // Filtros abiertos en escritorio, plegados en celular.
    var escritorio = window.matchMedia('(min-width: 1024px)');
    panel.open = escritorio.matches;

    function pintar() {
      var q = normalizar(estado.q);
      var donde = normalizar(estado.donde);
      var resultados = VACANTES.filter(function (v) {
        var pajar = normalizar([v.titulo, v.empresa.nombre, v.ciudad, v.carrera].concat(habilidadesDe(v)).join(' '));
        var coincideTexto = !q || q.split(/\s+/).every(function (palabra) { return pajar.indexOf(palabra) !== -1; });
        var coincideDonde = !donde || normalizar(v.ciudad).indexOf(donde) !== -1 ||
          (donde === 'remoto' && v.modalidad === 'Remoto');
        return coincideTexto && coincideDonde &&
          (estado.modalidad === 'todas' || v.modalidad === estado.modalidad) &&
          (estado.jornada === 'todas' || v.jornada === estado.jornada) &&
          (estado.carrera === 'todas' || v.carrera === estado.carrera);
      }).sort(function (a, b) { return a.diasPublicada - b.diasPublicada; });

      var n = resultados.length;
      conteo.textContent = n === 1 ? '1 oportunidad encontrada' : n + ' oportunidades encontradas';
      pintarLista(lista, resultados, vacio);
    }
    pintar();
  }

  function paginaDetalle() {
    var id = Number(new URLSearchParams(location.search).get('id')) || 1;
    var v = buscarVacante(id);
    if (!v) {
      document.getElementById('detalle').hidden = true;
      document.getElementById('no-encontrada').hidden = false;
      return;
    }

    document.title = v.titulo + ' — ' + v.empresa.nombre + ' | TalentoMDD';

    function poner(campo, texto) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-campo="' + campo + '"]'), function (n) {
        n.textContent = texto;
      });
    }
    poner('titulo', v.titulo);
    poner('empresa', v.empresa.nombre);
    poner('iniciales', v.empresa.iniciales);
    poner('descripcion', v.descripcion);
    poner('empresa-descripcion', v.empresa.descripcion);
    poner('empresa-rubro', v.empresa.rubro + ' · ' + v.empresa.ciudad);

    document.getElementById('v-meta').replaceChildren(
      el('li', {}, [icono('ubicacion'), v.ciudad]),
      el('li', {}, [icono('maletin'), v.modalidad]),
      el('li', {}, [icono('reloj'), v.jornada + ' · ' + v.horas]),
      el('li', { class: 'meta__secundario', text: 'Publicado ' + textoFecha(v.diasPublicada) })
    );

    function lista(idLista, items) {
      document.getElementById(idLista).replaceChildren.apply(
        document.getElementById(idLista),
        items.map(function (t) { return el('li', { text: t }); })
      );
    }
    lista('v-responsabilidades', v.responsabilidades);
    lista('v-requisitos', v.requisitos);

    document.getElementById('v-obligatorias').replaceChildren.apply(
      document.getElementById('v-obligatorias'),
      v.obligatorias.map(function (h) { return el('li', { class: 'chip chip--obligatoria', text: h }); })
    );
    var bloqueDeseables = document.getElementById('bloque-deseables');
    bloqueDeseables.hidden = v.deseables.length === 0;
    document.getElementById('v-deseables').replaceChildren.apply(
      document.getElementById('v-deseables'),
      v.deseables.map(function (h) { return el('li', { class: 'chip chip--deseable', text: h }); })
    );

    var seccionMicros = document.getElementById('seccion-micros');
    seccionMicros.hidden = v.microcertificaciones.length === 0;
    document.getElementById('v-micros').replaceChildren.apply(
      document.getElementById('v-micros'),
      v.microcertificaciones.map(function (m) {
        return el('li', { class: 'micro' }, [
          el('span', { class: 'micro__icono', 'aria-hidden': 'true' }, [icono('medalla')]),
          el('span', {}, [el('strong', { text: m.nombre }), el('span', { text: 'Valida la habilidad ' + m.habilidad })])
        ]);
      })
    );

    var resumen = [
      ['Ubicación', v.ciudad],
      ['Modalidad', v.modalidad],
      ['Jornada', v.jornada + ' (' + v.horas + ')'],
      ['Contrato', v.tipoContrato],
      ['Carrera', v.carrera]
    ];
    var dl = document.getElementById('v-resumen');
    dl.replaceChildren();
    resumen.forEach(function (fila) {
      dl.append(el('dt', { text: fila[0] }), el('dd', { text: fila[1] }));
    });

    // Postular / Contactar sin sesión → registro, con regreso a esta vacante (RF-6.7).
    var volver = encodeURIComponent('vacante.html?id=' + v.id);
    document.querySelector('[data-accion="postular"]').href = 'acceso.html?accion=postular&volver=' + volver;
    document.querySelector('[data-accion="contactar"]').href = 'acceso.html?accion=contactar&volver=' + volver;
    document.querySelector('[data-accion="ver-match"]').href = 'acceso.html?volver=' + volver;
    document.querySelector('[data-accion="otras"]').href = 'explorar.html?q=' + encodeURIComponent(v.empresa.nombre);
  }

  function paginaAcceso() {
    var params = new URLSearchParams(location.search);
    var volver = rutaDeRetorno(params.get('volver'));
    var accion = params.get('accion');

    // Contexto: a qué vacante vuelve el usuario.
    var vacante = buscarVacante(idDeRuta(volver));
    var bloqueVacante = document.getElementById('ctx-vacante');
    if (vacante) {
      document.getElementById('ctx-etiqueta').textContent =
        accion === 'contactar' ? 'Quieres contactar a' : 'Estás postulando a';
      document.getElementById('ctx-iniciales').textContent = vacante.empresa.iniciales;
      document.getElementById('ctx-titulo').textContent = vacante.titulo;
      document.getElementById('ctx-detalle').textContent =
        vacante.empresa.nombre + ' · ' + vacante.modalidad + ' · ' + vacante.ciudad;
      document.getElementById('ctx-volver').hidden = false;
    } else {
      bloqueVacante.hidden = true;
    }

    // Pestañas
    var pestanas = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
    function seleccionar(pestana, enfocar) {
      pestanas.forEach(function (p) {
        var activa = p === pestana;
        p.setAttribute('aria-selected', String(activa));
        p.tabIndex = activa ? 0 : -1;
        document.getElementById(p.getAttribute('aria-controls')).hidden = !activa;
      });
      if (enfocar) pestana.focus();
    }
    pestanas.forEach(function (p, i) {
      p.addEventListener('click', function () { seleccionar(p); });
      p.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          var siguiente = pestanas[(i + (e.key === 'ArrowRight' ? 1 : pestanas.length - 1)) % pestanas.length];
          seleccionar(siguiente, true);
        }
      });
    });
    var pestanaLogin = document.getElementById('tab-login');
    var pestanaRegistro = document.getElementById('tab-registro');
    seleccionar(params.get('tab') === 'login' ? pestanaLogin : pestanaRegistro);
    document.getElementById('ir-registro').addEventListener('click', function () {
      seleccionar(pestanaRegistro, true);
    });

    // Rol: estudiante / empresa
    var radiosRol = document.querySelectorAll('input[name="rol"]');
    function mostrarRol(rol) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-panel-rol]'), function (panel) {
        panel.hidden = panel.dataset.panelRol !== rol;
      });
    }
    Array.prototype.forEach.call(radiosRol, function (radio) {
      radio.addEventListener('change', function () { mostrarRol(radio.value); });
    });
    if (params.get('rol') === 'empresa') document.getElementById('rol-empresa').checked = true;
    mostrarRol(document.querySelector('input[name="rol"]:checked').value);

    // Envíos (prototipo: no hay autenticación real todavía)
    var formLogin = document.getElementById('form-login');
    var formRegistro = document.getElementById('form-registro');
    limpiarErrorAlEscribir(formLogin);
    limpiarErrorAlEscribir(formRegistro);

    formLogin.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validar(formLogin)) return;
      var inicioPorRol = params.get('rol') === 'empresa' ? 'empresa-vacantes.html' : 'index.html';
      location.href = volver || inicioPorRol;
    });

    formRegistro.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validar(formRegistro)) return;
      var rol = document.querySelector('input[name="rol"]:checked').value;
      if (rol === 'estudiante') {
        location.href = 'completar-perfil.html' + (volver ? '?volver=' + encodeURIComponent(volver) : '');
      } else {
        formRegistro.hidden = true;
        var exito = document.getElementById('exito-empresa');
        exito.hidden = false;
        exito.focus();
      }
    });
  }

  function paginaPerfil() {
    var volver = rutaDeRetorno(new URLSearchParams(location.search).get('volver'));
    var pasos = Array.prototype.slice.call(document.querySelectorAll('.paso'));
    var indicadores = Array.prototype.slice.call(document.querySelectorAll('.indicador-pasos li'));
    var barra = document.getElementById('barra-progreso');
    var relleno = barra.querySelector('.barra-progreso__relleno');
    var botonAtras = document.getElementById('paso-atras');
    var botonSiguiente = document.getElementById('paso-siguiente');
    var finales = document.getElementById('acciones-finales');
    var formulario = document.getElementById('form-perfil');
    var actual = 0;

    var destino = volver || 'explorar.html';
    document.getElementById('finalizar').href = destino;
    document.getElementById('omitir').href = destino;
    document.getElementById('finalizar').textContent = volver ? 'Finalizar y volver a la vacante' : 'Finalizar y ver vacantes';

    function mostrar(i, enfocar) {
      actual = i;
      pasos.forEach(function (paso, j) { paso.hidden = j !== i; });
      indicadores.forEach(function (li, j) {
        li.classList.toggle('hecho', j < i);
        if (j === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        li.querySelector('.indicador-pasos__numero').textContent = j < i ? '✓' : String(j + 1);
      });
      var porcentaje = Math.round(((i + 1) / pasos.length) * 100);
      relleno.style.width = porcentaje + '%';
      barra.setAttribute('aria-valuenow', String(porcentaje));
      botonAtras.hidden = i === 0;
      botonSiguiente.hidden = i === pasos.length - 1;
      finales.hidden = i !== pasos.length - 1;
      if (enfocar) pasos[i].querySelector('h2').focus();
    }

    botonSiguiente.addEventListener('click', function () {
      if (!validar(pasos[actual])) return;
      if (actual === 1 && habilidades.length === 0) {
        errorHabilidad('Agrega al menos una habilidad para continuar.');
        return;
      }
      mostrar(actual + 1, true);
    });
    botonAtras.addEventListener('click', function () { mostrar(actual - 1, true); });
    formulario.addEventListener('submit', function (e) { e.preventDefault(); });
    limpiarErrorAlEscribir(formulario);

    grupoFiltros(document.getElementById('filtro-disponibilidad'), function () {});
    grupoFiltros(document.getElementById('filtro-modalidad-pref'), function () {});

    // Habilidades: solo del catálogo (RF-1.5), con nivel 1–5.
    var catalogo = [];
    VACANTES.forEach(function (v) {
      habilidadesDe(v).forEach(function (h) { if (catalogo.indexOf(h) === -1) catalogo.push(h); });
    });
    ['Python', 'Figma', 'HTML y CSS', 'Power BI'].forEach(function (h) {
      if (catalogo.indexOf(h) === -1) catalogo.push(h);
    });
    catalogo.sort(function (a, b) { return a.localeCompare(b, 'es'); });
    var datalist = document.getElementById('catalogo-habilidades');
    catalogo.forEach(function (h) { datalist.append(el('option', { value: h })); });

    var habilidades = [{ nombre: 'JavaScript', nivel: 3 }, { nombre: 'Git', nivel: 2 }, { nombre: 'SQL', nivel: 3 }];
    var listaHabilidades = document.getElementById('lista-habilidades');
    var sugerencias = document.getElementById('sugerencias');
    var campoHabilidad = document.getElementById('nueva-habilidad');
    var selectMicroHabilidad = document.getElementById('m-habilidad');

    function errorHabilidad(mensaje) {
      var contenedor = campoHabilidad.closest('.campo');
      contenedor.querySelector('.campo__error').textContent = mensaje;
      contenedor.classList.add('campo--error');
      campoHabilidad.focus();
    }

    function agregar(nombre) {
      var encontrada = catalogo.filter(function (h) { return normalizar(h) === normalizar(nombre); })[0];
      if (!encontrada) { errorHabilidad('Elige una habilidad de la lista del catálogo.'); return; }
      if (habilidades.some(function (h) { return h.nombre === encontrada; })) {
        errorHabilidad(encontrada + ' ya está en tu perfil.');
        return;
      }
      habilidades.push({ nombre: encontrada, nivel: 1 });
      campoHabilidad.value = '';
      campoHabilidad.closest('.campo').classList.remove('campo--error');
      pintarHabilidades();
    }

    function pintarHabilidades() {
      listaHabilidades.replaceChildren.apply(listaHabilidades, habilidades.map(function (h, idx) {
        var niveles = [1, 2, 3, 4, 5].map(function (n) {
          var boton = el('button', {
            type: 'button',
            class: 'nivel' + (n <= h.nivel ? ' activo' : ''),
            'aria-pressed': String(n === h.nivel),
            'aria-label': 'Nivel ' + n + ' de 5',
            text: String(n)
          });
          boton.addEventListener('click', function () { h.nivel = n; pintarHabilidades(); });
          return boton;
        });
        var quitar = el('button', { type: 'button', class: 'boton-texto', 'aria-label': 'Quitar ' + h.nombre, text: 'Quitar' });
        quitar.addEventListener('click', function () { habilidades.splice(idx, 1); pintarHabilidades(); });
        return el('li', { class: 'habilidad' }, [
          el('span', { class: 'habilidad__nombre', text: h.nombre }),
          el('div', { class: 'niveles', role: 'group', 'aria-label': 'Nivel de ' + h.nombre }, niveles),
          quitar
        ]);
      }));

      var tiene = habilidades.map(function (h) { return h.nombre; });
      var sugeridas = ['React', 'Excel', 'Python', 'Power BI', 'Figma', 'HTML y CSS']
        .filter(function (h) { return tiene.indexOf(h) === -1; }).slice(0, 5);
      sugerencias.replaceChildren.apply(sugerencias, sugeridas.map(function (h) {
        var b = el('button', { type: 'button', class: 'filtro sugerencia', 'aria-label': 'Agregar ' + h, text: '+ ' + h });
        b.addEventListener('click', function () { agregar(h); });
        return b;
      }));

      // La microcertificación solo puede respaldar habilidades del perfil.
      selectMicroHabilidad.replaceChildren.apply(selectMicroHabilidad,
        [el('option', { value: '', text: 'Selecciona una habilidad' })].concat(
          tiene.map(function (h) { return el('option', { value: h, text: h }); })
        ));
    }

    document.getElementById('agregar-habilidad').addEventListener('click', function () {
      agregar(campoHabilidad.value);
    });
    campoHabilidad.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); agregar(campoHabilidad.value); }
    });
    pintarHabilidades();

    // Microcertificaciones agregadas
    var listaMicros = document.getElementById('lista-micros');
    document.getElementById('agregar-micro').addEventListener('click', function () {
      var bloque = document.getElementById('bloque-micro');
      if (!validar(bloque)) return;
      var nombre = document.getElementById('m-nombre').value.trim();
      var habilidad = selectMicroHabilidad.value;
      var entidad = document.getElementById('m-entidad').value.trim();
      listaMicros.append(el('li', { class: 'micro' }, [
        el('span', { class: 'micro__icono', 'aria-hidden': 'true' }, [icono('medalla')]),
        el('span', {}, [el('strong', { text: nombre }), el('span', { text: habilidad + ' · ' + entidad })])
      ]));
      Array.prototype.forEach.call(bloque.querySelectorAll('input'), function (i) { i.value = ''; });
      selectMicroHabilidad.value = '';
      document.getElementById('m-nombre').focus();
    });

    mostrar(0);
  }

  // ------------------------------------------------------------------
  // Arranque
  // ------------------------------------------------------------------

  // Utilidades compartidas con js/empresa.js, que registra sus propias páginas.
  window.TMDD = {
    el: el,
    icono: icono,
    textoFecha: textoFecha,
    habilidadesDe: habilidadesDe,
    normalizar: normalizar,
    crearTarjeta: crearTarjeta,
    grupoFiltros: grupoFiltros,
    validar: validar,
    limpiarErrorAlEscribir: limpiarErrorAlEscribir,
    almacen: almacen,
    todasLasVacantes: todasLasVacantes,
    CLAVE_VACANTES_PUBLICADAS: CLAVE_VACANTES_PUBLICADAS,
    CLAVE_ESTADO_VACANTES: CLAVE_ESTADO_VACANTES,
    paginas: {
      inicio: paginaInicio,
      explorar: paginaExplorar,
      detalle: paginaDetalle,
      acceso: paginaAcceso,
      perfil: paginaPerfil
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    iniciarMenu();
    var pagina = window.TMDD.paginas[document.body.dataset.pagina];
    if (pagina) pagina();
  });
})();
