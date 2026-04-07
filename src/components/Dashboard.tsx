import { 
  ArrowUpRight, 
  Clock, 
  FileCheck, 
  AlertCircle,
  Search,
  TrendingUp
} from 'lucide-react';
import './Dashboard.css';

const recentCases = [
  { id: 'EXP-10492', client: 'García, Marta Susana', type: 'Reajuste (Badaro)', status: 'En Proceso', date: '04/04/2026', amount: '$ 452.100' },
  { id: 'EXP-10491', client: 'Pérez, Juan Carlos', type: 'Haber Inicial', status: 'Finalizado', date: '02/04/2026', amount: '$ 328.500' },
  { id: 'EXP-10490', client: 'López, Aníbal', type: 'Movilidad DNU 274', status: 'Pendiente', date: '30/03/2026', amount: '-' },
  { id: 'EXP-10489', client: 'Fernández, Silvia', type: 'Reajuste PBU (Marinati)', status: 'Finalizado', date: '28/03/2026', amount: '$ 510.800' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general de tus cálculos previsionales.</p>
        </div>
        
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Buscar expedientes, clientes..." />
        </div>
      </header>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <FileCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Expedientes</h3>
            <div className="stat-value">1,492</div>
            <p className="stat-trend positive">
              <ArrowUpRight size={16} /> +12% este mes
            </p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Retroactivos Proyectados</h3>
            <div className="stat-value">$ 18.4M</div>
            <p className="stat-trend positive">
              <ArrowUpRight size={16} /> +5% este mes
            </p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Casos Pendientes</h3>
            <div className="stat-value">34</div>
            <p className="stat-trend">Requieren análisis de tope</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Confiscatoriedades</h3>
            <div className="stat-value">12</div>
            <p className="stat-trend">Superan el 15% (Actis Caporale)</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="card recent-cases-table">
          <div className="card-header">
            <h2>Últimos Casos Calculados</h2>
            <button className="btn-secondary">Ver Todos</button>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Expediente</th>
                  <th>Cliente</th>
                  <th>Tipo de Cálculo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Haber Resultante</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.id}</strong></td>
                    <td>{c.client}</td>
                    <td>{c.type}</td>
                    <td>{c.date}</td>
                    <td>
                      <span className={`status-badge ${c.status === 'Finalizado' ? 'success' : c.status === 'En Proceso' ? 'warning' : 'default'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="font-mono">{c.amount}</td>
                    <td>
                      <button className="btn-table">Abrir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
