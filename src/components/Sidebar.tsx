import { Calculator, Home, Scale, Settings, TrendingUp, Users, FileText, LineChart, LogOut, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const navItems = [
  { icon: Home,       label: 'Dashboard',          to: '/'           },
  { icon: Users,      label: 'Mis Clientes',        to: '/clientes'   },
  { icon: Calculator, label: 'Haber Inicial',        to: '/haber-inicial' },
  { icon: TrendingUp, label: 'Movilidad Reciente',  to: '/movilidad'  },
  { icon: LineChart,  label: 'Comparativa Índices', to: '/comparativa'},
  { icon: Scale,      label: 'Reajustes & Fallos',  to: '/reajustes'  },
  { icon: FileText,   label: 'Retroactivo',          to: '/retroactivo'},
  { icon: Settings,   label: 'Configuración',        to: '/config'     },
];

export const Sidebar: React.FC = () => {
  const { profile, suscripcion, isAdmin, signOut } = useAuth();

  const nombre   = isAdmin ? 'Equipo CreApp' : (profile?.nombre_completo || profile?.email || 'Usuario');
  const estudio  = isAdmin ? 'Super Admin'   : (profile?.nombre_estudio  || 'Estudio Jurídico');
  const initials = isAdmin ? 'CR' : nombre.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <Scale className="logo-icon" size={28} />
          <h2 className="logo-text">LexPrevi <span className="logo-badge">PRO</span></h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin && (
          <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={20} className="nav-icon" />
            <span className="nav-label">Panel Admin</span>
          </NavLink>
        )}
        {navItems.map(item => (
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
        {/* Badge de plan/suscripción */}
        {suscripcion && !isAdmin && (
          <div className="plan-badge-sidebar">
            <span className={`plan-dot ${suscripcion.estado}`} />
            <span>{suscripcion.plan_nombre}</span>
            {suscripcion.fecha_vencimiento && (
              <span className="plan-exp">
                vence {new Date(suscripcion.fecha_vencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
              </span>
            )}
          </div>
        )}

        <div className="user-profile">
          <div className="avatar">{initials || '??'}</div>
          <div className="user-info">
            <span className="user-name">{nombre}</span>
            <span className="user-role">{estudio}</span>
          </div>
          <button className="btn-signout" onClick={signOut} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
