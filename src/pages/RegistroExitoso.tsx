import { Scale, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LandingLogin.css';

export const RegistroExitoso = () => {
  const navigate = useNavigate();

  return (
    <div className="landing" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="landing-nav">
        <div className="ln-brand" onClick={() => navigate('/bienvenido')} style={{ cursor: 'pointer' }}>
          <Scale size={28} className="ln-icon" />
          <span>LexPrevi <span className="ln-badge">PRO</span></span>
        </div>
      </nav>

      <div className="landing-body" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: 450, marginTop: '-5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.1)', border: '2px solid rgba(16, 185, 129, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#10b981'
            }}>
              <CheckCircle2 size={32} />
            </div>
          </div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>
            ¡Solicitud Enviada!
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Hemos registrado tu cuenta con éxito. En los próximos minutos vas a recibir un correo electrónico para <strong>confirmar tu identidad</strong>.
          </p>

          <div style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border-light)', 
            padding: '1.25rem', borderRadius: 12, marginBottom: '2rem',
            display: 'flex', gap: '1rem', alignItems: 'flex-start', textAlign: 'left'
          }}>
            <Mail size={24} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ color: 'white', fontWeight: 500, marginBottom: '0.25rem' }}>Revisá tu bandeja de entrada</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Hacé clic en el enlace de confirmación que te eviamos. Si no lo ves, buscá en la carpeta de Spam.
              </p>
            </div>
          </div>

          <button className="btn-auth" onClick={() => navigate('/bienvenido')}>
            Volver al Inicio <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
