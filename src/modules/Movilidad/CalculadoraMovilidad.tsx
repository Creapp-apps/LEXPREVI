import { useState, useMemo } from 'react';
import { Calculator, HelpCircle, Calendar, DollarSign, TrendingUp, Download } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import { calcularEmpalmeDNU, movilidadDNU2024 } from '../../utils/indicesMovilidad';
import './Movilidad.css';

export const CalculadoraMovilidad: React.FC = () => {
  const [haberInicial, setHaberInicial] = useState<number>(105712.61); // Mínima de dic 2023 base ej
  const [periodoDesde, setPeriodoDesde] = useState<string>('2023-12');
  
  const resultados = useMemo(() => {
    return calcularEmpalmeDNU(haberInicial, periodoDesde);
  }, [haberInicial, periodoDesde]);

  const chartData = useMemo(() => {
    return resultados.historial.map(r => ({
      name: r.periodo.split('-').reverse().join('/'),
      Haber: r.haberBeneficio,
      Bono: r.bonoAplicado,
      Total: r.cobroTotal,
      Inflacion: movilidadDNU2024.find(m => m.periodo === r.periodo)?.inflacion || 0,
      Aumento: r.aumentoPorcentaje
    }));
  }, [resultados.historial]);

  return (
    <div className="movilidad-view animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Movilidad Reciente (DNU 274/2024)</h1>
          <p className="page-subtitle">Calculadora interactiva: empalme Ley 27.609 hacia ajuste mensual por IPC.</p>
        </div>
      </header>

      <div className="movilidad-layout">
        {/* PANEL DE INGRESO DE DATOS */}
        <section className="input-panel card">
          <div className="card-header">
            <h2>Datos del Beneficio</h2>
            <Calculator size={20} className="text-muted" />
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>
                Haber Inicial Analizado
                <span className="tooltip-icon" title="Ingresar el haber sin los bonos ni sumas extraordinarias.">
                  <HelpCircle size={14} />
                </span>
              </label>
              <div className="input-with-icon">
                <DollarSign size={18} className="input-icon" />
                <input 
                  type="number" 
                  value={haberInicial}
                  onChange={(e) => setHaberInicial(Number(e.target.value))}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Período de Inicio</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <select 
                  value={periodoDesde}
                  onChange={(e) => setPeriodoDesde(e.target.value)}
                  className="form-control"
                >
                  <option value="2023-12">Diciembre 2023 (Ley previa)</option>
                  <option value="2024-03">Marzo 2024 (Último aumento Ley)</option>
                  <option value="2024-04">Abril 2024 (Empalme DNU 274)</option>
                  <option value="2024-07">Julio 2024 (IPC puro)</option>
                </select>
              </div>
            </div>

            <div className="info-box info">
              <h4>DNU 274/2024</h4>
              <p>A partir de abril 2024, los haberes se actualizan mensualmente por el IPC de dos meses hacia atrás. En abril hubo un compensatorio del 12.5% adicional.</p>
            </div>
            
            <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Procesar Cálculo
            </button>
          </div>
        </section>

        {/* PANEL DE RESULTADOS */}
        <div className="results-container">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-title">Último Haber Calculado</div>
              <div className="summary-value font-mono">
                $ {resultados.haberFinal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="summary-card highlight">
              <div className="summary-title">Último Cobro Total (C/ Bonos)</div>
              <div className="summary-value font-mono">
                $ {resultados.historial[resultados.historial.length - 1]?.cobroTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <section className="card chart-card">
            <div className="card-header">
              <h2>Evolución del Haber vs Bono</h2>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(val) => `$${val / 1000}k`} axisLine={false} tickLine={false} />
                    <RechartsTooltip formatter={(value: any) => `$ ${value.toLocaleString('es-AR', {maximumFractionDigits: 0})}`} />
                    <Legend />
                    <Bar dataKey="Haber" stackId="a" fill="var(--brand-primary)" />
                    <Bar dataKey="Bono" stackId="a" fill="var(--accent-warning)" />
                    <Line type="monotone" dataKey="Total" stroke="var(--accent-success)" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="card table-card">
        <div className="card-header">
          <h2>Detalle Mensual de Movilidad</h2>
          <button className="btn-secondary flex-center gap-2">
            <Download size={16} /> Exportar
          </button>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Período</th>
                <th>Concepto / Ley</th>
                <th>% Aumento</th>
                <th>Haber (PC+PAP+PBU)</th>
                <th>Bono</th>
                <th>Total a Cobrar</th>
              </tr>
            </thead>
            <tbody>
              {resultados.historial.map((item, index) => (
                <tr key={index}>
                  <td><strong>{item.periodo.split('-').reverse().join('/')}</strong></td>
                  <td>{item.descripcion}</td>
                  <td className={item.aumentoPorcentaje > 0 ? 'text-success' : ''}>
                    {item.aumentoPorcentaje > 0 ? `+${item.aumentoPorcentaje}%` : '-'}
                  </td>
                  <td className="font-mono">$ {item.haberBeneficio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="font-mono">$ {item.bonoAplicado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="font-mono font-bold">$ {item.cobroTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
