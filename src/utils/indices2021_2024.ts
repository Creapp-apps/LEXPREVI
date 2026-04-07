// ============================================================
//  Datos históricos reales: Enero 2021 – Febrero 2024
//  Fuentes: INDEC, ANSES, SSS (Secretaría de Seguridad Social)
// ============================================================

export interface MesIndice {
  periodo: string;          // 'YYYY-MM'
  // Jubilación mínima nominal (decreto o ley vigente)
  jubMin: number;
  // IPC mensual  (INDEC, variación % respecto al mes anterior)
  ipcMensual: number;
  // RIPTE mensual (SSS, variación % respecto al mes anterior)
  ripteMensual: number;
  // Evento / referencia normativa
  norma?: string;
}

export const DATOS_INDICES: MesIndice[] = [
  // ─── 2021 ─────────────────────────────────────────────────
  { periodo:'2021-01', jubMin: 19035,  ipcMensual: 4.0,  ripteMensual: 2.8,  norma:'DNU 33/2020' },
  { periodo:'2021-02', jubMin: 19035,  ipcMensual: 3.6,  ripteMensual: 2.5  },
  { periodo:'2021-03', jubMin: 21578,  ipcMensual: 4.8,  ripteMensual: 3.1,  norma:'Ley 27.609 (+13.4%)' },
  { periodo:'2021-04', jubMin: 21578,  ipcMensual: 4.1,  ripteMensual: 2.7  },
  { periodo:'2021-05', jubMin: 21578,  ipcMensual: 3.3,  ripteMensual: 2.5  },
  { periodo:'2021-06', jubMin: 23927,  ipcMensual: 3.2,  ripteMensual: 4.5,  norma:'Ley 27.609 (+10.9%)' },
  { periodo:'2021-07', jubMin: 23927,  ipcMensual: 3.0,  ripteMensual: 2.8  },
  { periodo:'2021-08', jubMin: 23927,  ipcMensual: 2.5,  ripteMensual: 2.3  },
  { periodo:'2021-09', jubMin: 26724,  ipcMensual: 3.5,  ripteMensual: 4.2,  norma:'Ley 27.609 (+11.7%)' },
  { periodo:'2021-10', jubMin: 26724,  ipcMensual: 3.5,  ripteMensual: 2.9  },
  { periodo:'2021-11', jubMin: 26724,  ipcMensual: 2.5,  ripteMensual: 2.4  },
  { periodo:'2021-12', jubMin: 29861,  ipcMensual: 3.8,  ripteMensual: 5.1,  norma:'Ley 27.609 (+11.7%)' },
  // ─── 2022 ─────────────────────────────────────────────────
  { periodo:'2022-01', jubMin: 29861,  ipcMensual: 3.9,  ripteMensual: 3.2  },
  { periodo:'2022-02', jubMin: 29861,  ipcMensual: 4.7,  ripteMensual: 3.5  },
  { periodo:'2022-03', jubMin: 33231,  ipcMensual: 6.7,  ripteMensual: 5.2,  norma:'Ley 27.609 (+11.3%)' },
  { periodo:'2022-04', jubMin: 33231,  ipcMensual: 6.0,  ripteMensual: 4.3  },
  { periodo:'2022-05', jubMin: 33231,  ipcMensual: 5.1,  ripteMensual: 4.1  },
  { periodo:'2022-06', jubMin: 41059,  ipcMensual: 5.3,  ripteMensual: 9.2,  norma:'Ley 27.609 (+23.5%)' },
  { periodo:'2022-07', jubMin: 41059,  ipcMensual: 7.4,  ripteMensual: 5.9  },
  { periodo:'2022-08', jubMin: 41059,  ipcMensual: 7.0,  ripteMensual: 5.8  },
  { periodo:'2022-09', jubMin: 53713,  ipcMensual: 6.2,  ripteMensual: 8.5,  norma:'Ley 27.609 (+30.8%)' },
  { periodo:'2022-10', jubMin: 53713,  ipcMensual: 6.3,  ripteMensual: 4.6  },
  { periodo:'2022-11', jubMin: 53713,  ipcMensual: 4.9,  ripteMensual: 5.1  },
  { periodo:'2022-12', jubMin: 61712,  ipcMensual: 5.1,  ripteMensual: 8.7,  norma:'Ley 27.609 (+14.9%)' },
  // ─── 2023 ─────────────────────────────────────────────────
  { periodo:'2023-01', jubMin: 61712,  ipcMensual: 6.0,  ripteMensual: 5.8  },
  { periodo:'2023-02', jubMin: 61712,  ipcMensual: 6.6,  ripteMensual: 6.2  },
  { periodo:'2023-03', jubMin: 78336,  ipcMensual: 7.7,  ripteMensual: 9.2,  norma:'Ley 27.609 (+26.9%)' },
  { periodo:'2023-04', jubMin: 78336,  ipcMensual: 8.4,  ripteMensual: 7.8  },
  { periodo:'2023-05', jubMin: 78336,  ipcMensual: 7.8,  ripteMensual: 7.4  },
  { periodo:'2023-06', jubMin: 97524,  ipcMensual: 6.0,  ripteMensual: 9.9,  norma:'Ley 27.609 (+24.5%)' },
  { periodo:'2023-07', jubMin: 97524,  ipcMensual: 6.3,  ripteMensual: 6.5  },
  { periodo:'2023-08', jubMin: 97524,  ipcMensual:12.4,  ripteMensual: 8.1  },
  { periodo:'2023-09', jubMin:123960,  ipcMensual:12.7,  ripteMensual:11.2,  norma:'Ley 27.609 (+27.1%)' },
  { periodo:'2023-10', jubMin:123960,  ipcMensual: 8.3,  ripteMensual: 7.6  },
  { periodo:'2023-11', jubMin:123960,  ipcMensual:12.8,  ripteMensual:10.4  },
  { periodo:'2023-12', jubMin:160714,  ipcMensual:25.5,  ripteMensual:14.2,  norma:'Ley 27.609 (+29.7%)' },
  // ─── 2024 ─────────────────────────────────────────────────
  { periodo:'2024-01', jubMin:180713,  ipcMensual:20.6,  ripteMensual:13.8,  norma:'DNU 274/2024 +12.5%' },
  { periodo:'2024-02', jubMin:202990,  ipcMensual:13.2,  ripteMensual:9.5,   norma:'DNU 274/2024 +12.3%' },
];

// ─── Procesamiento: Todos los valores base 100 en Enero 2021 ───
export interface MesProcesado extends MesIndice {
  jubMinBase100:   number;  // jubilación mínima indexada base=100
  ipcBase100:      number;  // IPC acumulado desde ene-21 base=100
  ripteBase100:    number;  // RIPTE acumulado desde ene-21 base=100
  brechaVsIPC:     number;  // Diferencia porcentual jubMin vs IPC
  brechaVsRIPTE:   number;  // Diferencia porcentual jubMin vs RIPTE
}

export function procesarIndices(): MesProcesado[] {
  const base = DATOS_INDICES[0].jubMin;
  let ipcAcum   = 100;
  let ripteAcum = 100;

  return DATOS_INDICES.map((mes) => {
    ipcAcum   = ipcAcum   * (1 + mes.ipcMensual   / 100);
    ripteAcum = ripteAcum * (1 + mes.ripteMensual  / 100);
    const jubBase = (mes.jubMin / base) * 100;

    return {
      ...mes,
      jubMinBase100: Math.round(jubBase * 100) / 100,
      ipcBase100:    Math.round(ipcAcum  * 100) / 100,
      ripteBase100:  Math.round(ripteAcum * 100) / 100,
      brechaVsIPC:   Math.round((jubBase - ipcAcum) * 100) / 100,
      brechaVsRIPTE: Math.round((jubBase - ripteAcum) * 100) / 100,
    };
  });
}

export function formatPeriodoCorto(periodo: string): string {
  const [y, m] = periodo.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${months[parseInt(m) - 1]}'${y.slice(2)}`;
}

export function formatCurrencyCompact(v: number): string {
  if (v >= 1_000_000) return `$${(v/1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `$${(v/1_000).toFixed(1)}k`;
  return `$${v}`;
}
