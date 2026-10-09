/*
 * Motor de Match — implementación de referencia de la fórmula v2 de
 * design.md §6.1, para mostrar el resultado en el prototipo.
 *
 * El cálculo oficial vive en el backend (services/matching.py, Antony).
 * Si la fórmula cambia allí, actualizar también esta función o, mejor,
 * leer el porcentaje que devuelva la API.
 *
 *   cobertura (60%) = Σ peso de habilidades que el estudiante tiene / Σ peso total
 *                     (peso 2 = obligatoria, 1 = deseable)
 *   nivel     (20%) = promedio de nivel/5 de las habilidades que coinciden
 *   disponibilidad (10%) = estudiante.disponibilidad === vacante.jornada
 *   modalidad (10%) = vacante remota o igual a la preferencia del estudiante
 */
(function () {
  'use strict';

  var PESO_OBLIGATORIA = 2;
  var PESO_DESEABLE = 1;

  function calcularMatch(estudiante, vacante) {
    var niveles = {};
    estudiante.habilidades.forEach(function (h) { niveles[h.nombre] = h.nivel; });

    var requeridas = vacante.obligatorias.map(function (n) { return { nombre: n, peso: PESO_OBLIGATORIA, obligatoria: true }; })
      .concat(vacante.deseables.map(function (n) { return { nombre: n, peso: PESO_DESEABLE, obligatoria: false }; }));

    var pesoTotal = 0;
    var pesoCubierto = 0;
    var sumaNiveles = 0;
    var coincidencias = [];
    var faltanObligatorias = [];

    requeridas.forEach(function (r) {
      pesoTotal += r.peso;
      if (niveles[r.nombre] !== undefined) {
        pesoCubierto += r.peso;
        sumaNiveles += niveles[r.nombre] / 5;
        coincidencias.push(r.nombre);
      } else if (r.obligatoria) {
        faltanObligatorias.push(r.nombre);
      }
    });

    var cobertura = pesoTotal === 0 ? 0 : pesoCubierto / pesoTotal;
    var nivel = coincidencias.length === 0 ? 0 : sumaNiveles / coincidencias.length;
    var disponibilidad = estudiante.disponibilidad === vacante.jornada ? 1 : 0;
    var modalidad = vacante.modalidad === 'Remoto' || estudiante.modalidad === vacante.modalidad ? 1 : 0;

    var desglose = {
      habilidades: cobertura * 60,
      nivel: nivel * 20,
      disponibilidad: disponibilidad * 10,
      modalidad: modalidad * 10
    };

    return {
      porcentaje: Math.round(desglose.habilidades + desglose.nivel + desglose.disponibilidad + desglose.modalidad),
      desglose: desglose,
      coincidencias: coincidencias,
      faltanObligatorias: faltanObligatorias // RF-5.3: se muestran explícitamente
    };
  }

  /** Nivel visual del Match (guía de estilos): alto ≥ 75, medio ≥ 50, bajo. */
  function nivelMatch(porcentaje) {
    if (porcentaje >= 75) return { clase: 'match--alto', texto: 'Match alto' };
    if (porcentaje >= 50) return { clase: 'match--medio', texto: 'Match medio' };
    return { clase: 'match--bajo', texto: 'Match bajo' };
  }

  window.MatchTMDD = { calcularMatch: calcularMatch, nivelMatch: nivelMatch };
})();
