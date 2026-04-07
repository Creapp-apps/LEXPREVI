import { useMemo, useState } from 'react';
import {
  LineChart as _LineChart, Area, ComposedChart, ReferenceLine,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  procesarIndices,
  formatPeriodoCorto,
  formatCurrencyCompact,
} from '../../utils/indices2021_2024';
import { TrendingDown, TrendingUp, AlertTriangle, Info, BarChart3, Table2 } from 'lucide-react';
import './Comparativa.css';

const COLORS = {
  jubMin: '#3b82f6',   // azul
  ipc:    '#ef4444',   // rojo
  ripte:  '#10b981',   // verde
};

type Vista = 'grafico' | 'tabla';

// Tooltip personalizado del gráfico
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-title">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span className="tooltip-name">{p.name}</span>
          <span className="tooltip-value">{p.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

export const ComparativaIndices: React.FC = () => {
  const [vista, setVista] = useState<Vista>('grafico');
  const datos = useMemo(() => procesarIndices(), []);

  const ultimo = datos[datos.length - 1];
  const perdidaVsIPC   = Math.abs(ultimo.brechaVsIPC);

  // Datos para gráfico de brecha mensual
  const brechaData = datos.map(d => ({
    name: formatPeriodoCorto(d.periodo),
    'vs IPC': d.brechaVsIPC,
    'vs RIPTE': d.brechaVsRIPTE,
  }));

  // Chart data principal (base100)
  const chartData = datos.map(d => ({
    name:   formatPeriodoCorto(d.periodo),
    'Jub. Mínima':  d.jubMinBase100,
    'IPC Acum.':    d.ipcBase100,
    'RIPTE Acum.':  d.ripteBase100,
  }));

  return (
    <div className="comparativa-view animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Evolución de la Jubilación Mínima</h1>
          <p className="page-subtitle">
            Comparativa vs IPC y RIPTE · Enero 2021 – Febrero 2024 · Base 100 = Ene 2021
          </p>
        </div>
        <div className="header-actions">
          <div className="vista-toggle">
            <button
              className={`vista-btn ${vista === 'grafico' ? 'active' : ''}`}
              onClick={() => setVista('grafico')}
            >
              <BarChart3 size={15} /> Gráfico
            </button>
            <button
              className={`vista-btn ${vista === 'tabla' ? 'active' : ''}`}
              onClick={() => setVista('tabla')}
            >
              <Table2 size={15} /> Tabla
            </button>
          </div>
        </div>
      </header>

      {/* ─── KPIs ──────────────────────────────────────────────── */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue"><TrendingUp size={22} /></div>
          <div>
            <div className="kpi-label">Jub. Mínima Feb 2024</div>
            <div className="kpi-value">{formatCurrencyCompact(ultimo.jubMin)}</div>
            <div className="kpi-sub">+{(ultimo.jubMinBase100 - 100).toFixed(1)}% desde Ene 2021</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><TrendingUp size={22} /></div>
          <div>
            <div className="kpi-label">IPC Acumulado</div>
            <div className="kpi-value">+{(ultimo.ipcBase100 - 100).toFixed(1)}%</div>
            <div className="kpi-sub">Inflación real Ene 2021 – Feb 2024</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><TrendingUp size={22} /></div>
          <div>
            <div className="kpi-label">RIPTE Acumulado</div>
            <div className="kpi-value">+{(ultimo.ripteBase100 - 100).toFixed(1)}%</div>
            <div className="kpi-sub">Sueldo promedio registrado Ene 2021 – Feb 2024</div>
          </div>
        </div>
        <div className="kpi-card danger">
          <div className="kpi-icon orange"><TrendingDown size={22} /></div>
          <div>
            <div className="kpi-label">Pérdida vs IPC al cierre</div>
            <div className="kpi-value loss">−{perdidaVsIPC.toFixed(1)} pts</div>
            <div className="kpi-sub">La jub. creció {perdidaVsIPC.toFixed(1)} puntos MENOS que la inflación</div>
          </div>
        </div>
      </div>

      {/* ─── Alerta jurídica ──────────────────────────────────────── */}
      <div className="alerta-juridica">
        <AlertTriangle size={18} className="alerta-icon" />
        <div>
          <strong>Relevancia Jurídica:</strong> La diferencia entre el índice de actualización de la Ley 27.609
          (que usa 70% IPC + 30% RIPTE) y la inflación real en el período evidencia una pérdida del poder
          adquisitivo acumulada. Esta brecha es la base fáctica para los{' '}
          <strong>reclamos de confiscatoriedad</strong> y los fallos de reajuste de movilidad (ej: Alaniz, Delaude).
        </div>
      </div>

      {vista === 'grafico' ? (
        <>
          {/* ─── Gráfico principal: evolución base 100 ─────────────── */}
          <section className="card chart-section">
            <div className="card-header">
              <h2>Evolución Comparada — Base 100 (Enero 2021)</h2>
              <div className="legend-manual">
                <span><span className="dot-legend" style={{background: COLORS.jubMin}}/> Jub. Mínima</span>
                <span><span className="dot-legend" style={{background: COLORS.ipc}}/> IPC Acum.</span>
                <span><span className="dot-legend" style={{background: COLORS.ripte}}/> RIPTE Acum.</span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: 380 }}>
                <ResponsiveContainer>
                    <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                    <defs>
                      <linearGradient id="jubGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.jubMin} stopOpacity={0.15}/>
                        <stop offset="95%" stopColor={COLORS.jubMin} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tickFormatter={v => `${v}`} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={['auto','auto']} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <ReferenceLine y={100} stroke="var(--text-muted)" strokeDasharray="4 4" label={{ value: 'Base 100', fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Area type="monotone" dataKey="Jub. Mínima" fill="url(#jubGrad)" stroke={COLORS.jubMin} strokeWidth={2.5} dot={false} />
                    <Area type="monotone" dataKey="IPC Acum."   fill="transparent" stroke={COLORS.ipc}   strokeWidth={2} dot={false} strokeDasharray="6 3" />
                    <Area type="monotone" dataKey="RIPTE Acum." fill="transparent" stroke={COLORS.ripte} strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* ─── Gráfico de brecha ────────────────────────────────── */}
          <section className="card chart-section" style={{ marginTop: '1.5rem' }}>
            <div className="card-header">
              <h2>Brecha Mensual (Jub. Mínima menos índice acumulado, en puntos)</h2>
              <div className="info-box info" style={{ margin: 0, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                <Info size={13} /> Valores negativos = pérdida de poder adquisitivo
              </div>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={brechaData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="var(--text-secondary)" />
                    <Bar dataKey="vs IPC"   fill={COLORS.ipc}   radius={[3,3,0,0]} opacity={0.8} />
                    <Bar dataKey="vs RIPTE" fill={COLORS.ripte} radius={[3,3,0,0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* ─── TABLA COMPLETA ──────────────────────────────────────── */
        <section className="card">
          <div className="card-header">
            <h2>Detalle Mensual Completo</h2>
            <span className="badge-info">{datos.length} períodos</span>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Jub. Mínima</th>
                  <th>IPC Mensual</th>
                  <th>RIPTE Mensual</th>
                  <th>Jub. (Base 100)</th>
                  <th>IPC Acum.</th>
                  <th>RIPTE Acum.</th>
                  <th>Brecha vs IPC</th>
                  <th>Norma</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((d) => (
                  <tr key={d.periodo} className={d.norma ? 'row-norma' : ''}>
                    <td><strong>{formatPeriodoCorto(d.periodo)}</strong></td>
                    <td className="font-mono">${d.jubMin.toLocaleString('es-AR')}</td>
                    <td className="font-mono text-danger">+{d.ipcMensual.toFixed(1)}%</td>
                    <td className="font-mono text-success">+{d.ripteMensual.toFixed(1)}%</td>
                    <td className="font-mono"><strong>{d.jubMinBase100.toFixed(1)}</strong></td>
                    <td className="font-mono">{d.ipcBase100.toFixed(1)}</td>
                    <td className="font-mono">{d.ripteBase100.toFixed(1)}</td>
                    <td className={`font-mono font-bold ${d.brechaVsIPC < 0 ? 'text-danger' : 'text-success'}`}>
                      {d.brechaVsIPC > 0 ? '+' : ''}{d.brechaVsIPC.toFixed(1)} pts
                    </td>
                    <td>
                      {d.norma
                        ? <span className="badge-norma">{d.norma}</span>
                        : <span className="text-muted-sm">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
