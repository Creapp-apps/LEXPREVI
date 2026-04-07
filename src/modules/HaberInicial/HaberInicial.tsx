import { useState, useMemo, useCallback } from 'react';
import {
  User, Calendar, BarChart3, ClipboardList, Calculator,
  ChevronRight, AlertTriangle, CheckCircle2, Info,
  FileDown, Trash2, Upload, HelpCircle
} from 'lucide-react';
import {
  calcularHaberInicial,
  generarPeriodos,
  formatCurrency,
  formatPeriodo,
  HABER_MAXIMO,
  type DatosBeneficiario,
  type Remuneracion,
} from '../../utils/haberInicial';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer,
} from 'recharts';
import './HaberInicial.css';

type TabId = 'datos' | 'remuneraciones' | 'resultado';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'datos',         label: 'Datos del Beneficiario', icon: <User size={16} /> },
  { id: 'remuneraciones', label: 'Remuneraciones (120)',   icon: <ClipboardList size={16} /> },
  { id: 'resultado',     label: 'Resultado del Haber',    icon: <BarChart3 size={16} /> },
];

const DEFAULT_DATOS: DatosBeneficiario = {
  apellidoNombre: '',
  cuil: '',
  fechaNacimiento: '1958-05-15',
  sexo: 'M',
  fechaCese: '2024-06-01',
  fechaSolicitud: '2024-06-15',
  aportesDependencia: 20,
  aportesAutonomo: 5,
  aportesAnte94: 10,
};

export const HaberInicial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('datos');
  const [datos, setDatos] = useState<DatosBeneficiario>(DEFAULT_DATOS);
  const [remuneraciones, setRemuneraciones] = useState<Remuneracion[]>(() =>
    generarPeriodos(DEFAULT_DATOS.fechaCese)
  );

  // Regenerar grilla cuando cambia fecha de cese
  const handleFechaCeseChange = useCallback((fecha: string) => {
    setDatos(prev => ({ ...prev, fechaCese: fecha }));
    setRemuneraciones(generarPeriodos(fecha));
  }, []);

  const handleRemChange = useCallback((index: number, field: keyof Remuneracion, value: string | number) => {
    setRemuneraciones(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const resultado = useMemo(
    () => calcularHaberInicial(datos, remuneraciones),
    [datos, remuneraciones]
  );

  const cantCargadas = remuneraciones.filter(r => r.importe > 0).length;
  const progreso = Math.round((cantCargadas / 120) * 100);

  const chartData = [
    { name: 'PBU', value: resultado.pbu, fill: '#3b82f6' },
    { name: 'PC', value: resultado.pc, fill: '#8b5cf6' },
    { name: 'PAP', value: resultado.pap, fill: '#10b981' },
  ];

  const handleClearAll = () => {
    setRemuneraciones(prev => prev.map(r => ({ ...r, importe: 0 })));
  };

  const handleFillDemo = () => {
    setRemuneraciones(prev =>
      prev.map((r, i) => ({
        ...r,
        importe: Math.round(800000 + i * 4500 + Math.random() * 50000),
      }))
    );
  };

  return (
    <div className="haber-view animate-fade-in">
      {/* Encabezado */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Cálculo del Haber Inicial</h1>
          <p className="page-subtitle">
            Ley 24.241 · PBU + PC + PAP · Tope Haber Máximo
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary flex-center gap-2">
            <FileDown size={16} /> Exportar PDF
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-label">
          <span>Remuneraciones cargadas</span>
          <span><strong>{cantCargadas}</strong> / 120 meses ({progreso}%)</span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Tabs de navegación */}
      <nav className="tabs-nav">
        {TABS.map((tab, idx) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {idx < TABS.length - 1 && (
              <ChevronRight size={14} className="tab-arrow" />
            )}
          </button>
        ))}
      </nav>

      {/* ===== PESTAÑA 1: DATOS ===== */}
      {activeTab === 'datos' && (
        <div className="tab-content animate-fade-in">
          <div className="datos-grid">
            {/* Datos personales */}
            <section className="card">
              <div className="card-header">
                <h2>Datos Personales</h2>
                <User size={18} className="icon-muted" />
              </div>
              <div className="card-body grid-2col">
                <div className="form-group col-span-2">
                  <label>Apellido y Nombre</label>
                  <input
                    type="text"
                    placeholder="García, Marta Susana"
                    className="form-control no-icon"
                    value={datos.apellidoNombre}
                    onChange={e => setDatos(p => ({ ...p, apellidoNombre: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>CUIL</label>
                  <input
                    type="text"
                    placeholder="20-12345678-9"
                    className="form-control no-icon"
                    value={datos.cuil}
                    onChange={e => setDatos(p => ({ ...p, cuil: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Sexo</label>
                  <select
                    className="form-control no-icon"
                    value={datos.sexo}
                    onChange={e => setDatos(p => ({ ...p, sexo: e.target.value as 'M' | 'F' }))}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    className="form-control no-icon"
                    value={datos.fechaNacimiento}
                    onChange={e => setDatos(p => ({ ...p, fechaNacimiento: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Cese Laboral</label>
                  <input
                    type="date"
                    className="form-control no-icon"
                    value={datos.fechaCese}
                    onChange={e => handleFechaCeseChange(e.target.value)}
                  />
                </div>
                <div className="form-group col-span-2">
                  <label>Fecha de Solicitud del Beneficio</label>
                  <input
                    type="date"
                    className="form-control no-icon"
                    value={datos.fechaSolicitud}
                    onChange={e => setDatos(p => ({ ...p, fechaSolicitud: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            {/* Años de aportes */}
            <section className="card">
              <div className="card-header">
                <h2>Años de Servicios y Aportes</h2>
                <Calendar size={18} className="icon-muted" />
              </div>
              <div className="card-body">
                <div className="info-box info" style={{ marginBottom: '1.25rem' }}>
                  <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Prestación Compensatoria (PC)</strong>: aportes hasta el 30/06/1994.<br />
                    <strong>Prestación Adicional por Permanencia (PAP)</strong>: aportes desde el 01/07/1994.
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Años con aportes p/ PC (hasta 30/06/1994)
                    <span className="tooltip-icon" title="Se computa el total de servicios con aportes hasta el 30 de junio de 1994."><HelpCircle size={13} /></span>
                  </label>
                  <input
                    type="number" min="0" max="40" step="0.5"
                    className="form-control no-icon"
                    value={datos.aportesAnte94}
                    onChange={e => setDatos(p => ({ ...p, aportesAnte94: parseFloat(e.target.value) }))}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Años en relación de dependencia (post-94)
                    <span className="tooltip-icon" title="Años de aporte en relación de dependencia desde julio de 1994 en adelante."><HelpCircle size={13} /></span>
                  </label>
                  <input
                    type="number" min="0" max="40" step="0.5"
                    className="form-control no-icon"
                    value={datos.aportesDependencia}
                    onChange={e => setDatos(p => ({ ...p, aportesDependencia: parseFloat(e.target.value) }))}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Años como autónomo (post-94)
                    <span className="tooltip-icon" title="Años de aporte como trabajador autónomo desde julio de 1994."><HelpCircle size={13} /></span>
                  </label>
                  <input
                    type="number" min="0" max="40" step="0.5"
                    className="form-control no-icon"
                    value={datos.aportesAutonomo}
                    onChange={e => setDatos(p => ({ ...p, aportesAutonomo: parseFloat(e.target.value) }))}
                  />
                </div>

                {/* Resumen de años */}
                <div className="years-summary">
                  <div className="year-chip blue">
                    <span>PC: {datos.aportesAnte94} años</span>
                    <small>1.5% c/u = {(datos.aportesAnte94 * 1.5).toFixed(1)}%</small>
                  </div>
                  <div className="year-chip green">
                    <span>PAP: {datos.aportesDependencia + datos.aportesAutonomo} años</span>
                    <small>1.5% c/u = {((datos.aportesDependencia + datos.aportesAutonomo) * 1.5).toFixed(1)}%</small>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '1.5rem' }}
                  onClick={() => setActiveTab('remuneraciones')}
                >
                  Continuar → Cargar Remuneraciones
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ===== PESTAÑA 2: REMUNERACIONES ===== */}
      {activeTab === 'remuneraciones' && (
        <div className="tab-content animate-fade-in">
          <div className="rem-toolbar card" style={{ padding: '1rem 1.5rem', marginBottom: '1rem' }}>
            <div>
              <strong>{cantCargadas}</strong> períodos cargados de 120 requeridos.
              {cantCargadas < 60 && (
                <span className="badge-warning"> ⚠ Mínimo 60 para calcular</span>
              )}
            </div>
            <div className="flex-center gap-2">
              <button onClick={handleFillDemo} className="btn-secondary flex-center gap-2">
                <Upload size={14}/> Cargar datos demo
              </button>
              <button onClick={handleClearAll} className="btn-danger flex-center gap-2">
                <Trash2 size={14}/> Limpiar todo
              </button>
            </div>
          </div>

          <section className="card rem-table-card">
            <div className="card-header">
              <h2>Últimas 120 Remuneraciones</h2>
              <span className="badge-info">
                Base para el promedio PRPA
              </span>
            </div>
            <div className="rem-table-wrapper">
              <table className="rem-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Período</th>
                    <th>Tipo</th>
                    <th>Importe Bruto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {remuneraciones.map((rem, idx) => (
                    <tr key={rem.periodo} className={rem.importe > 0 ? 'row-loaded' : ''}>
                      <td className="td-num">{120 - idx}</td>
                      <td className="td-periodo">{formatPeriodo(rem.periodo)}</td>
                      <td>
                        <select
                          value={rem.tipo}
                          onChange={e => handleRemChange(idx, 'tipo', e.target.value)}
                          className="select-tipo"
                        >
                          <option value="dependencia">Rel. Dependencia</option>
                          <option value="autonomo">Autónomo</option>
                        </select>
                      </td>
                      <td>
                        <div className="input-rem-wrapper">
                          <span className="peso-sign">$</span>
                          <input
                            type="number"
                            min="0"
                            className="input-rem"
                            value={rem.importe || ''}
                            placeholder="0"
                            onChange={e => handleRemChange(idx, 'importe', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </td>
                      <td>
                        {rem.importe > 0
                          ? <CheckCircle2 size={16} color="var(--accent-success)" />
                          : <span className="empty-dot" />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              className="btn-primary"
              onClick={() => setActiveTab('resultado')}
              disabled={cantCargadas < 1}
            >
              Calcular Haber Inicial →
            </button>
          </div>
        </div>
      )}

      {/* ===== PESTAÑA 3: RESULTADO ===== */}
      {activeTab === 'resultado' && (
        <div className="tab-content animate-fade-in">
          {cantCargadas < 1 ? (
            <div className="empty-state card">
              <ClipboardList size={48} color="var(--text-muted)" />
              <h3>Sin remuneraciones cargadas</h3>
              <p>Por favor ingresá al menos un período en la solapa de Remuneraciones.</p>
              <button className="btn-primary" onClick={() => setActiveTab('remuneraciones')}>
                Ir a Remuneraciones
              </button>
            </div>
          ) : (
            <div className="resultado-layout">
              {/* Columna izquierda: composición */}
              <div className="resultado-left">
                <section className="card">
                  <div className="card-header">
                    <h2>Composición del Haber</h2>
                    <Calculator size={18} className="icon-muted" />
                  </div>
                  <div className="card-body">
                    <div className="promedio-rem">
                      <span>Promedio de Remuneraciones (PRPA)</span>
                      <strong className="font-mono">{formatCurrency(resultado.promedioRemuneraciones)}</strong>
                    </div>
                    <div className="componentes-list">
                      <div className="componente-item pbu">
                        <div className="comp-header">
                          <span className="comp-name">PBU</span>
                          <span className="comp-label">Prestación Básica Universal</span>
                        </div>
                        <span className="comp-value font-mono">{formatCurrency(resultado.pbu)}</span>
                      </div>
                      <div className="componente-item pc">
                        <div className="comp-header">
                          <span className="comp-name">PC</span>
                          <span className="comp-label">
                            Prestación Compensatoria ({datos.aportesAnte94} años × 1.5%)
                          </span>
                        </div>
                        <span className="comp-value font-mono">{formatCurrency(resultado.pc)}</span>
                      </div>
                      <div className="componente-item pap">
                        <div className="comp-header">
                          <span className="comp-name">PAP</span>
                          <span className="comp-label">
                            Prestación Adicional por Permanencia ({datos.aportesDependencia + datos.aportesAutonomo} años × 1.5%)
                          </span>
                        </div>
                        <span className="comp-value font-mono">{formatCurrency(resultado.pap)}</span>
                      </div>

                      <div className="componente-total">
                        <span>Haber Bruto</span>
                        <span className="font-mono">{formatCurrency(resultado.haberBruto)}</span>
                      </div>

                      {resultado.confiscatorio && (
                        <div className="alert-confiscatorio">
                          <AlertTriangle size={16} />
                          <div>
                            <strong>¡Tope de Haber Máximo aplicado!</strong>
                            <p>
                              El haber bruto supera el máximo legal ({formatCurrency(HABER_MAXIMO)}).
                              Diferencia confiscada: {formatCurrency(resultado.haberBruto - resultado.haberMaximo)}{' '}
                              ({resultado.porcentajeConfiscatoriedad.toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="haber-final-box">
                      <div className="haber-final-label">
                        {resultado.confiscatorio ? 'Haber Máximo Legal' : 'Haber Inicial Resultante'}
                      </div>
                      <div className="haber-final-value font-mono">
                        {formatCurrency(resultado.haberFinal)}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Columna derecha: gráfico */}
              <div className="resultado-right">
                <section className="card chart-breakdown">
                  <div className="card-header">
                    <h2>Distribución Visual</h2>
                  </div>
                  <div className="card-body">
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 40 }}>
                          <CartesianGrid horizontal={false} stroke="var(--border-light)" />
                          <XAxis type="number" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={40} />
                          <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Mini stats */}
                    <div className="mini-stats">
                      <div className="mini-stat">
                        <span className="dot blue" />
                        <span className="label-mini">PBU</span>
                        <span className="val-mini">{((resultado.pbu / resultado.haberBruto) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="mini-stat">
                        <span className="dot purple" />
                        <span className="label-mini">PC</span>
                        <span className="val-mini">{((resultado.pc / resultado.haberBruto) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="mini-stat">
                        <span className="dot green" />
                        <span className="label-mini">PAP</span>
                        <span className="val-mini">{((resultado.pap / resultado.haberBruto) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="card" style={{ marginTop: '1rem' }}>
                  <div className="card-header">
                    <h2>Tope del Haber Máximo</h2>
                    {resultado.confiscatorio
                      ? <AlertTriangle size={18} color="var(--accent-warning)" />
                      : <CheckCircle2 size={18} color="var(--accent-success)" />
                    }
                  </div>
                  <div className="card-body">
                    <div className="tope-bar-container">
                      <div className="tope-bar-track">
                        <div
                          className={`tope-bar-fill ${resultado.confiscatorio ? 'over' : 'ok'}`}
                          style={{
                            width: `${Math.min((resultado.haberBruto / HABER_MAXIMO) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <div className="tope-bar-labels">
                        <span>{formatCurrency(resultado.haberBruto)}</span>
                        <span>Tope: {formatCurrency(HABER_MAXIMO)}</span>
                      </div>
                    </div>
                    {!resultado.confiscatorio && (
                      <p className="no-confiscatorio">
                        <CheckCircle2 size={14} /> El haber calculado <strong>no supera</strong> el haber máximo legal.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
