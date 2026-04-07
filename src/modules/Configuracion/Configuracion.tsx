import { useState, useEffect } from 'react';
import {
  getConfig, saveConfig, resetConfig,
  type AppConfig, type ConfigEstudio, type ConfigValores, type ConfigPreferencias,
} from '../../utils/configStore';
import {
  Building2, DollarSign, Palette, Bell, Save, RotateCcw,
  CheckCircle2, Info, Scale, ChevronRight, Moon, Sun, Monitor,
} from 'lucide-react';
import './Configuracion.css';

type SeccionId = 'estudio' | 'valores' | 'preferencias';

const SECCIONES: { id: SeccionId; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'estudio',      label: 'Datos del Estudio',   icon: <Building2 size={18} />, desc: 'Nombre, CUIT, dirección y datos del profesional' },
  { id: 'valores',      label: 'Valores por Defecto', icon: <DollarSign size={18} />, desc: 'PBU, tope máximo, tasa de interés, obra social' },
  { id: 'preferencias', label: 'Preferencias',         icon: <Palette size={18} />,   desc: 'Tema visual, formato de períodos, notificaciones' },
];

const TEMAS = [
  { value: 'light',  label: 'Claro',    icon: <Sun  size={16} /> },
  { value: 'dark',   label: 'Oscuro',   icon: <Moon size={16} /> },
  { value: 'system', label: 'Sistema',  icon: <Monitor size={16} /> },
];

const TASAS_LABELS: Record<string, string> = {
  pasiva_bcra:        'Tasa Pasiva BCRA',
  activa_3_mensual:   'Tasa Activa + 1% Mensual',
  afip_resarcitorio:  'Tasa AFIP Resarcitoria',
  afip_punitorio:     'Tasa AFIP Punitoria',
};

export const Configuracion: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(getConfig);
  const [seccion, setSeccion] = useState<SeccionId>('estudio');
  const [saved, setSaved] = useState(false);

  // Aplica el tema al body cuando cambia
  useEffect(() => {
    const tema = config.preferencias.tema;
    const root = document.documentElement;
    if (tema === 'dark')  root.setAttribute('data-theme', 'dark');
    else if (tema === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
  }, [config.preferencias.tema]);

  const setEstudio = (k: keyof ConfigEstudio, v: string) =>
    setConfig(p => ({ ...p, estudio: { ...p.estudio, [k]: v } }));

  const setValores = (k: keyof ConfigValores, v: string | number | boolean) =>
    setConfig(p => ({ ...p, valores: { ...p.valores, [k]: v } }));

  const setPref = (k: keyof ConfigPreferencias, v: string | number | boolean) =>
    setConfig(p => ({ ...p, preferencias: { ...p.preferencias, [k]: v } }));

  const handleSave = () => {
    saveConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (!confirm('¿Restablecer la configuración a los valores por defecto?')) return;
    resetConfig();
    setConfig(getConfig());
  };

  return (
    <div className="config-view animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Personalización del estudio y parámetros de cálculo</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary flex-center gap-2" onClick={handleReset}>
            <RotateCcw size={15} /> Restablecer
          </button>
          <button className={`btn-primary flex-center gap-2 ${saved ? 'btn-saved' : ''}`} onClick={handleSave}>
            {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saved ? '¡Guardado!' : 'Guardar Cambios'}
          </button>
        </div>
      </header>

      <div className="config-layout">
        {/* Menú lateral de secciones */}
        <nav className="config-nav">
          {SECCIONES.map(s => (
            <button key={s.id} className={`config-nav-btn ${seccion === s.id ? 'active' : ''}`}
              onClick={() => setSeccion(s.id)}>
              <div className="cnb-icon">{s.icon}</div>
              <div className="cnb-text">
                <span className="cnb-label">{s.label}</span>
                <span className="cnb-desc">{s.desc}</span>
              </div>
              <ChevronRight size={16} className="cnb-arrow" />
            </button>
          ))}

          {/* Información de versión */}
          <div className="version-info">
            <div className="version-logo">⚖️ LexPrevi</div>
            <div className="version-tag">v1.0.0 — Abril 2024</div>
            <div className="version-desc">Plataforma Previsional Premium</div>
          </div>
        </nav>

        {/* Panel de contenido */}
        <div className="config-content animate-fade-in" key={seccion}>

          {/* ── SECCIÓN: DATOS DEL ESTUDIO ── */}
          {seccion === 'estudio' && (
            <section className="card">
              <div className="card-header">
                <h2>Datos del Estudio Jurídico</h2>
                <Building2 size={18} className="icon-muted" />
              </div>
              <div className="card-body">
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label>Nombre del Estudio</label>
                    <input className="form-control no-icon" value={config.estudio.nombreEstudio}
                      onChange={e => setEstudio('nombreEstudio', e.target.value)}
                      placeholder="Estudio Jurídico Previsional" />
                  </div>
                  <div className="form-group">
                    <label>Responsable / Abogado</label>
                    <input className="form-control no-icon" value={config.estudio.responsable}
                      onChange={e => setEstudio('responsable', e.target.value)}
                      placeholder="Dr. Juan Pérez" />
                  </div>
                  <div className="form-group">
                    <label>CUIT del Estudio</label>
                    <input className="form-control no-icon" value={config.estudio.cuit}
                      onChange={e => setEstudio('cuit', e.target.value)}
                      placeholder="20-12345678-9" />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Matrícula Profesional</label>
                    <input className="form-control no-icon" value={config.estudio.matricula}
                      onChange={e => setEstudio('matricula', e.target.value)}
                      placeholder="T° VII F° 288 CPACF" />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Dirección</label>
                    <input className="form-control no-icon" value={config.estudio.direccion}
                      onChange={e => setEstudio('direccion', e.target.value)}
                      placeholder="Av. Corrientes 1234, Piso 5°" />
                  </div>
                  <div className="form-group">
                    <label>Ciudad / Partido</label>
                    <input className="form-control no-icon" value={config.estudio.ciudad}
                      onChange={e => setEstudio('ciudad', e.target.value)}
                      placeholder="Ciudad Autónoma de Buenos Aires" />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input className="form-control no-icon" value={config.estudio.telefono}
                      onChange={e => setEstudio('telefono', e.target.value)}
                      placeholder="011-5555-0001" />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Email de Contacto</label>
                    <input type="email" className="form-control no-icon" value={config.estudio.email}
                      onChange={e => setEstudio('email', e.target.value)}
                      placeholder="contacto@estudio.com.ar" />
                  </div>
                </div>

                {/* Vista previa del encabezado */}
                <div className="preview-card">
                  <div className="preview-label">Vista Previa del Encabezado de Reportes</div>
                  <div className="preview-body">
                    <div className="preview-logo">⚖️</div>
                    <div>
                      <div className="preview-estudio">{config.estudio.nombreEstudio || 'Estudio Jurídico Previsional'}</div>
                      <div className="preview-resp">{config.estudio.responsable} · {config.estudio.matricula}</div>
                      <div className="preview-contact">{config.estudio.direccion} · {config.estudio.ciudad}</div>
                      <div className="preview-contact">{config.estudio.telefono} · {config.estudio.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── SECCIÓN: VALORES ── */}
          {seccion === 'valores' && (
            <section className="card">
              <div className="card-header">
                <h2>Valores Legales por Defecto</h2>
                <Scale size={18} className="icon-muted" />
              </div>
              <div className="card-body">
                <div className="info-box info" style={{ marginBottom: '1.5rem' }}>
                  <Info size={14} style={{ flexShrink: 0 }} />
                  <span>Estos valores se usan como predeterminados en todos los cálculos. Actualizalos cuando ANSES publique nuevos valores.</span>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>PBU Vigente ($)</label>
                    <input type="number" className="form-control no-icon" value={config.valores.pbu}
                      onChange={e => setValores('pbu', parseFloat(e.target.value))} />
                    <span className="field-hint">Prestación Básica Universal actual</span>
                  </div>
                  <div className="form-group">
                    <label>Haber Máximo ($)</label>
                    <input type="number" className="form-control no-icon" value={config.valores.haberMaximo}
                      onChange={e => setValores('haberMaximo', parseFloat(e.target.value))} />
                    <span className="field-hint">Tope legal vigente de jubilación</span>
                  </div>
                  <div className="form-group col-span-2">
                    <label>Tasa de Interés por Defecto</label>
                    <select className="form-control no-icon" value={config.valores.tasaDefecto}
                      onChange={e => setValores('tasaDefecto', e.target.value)}>
                      {Object.entries(TASAS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <span className="field-hint">Se pre-seleccionará en el módulo de Retroactivo</span>
                  </div>
                  <div className="form-group">
                    <label>Descuento Obra Social (%)</label>
                    <input type="number" min="0" max="10" step="0.5" className="form-control no-icon"
                      value={config.valores.porcentajeObraSocial}
                      onChange={e => setValores('porcentajeObraSocial', parseFloat(e.target.value))} />
                    <span className="field-hint">Aporte al INSSJP sobre retroactivos</span>
                  </div>
                  <div className="form-group">
                    <div className="toggle-row" style={{ marginTop: '1.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>Inscripto en Ganancias</div>
                        <div className="field-hint">Aplicar retención de Ganancias en liquidaciones</div>
                      </div>
                      <button className={`toggle-btn ${config.valores.inscriptoGanancias ? 'on' : 'off'}`}
                        onClick={() => setValores('inscriptoGanancias', !config.valores.inscriptoGanancias)}>
                        {config.valores.inscriptoGanancias ? 'SÍ' : 'NO'}
                      </button>
                    </div>
                  </div>
                  {config.valores.inscriptoGanancias && (
                    <div className="form-group col-span-2">
                      <label>Alícuota de Ganancias (%)</label>
                      <input type="number" min="0" max="35" step="1" className="form-control no-icon"
                        value={config.valores.alicuotaGanancias}
                        onChange={e => setValores('alicuotaGanancias', parseFloat(e.target.value))} />
                    </div>
                  )}
                </div>

                {/* Resumen visual de valores */}
                <div className="valores-summary">
                  <div className="vs-item">
                    <span className="vs-label">PBU</span>
                    <span className="vs-value font-mono">$ {config.valores.pbu.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="vs-item">
                    <span className="vs-label">Haber Máximo</span>
                    <span className="vs-value font-mono">$ {config.valores.haberMaximo.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="vs-item">
                    <span className="vs-label">Tasa</span>
                    <span className="vs-value">{TASAS_LABELS[config.valores.tasaDefecto]}</span>
                  </div>
                  <div className="vs-item">
                    <span className="vs-label">Obra Social</span>
                    <span className="vs-value">{config.valores.porcentajeObraSocial}%</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── SECCIÓN: PREFERENCIAS ── */}
          {seccion === 'preferencias' && (
            <section className="card">
              <div className="card-header">
                <h2>Preferencias Visuales y del Sistema</h2>
                <Palette size={18} className="icon-muted" />
              </div>
              <div className="card-body">
                {/* Tema */}
                <div className="pref-group">
                  <div className="pref-group-label">Tema de la Aplicación</div>
                  <div className="tema-selector">
                    {TEMAS.map(t => (
                      <button key={t.value}
                        className={`tema-btn ${config.preferencias.tema === t.value ? 'active' : ''}`}
                        onClick={() => setPref('tema', t.value)}>
                        {t.icon}
                        <span>{t.label}</span>
                        {config.preferencias.tema === t.value && <CheckCircle2 size={14} className="tema-check" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formato de período */}
                <div className="pref-group">
                  <div className="pref-group-label">Formato de Períodos</div>
                  <div className="formato-selector">
                    {(['YYYY-MM', 'MM/YYYY'] as const).map(f => (
                      <label key={f} className={`formato-opt ${config.preferencias.formatoPeriodo === f ? 'active' : ''}`}>
                        <input type="radio" name="formato" value={f}
                          checked={config.preferencias.formatoPeriodo === f}
                          onChange={() => setPref('formatoPeriodo', f)} />
                        <span>{f}</span>
                        <span className="formato-ejemplo">Ej: {f === 'YYYY-MM' ? '2024-03' : '03/2024'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Decimales de moneda */}
                <div className="pref-group">
                  <div className="pref-group-label">Decimales en Montos</div>
                  <div className="dec-selector">
                    {[0, 2].map(d => (
                      <button key={d}
                        className={`dec-btn ${config.preferencias.monedaDecimales === d ? 'active' : ''}`}
                        onClick={() => setPref('monedaDecimales', d)}>
                        {d === 0 ? '$ 1.234.567' : '$ 1.234.567,89'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="pref-toggles">
                  <div className="toggle-row pref-toggle-row">
                    <div>
                      <div className="toggle-title">Mostrar Tooltips de Ayuda</div>
                      <div className="toggle-desc">Muestra íconos de ayuda con información adicional en los formularios</div>
                    </div>
                    <button className={`toggle-btn ${config.preferencias.mostrarTooltips ? 'on' : 'off'}`}
                      onClick={() => setPref('mostrarTooltips', !config.preferencias.mostrarTooltips)}>
                      {config.preferencias.mostrarTooltips ? 'SÍ' : 'NO'}
                    </button>
                  </div>
                  <div className="toggle-row pref-toggle-row">
                    <div>
                      <div className="toggle-title"><Bell size={14} style={{ display: 'inline', marginRight: 4 }}/>Recordatorios Activos</div>
                      <div className="toggle-desc">Habilita notificaciones de vencimientos y alertas de movilidad</div>
                    </div>
                    <button className={`toggle-btn ${config.preferencias.recordatoriosActivos ? 'on' : 'off'}`}
                      onClick={() => setPref('recordatoriosActivos', !config.preferencias.recordatoriosActivos)}>
                      {config.preferencias.recordatoriosActivos ? 'SÍ' : 'NO'}
                    </button>
                  </div>
                </div>

              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
