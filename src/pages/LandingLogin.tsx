import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Scale, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Users, Shield, FileText, ChevronRight, Calculator, Clock, Check, X } from 'lucide-react';
import './LandingLogin.css';

type Mode = 'login' | 'register';

const PLANES = [
  {
    nombre: 'Starter',
    precio: '$200',
    periodo: '/ año',
    limit: 'Límite de 50 expedientes activos',
    color: '#3b82f6',
    items: ['Liquidación Badaro, Elliff, etc.', 'Gestión de clientes en Nube', 'Cálculo de Retroactivos', 'Soporte vía Email'],
  },
  {
    nombre: 'Enterprise',
    precio: 'Personalizado',
    periodo: '',
    limit: 'Expedientes ilimitados',
    color: '#a855f7',
    badge: 'ESTUDIOS GRANDES',
    items: ['Todo lo del plan Starter', 'Múltiples usuarios por firma', 'Prioridad de soporte Alta', 'Capacitación al personal'],
  },
];

export const LandingLogin = () => {
  const { signIn, signUp } = useAuth();
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode]           = useState<Mode>('login');
  
  // Auth Form State
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [nombre, setNombre]       = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Prevenir scroll en body al abrir modal
  useEffect(() => {
    if (modalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const openAuth = (m: Mode) => {
    setMode(m);
    setError('');
    // Reseteamos el success se manejara por redireccion
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError('Email o contraseña incorrectos.');
    } else {
      if (!nombre.trim()) { setError('Ingresá tu nombre completo.'); setLoading(false); return; }
      const { error } = await signUp(email, password, { nombre_completo: nombre });
      if (error) setError(error);
      else window.location.href = '/registro-exitoso';
    }
    setLoading(false);
  };

  return (
    <div className="landing-premium">
      {/* ── BACKGROUND GLOWS ── */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      {/* ── NAV OVERLAY ── */}
      <nav className="nav-glass">
        <div className="nav-container">
          <div className="brand">
            <Scale size={26} className="brand-icon" />
            <span className="brand-text">LexPrevi <span className="brand-badge">PRO</span></span>
          </div>
          <div className="nav-actions">
            <button className="nav-link" onClick={() => openAuth('login')}>Iniciar sesión</button>
            <button className="btn-apple-primary" onClick={() => openAuth('register')}>Solicitar Acceso</button>
          </div>
        </div>
      </nav>

      {/* ── HERO CENTRADO ── */}
      <section className="hero-section center-layout">
        <div className="hero-badge animate-float">
          <span>Actualizado DNU 274/24</span> <ChevronRight size={14} />
        </div>
        
        <h1 className="hero-title reveal-text">
          El motor de cálculo previsional<br />
          más exacto, en la nube.
        </h1>
        
        <p className="hero-subtitle reveal-text delay-1">
          LexPrevi unifica movilidad, haber inicial y reajustes jurisprudenciales en un ecosistema hermoso, privado y de nivel corporativo para estudios jurídicos.
        </p>
        
        <div className="hero-cta reveal-text delay-2">
          <button className="btn-apple-large" onClick={() => openAuth('register')}>
            Comenzar Prueba <ArrowRight size={18} />
          </button>
        </div>

        {/* MOCKUP FLOTANTE */}
        <div className="hero-mockup-wrap reveal-up delay-3">
          <div className="hero-mockup-glass">
            {/* Si alguna vez exportamos un img, iría aquí. Mientras usamos una UI abstracta. */}
            <div className="mock-header">
              <div className="mock-dots"><span/><span/><span/></div>
              <div className="mock-title">lexprevi.vercel.app/badaro</div>
            </div>
            <div className="mock-body">
              <div className="mock-sidebar" />
              <div className="mock-content">
                <div className="mock-graph" />
                <div className="mock-details" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENTO BOX FEATURES ── */}
      <section className="bento-section">
        <div className="bento-container">
          <div className="bento-header">
            <h2>Diseñado para abogados que detestan perder el tiempo.</h2>
            <p>Todo el fuero de seguridad social corriendo nativamente a la velocidad de la luz.</p>
          </div>

          <div className="bento-grid">
            {/* Box 1 - Grande */}
            <div className="bento-box bento-large flex-col">
              <Calculator size={40} className="bento-icon text-blue" />
              <h3>Liquidación Ultra-Rápida</h3>
              <p>Badaro, Alaniz, Elliff, PBU, Movilidades recientes. Ingresa las rentas, selecciona el fallo, y obtén el haber resultante con topes confiscatorios calculados al centavo al instante.</p>
            </div>
            {/* Box 2 */}
            <div className="bento-box flex-col">
              <Shield size={34} className="bento-icon text-purple" />
              <h3>Aislamiento Multi-Tenant</h3>
              <p>Seguridad nivel banco. Tus expedientes y documentos viven en contenedores asilados criptográficamente.</p>
            </div>
            {/* Box 3 */}
            <div className="bento-box flex-col justify-end text-right" style={{ background: 'linear-gradient(to top right, rgba(59,130,246,0.1), transparent)' }}>
              <Users size={34} className="bento-icon text-cyan mb-auto ml-auto" />
              <h3>Gestión de Cartera</h3>
              <p>Control de estados, historial clínico por cliente e indexación inteligente.</p>
            </div>
            {/* Box 4 */}
            <div className="bento-box bento-wide flex-row items-center gap-6">
              <div style={{ flex: 1 }}>
                <h3>Documentos en la Nube</h3>
                <p>Abandona los pendrives. Sube el PDF de Anses directamente a la ficha del cliente y visualízalo estés donde estés.</p>
              </div>
              <FileText size={80} style={{ opacity: 0.1, color: '#f8fafc' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING APPLE-STYLE ── */}
      <section className="pricing-section">
        <h2 className="pricing-title">Profesionalidad a tu alcance.</h2>
        <div className="pricing-grid">
          {PLANES.map(p => (
            <div key={p.nombre} className="apple-pricing-card">
              {p.badge && <div className="ap-badge" style={{ color: p.color }}>{p.badge}</div>}
              <h3 className="ap-name">{p.nombre}</h3>
              <div className="ap-price-wrap">
                <span className="ap-price">{p.precio}</span>
                <span className="ap-period">{p.periodo}</span>
              </div>
              <p className="ap-limit">{p.limit}</p>
              <ul className="ap-features">
                {p.items.map(i => (
                  <li key={i}><Check size={16} color={p.color} /> {i}</li>
                ))}
              </ul>
              <button className="btn-apple-outline" onClick={() => openAuth('register')} style={{ borderColor: p.color, color: p.color }}>
                Comenzar con {p.nombre}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-minimal">
        <div className="flex-center gap-2 mb-2">
          <Scale size={20} className="text-blue" />
          <span style={{ fontWeight: 600 }}>LexPrevi PRO</span>
        </div>
        <p className="footer-txt">Ingeniería Web para el sector legal previsional.</p>
        <p className="footer-copy">© 2026 CreApp Studios.</p>
      </footer>

      {/* ── MODAL AUTHENTICATION (GLASS PORTAL) ── */}
      {modalOpen && (
        <div className="glass-modal-overlay animate-in" onClick={() => setModalOpen(false)}>
          <div className="glass-modal animate-scale" onClick={e => e.stopPropagation()}>
            <button className="glass-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            
            <div className="gm-header">
              <Scale size={32} className="gm-icon" />
              <h2>{mode === 'login' ? 'Iniciar Sesión' : 'Crea tu cuenta'}</h2>
              <p>{mode === 'login' ? 'Accede a tu panel en la nube.' : 'Solicita acceso al sistema maestro.'}</p>
            </div>

            <form className="gm-form" onSubmit={handleSubmit}>
              <div className="auth-tabs">
                <button type="button" className={`at-tab ${mode==='login' ? 'active' : ''}`} onClick={()=>setMode('login')}>Ingresar</button>
                <button type="button" className={`at-tab ${mode==='register' ? 'active' : ''}`} onClick={()=>setMode('register')}>Solicitar</button>
              </div>

              {mode === 'register' && (
                <div className="gm-field">
                  <div className="gm-input-glass">
                    <Users size={18} className="gm-i" />
                    <input autoFocus type="text" placeholder="Tu Nombre o Estudio" value={nombre} onChange={e => setNombre(e.target.value)} required />
                  </div>
                </div>
              )}

              <div className="gm-field">
                <div className="gm-input-glass">
                  <Mail size={18} className="gm-i" />
                  <input autoFocus={mode === 'login'} type="email" placeholder="Email profesional" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="gm-field">
                <div className="gm-input-glass">
                  <Lock size={18} className="gm-i" />
                  <input type={showPwd ? 'text' : 'password'} placeholder="Contraseña segura" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  <button type="button" className="gm-btn-icon" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              {error && <div className="gm-error">{error}</div>}

              <button type="submit" className="btn-apple-primary w-full mt-4" disabled={loading}>
                {loading ? <span className="spin-minimal"/> : (mode === 'login' ? 'Entrar a LexPrevi' : 'Continuar Seguro')}
              </button>

              {mode === 'register' && (
                <p className="gm-disclaimer">
                  Tu solicitud se enviará a revisión. Estarás confirmando las Condiciones de Uso Privadas de la plataforma.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
