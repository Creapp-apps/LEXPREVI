import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users, Plus, ShieldCheck, Mail, CheckCircle2, XCircle,
  RefreshCw, AlertTriangle, Edit3, X, Save, Eye, EyeOff,
  TrendingUp, Clock, DollarSign, UserCheck,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import './AdminPanel.css';

/* ── Tipos ─────────────────────────────────────────────── */
interface Plan {
  id: string;
  nombre: string;
  max_expedientes: number | null;
  precio_anual: number | null;
}

interface UsuarioAdmin {
  id: string;
  email: string;
  nombre_completo: string;
  nombre_estudio: string;
  rol: string;
  activo: boolean;
  fecha_alta: string;
  notas_admin?: string;
  suscripcion?: {
    id: string;
    estado: string;
    fecha_inicio: string;
    fecha_vencimiento: string | null;
    monto_pagado: number | null;
    forma_pago: string | null;
    notas: string | null;
    plan_nombre: string;
  };
  total_clientes?: number;
}

const ESTADOS_SUS = ['trial', 'activo', 'vencido', 'suspendido'];
const FORMAS_PAGO = ['transferencia', 'efectivo', 'mercadopago', 'otro'];

const ESTADO_COLOR: Record<string, string> = {
  activo:     '#10b981',
  trial:      '#3b82f6',
  vencido:    '#ef4444',
  suspendido: '#94a3b8',
};

/* ── Estadísitica rápida ─────────────────────────────── */
const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
  <div className="admin-stat">
    <div className="as-icon" style={{ background: `${color}18`, color }}>{icon}</div>
    <div><div className="as-val">{value}</div><div className="as-label">{label}</div></div>
  </div>
);

/* ── Modal de edición/alta ─────────────────────────────── */
const ModalUsuario: React.FC<{
  usuario?: UsuarioAdmin;
  planes: Plan[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ usuario, planes, onClose, onSaved }) => {
  const esNuevo = !usuario;

  const [email,     setEmail]     = useState(usuario?.email ?? '');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [nombre,    setNombre]    = useState(usuario?.nombre_completo ?? '');
  const [estudio,   setEstudio]   = useState(usuario?.nombre_estudio ?? '');
  const [activo,    setActivo]    = useState(usuario?.activo ?? true);
  const [notasAdmin,setNotas]     = useState(usuario?.notas_admin ?? '');

  // Suscripción
  const planDefault = planes[0]?.id ?? '';
  const [planId,    setPlanId]    = useState(
    planes.find(p => p.nombre === usuario?.suscripcion?.plan_nombre)?.id ?? planDefault
  );
  const [estado,    setEstado]    = useState(usuario?.suscripcion?.estado ?? 'trial');
  const [vencimiento, setVenc]    = useState(usuario?.suscripcion?.fecha_vencimiento?.split('T')[0] ?? '');
  const [monto,     setMonto]     = useState<string>(usuario?.suscripcion?.monto_pagado?.toString() ?? '');
  const [formaPago, setFormaPago] = useState(usuario?.suscripcion?.forma_pago ?? '');
  const [notasSus,  setNotasSus]  = useState(usuario?.suscripcion?.notas ?? '');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSave = async () => {
    setError('');
    if (!email.trim()) { setError('El email es obligatorio.'); return; }
    setLoading(true);

    try {
      if (esNuevo) {
        // Crear usuario en Supabase Auth
        if (!password || password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return; }
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nombre_completo: nombre },
        });
        if (authErr) throw authErr;

        // El trigger crea el profile automáticamente, esperamos un momento
        await new Promise(r => setTimeout(r, 800));

        // Actualizar profile con datos adicionales
        if (authData.user) {
          await supabase.from('profiles').update({
            nombre_completo: nombre,
            nombre_estudio:  estudio,
            activo,
            notas_admin: notasAdmin,
          }).eq('id', authData.user.id);

          // Actualizar suscripción creada por el trigger
          await supabase.from('suscripciones')
            .update({ plan_id: planId, estado, fecha_vencimiento: vencimiento || null,
              monto_pagado: monto ? parseFloat(monto) : null,
              forma_pago: formaPago || null, notas: notasSus || null })
            .eq('user_id', authData.user.id);
        }
      } else {
        // Actualizar perfil existente
        await supabase.from('profiles').update({
          nombre_completo: nombre,
          nombre_estudio:  estudio,
          activo,
          notas_admin: notasAdmin,
        }).eq('id', usuario!.id);

        // Actualizar suscripción
        if (usuario!.suscripcion?.id) {
          await supabase.from('suscripciones').update({
            plan_id: planId, estado,
            fecha_vencimiento: vencimiento || null,
            monto_pagado: monto ? parseFloat(monto) : null,
            forma_pago: formaPago || null,
            notas: notasSus || null,
          }).eq('id', usuario!.suscripcion.id);
        }
      }

      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Error al guardar. Verificá los datos.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-body" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{esNuevo ? 'Nuevo Abogado' : `Editar: ${usuario?.nombre_completo || usuario?.email}`}</h2>
          <button className="btn-icon-sm" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-content">
          {/* Datos personales */}
          <div className="modal-section">
            <div className="modal-section-title">Datos del Usuario</div>
            <div className="modal-grid">
              <div className="form-group col-span-2">
                <label>Email *</label>
                <input className="form-control no-icon" type="email" value={email}
                  onChange={e => setEmail(e.target.value)} disabled={!esNuevo}
                  placeholder="dr.perez@estudio.com.ar" />
              </div>
              {esNuevo && (
                <div className="form-group col-span-2">
                  <label>Contraseña Inicial *</label>
                  <div style={{ display: 'flex', gap: 0 }}>
                    <input className="form-control no-icon" type={showPwd ? 'text' : 'password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres" style={{ borderRadius: '8px 0 0 8px' }} />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      style={{ padding: '0 0.875rem', border: '1px solid var(--border-light)', borderLeft: 'none', borderRadius: '0 8px 8px 0', background: 'var(--bg-surface-hover)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    El usuario recibirá un email de confirmación y podrá cambiar su contraseña.
                  </span>
                </div>
              )}
              <div className="form-group">
                <label>Nombre Completo</label>
                <input className="form-control no-icon" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Dr. Juan Pérez" />
              </div>
              <div className="form-group">
                <label>Estudio Jurídico</label>
                <input className="form-control no-icon" value={estudio} onChange={e => setEstudio(e.target.value)} placeholder="Estudio Previsional" />
              </div>
              <div className="form-group col-span-2">
                <label>Notas Internas (solo el admin las ve)</label>
                <textarea className="form-control no-icon" rows={2} value={notasAdmin}
                  onChange={e => setNotas(e.target.value)} placeholder="Cómo lo conociste, acuerdo especial, etc." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div className="form-group">
                <div className="toggle-row">
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Cuenta Activa</span>
                  <button className={`toggle-btn ${activo ? 'on' : 'off'}`} onClick={() => setActivo(p => !p)}>
                    {activo ? 'SÍ' : 'NO'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Suscripción */}
          <div className="modal-section">
            <div className="modal-section-title">Suscripción y Pago</div>
            <div className="modal-grid">
              <div className="form-group">
                <label>Plan</label>
                <select className="form-control no-icon" value={planId} onChange={e => setPlanId(e.target.value)}>
                  {planes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.max_expedientes ? `(${p.max_expedientes} exp.)` : '(Ilimitado)'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select className="form-control no-icon" value={estado} onChange={e => setEstado(e.target.value)}>
                  {ESTADOS_SUS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Vencimiento</label>
                <input type="date" className="form-control no-icon" value={vencimiento} onChange={e => setVenc(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Monto Pagado ($)</label>
                <input type="number" className="form-control no-icon" value={monto} onChange={e => setMonto(e.target.value)} placeholder="200" />
              </div>
              <div className="form-group">
                <label>Forma de Pago</label>
                <select className="form-control no-icon" value={formaPago} onChange={e => setFormaPago(e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  {FORMAS_PAGO.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group col-span-2">
                <label>Notas del Pago</label>
                <input className="form-control no-icon" value={notasSus} onChange={e => setNotasSus(e.target.value)} placeholder="Ej: Pago recibido vía MP el 5/4/2026" />
              </div>
            </div>
          </div>

          {error && <div className="info-box danger"><AlertTriangle size={14}/> {error}</div>}

          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn-primary flex-center gap-2" onClick={handleSave} disabled={loading}>
              {loading ? <span className="upload-spinner" /> : <Save size={16}/>}
              {esNuevo ? 'Crear Usuario' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ── Panel principal ──────────────────────────────────── */
export const AdminPanel: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [planes,   setPlanes]   = useState<Plan[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState<UsuarioAdmin | null | 'nuevo'>(null);
  const [busqueda, setBusqueda] = useState('');

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: plans }] = await Promise.all([
      supabase.from('profiles').select('*').neq('rol', 'admin').order('fecha_alta', { ascending: false }),
      supabase.from('planes').select('*').eq('activo', true),
    ]);

    if (plans) setPlanes(plans);

    if (profs) {
      // Cargar suscripciones + conteo de clientes
      const enriched = await Promise.all(profs.map(async p => {
        const [{ data: sus }, { count }] = await Promise.all([
          supabase.from('suscripciones')
            .select('id, estado, fecha_inicio, fecha_vencimiento, monto_pagado, forma_pago, notas, planes(nombre)')
            .eq('user_id', p.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('user_id', p.id),
        ]);

        return {
          ...p,
          total_clientes: count ?? 0,
          suscripcion: sus ? {
            ...sus,
            plan_nombre: (sus as any).planes?.nombre ?? 'STARTER',
          } : undefined,
        } as UsuarioAdmin;
      }));
      setUsuarios(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtrados = usuarios.filter(u =>
    u.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const stats = {
    total:      usuarios.length,
    activos:    usuarios.filter(u => u.suscripcion?.estado === 'activo').length,
    trial:      usuarios.filter(u => u.suscripcion?.estado === 'trial').length,
    vencidos:   usuarios.filter(u => u.suscripcion?.estado === 'vencido' || u.suscripcion?.estado === 'suspendido').length,
    ingresos:   usuarios.reduce((s, u) => s + (u.suscripcion?.monto_pagado ?? 0), 0),
  };

  return (
    <div className="admin-panel animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ShieldCheck size={26} color="var(--brand-primary)" /> Panel de Administración
          </h1>
          <p className="page-subtitle">Gestión de usuarios, planes y pagos — LexPrevi SaaS</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary flex-center gap-2" onClick={load}>
            <RefreshCw size={15} /> Actualizar
          </button>
          <button className="btn-primary flex-center gap-2" onClick={() => setModal('nuevo')}>
            <Plus size={16} /> Nuevo Abogado
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="admin-stats">
        <StatCard icon={<Users size={20}/>}      label="Total Usuarios"  value={stats.total}   color="#3b82f6" />
        <StatCard icon={<UserCheck size={20}/>}   label="Activos"         value={stats.activos} color="#10b981" />
        <StatCard icon={<Clock size={20}/>}        label="En Trial"        value={stats.trial}   color="#f59e0b" />
        <StatCard icon={<AlertTriangle size={20}/>} label="Vencidos/Susp." value={stats.vencidos} color="#ef4444"/>
        <StatCard icon={<DollarSign size={20}/>}   label="Ingresos Totales" value={stats.ingresos} color="#8b5cf6" />
      </div>

      {/* Búsqueda */}
      <div className="search-bar" style={{ marginBottom: '1rem', maxWidth: 400 }}>
        <Users size={16} className="search-icon" />
        <input placeholder="Buscar por nombre o email..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {/* Tabla de usuarios */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando usuarios...</div>
      ) : (
        <div className="admin-table-wrap card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Abogado / Estudio</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Vencimiento</th>
                <th>Expedientes</th>
                <th>Pago</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No hay abogados registrados.
                </td></tr>
              )}
              {filtrados.map(u => {
                const estColor = ESTADO_COLOR[u.suscripcion?.estado ?? ''] ?? '#94a3b8';
                return (
                  <tr key={u.id} className={!u.activo ? 'row-inactive' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="uc-avatar">{(u.nombre_completo || u.email).slice(0,2).toUpperCase()}</div>
                        <div>
                          <div className="uc-nombre">{u.nombre_completo || '—'}</div>
                          <div className="uc-estudio">{u.nombre_estudio || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-email">{u.email}</td>
                    <td>
                      <span className="plan-chip">{u.suscripcion?.plan_nombre ?? '—'}</span>
                    </td>
                    <td>
                      <span className="estado-pill" style={{ background: `${estColor}18`, color: estColor }}>
                        {u.suscripcion?.estado ?? '—'}
                      </span>
                    </td>
                    <td className="td-fecha">
                      {u.suscripcion?.fecha_vencimiento
                        ? new Date(u.suscripcion.fecha_vencimiento).toLocaleDateString('es-AR')
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{u.total_clientes}</span>
                    </td>
                    <td>
                      {u.suscripcion?.monto_pagado
                        ? <span style={{ fontWeight: 600, color: '#10b981' }}>$ {u.suscripcion.monto_pagado.toLocaleString('es-AR')}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Sin pago</span>}
                    </td>
                    <td>
                      <button className="btn-edit-user" onClick={() => setModal(u)}>
                        <Edit3 size={15} /> Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ModalUsuario
          usuario={modal === 'nuevo' ? undefined : modal}
          planes={planes}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
};
