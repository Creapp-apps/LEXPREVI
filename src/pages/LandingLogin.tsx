import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Scale, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Users, Shield, FileText } from 'lucide-react';
import './LandingLogin.css';

type Mode = 'login' | 'register';

const PLANES = [
  {
    nombre: 'Starter',
    precio: '$200 / año',
    limit: 'Hasta 50 expedientes',
    color: '#3b82f6',
    items: ['Todos los módulos incluidos', 'Historial y documentos', 'Reajustes jurisprudenciales', 'Soporte por email'],
  },
  {
    nombre: 'Enterprise',
    precio: 'A convenir',
    limit: 'Expedientes ilimitados',
    color: '#8b5cf6',
    badge: 'Estudios Jurídicos',
    items: ['Todo lo de Starter', 'Múltiples usuarios', 'Prioridad en soporte', 'Capacitación incluida'],
  },
];

export const LandingLogin = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode]       = useState<Mode>('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre]   = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError('Email o contraseña incorrectos.');
    } else {
      if (!nombre.trim()) { setError('Ingresá tu nombre completo.'); setLoading(false); return; }
      const { error } = await signUp(email, password, { nombre_completo: nombre });
      if (error) setError(error);
      else setSuccess('¡Cuenta creada! Revisá tu email para confirmar el registro. Luego el equipo de LexPrevi activará tu acceso.');
    }
    setLoading(false);
  };

  return (
    <div className="landing">
      {/* ── NAV ── */}
      <nav className="landing-nav">
        <div className="ln-brand">
          <Scale size={28} className="ln-icon" />
          <span>LexPrevi <span className="ln-badge">PRO</span></span>
        </div>
        <div className="ln-actions">
          <button className={`ln-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Iniciar Sesión</button>
          <button className="btn-outline-sm" onClick={() => setMode('register')}>Solicitar Acceso</button>
        </div>
      </nav>

      <div className="landing-body">
        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-chip">⚖️ Plataforma Previsional Argentina</div>
            <h1 className="hero-title">
              Calculá, liquidá y gestioná<br />
              <span className="hero-gradient">expedientes previsionales</span><br />
              como nunca antes.
            </h1>
            <p className="hero-sub">
              LexPrevi reúne todos los cálculos del fuero previsional argentino en una sola plataforma profesional.
              Badaro, Alaniz, Elliff, retroactivos, movilidades y más — en segundos.
            </p>
            <div className="hero-features">
              {[
                { icon: <Scale size={18} />, label: '8 Fallos Jurisprudenciales' },
                { icon: <FileText size={18} />, label: 'Liquidación de Retroactivos' },
                { icon: <Users size={18} />, label: 'Gestión de Expedientes' },
                { icon: <Shield size={18} />, label: 'Datos seguros en la nube' },
              ].map(f => (
                <div key={f.label} className="hf-item">
                  {f.icon} <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── FORM ── */}
          <div className="auth-card">
            <div className="auth-tabs">
              <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                Iniciar Sesión
              </button>
              <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
                Registrarse
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="auth-field">
                  <label>Nombre Completo</label>
                  <div className="input-wrap">
                    <Users size={16} className="input-icon" />
                    <input type="text" placeholder="Dr. Juan Pérez" value={nombre}
                      onChange={e => setNombre(e.target.value)} required />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label>Email Profesional</label>
                <div className="input-wrap">
                  <Mail size={16} className="input-icon" />
                  <input type="email" placeholder="dr.perez@estudio.com.ar" value={email}
                    onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="auth-field">
                <label>{mode === 'login' ? 'Contraseña' : 'Crear Contraseña'}</label>
                <div className="input-wrap">
                  <Lock size={16} className="input-icon" />
                  <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)} required minLength={6} />
                  <button type="button" className="input-toggle" onClick={() => setShowPwd(p => !p)}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error   && <div className="auth-error">{error}</div>}
              {success && (
                <div className="auth-success">
                  <CheckCircle2 size={15} /> {success}
                </div>
              )}

              {!success && (
                <button type="submit" className="btn-auth" disabled={loading}>
                  {loading ? <span className="spin-sm" /> : <ArrowRight size={18} />}
                  {mode === 'login' ? 'Ingresar a LexPrevi' : 'Solicitar Acceso'}
                </button>
              )}

              {mode === 'register' && !success && (
                <p className="auth-note">
                  Tu solicitud será revisada y activada manualmente por el equipo de LexPrevi. Recibirás un email de confirmación.
                </p>
              )}
            </form>
          </div>
        </section>

        {/* ── PLANES ── */}
        <section className="planes-section" id="planes">
          <h2 className="section-title">Planes y Precios</h2>
          <p className="section-sub">Todos los planes incluyen acceso completo a todos los módulos. La diferencia es la escala.</p>
          <div className="planes-grid">
            {PLANES.map(p => (
              <div key={p.nombre} className="plan-card" style={{ borderTopColor: p.color }}>
                {p.badge && <div className="plan-badge" style={{ background: p.color }}>{p.badge}</div>}
                <div className="plan-nombre" style={{ color: p.color }}>{p.nombre}</div>
                <div className="plan-precio">{p.precio}</div>
                <div className="plan-limit">{p.limit}</div>
                <ul className="plan-items">
                  {p.items.map(i => <li key={i}><CheckCircle2 size={14} style={{ color: p.color }} /> {i}</li>)}
                </ul>
                <button className="btn-plan" style={{ background: p.color }}
                  onClick={() => setMode('register')}>
                  Comenzar ahora
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="landing-footer">
          <div className="lf-brand"><Scale size={20} /> LexPrevi PRO</div>
          <p>Desarrollado por <strong>CreApp</strong> · Plataforma Previsional Argentina</p>
          <p>contacto: creapp.ar@gmail.com</p>
        </footer>
      </div>
    </div>
  );
};
