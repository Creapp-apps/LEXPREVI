// ============================================================
//  Motor de Reajustes por Fallos Jurisprudenciales
//  Fuente: CSJN, CNASS, Diario Previsional
// ============================================================

export type FalloId =
  | 'badaro'
  | 'alaniz'
  | 'delaude'
  | 'elliff'
  | 'vergara'
  | 'marinati'
  | 'vargas'
  | 'liechtenstein';

export interface FalloInfo {
  id: FalloId;
  nombre: string;
  tribunal: string;
  anio: string;
  categoria: 'movilidad' | 'haber_inicial' | 'pbu' | 'autonomos';
  descripcion: string;
  detalle: string;
  referencia: string;
  color: string;
}

export const FALLOS: FalloInfo[] = [
  {
    id: 'badaro',
    nombre: 'Badaro, Adolfo Valentín',
    tribunal: 'CSJN',
    anio: '2007',
    categoria: 'movilidad',
    descripcion: 'Movilidad del período 1995–2006 mediante índice de salarios (ISBIC)',
    detalle: 'La Corte estableció que el congelamiento de haberes entre 1995 y 2006 fue inconstitucional. Manda actualizar usando el índice de nivel general de salarios publicado por el INDEC.',
    referencia: 'Fallos 330:4866',
    color: '#3b82f6',
  },
  {
    id: 'alaniz',
    nombre: 'Alaniz, Saturnino Evaristo',
    tribunal: 'CNASS',
    anio: '2020',
    categoria: 'movilidad',
    descripcion: 'Movilidad de marzo 2020 al 35.55% en lugar del 6.12% de ANSES',
    detalle: 'La Cámara fijó que el aumento de marzo 2020 (Ley 27.609 suspendida) debió ser del 35.55% (IPC 4T 2019 = 12.5% + movilidad real). ANSES pagó solo 6.12%.',
    referencia: 'CAS 2020',
    color: '#8b5cf6',
  },
  {
    id: 'delaude',
    nombre: 'Delaude, Nilda',
    tribunal: 'CNASS',
    anio: '2021',
    categoria: 'movilidad',
    descripcion: 'Recomposición del haber a Enero 2021 aplicando Ley 27.426 sobre Dic 2019',
    detalle: 'Manda recalcular el haber de diciembre de 2019 y desde ahí aplicar sumatorias de aumentos de la Ley 27.426 (los que hubieran correspondido en 2020), recomponiendo el haber a enero de 2021.',
    referencia: 'SAP N°21.087',
    color: '#10b981',
  },
  {
    id: 'elliff',
    nombre: 'Elliff, Alberto José',
    tribunal: 'CSJN',
    anio: '2009',
    categoria: 'haber_inicial',
    descripcion: 'Actualización del promedio de remuneraciones usando RIPTE en lugar de topes fijos',
    detalle: 'La CSJN estableció que las remuneraciones para el cálculo del haber inicial deben actualizarse usando el RIPTE (Remuneración Imponible Promedio Trabajadores Estables), no índices inferiores.',
    referencia: 'Fallos 332:1914',
    color: '#f59e0b',
  },
  {
    id: 'vergara',
    nombre: 'Vergara, Marta Beatriz',
    tribunal: 'CNASS',
    anio: '2023',
    categoria: 'haber_inicial',
    descripcion: 'Promedio mixto: últimas 60 cuotas de autónomo + 60 remuneraciones en dependencia',
    detalle: 'Para beneficiarios con aportes simultáneos o mixtos (dependencia y autónomo), el promedio se calcula por separado: promedio de las últimas 60 remuneraciones de dependencia + promedio de las últimas 60 rentas de autónomo.',
    referencia: 'CNASS Sala VI 2023',
    color: '#ef4444',
  },
  {
    id: 'marinati',
    nombre: 'Marinati, Nilda Ana',
    tribunal: 'CNASS',
    anio: '2023',
    categoria: 'pbu',
    descripcion: 'Reajuste de la PBU eliminando topes inconstitucionales en el cómputo',
    detalle: 'La Cámara ordenó reajustar la PBU sin aplicar los topes que limitan su cálculo confiscatoriamente, permitiendo utilizar los ciclos completos de cotización para determinar el monto correcto de la PBU.',
    referencia: 'CNASS Sala I 2023',
    color: '#06b6d4',
  },
  {
    id: 'vargas',
    nombre: 'Vargas, Aníbal',
    tribunal: 'CNASS',
    anio: '2022',
    categoria: 'pbu',
    descripcion: 'Reajuste PBU: análisis de incidencias PC y PAP para detectar confiscatoriedad',
    detalle: 'El fallo establece que si la incidencia de la PBU en el haber total es inferior a un umbral (confiscatoriedad inversa), debe recalcularse. Introduce la comparación entre PBU correcta vs PBU que percibía el actor.',
    referencia: 'CNASS Sala II 2022',
    color: '#84cc16',
  },
  {
    id: 'liechtenstein',
    nombre: 'Liechtenstein, Marcelo',
    tribunal: 'CNASS',
    anio: '2023',
    categoria: 'autonomos',
    descripcion: 'Confiscatoriedad de rentas actualizadas para autónomos: fórmula de corrección',
    detalle: 'Para trabajadores autónomos, si la renta actualizada supera en más del 15% el valor máximo del aporte a la fecha de solicitud, no se aplica el tope. Se evalúa la confiscatoriedad de cada renta individualmente.',
    referencia: 'CNASS Sala III 2023',
    color: '#f97316',
  },
];

// ──────────────────────────────────────────
//  Datos históricos ISBIC (Badaro 1995–2006)
// ──────────────────────────────────────────
// Coeficiente de actualización acumulado respecto a mar-1995
export const ISBIC_COEFICIENTES: Record<string, number> = {
  '1995-03': 1.000, '1995-12': 1.022, '1996-12': 1.036, '1997-12': 1.051,
  '1998-12': 1.058, '1999-12': 1.042, '2000-12': 1.035, '2001-12': 1.020,
  '2002-12': 1.085, '2003-12': 1.155, '2004-12': 1.271, '2005-12': 1.398,
  '2006-09': 1.533, '2006-12': 1.591,
};

// ──────────────────────────────────────────
//  Aumentos Ley 27.426 en 2020 (para Delaude)
//  Suma de los 4 aumentos que HUBIERAN correspondido
// ──────────────────────────────────────────
const AUMENTOS_27426_2020 = [
  { mes: 'Mar 2020', pct: 13.43 },
  { mes: 'Jun 2020', pct: 7.48  },
  { mes: 'Sep 2020', pct: 7.50  },
  { mes: 'Dic 2020', pct: 5.71  },
];

// ──────────────────────────────────────────
//  RIPTE para Elliff (encadenado, base 1984)
// ──────────────────────────────────────────
export const RIPTE_POR_ANIO: Record<string, number> = {
  '1994': 100, '1995': 101.5, '1996': 102.8, '1997': 105.6, '1998': 106.4,
  '1999': 104.9, '2000': 103.7, '2001': 101.8, '2002': 107.2, '2003': 118.9,
  '2004': 134.1, '2005': 152.7, '2006': 175.4, '2007': 207.2, '2008': 259.3,
};

// ──────────────────────────────────────────
//  CÁLCULOS ESPECÍFICOS POR FALLO
// ──────────────────────────────────────────

/** BADARO: dado un haber en marzo de 1995, calcula el reajustado a una fecha destino */
export function calcularBadaro(haberMar1995: number, fechaDestino: string) {
  const coefDestino = ISBIC_COEFICIENTES[fechaDestino] ?? ISBIC_COEFICIENTES['2006-12'];
  const haberReajustado = haberMar1995 * coefDestino;
  const diferencia      = haberReajustado - haberMar1995;
  const pctAumento      = ((coefDestino - 1) * 100);

  return {
    haberOriginal:   haberMar1995,
    coeficiente:     coefDestino,
    haberReajustado: Math.round(haberReajustado * 100) / 100,
    diferencia:      Math.round(diferencia * 100) / 100,
    pctAumento:      Math.round(pctAumento * 10) / 10,
    pasos: Object.entries(ISBIC_COEFICIENTES).map(([fecha, coef]) => ({
      fecha,
      coef,
      haber: Math.round(haberMar1995 * coef * 100) / 100,
    })),
  };
}

/** ALANIZ: dado el haber de feb 2020, simula el 35.55% vs ANSES 6.12% */
export function calcularAlaniz(haberFeb2020: number) {
  const haberConFallo  = haberFeb2020 * 1.3555;
  const haberConANSES  = haberFeb2020 * 1.0612;
  const diferenciaMar  = haberConFallo - haberConANSES;

  return {
    haberFeb2020,
    haberConANSES:  Math.round(haberConANSES * 100) / 100,
    haberConFallo:  Math.round(haberConFallo * 100) / 100,
    diferenciaMar:  Math.round(diferenciaMar * 100) / 100,
    pctFallo:  35.55,
    pctANSES:   6.12,
    mejora: Math.round(((haberConFallo / haberConANSES) - 1) * 100 * 10) / 10,
  };
}

/** DELAUDE: recalcula el haber aplicando los 4 aumentos de Ley 27.426 sobre dic 2019 */
export function calcularDelaude(haberDic2019: number) {
  let haber = haberDic2019;
  const pasos: { mes: string; pct: number; haberResultante: number }[] = [];

  for (const a of AUMENTOS_27426_2020) {
    haber = haber * (1 + a.pct / 100);
    pasos.push({ mes: a.mes, pct: a.pct, haberResultante: Math.round(haber * 100) / 100 });
  }

  const totalPct = ((haber / haberDic2019) - 1) * 100;

  return {
    haberDic2019,
    haberEnero2021: Math.round(haber * 100) / 100,
    totalPct:       Math.round(totalPct * 10) / 10,
    pasos,
    aumentos: AUMENTOS_27426_2020,
  };
}

/** ELLIFF: actualiza remuneraciones con RIPTE entre año de percepción y año de solicitud */
export function calcularElliff(
  remuneracion: number,
  anioRemun: number,
  anioSolicitud: number
) {
  const ripteBase    = RIPTE_POR_ANIO[String(anioRemun)]    ?? 100;
  const ripteDestino = RIPTE_POR_ANIO[String(anioSolicitud)] ?? 207.2;
  const coef         = ripteDestino / ripteBase;
  const remActualizada = remuneracion * coef;

  return {
    remuneracion,
    anioRemun,
    anioSolicitud,
    ripteBase,
    ripteDestino,
    coeficiente:     Math.round(coef * 10000) / 10000,
    remActualizada:  Math.round(remActualizada * 100) / 100,
    diferencia:      Math.round((remActualizada - remuneracion) * 100) / 100,
  };
}

/** VERGARA: promedio mixto 60+60 */
export function calcularVergara(
  remsDependencia: number[],
  rentsAutonomo:   number[]
) {
  const sliceDep  = remsDependencia.slice(-60);
  const sliceAut  = rentsAutonomo.slice(-60);
  const promDep   = sliceDep.reduce((s, v) => s + v, 0) / (sliceDep.length || 1);
  const promAut   = sliceAut.reduce((s, v) => s + v, 0) / (sliceAut.length || 1);
  const promTotal = promDep + promAut;

  return {
    cantDep:   sliceDep.length,
    cantAut:   sliceAut.length,
    promDep:   Math.round(promDep * 100) / 100,
    promAut:   Math.round(promAut * 100) / 100,
    promTotal: Math.round(promTotal * 100) / 100,
  };
}

export type { FalloInfo as FalloInfoType };
