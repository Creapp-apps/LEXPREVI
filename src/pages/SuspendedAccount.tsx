import { Scale, AlertTriangle, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SuspendedAccount = () => {
  const { signOut, suscripcion } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050d1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '2rem',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 20,
        padding: '3rem',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
      }}>
        <Scale size={40} color="#3b82f6" style={{ marginBottom: '1rem' }} />
        <AlertTriangle size={32} color="#ef4444" style={{ marginBottom: '1.25rem' }} />
        <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          Cuenta {suscripcion?.estado === 'vencido' ? 'Vencida' : 'Suspendida'}
        </h1>
        <p style={{ color: 'rgba(248,250,252,0.5)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          {suscripcion?.estado === 'vencido'
            ? 'Tu período de acceso ha vencido. Contactá al equipo de LexPrevi para renovar tu suscripción y volver a acceder a todos tus expedientes.'
            : 'Tu cuenta ha sido suspendida temporalmente. Contactá a LexPrevi para regularizar tu situación.'}
        </p>
        {suscripcion?.fecha_vencimiento && (
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1.75rem' }}>
            Venció el: {new Date(suscripcion.fecha_vencimiento).toLocaleDateString('es-AR')}
          </p>
        )}
        <a href="mailto:creapp.ar@gmail.com" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.875rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          color: 'white', borderRadius: 10, fontWeight: 700, fontSize: '0.9375rem',
          textDecoration: 'none', marginBottom: '1rem',
        }}>
          <Mail size={18} /> Contactar a LexPrevi
        </a>
        <br />
        <button onClick={signOut} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
          fontSize: '0.8125rem', cursor: 'pointer', marginTop: '0.75rem',
        }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
