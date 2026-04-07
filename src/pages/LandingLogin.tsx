import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'register';
import { Scale, ChevronRight, Calculator, Shield, Users, FileText, ArrowRight, Check } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './LandingLogin.css';

const PLANES = [
  {
    nombre: 'Starter',
    precio: '$200',
    periodo: '/ año',
    limit: 'Límite de 50 expedientes activos',
    color: '#94a3b8',
    items: ['Liquidación Badaro, Elliff, etc.', 'Gestión de clientes en Nube', 'Cálculo de Retroactivos', 'Soporte prioritario'],
  },
  {
    nombre: 'Enterprise',
    precio: 'Personalizado',
    periodo: '',
    limit: 'Expedientes ilimitados',
    color: '#f8fafc',
    badge: 'ESTUDIOS GRANDES',
    items: ['Todo lo del plan Starter', 'Múltiples usuarios por firma', 'Prioridad de soporte Alta', 'Ingeniería dedicada'],
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

  // Parallax y animaciones de scroll
  const { scrollYProgress } = useScroll();
  
  // Rotación 3D para el Mockup
  const mockupRotateX = useTransform(scrollYProgress, [0, 0.2], [15, 0]);
  const mockupScale = useTransform(scrollYProgress, [0, 0.2], [0.9, 1]);
  const mockupOpacity = useTransform(scrollYProgress, [0, 0.15], [0.5, 1]);

  // Glows Parallax
  const glow1Y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const glow2Y = useTransform(scrollYProgress, [0, 1], [0, -300]);

  useEffect(() => {
    if (modalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const openAuth = (m: Mode) => {
    setMode(m);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError('Credenciales incorrectas.');
    } else {
      if (!nombre.trim()) { setError('Requiere nombre completo.'); setLoading(false); return; }
      const { error } = await signUp(email, password, { nombre_completo: nombre });
      if (error) setError(error);
      else window.location.href = '/registro-exitoso';
    }
    setLoading(false);
  };

  return (
    <div className="landing-premium">
      {/* ── BACKGROUND GLOWS CON PARALLAX ── */}
      <motion.div className="ambient-glow glow-1" style={{ y: glow1Y }} />
      <motion.div className="ambient-glow glow-2" style={{ y: glow2Y }} />

      {/* ── NAV OVERLAY ── */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="nav-glass"
      >
        <div className="nav-container">
          <div className="brand">
            <Scale size={24} className="brand-icon" />
            <span className="brand-text">LexPrevi <span className="brand-badge">PRO</span></span>
          </div>
          <div className="nav-actions">
            <button className="nav-link" onClick={() => openAuth('login')}>Iniciar Sesión</button>
            <button className="btn-apple-primary" onClick={() => openAuth('register')}>Registrarse</button>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO CENTRADO ── */}
      <section className="hero-section center-layout" style={{ perspective: '1200px' }}>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-badge animate-float"
        >
          <span style={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}>Actualizado DNU 274/24</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hero-title"
        >
          El motor de cálculo previsional<br />
          más exacto y seguro.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hero-subtitle"
        >
          Unificamos movilidad, haber inicial y reajustes jurisprudenciales en una arquitectura en la nube de alta precisión, diseñada bajo estándares corporativos.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hero-cta"
        >
          <button className="btn-apple-large" onClick={() => openAuth('register')}>
            Comenzar Prueba
          </button>
        </motion.div>

        {/* ── MOCKUP 3D ANIMADO AL HACER SCROLL ── */}
        <motion.div 
          className="hero-mockup-wrap"
          style={{ 
            rotateX: mockupRotateX, 
            scale: mockupScale, 
            opacity: mockupOpacity,
            transformStyle: 'preserve-3d' 
          }}
        >
          <div className="hero-mockup-glass">
            <div className="mock-header">
              <div className="mock-dots"><span/><span/><span/></div>
              <div className="mock-title">Entorno Seguro — LexPrevi</div>
            </div>
            <div className="mock-body" style={{ padding: 0 }}>
              <img src="/app-showcase.webp" alt="LexPrevi Plataforma Demo" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── BENTO BOX FEATURES CON STAGGER ── */}
      <section className="bento-section">
        <div className="bento-container">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bento-header"
          >
            <h2>Ingeniería Legal. Cero latencia.</h2>
            <p>Todo el fuero de seguridad social procesado nativamente por algoritmos verificados.</p>
          </motion.div>

          <div className="bento-grid">
            {/* Box 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bento-box bento-large flex-col"
            >
              <Calculator size={34} className="bento-icon text-platinum" />
              <h3>Liquidación Paramétrica</h3>
              <p>Badaro, Alaniz, Elliff, PBU, movilidades recientes. Obtenga el haber resultante con topes confiscatorios calculados al centavo de forma instantánea.</p>
            </motion.div>

            {/* Box 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bento-box flex-col"
            >
              <Shield size={34} className="bento-icon text-platinum" />
              <h3>Infraestructura Aislada</h3>
              <p>Protocolos de seguridad bancaria. Sus expedientes y documentos persisten en tenencias impenetrables.</p>
            </motion.div>

            {/* Box 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bento-box flex-col justify-end text-right" 
              style={{ background: 'linear-gradient(to top right, rgba(255,255,255,0.03), transparent)' }}
            >
              <Users size={34} className="bento-icon text-platinum mb-auto ml-auto" />
              <h3>Gestión Analítica</h3>
              <p>Auditoría de estados procesales, métricas e indexación algorítmica.</p>
            </motion.div>

            {/* Box 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bento-box bento-wide flex-row items-center gap-6"
            >
              <div style={{ flex: 1 }}>
                <h3>Documentos Centralizados</h3>
                <p>Prescinda del almacenamiento físico. Adjunte dictámenes de ANSES directo a la ficha electrónica, disponibles globalmente con latencia cero.</p>
              </div>
              <FileText size={70} style={{ opacity: 0.05, color: '#f8fafc' }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PRICING CON EFECTOS HOVER MOTION ── */}
      <section className="pricing-section">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pricing-title"
        >
          Planes Corporativos.
        </motion.h2>
        <div className="pricing-grid">
          {PLANES.map((p, index) => (
            <motion.div 
              key={p.nombre} 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -8 }}
              className="apple-pricing-card"
            >
              {p.badge && <div className="ap-badge" style={{ color: p.color, borderColor: p.color }}>{p.badge}</div>}
              <h3 className="ap-name">{p.nombre}</h3>
              <div className="ap-price-wrap">
                <span className="ap-price">{p.precio}</span>
                <span className="ap-period">{p.periodo}</span>
              </div>
              <p className="ap-limit">{p.limit}</p>
              <ul className="ap-features">
                {p.items.map(i => (
                  <li key={i}><Check size={16} color={p.color} style={{ opacity: 0.7 }} /> {i}</li>
                ))}
              </ul>
              <button className="btn-apple-outline" onClick={() => openAuth('register')} style={{ borderColor: p.color, color: p.color }}>
                Comenzar Prueba
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MODAL AUTH (GLASSMORPHISM) ── */}
      {modalOpen && (
        <div className="glass-modal-overlay animate-in" onMouseDown={(e) => { if(e.target===e.currentTarget) setModalOpen(false)}}>
          <div className="glass-modal animate-scale">
            <button className="glass-close" onClick={() => setModalOpen(false)}><ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /></button>
            <div className="gm-header">
              <Shield size={32} className="gm-icon mx-auto" />
              <h2>{mode === 'login' ? 'Acceso Reservado' : 'Solicitar Admisión'}</h2>
              <p>{mode === 'login' ? 'Ingresá a tu entorno encriptado.' : 'Aplicá para obtener una instancia privada.'}</p>
            </div>

            <div className="auth-tabs">
              <button className={`at-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>Iniciar Sesión</button>
              <button className={`at-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>Registrarse</button>
            </div>

            <form onSubmit={handleSubmit} className="gm-form">
              {mode === 'register' && (
                <div className="gm-field">
                  <div className="gm-input-glass">
                    <Users size={16} className="gm-i" />
                    <input type="text" placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} required />
                  </div>
                </div>
              )}
              <div className="gm-field">
                <div className="gm-input-glass">
                  <div className="gm-i" style={{ fontWeight: 600, fontSize: 14 }}>@</div>
                  <input type="email" placeholder="Correo electrónico corporativo" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="gm-field">
                <div className="gm-input-glass">
                  <div className="gm-i" style={{ fontWeight: 600, fontSize: 14 }}>*</div>
                  <input type={showPwd ? "text" : "password"} placeholder="Constraseña de cifrado" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>

              {error && <div className="gm-error">{error}</div>}

              <button type="submit" className="btn-apple-primary w-full mt-4" style={{ height: 48 }} disabled={loading}>
                {loading ? <span className="spin-minimal" /> : mode === 'login' ? 'Acceder al Sistema' : 'Comenzar Certificación'}
              </button>
            </form>
            
            <p className="gm-disclaimer">Al continuar, aceptás nuestros protocolos de confidencialidad y términos corporativos M-RSA.</p>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="footer-minimal">
        <div className="flex-center gap-2 mb-2">
          <Scale size={18} className="text-platinum" style={{ opacity: 0.8 }} />
          <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>LexPrevi PRO</span>
        </div>
        <p className="footer-txt">Ingeniería en tecnología legal previsional.</p>
        <p className="footer-copy">© 2026 CreApp Studios.</p>
      </footer>
    </div>
  );
};
