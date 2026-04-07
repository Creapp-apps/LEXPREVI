import { useState } from 'react';
import {
  FALLOS, calcularBadaro, calcularAlaniz, calcularDelaude,
  calcularElliff, calcularVergara,
  type FalloId, type FalloInfo,
} from '../../utils/fallos';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Scale, ArrowRight, BookOpen, ChevronLeft,
  CheckCircle2, HelpCircle, Info,
} from 'lucide-react';
import './ReajustesFallos.css';

const CATEGORIA_LABELS: Record<string, string> = {
  movilidad:    'Movilidad',
  haber_inicial:'Haber Inicial',
  pbu:          'Reajuste PBU',
  autonomos:    'Autónomos',
};

/* ──────────────── Selectora de fallos ──────────────── */
const SelectorFallos: React.FC<{ onSelect: (id: FalloId) => void }> = ({ onSelect }) => {
  const [filtro, setFiltro] = useState<string>('todos');
  const categorias = ['todos', 'movilidad', 'haber_inicial', 'pbu', 'autonomos'];
  const visibles = filtro === 'todos' ? FALLOS : FALLOS.filter(f => f.categoria === filtro);

  return (
    <div className="selector-view animate-fade-in">
      {/* Filtro por categoría */}
      <div className="cat-filter">
        {categorias.map(c => (
          <button key={c} className={`cat-btn ${filtro === c ? 'active' : ''}`} onClick={() => setFiltro(c)}>
            {c === 'todos' ? 'Todos' : CATEGORIA_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Grid de fallos */}
      <div className="fallos-grid">
        {visibles.map(f => (
          <div key={f.id} className="fallo-card" onClick={() => onSelect(f.id)} style={{ '--fallo-color': f.color } as React.CSSProperties}>
            <div className="fallo-card-header">
              <div className="fallo-badge" style={{ background: `${f.color}15`, color: f.color, borderColor: `${f.color}30` }}>
                {CATEGORIA_LABELS[f.categoria]}
              </div>
              <div className="fallo-meta">
                <span className="fallo-tribunal">{f.tribunal}</span>
                <span className="fallo-anio">{f.anio}</span>
              </div>
            </div>

            <h3 className="fallo-nombre">{f.nombre}</h3>
            <p className="fallo-desc">{f.descripcion}</p>

            <div className="fallo-ref">
              <BookOpen size={13} />
              <span>{f.referencia}</span>
            </div>

            <div className="fallo-cta">
              Calcular <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ──────────────── Panel de cada fallo ──────────────── */
const PanelFallo: React.FC<{ fallo: FalloInfo; onBack: () => void }> = ({ fallo, onBack }) => {
  // Estados para cada calculadora
  const [haberBase, setHaberBase]     = useState(50000);
  const [fechaBad, setFechaBad]       = useState('2006-12');
  const [anioRemun, setAnioRemun]     = useState(2000);
  const [anioSol, setAnioSol]         = useState(2008);

  // Resultados
  const resBadaro       = calcularBadaro(haberBase, fechaBad);
  const resAlaniz       = calcularAlaniz(haberBase);
  const resDelaude      = calcularDelaude(haberBase);
  const resElliff       = calcularElliff(haberBase, anioRemun, anioSol);
  const resVergara      = calcularVergara(
    Array.from({ length: 60 }, (_, i) => haberBase + i * 5000),
    Array.from({ length: 60 }, (_, i) => haberBase * 0.6 + i * 2000)
  );

  const fmt = (v: number) => `$ ${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="panel-fallo animate-fade-in">
      {/* Header del fallo */}
      <div className="fallo-detail-header" style={{ borderColor: fallo.color }}>
        <button className="btn-back" onClick={onBack}>
          <ChevronLeft size={18} /> Volver a Fallos
        </button>
        <div className="fallo-detail-info">
          <div className="fallo-badge-lg" style={{ background: `${fallo.color}15`, color: fallo.color }}>
            {CATEGORIA_LABELS[fallo.categoria]}
          </div>
          <h2>{fallo.nombre}</h2>
          <div className="fallo-chips">
            <span className="chip tribunal">{fallo.tribunal}</span>
            <span className="chip anio">{fallo.anio}</span>
            <span className="chip ref">{fallo.referencia}</span>
          </div>
        </div>
      </div>

      {/* Descripción y detalle jurídico */}
      <div className="fallo-juridico">
        <div className="fallo-juridico-icon" style={{ color: fallo.color }}>
          <Scale size={20} />
        </div>
        <div>
          <strong className="fallo-juridico-title">{fallo.descripcion}</strong>
          <p className="fallo-juridico-detalle">{fallo.detalle}</p>
        </div>
      </div>

      {/* ====== CALCULADORAS ESPECÍFICAS ====== */}
      <div className="calc-layout">
        <section className="card input-panel">
          <div className="card-header"><h2>Parámetros del Cálculo</h2></div>
          <div className="card-body">

            {(fallo.id === 'badaro') && (
              <>
                <div className="form-group">
                  <label>Haber en Marzo 1995 <span className="tooltip-icon" title="Monto del haber jubilatorio en marzo de 1995, antes del congelamiento."><HelpCircle size={13} /></span></label>
                  <input type="number" className="form-control no-icon" value={haberBase} onChange={e => setHaberBase(+e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Fecha de Destino del Reajuste</label>
                  <select className="form-control no-icon" value={fechaBad} onChange={e => setFechaBad(e.target.value)}>
                    {Object.keys(resBadaro.pasos.reduce((acc, p) => ({ ...acc, [p.fecha]: true }), {})).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="info-box info" style={{ marginTop: '1rem' }}>
                  <Info size={14} style={{ flexShrink: 0 }} />
                  <span>Los coeficientes ISBIC son publicados por INDEC y aplican desde marzo de 1995 hasta septiembre de 2006.</span>
                </div>
              </>
            )}

            {(fallo.id === 'alaniz') && (
              <>
                <div className="form-group">
                  <label>Haber de Febrero 2020</label>
                  <input type="number" className="form-control no-icon" value={haberBase} onChange={e => setHaberBase(+e.target.value)} />
                </div>
                <div className="info-box info" style={{ marginTop: '1rem' }}>
                  <Info size={14} style={{ flexShrink: 0 }} />
                  <span>Alaniz establece que el aumento de <strong>marzo 2020</strong> debió ser del 35.55%, no del 6.12% que otorgó ANSES mediante DNU 163/2020.</span>
                </div>
              </>
            )}

            {(fallo.id === 'delaude') && (
              <>
                <div className="form-group">
                  <label>Haber de Diciembre 2019</label>
                  <input type="number" className="form-control no-icon" value={haberBase} onChange={e => setHaberBase(+e.target.value)} />
                </div>
                <div className="info-box info" style={{ marginTop: '1rem' }}>
                  <Info size={14} style={{ flexShrink: 0 }} />
                  <span>El fallo aplica los 4 aumentos trimestrales de la Ley 27.426 que le hubieran correspondido durante 2020, recomponiendo el haber a enero de 2021.</span>
                </div>
              </>
            )}

            {(fallo.id === 'elliff') && (
              <>
                <div className="form-group">
                  <label>Remuneración a Actualizar</label>
                  <input type="number" className="form-control no-icon" value={haberBase} onChange={e => setHaberBase(+e.target.value)} />
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label>Año de la Remuneración</label>
                    <select className="form-control no-icon" value={anioRemun} onChange={e => setAnioRemun(+e.target.value)}>
                      {Array.from({ length: 15 }, (_, i) => 1994 + i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Año de Solicitud</label>
                    <select className="form-control no-icon" value={anioSol} onChange={e => setAnioSol(+e.target.value)}>
                      {Array.from({ length: 15 }, (_, i) => 1994 + i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {(fallo.id === 'vergara') && (
              <>
                <div className="form-group">
                  <label>Promedio base de remuneraciones de dependencia</label>
                  <input type="number" className="form-control no-icon" value={haberBase} onChange={e => setHaberBase(+e.target.value)} />
                </div>
                <div className="info-box info" style={{ marginTop: '1rem' }}>
                  <Info size={14} style={{ flexShrink: 0 }} />
                  <span>Vergara establece que para beneficiarios mixtos, el promedio se calcula en dos grupos separados de 60 meses cada uno. La simulación usa valores progresivos demostrativos.</span>
                </div>
              </>
            )}

            {(['marinati', 'vargas', 'liechtenstein'].includes(fallo.id)) && (
              <div className="coming-soon-calc">
                <Scale size={40} style={{ color: fallo.color, opacity: 0.5 }} />
                <h3>Calculadora en desarrollo</h3>
                <p>Este módulo requiere datos específicos del expediente. Estará disponible en la próxima versión junto con el módulo de PBU y Autónomos avanzado.</p>
              </div>
            )}
          </div>
        </section>

        {/* Resultados */}
        <div className="resultados-panel">

          {fallo.id === 'badaro' && (
            <>
              <div className="resultado-highlight" style={{ borderColor: fallo.color }}>
                <div className="rh-label">Haber Reajustado (Badaro)</div>
                <div className="rh-value font-mono" style={{ color: fallo.color }}>{fmt(resBadaro.haberReajustado)}</div>
                <div className="rh-sub">Coeficiente ISBIC: <strong>× {resBadaro.coeficiente}</strong> · Aumento: <strong>+{resBadaro.pctAumento}%</strong></div>
              </div>
              <div className="comp-chart card">
                <div className="card-header"><h2>Haber Original vs Reajustado</h2></div>
                <div className="card-body">
                  <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                      <BarChart data={[{ name: 'Original', val: resBadaro.haberOriginal }, { name: 'Badaro', val: resBadaro.haberReajustado }]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                        <RechartsTooltip formatter={(v: any) => fmt(Number(v))} />
                        <Bar dataKey="val" radius={[6,6,0,0]}>
                          <Cell fill="var(--text-muted)" />
                          <Cell fill={fallo.color} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="card" style={{ marginTop: '1rem' }}>
                <div className="card-header"><h2>Evolución por períodos (ISBIC)</h2></div>
                <div className="table-responsive" style={{ maxHeight: 260 }}>
                  <table>
                    <thead><tr><th>Período</th><th>Coef. ISBIC</th><th>Haber</th></tr></thead>
                    <tbody>
                      {resBadaro.pasos.map(p => (
                        <tr key={p.fecha}><td>{p.fecha}</td><td className="font-mono">× {p.coef.toFixed(3)}</td><td className="font-mono">{fmt(p.haber)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {fallo.id === 'alaniz' && (
            <>
              <div className="comp-dos-cols">
                <div className="comp-col anses">
                  <div className="comp-col-label">ANSES (DNU 163/2020)</div>
                  <div className="comp-col-value font-mono">{fmt(resAlaniz.haberConANSES)}</div>
                  <div className="comp-col-pct">+{resAlaniz.pctANSES}%</div>
                </div>
                <div className="comp-col fallo" style={{ borderColor: fallo.color, background: `${fallo.color}08` }}>
                  <div className="comp-col-label">Con Fallo Alaniz</div>
                  <div className="comp-col-value font-mono" style={{ color: fallo.color }}>{fmt(resAlaniz.haberConFallo)}</div>
                  <div className="comp-col-pct" style={{ color: fallo.color }}>+{resAlaniz.pctFallo}%</div>
                </div>
              </div>
              <div className="resultado-highlight" style={{ borderColor: fallo.color }}>
                <div className="rh-label">Diferencia mensual a favor (solo marzo 2020)</div>
                <div className="rh-value font-mono" style={{ color: fallo.color }}>{fmt(resAlaniz.diferenciaMar)}</div>
                <div className="rh-sub">El haber con Alaniz es un <strong>+{resAlaniz.mejora}%</strong> mayor que el de ANSES</div>
              </div>
            </>
          )}

          {fallo.id === 'delaude' && (
            <>
              <div className="resultado-highlight" style={{ borderColor: fallo.color }}>
                <div className="rh-label">Haber recompuesto a Enero 2021</div>
                <div className="rh-value font-mono" style={{ color: fallo.color }}>{fmt(resDelaude.haberEnero2021)}</div>
                <div className="rh-sub">Sobre Dic 2019 ({fmt(haberBase)}) · Acumulado: <strong>+{resDelaude.totalPct}%</strong></div>
              </div>
              <div className="card" style={{ marginTop: '1rem' }}>
                <div className="card-header"><h2>Pasos de Recomposición (Ley 27.426)</h2></div>
                <div className="card-body" style={{ padding: '0.75rem 0' }}>
                  {resDelaude.pasos.map((p, i) => (
                    <div key={i} className="paso-delaude">
                      <CheckCircle2 size={16} color={fallo.color} />
                      <div className="paso-info">
                        <span className="paso-mes">{p.mes}</span>
                        <span className="paso-pct">+{p.pct}%</span>
                      </div>
                      <span className="paso-haber font-mono">{fmt(p.haberResultante)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {fallo.id === 'elliff' && (
            <>
              <div className="resultado-highlight" style={{ borderColor: fallo.color }}>
                <div className="rh-label">Remuneración Actualizada por RIPTE</div>
                <div className="rh-value font-mono" style={{ color: fallo.color }}>{fmt(resElliff.remActualizada)}</div>
                <div className="rh-sub">Coeficiente RIPTE: <strong>× {resElliff.coeficiente}</strong> · Diferencia: <strong>{fmt(resElliff.diferencia)}</strong></div>
              </div>
              <div className="ripte-chips">
                <div className="ripte-chip">
                  <div className="rc-label">RIPTE {anioRemun}</div>
                  <div className="rc-value">{resElliff.ripteBase.toFixed(1)}</div>
                </div>
                <ArrowRight size={20} color="var(--text-muted)" />
                <div className="ripte-chip">
                  <div className="rc-label">RIPTE {anioSol}</div>
                  <div className="rc-value">{resElliff.ripteDestino.toFixed(1)}</div>
                </div>
              </div>
            </>
          )}

          {fallo.id === 'vergara' && (
            <>
              <div className="resultado-highlight" style={{ borderColor: fallo.color }}>
                <div className="rh-label">Promedio Total (Vergara Mixto)</div>
                <div className="rh-value font-mono" style={{ color: fallo.color }}>{fmt(resVergara.promTotal)}</div>
              </div>
              <div className="vergara-breakdown">
                <div className="vb-item blue">
                  <div className="vb-label">Promedio Dependencia ({resVergara.cantDep} meses)</div>
                  <div className="vb-value font-mono">{fmt(resVergara.promDep)}</div>
                </div>
                <div className="vb-plus">+</div>
                <div className="vb-item green">
                  <div className="vb-label">Promedio Autónomo ({resVergara.cantAut} meses)</div>
                  <div className="vb-value font-mono">{fmt(resVergara.promAut)}</div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

/* ──────────────── Componente principal ──────────────── */
export const ReajustesFallos: React.FC = () => {
  const [seleccionado, setSeleccionado] = useState<FalloId | null>(null);
  const fallo = seleccionado ? FALLOS.find(f => f.id === seleccionado) : null;

  return (
    <div className="reajustes-view">
      <header className="page-header">
        <div>
          <h1 className="page-title">Reajustes & Fallos Jurisprudenciales</h1>
          <p className="page-subtitle">
            Calculadoras jurídicas basadas en los principales precedentes del fuero previsional
          </p>
        </div>
      </header>

      {!fallo
        ? <SelectorFallos onSelect={setSeleccionado} />
        : <PanelFallo fallo={fallo} onBack={() => setSeleccionado(null)} />
      }
    </div>
  );
};
