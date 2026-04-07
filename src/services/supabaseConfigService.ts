import { supabase } from '../lib/supabase';
import type { AppConfig } from '../utils/configStore'; // Assuming configStore types are kept

const DEFAULT_CONFIG: AppConfig = {
  estudio: {
    nombreEstudio: 'Estudio Jurídico Previsional',
    responsable: '',
    cuit: '',
    matricula: '',
    direccion: '',
    ciudad: 'Ciudad Autónoma de Buenos Aires',
    telefono: '',
    email: '',
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

export const supabaseConfigService = {
  async getConfig(userId: string): Promise<AppConfig> {
    const { data, error } = await supabase
      .from('configuracion_estudio')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      throw error;
    }

    if (!data) return DEFAULT_CONFIG;

    return {
      estudio: {
        nombreEstudio: data.nombre_estudio || DEFAULT_CONFIG.estudio.nombreEstudio,
        responsable: data.responsable || DEFAULT_CONFIG.estudio.responsable,
        cuit: data.cuit || DEFAULT_CONFIG.estudio.cuit,
        matricula: data.matricula || DEFAULT_CONFIG.estudio.matricula,
        direccion: data.direccion || DEFAULT_CONFIG.estudio.direccion,
        ciudad: data.ciudad || DEFAULT_CONFIG.estudio.ciudad,
        telefono: data.telefono || DEFAULT_CONFIG.estudio.telefono,
        email: data.email || DEFAULT_CONFIG.estudio.email,
      },
      valores: {
        pbu: data.pbu !== null ? data.pbu : DEFAULT_CONFIG.valores.pbu,
        haberMaximo: data.haber_maximo !== null ? data.haber_maximo : DEFAULT_CONFIG.valores.haberMaximo,
        tasaDefecto: data.tasa_defecto || DEFAULT_CONFIG.valores.tasaDefecto,
        porcentajeObraSocial: data.porcentaje_obra_social !== null ? data.porcentaje_obra_social : DEFAULT_CONFIG.valores.porcentajeObraSocial,
        inscriptoGanancias: data.inscripto_ganancias !== null ? data.inscripto_ganancias : DEFAULT_CONFIG.valores.inscriptoGanancias,
        alicuotaGanancias: data.alicuota_ganancias !== null ? data.alicuota_ganancias : DEFAULT_CONFIG.valores.alicuotaGanancias,
      },
      preferencias: {
        tema: data.tema || DEFAULT_CONFIG.preferencias.tema,
        formatoPeriodo: data.formato_periodo || DEFAULT_CONFIG.preferencias.formatoPeriodo,
        monedaDecimales: 2,
        mostrarTooltips: true,
        recordatoriosActivos: true,
      }
    };
  },

  async saveConfig(userId: string, config: AppConfig): Promise<void> {
    const { error } = await supabase
      .from('configuracion_estudio')
      .upsert({
        user_id: userId,
        nombre_estudio: config.estudio.nombreEstudio,
        responsable: config.estudio.responsable,
        cuit: config.estudio.cuit,
        matricula: config.estudio.matricula,
        direccion: config.estudio.direccion,
        ciudad: config.estudio.ciudad,
        telefono: config.estudio.telefono,
        email: config.estudio.email,
        pbu: config.valores.pbu,
        haber_maximo: config.valores.haberMaximo,
        tasa_defecto: config.valores.tasaDefecto,
        porcentaje_obra_social: config.valores.porcentajeObraSocial,
        inscripto_ganancias: config.valores.inscriptoGanancias,
        alicuota_ganancias: config.valores.alicuotaGanancias,
        tema: config.preferencias.tema,
        formato_periodo: config.preferencias.formatoPeriodo,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;
  }
};
