import { 
  Calculator, 
  Home, 
  Scale, 
  Settings, 
  TrendingUp, 
  Users, 
  FileText,
  LineChart
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { getConfig } from '../utils/configStore';
import './Sidebar.css';

const navItems = [
  { icon: Home, label: 'Dashboard', to: '/' },
  { icon: Users, label: 'Mis Clientes', to: '/clientes' },
  { icon: Calculator, label: 'Haber Inicial', to: '/haber-inicial' },
  { icon: TrendingUp, label: 'Movilidad Reciente', to: '/movilidad' },
  { icon: LineChart, label: 'Comparativa Índices', to: '/comparativa' },
  { icon: Scale, label: 'Reajustes & Fallos', to: '/reajustes' },
  { icon: FileText, label: 'Retroactivo', to: '/retroactivo' },
  { icon: Settings, label: 'Configuración', to: '/config' },
];

export const Sidebar: React.FC = () => {
  const cfg = getConfig();
  const initials = cfg.estudio.responsable
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <Scale className="logo-icon" size={28} />
          <h2 className="logo-text">LexPrevi <span className="logo-badge">PRO</span></h2>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">{initials || 'JD'}</div>
          <div className="user-info">
            <span className="user-name">{cfg.estudio.responsable || 'Dr. Juan Doe'}</span>
            <span className="user-role">{cfg.estudio.nombreEstudio || 'Estudio Jurídico'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
