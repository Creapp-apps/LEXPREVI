// Tipos y lógica central del cálculo del Haber Inicial
// Según Ley 24.241 (SIJP)

export interface Remuneracion {
  periodo: string; // 'YYYY-MM'
  importe: number;
  tipo: 'dependencia' | 'autonomo';
  actualizada?: number; // Calculado, no ingresado
}

export interface DatosBeneficiario {
  apellidoNombre: string;
  cuil: string;
  fechaNacimiento: string;
  sexo: 'M' | 'F';
  fechaCese: string;         // Fecha de baja laboral
  fechaSolicitud: string;    // Fecha de solicitud del beneficio
  aportesDependencia: number; // Años de aporte en relación de dependencia (post-94)
  aportesAutonomo: number;   // Años de aporte autónomos (post-94)
  aportesAnte94: number;     // Años totales de servicios computados hasta 30/06/1994
}

export interface ResultadoHaber {
  pbu: number;
  pc: number;
  pap: number;
  haberBruto: number;
  haberMaximo: number;
  haberFinal: number;
  promedioRemuneraciones: number;
  confiscatorio: boolean;
  porcentajeConfiscatoriedad: number;
}

// PBU vigente (actualizable)
export const PBU_BASE = 89632.86; // Valor a Diciembre 2024 aprox.
export const HABER_MAXIMO = 2184406.42; // Tope máximo Dec 2024

// Tasas de PC y PAP (1.5% por año de aporte)
const TASA_ANUAL = 0.015;

/**
 * Calcula el Haber Inicial según la Ley 24.241
 */
export function calcularHaberInicial(
  datos: DatosBeneficiario,
  remuneraciones: Remuneracion[]
): ResultadoHaber {
  // Promedio de remuneraciones actualizadas (máximo 120 meses)
  const rems = remuneraciones
    .slice(0, 120)
    .filter(r => r.importe > 0);
  
  const promedioRemuneraciones = rems.length > 0
    ? rems.reduce((sum, r) => sum + r.importe, 0) / rems.length
    : 0;

  // PBU (suma fija)
  const pbu = PBU_BASE;

  // PC (Prestación Compensatoria) - aportes pre-1994
  // PC = 1.5% * años_ante_94 * promedio_rem
  const pc = TASA_ANUAL * datos.aportesAnte94 * promedioRemuneraciones;

  // PAP (Prestación Adicional por Permanencia) - aportes post-1994
  const anosPost94 = datos.aportesDependencia + datos.aportesAutonomo;
  const pap = TASA_ANUAL * anosPost94 * promedioRemuneraciones;

  const haberBruto = pbu + pc + pap;

  // Verificar tope máximo
  const haberFinal = Math.min(haberBruto, HABER_MAXIMO);
  const confiscatorio = haberBruto > HABER_MAXIMO;
  const porcentajeConfiscatoriedad = confiscatorio 
    ? ((haberBruto - HABER_MAXIMO) / haberBruto) * 100 
    : 0;

  return {
    pbu,
    pc: Math.round(pc * 100) / 100,
    pap: Math.round(pap * 100) / 100,
    haberBruto: Math.round(haberBruto * 100) / 100,
    haberMaximo: HABER_MAXIMO,
    haberFinal: Math.round(haberFinal * 100) / 100,
    promedioRemuneraciones: Math.round(promedioRemuneraciones * 100) / 100,
    confiscatorio,
    porcentajeConfiscatoriedad: Math.round(porcentajeConfiscatoriedad * 100) / 100,
  };
}

/**
 * Genera 120 meses hacia atrás desde una fecha dada (para inicializar la grilla)
 */
export function generarPeriodos(fechaCese: string): Remuneracion[] {
  const periodos: Remuneracion[] = [];
  const [year, month] = fechaCese.split('-').map(Number);
  let date = new Date(year, month - 1, 1);

  for (let i = 0; i < 120; i++) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    periodos.unshift({
      periodo: `${y}-${m}`,
      importe: 0,
      tipo: 'dependencia',
    });
    date.setMonth(date.getMonth() - 1);
  }
  return periodos;
}

export function formatCurrency(value: number): string {
  return `$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPeriodo(periodo: string): string {
  const [y, m] = periodo.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${months[parseInt(m) - 1]} ${y}`;
}
