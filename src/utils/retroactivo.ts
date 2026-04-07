// ============================================================
//  Lógica del cálculo del Retroactivo Previsional
//  Diferencias de haberes + intereses
// ============================================================

export type TasaInteres = 'pasiva_bcra' | 'activa_3_mensual' | 'afip_resarcitorio' | 'afip_punitorio';

export interface PagoEfectivo {
  fecha: string;  // 'YYYY-MM-DD'
  monto: number;
  descripcion?: string;
}

export interface MesRetroactivo {
  periodo: string;       // 'YYYY-MM'
  haberReclamado: number;
  haberPercibido: number;
  diferencia: number;    // reclamado - percibido (puede ser negativo)
  intereses: number;     // calculado
  total: number;         // diferencia + intereses
}

export interface ResultadoRetroactivo {
  meses: MesRetroactivo[];
  totalDiferencias: number;
  totalIntereses: number;
  totalBruto: number;
  pagoEfectivoTotal: number;
  saldoFinal: number;    // Total bruto - pagos efectivos recibidos
}

// Tasas de interés mensuales aproximadas (datos históricos SSS/BCRA)
// Tasa pasiva BCRA promedio * 1 (mensual acumulada)
const TASA_PASIVA_MENSUAL: Record<string, number> = {
  '2021': 0.0244, '2022': 0.0418, '2023': 0.0730, '2024': 0.0530,
};

const TASA_ACTIVA_3_MENSUAL = 0.01; // 1% mensual fija (Fallo Villarreal, CSJN)

const AFIP_RESARCITORIA: Record<string, number> = {
  '2021': 0.0278, '2022': 0.0500, '2023': 0.0900, '2024': 0.0700,
};

const AFIP_PUNITORIA: Record<string, number> = {
  '2021': 0.0417, '2022': 0.0750, '2023': 0.1350, '2024': 0.1050,
};

function getTasaMensual(periodo: string, tasa: TasaInteres): number {
  const year = periodo.slice(0, 4);
  switch (tasa) {
    case 'pasiva_bcra':       return TASA_PASIVA_MENSUAL[year]    ?? 0.04;
    case 'activa_3_mensual':  return TASA_ACTIVA_3_MENSUAL;
    case 'afip_resarcitorio': return AFIP_RESARCITORIA[year]      ?? 0.05;
    case 'afip_punitorio':    return AFIP_PUNITORIA[year]         ?? 0.075;
  }
}

// Meses transcurridos desde un período hasta hoy (para calcular intereses)
function mesesTranscurridos(periodoDesde: string, periodoHasta: string): number {
  const [y1, m1] = periodoDesde.split('-').map(Number);
  const [y2, m2] = periodoHasta.split('-').map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}

export function calcularRetroactivo(
  mesesIngresados: Array<{ periodo: string; haberReclamado: number; haberPercibido: number }>,
  tasa: TasaInteres,
  fechaLiquidacion: string,   // 'YYYY-MM'
  pagosEfectivos: PagoEfectivo[],
  descontarObraSocial: boolean = true,
  porcentajeObraSocial: number = 3
): ResultadoRetroactivo {
  const meses: MesRetroactivo[] = mesesIngresados.map(m => {
    const diferencia = m.haberReclamado - m.haberPercibido;
    const meses_ = mesesTranscurridos(m.periodo, fechaLiquidacion);
    const tasaMensual = getTasaMensual(m.periodo, tasa);
    
    // Interés compuesto mensual sobre la diferencia
    const intereses = meses_ > 0
      ? diferencia * (Math.pow(1 + tasaMensual, meses_) - 1)
      : 0;

    return {
      periodo: m.periodo,
      haberReclamado: Math.round(m.haberReclamado * 100) / 100,
      haberPercibido: Math.round(m.haberPercibido * 100) / 100,
      diferencia: Math.round(diferencia * 100) / 100,
      intereses: Math.round(intereses * 100) / 100,
      total: Math.round((diferencia + intereses) * 100) / 100,
    };
  });

  const totalDiferencias = meses.reduce((s, m) => s + m.diferencia, 0);
  const totalIntereses    = meses.reduce((s, m) => s + m.intereses, 0);
  let totalBruto          = totalDiferencias + totalIntereses;

  if (descontarObraSocial && totalBruto > 0) {
    totalBruto = totalBruto * (1 - porcentajeObraSocial / 100);
  }

  const pagoEfectivoTotal = pagosEfectivos.reduce((s, p) => s + p.monto, 0);
  const saldoFinal        = totalBruto - pagoEfectivoTotal;

  return {
    meses,
    totalDiferencias: Math.round(totalDiferencias * 100) / 100,
    totalIntereses:   Math.round(totalIntereses * 100) / 100,
    totalBruto:       Math.round(totalBruto * 100) / 100,
    pagoEfectivoTotal: Math.round(pagoEfectivoTotal * 100) / 100,
    saldoFinal:       Math.round(saldoFinal * 100) / 100,
  };
}

export function generarMesesRetroactivo(
  periodoDesde: string,
  periodoHasta: string
): Array<{ periodo: string; haberReclamado: number; haberPercibido: number }> {
  const result = [];
  let [y, m] = periodoDesde.split('-').map(Number);
  const [yF, mF] = periodoHasta.split('-').map(Number);

  while (y < yF || (y === yF && m <= mF)) {
    result.push({
      periodo: `${y}-${String(m).padStart(2, '0')}`,
      haberReclamado: 0,
      haberPercibido: 0,
    });
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return result;
}

export const TASAS_OPCIONES: { value: TasaInteres; label: string; descripcion: string }[] = [
  {
    value: 'pasiva_bcra',
    label: 'Tasa Pasiva BCRA',
    descripcion: 'Tasa pasiva promedio publicada por el BCRA. Criterio CSJN "Cipolla".',
  },
  {
    value: 'activa_3_mensual',
    label: 'Tasa Activa + 1% Mensual',
    descripcion: 'Tasa pasiva + 1% mensual adicional. Base Com. A 14290 del BCRA.',
  },
  {
    value: 'afip_resarcitorio',
    label: 'Tasa AFIP Resarcitoria',
    descripcion: 'Tasa resarcitoria publicada por AFIP según Res. 589/2019.',
  },
  {
    value: 'afip_punitorio',
    label: 'Tasa AFIP Punitoria',
    descripcion: 'Tasa punitoria (moratorio + interés) Res. 589/2019 de AFIP.',
  },
];

export function formatPeriodo(periodo: string): string {
  const [y, m] = periodo.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${months[parseInt(m) - 1]} ${y}`;
}

export function formatCurrency(v: number): string {
  return `$ ${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
