export interface RateData {
  periodo: string;
  inflacion: number; // IPC del mes (publicado a mediados del mes siguiente)
  aumentoAplicado: number; // Porcentaje de aumento real en el haber
  bono?: number; // Bono extraordinario vigente
  descripcion?: string; // Opcional, para tooltips
}

// Simulacion de valores recientes de IPC y aumentos por DNU 274/2024
export const movilidadDNU2024: RateData[] = [
  { periodo: '2023-12', inflacion: 25.5, aumentoAplicado: 20.87, bono: 55000, descripcion: 'Aumento Ley 27.609' },
  { periodo: '2024-01', inflacion: 20.6, aumentoAplicado: 0, bono: 55000, descripcion: 'Sin aumento (absorbido)' },
  { periodo: '2024-02', inflacion: 13.2, aumentoAplicado: 0, bono: 55000, descripcion: 'Sin aumento' },
  { periodo: '2024-03', inflacion: 11.0, aumentoAplicado: 27.18, bono: 70000, descripcion: 'Aumento Ley de Movilidad' },
  { periodo: '2024-04', inflacion: 8.8, aumentoAplicado: 27.4, bono: 70000, descripcion: 'DNU 274/2024: IPC Feb (13.2%) + Empalme (12.5%)' },
  { periodo: '2024-05', inflacion: 4.2, aumentoAplicado: 11.0, bono: 70000, descripcion: 'DNU 274/2024: IPC Mar' },
  { periodo: '2024-06', inflacion: 4.6, aumentoAplicado: 8.8, bono: 70000, descripcion: 'DNU 274/2024: IPC Abr' },
  { periodo: '2024-07', inflacion: 4.0, aumentoAplicado: 4.2, bono: 70000, descripcion: 'DNU 274/2024: IPC May' },
  { periodo: '2024-08', inflacion: 4.2, aumentoAplicado: 4.6, bono: 70000, descripcion: 'DNU 274/2024: IPC Jun' },
  { periodo: '2024-09', inflacion: 3.5, aumentoAplicado: 4.0, bono: 70000, descripcion: 'DNU 274/2024: IPC Jul' },
  { periodo: '2024-10', inflacion: 2.7, aumentoAplicado: 4.2, bono: 70000, descripcion: 'DNU 274/2024: IPC Ago' },
  { periodo: '2024-11', inflacion: 2.5, aumentoAplicado: 3.5, bono: 70000, descripcion: 'DNU 274/2024: IPC Sep' },
  { periodo: '2024-12', inflacion: 2.5, aumentoAplicado: 2.7, bono: 70000, descripcion: 'DNU 274/2024: IPC Oct + Aguinaldo' },
];

export const calcularEmpalmeDNU = (haberInicial: number, periodoInicial: string) => {
  let haberActual = haberInicial;
  const historial = [];
  
  let started = false;
  
  for (const m of movilidadDNU2024) {
    if (m.periodo === periodoInicial) {
      started = true;
    }
    
    if (started) {
      const aumentoMonto = haberActual * (m.aumentoAplicado / 100);
      haberActual = haberActual + aumentoMonto;
      historial.push({
        periodo: m.periodo,
        haberBeneficio: Number(haberActual.toFixed(2)),
        aumentoPorcentaje: m.aumentoAplicado,
        bonoAplicado: m.bono || 0,
        cobroTotal: Number((haberActual + (m.bono || 0)).toFixed(2)),
        descripcion: m.descripcion 
      });
    }
  }
  
  return {
    haberFinal: haberActual,
    historial
  };
};
