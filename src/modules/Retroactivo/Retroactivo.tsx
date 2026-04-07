import { useState, useMemo, useCallback } from 'react';
import {
  calcularRetroactivo,
  generarMesesRetroactivo,
  TASAS_OPCIONES,
  formatPeriodo,
  formatCurrency,
  type TasaInteres,
  type PagoEfectivo,
} from '../../utils/retroactivo';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  Settings2, Plus, Trash2, DollarSign, Calendar,
  ChevronRight, Info,
  TrendingUp, FileDown,
} from 'lucide-react';
import './Retroactivo.css';

type TabRetro = 'config' | 'grilla' | 'resultado';

export const Retroactivo: React.FC = () => {
  const [tab, setTab] = useState<TabRetro>('config');

  // Configuración
  const [periodoDesde, setPeriodoDesde] = useState('2020-01');
  const [periodoHasta, setPeriodoHasta] = useState('2024-03');
  const [fechaLiquidacion, setFechaLiquidacion] = useState('2024-06');
  const [tasa, setTasa] = useState<TasaInteres>('pasiva_bcra');
  const [descObraSocial, setDescObraSocial] = useState(true);
  const [pctObraSocial,  setPctObraSocial]  = useState(3);

  // Grilla de meses
  const [grilla, setGrilla] = useState(() =>
    generarMesesRetroactivo('2020-01', '2024-03')
  );

  // Pagos efectivos
  const [pagos, setPagos] = useState<PagoEfectivo[]>([]);

  // Regenerar grilla al cambiar rango
  const regenerarGrilla = useCallback(() => {
    setGrilla(generarMesesRetroactivo(periodoDesde, periodoHasta));
  }, [periodoDesde, periodoHasta]);

  const handleGrillaChange = useCallback(
    (idx: number, field: 'haberReclamado' | 'haberPercibido', val: number) => {
      setGrilla(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], [field]: val };
        return next;
      });
    }, []
  );

  const addPago = () =>
    setPagos(prev => [...prev, { fecha: '2024-01-01', monto: 0, descripcion: '' }]);

  const removePago = (i: number) =>
    setPagos(prev => prev.filter((_, idx) => idx !== i));

  const updatePago = (i: number, field: keyof PagoEfectivo, val: string | number) =>
    setPagos(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: val }; return n; });

  // Motor de cálculo
  const resultado = useMemo(() =>
    calcularRetroactivo(grilla, tasa, fechaLiquidacion, pagos, descObraSocial, pctObraSocial),
    [grilla, tasa, fechaLiquidacion, pagos, descObraSocial, pctObraSocial]
  );

  const tasaActual = TASAS_OPCIONES.find(t => t.value === tasa)!;
  const mesesConDif = resultado.meses.filter(m => m.diferencia !== 0).length;

  // Chart data (diferencias y totales por período)
  const chartData = resultado.meses
    .filter(m => m.diferencia !== 0 || m.intereses !== 0)
    .map(m => ({
      name: formatPeriodo(m.periodo).replace(' ', '\n'),
      Diferencia: m.diferencia,
      Intereses: m.intereses,
      Total: m.total,
    }));

  const TABS: { id: TabRetro; label: string; icon: React.ReactNode }[] = [
    { id: 'config',    label: 'Configuración',          icon: <Settings2 size={16} /> },
    { id: 'grilla',    label: `Grilla (${grilla.length} meses)`, icon: <Calendar size={16} /> },
    { id: 'resultado', label: 'Resultado',               icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="retro-view animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Liquidación del Retroactivo</h1>
          <p className="page-subtitle">
            Diferencias de haberes · Intereses · Pagos efectivos · Saldo final
          </p>
        </div>
        <button className="btn-secondary flex-center gap-2">
          <FileDown size={16} /> Exportar Liquidación
        </button>
      </header>

      {/* Tabs */}
      <nav className="tabs-nav">
        {TABS.map((t, i) => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} <span>{t.label}</span>
            {i < TABS.length - 1 && <ChevronRight size={14} className="tab-arrow" />}
          </button>
        ))}
      </nav>

      {/* ============ PESTAÑA 1: CONFIGURACIÓN ============ */}
      {tab === 'config' && (
        <div className="tab-content animate-fade-in">
          <div className="config-grid">
            {/* Períodos */}
            <section className="card">
              <div className="card-header"><h2>Período de Reclamo</h2></div>
              <div className="card-body">
                <div className="grid-2col">
                  <div className="form-group">
                    <label>Período Desde</label>
                    <input type="month" className="form-control no-icon" value={periodoDesde}
                      onChange={e => setPeriodoDesde(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Período Hasta</label>
                    <input type="month" className="form-control no-icon" value={periodoHasta}
                      onChange={e => setPeriodoHasta(e.target.value)} />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Fecha de Liquidación (para intereses)</label>
                    <input type="month" className="form-control no-icon" value={fechaLiquidacion}
                      onChange={e => setFechaLiquidacion(e.target.value)} />
                  </div>
                </div>
                <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={regenerarGrilla}>
                  Generar Grilla de Períodos
                </button>
              </div>
            </section>

            {/* Tasa de interés */}
            <section className="card">
              <div className="card-header"><h2>Tasa de Interés</h2></div>
              <div className="card-body">
                {TASAS_OPCIONES.map(op => (
                  <label key={op.value} className={`tasa-option ${tasa === op.value ? 'selected' : ''}`}>
                    <input type="radio" name="tasa" value={op.value}
                      checked={tasa === op.value} onChange={() => setTasa(op.value)} />
                    <div className="tasa-content">
                      <span className="tasa-label">{op.label}</span>
                      <span className="tasa-desc">{op.descripcion}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Descuento obra social + pagos */}
            <section className="card">
              <div className="card-header"><h2>Descuento Obra Social</h2></div>
              <div className="card-body">
                <div className="toggle-row">
                  <label>Descontar obra social del retroactivo</label>
                  <button
                    className={`toggle-btn ${descObraSocial ? 'on' : 'off'}`}
                    onClick={() => setDescObraSocial(p => !p)}
                  >
                    {descObraSocial ? 'SÍ' : 'NO'}
                  </button>
                </div>
                {descObraSocial && (
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Porcentaje a descontar (%)</label>
                    <input type="number" min="0" max="10" step="0.5" className="form-control no-icon"
                      value={pctObraSocial} onChange={e => setPctObraSocial(Number(e.target.value))} />
                  </div>
                )}
                <div className="info-box info" style={{ marginTop: '1rem' }}>
                  <Info size={14} style={{ flexShrink: 0 }} />
                  <span>El aporte a la obra social (INSSJP) se aplica sobre el haber retroactivo percibido, reduciendo el monto líquido.</span>
                </div>
              </div>
            </section>

            {/* Pagos efectivos recibidos */}
            <section className="card">
              <div className="card-header">
                <h2>Pagos Efectivos Recibidos</h2>
                <button className="btn-secondary flex-center gap-2" onClick={addPago}>
                  <Plus size={14} /> Agregar
                </button>
              </div>
              <div className="card-body">
                {pagos.length === 0 ? (
                  <p className="empty-text">Sin pagos registrados. Los pagos parciales recibidos se descuentan del saldo final.</p>
                ) : pagos.map((p, i) => (
                  <div key={i} className="pago-row">
                    <input type="date" value={p.fecha} className="form-control no-icon pago-date"
                      onChange={e => updatePago(i, 'fecha', e.target.value)} />
                    <div className="input-with-icon pago-monto">
                      <DollarSign size={16} className="input-icon" />
                      <input type="number" className="form-control" placeholder="Monto"
                        value={p.monto || ''} onChange={e => updatePago(i, 'monto', parseFloat(e.target.value) || 0)} />
                    </div>
                    <input type="text" placeholder="Descripción" className="form-control no-icon pago-desc"
                      value={p.descripcion || ''} onChange={e => updatePago(i, 'descripcion', e.target.value)} />
                    <button className="btn-icon-danger" onClick={() => removePago(i)}><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
            <button className="btn-primary" onClick={() => setTab('grilla')}>
              Continuar → Cargar Haberes
            </button>
          </div>
        </div>
      )}

      {/* ============ PESTAÑA 2: GRILLA ============ */}
      {tab === 'grilla' && (
        <div className="tab-content animate-fade-in">
          <div className="rem-toolbar card" style={{ padding: '1rem 1.5rem', marginBottom: '1rem' }}>
            <div>
              <span><strong>{mesesConDif}</strong> períodos con diferencias cargadas de {grilla.length} totales.</span>
              <span className="tasa-chip"> · Tasa: <strong>{tasaActual.label}</strong></span>
            </div>
            <button
              className="btn-secondary flex-center gap-2"
              onClick={() => {
                // Carga demo automática
                setGrilla(prev => prev.map((m, i) => ({
                  ...m,
                  haberReclamado: Math.round(40000 + i * 3200 + Math.random() * 5000),
                  haberPercibido: Math.round(35000 + i * 2500 + Math.random() * 3000),
                })));
              }}
            >
              Cargar datos demo
            </button>
          </div>

          <section className="card">
            <div className="card-header">
              <h2>Haberes Período por Período</h2>
              <span className="badge-info">Tasa: {tasaActual.label}</span>
            </div>
            <div className="rem-table-wrapper" style={{ maxHeight: 580 }}>
              <table className="rem-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Período</th>
                    <th>Haber Reclamado ($)</th>
                    <th>Haber Percibido ($)</th>
                    <th>Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {grilla.map((m, i) => {
                    const dif = m.haberReclamado - m.haberPercibido;
                    return (
                      <tr key={m.periodo} className={dif > 0 ? 'row-loaded' : ''}>
                        <td className="td-num">{i + 1}</td>
                        <td className="td-periodo">{formatPeriodo(m.periodo)}</td>
                        <td>
                          <div className="input-rem-wrapper">
                            <span className="peso-sign">$</span>
                            <input type="number" className="input-rem" placeholder="0"
                              value={m.haberReclamado || ''}
                              onChange={e => handleGrillaChange(i, 'haberReclamado', parseFloat(e.target.value) || 0)} />
                          </div>
                        </td>
                        <td>
                          <div className="input-rem-wrapper">
                            <span className="peso-sign">$</span>
                            <input type="number" className="input-rem" placeholder="0"
                              value={m.haberPercibido || ''}
                              onChange={e => handleGrillaChange(i, 'haberPercibido', parseFloat(e.target.value) || 0)} />
                          </div>
                        </td>
                        <td className={`font-mono ${dif > 0 ? 'text-success' : dif < 0 ? 'text-danger-cell' : ''}`}>
                          {dif !== 0 ? formatCurrency(dif) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
            <button className="btn-primary" onClick={() => setTab('resultado')}>
              Ver Resultado del Retroactivo →
            </button>
          </div>
        </div>
      )}

      {/* ============ PESTAÑA 3: RESULTADO ============ */}
      {tab === 'resultado' && (
        <div className="tab-content animate-fade-in">
          {/* Resumen ejecutivo */}
          <div className="resumen-grid">
            <div className="resumen-card">
              <div className="res-label">Total Diferencias</div>
              <div className="res-value font-mono">{formatCurrency(resultado.totalDiferencias)}</div>
              <div className="res-sub">{mesesConDif} meses con diferencia positiva</div>
            </div>
            <div className="resumen-card">
              <div className="res-label">Total Intereses ({tasaActual.label})</div>
              <div className="res-value font-mono">{formatCurrency(resultado.totalIntereses)}</div>
              <div className="res-sub">Acumulados al {formatPeriodo(fechaLiquidacion)}</div>
            </div>
            <div className="resumen-card highlight-gold">
              <div className="res-label">Total Bruto (c/desc. {descObraSocial ? `OS ${pctObraSocial}%` : 'sin desc.'})</div>
              <div className="res-value font-mono large">{formatCurrency(resultado.totalBruto)}</div>
            </div>
            <div className={`resumen-card ${resultado.saldoFinal > 0 ? 'highlight-green' : 'highlight-red'}`}>
              <div className="res-label">Saldo Final (menos pagos parciales)</div>
              <div className="res-value font-mono large">{formatCurrency(resultado.saldoFinal)}</div>
              <div className="res-sub">Pagos ya recibidos: {formatCurrency(resultado.pagoEfectivoTotal)}</div>
            </div>
          </div>

          {/* Gráfico diferencias + intereses */}
          {chartData.length > 0 && (
            <section className="card" style={{ margin: '1.5rem 0' }}>
              <div className="card-header"><h2>Diferencias e Intereses por Período</h2></div>
              <div className="card-body">
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 12)} />
                      <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                      <RechartsTooltip formatter={(v: any) => formatCurrency(Number(v))} />
                      <ReferenceLine y={0} stroke="var(--text-secondary)" />
                      <Bar dataKey="Diferencia" stackId="a" fill="var(--brand-primary)" />
                      <Bar dataKey="Intereses"  stackId="a" fill="var(--accent-warning)" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          )}

          {/* Tabla de detalle */}
          <section className="card">
            <div className="card-header">
              <h2>Detalle Mensual de la Liquidación</h2>
              <span className="badge-info">{resultado.meses.length} períodos</span>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Haber Reclamado</th>
                    <th>Haber Percibido</th>
                    <th>Diferencia</th>
                    <th>Intereses</th>
                    <th>Total c/Int.</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.meses.map(m => (
                    <tr key={m.periodo} className={m.diferencia > 0 ? 'row-norma' : ''}>
                      <td><strong>{formatPeriodo(m.periodo)}</strong></td>
                      <td className="font-mono">{formatCurrency(m.haberReclamado)}</td>
                      <td className="font-mono">{formatCurrency(m.haberPercibido)}</td>
                      <td className={`font-mono font-bold ${m.diferencia > 0 ? 'text-success' : m.diferencia < 0 ? 'text-danger' : ''}`}>
                        {m.diferencia !== 0 ? formatCurrency(m.diferencia) : '—'}
                      </td>
                      <td className="font-mono">{m.intereses > 0 ? formatCurrency(m.intereses) : '—'}</td>
                      <td className="font-mono font-bold">{m.total !== 0 ? formatCurrency(m.total) : '—'}</td>
                    </tr>
                  ))}
                  <tr className="row-total">
                    <td colSpan={3}><strong>TOTALES</strong></td>
                    <td className="font-mono font-bold">{formatCurrency(resultado.totalDiferencias)}</td>
                    <td className="font-mono font-bold">{formatCurrency(resultado.totalIntereses)}</td>
                    <td className="font-mono font-bold text-brand">{formatCurrency(resultado.totalBruto)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
