// ============================================================
//  Store de Configuración — localStorage
// ============================================================

export interface ConfigEstudio {
  nombreEstudio: string;
  responsable: string;
  cuit: string;
  matricula: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  logo?: string;
}

export interface ConfigValores {
  pbu: number;
  haberMaximo: number;
  tasaDefecto: string;
  porcentajeObraSocial: number;
  inscriptoGanancias: boolean;
  alicuotaGanancias: number;
}

export interface ConfigPreferencias {
  tema: 'light' | 'dark' | 'system';
  monedaDecimales: number;
  mostrarTooltips: boolean;
  recordatoriosActivos: boolean;
  formatoPeriodo: 'YYYY-MM' | 'MM/YYYY';
}

export interface AppConfig {
  estudio: ConfigEstudio;
  valores: ConfigValores;
  preferencias: ConfigPreferencias;
}

const KEY = 'lexprevi_config';

const DEFAULT_CONFIG: AppConfig = {
  estudio: {
    nombreEstudio: 'Estudio Jurídico Previsional',
    responsable: 'Dr. Juan Doe',
    cuit: '20-12345678-9',
    matricula: 'T° VII F° 288 CPACF',
    direccion: 'Av. Corrientes 1234, Piso 5°',
    ciudad: 'Ciudad Autónoma de Buenos Aires',
    telefono: '011-5555-0001',
    email: 'contacto@estudio.com.ar',
  },
  valores: {
    pbu: 89632.86,
    haberMaximo: 2184406.42,
    tasaDefecto: 'pasiva_bcra',
    porcentajeObraSocial: 3,
    inscriptoGanancias: false,
    alicuotaGanancias: 15,
  },
  preferencias: {
    tema: 'system',
    monedaDecimales: 2,
    mostrarTooltips: true,
    recordatoriosActivos: true,
    formatoPeriodo: 'YYYY-MM',
  },
};

export function getConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: AppConfig): void {
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function resetConfig(): void {
  localStorage.removeItem(KEY);
}
