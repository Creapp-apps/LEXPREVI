import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClientesService } from '../../services/supabaseClientesService';
import { useAuth } from '../../contexts/AuthContext';
import {
  ESTADO_CONFIG, TIPO_CALCULO_CONFIG, formatCurrency, formatFechaHs,
  getTipoDocumento, getDocIcono, formatBytes,
  type Cliente, type EstadoExpediente, type DocumentoExpediente,
} from '../../utils/clientesStore';
import {
  Search, Plus, User, Phone, Mail, FileText, MoreVertical,
  Trash2, Edit3, X, Save, Filter, ArrowUpRight,
  Calendar, ClipboardList, Calculator, Upload, Download,
  History, Files, RefreshCw, CheckCircle2, AlertCircle,
} from 'lucide-react';
import './Clientes.css';

const ESTADOS: EstadoExpediente[] = ['activo','presentado','sentencia','liquidacion','cobrado','archivo'];
type TabDetalle = 'expediente' | 'docs' | 'historial' | 'calculos';

/* ─────────────────────────────────────────────────────────
   Tarjeta de cliente en la lista
───────────────────────────────────────────────────────── */
const ClienteCard: React.FC<{ c: Cliente; onClick: () => void; onDelete: () => void }> = ({ c, onClick, onDelete }) => {
  const est = ESTADO_CONFIG[c.estado] || ESTADO_CONFIG['activo'];
  const [menu, setMenu] = useState(false);
  return (
    <div className="cliente-card" onClick={onClick}>
      <div className="cc-left">
        <div className="cc-avatar">{c.apellidoNombre.split(',')[0].trim().slice(0, 2).toUpperCase()}</div>
        <div className="cc-info">
          <strong className="cc-nombre">{c.apellidoNombre}</strong>
          {c.cuil && <span className="cc-cuil">CUIL {c.cuil}</span>}
          {c.nroExpediente && <span className="cc-exp">{c.nroExpediente}</span>}
        </div>
      </div>
      <div className="cc-right">
        <span className="estado-pill" style={{ background: est.bg, color: est.color }}>{est.label}</span>
        <span className="cc-casos">{(c.documentos||[]).length} doc · {(c.casos||[]).length} cálc</span>
        <button className="btn-menu" onClick={e => { e.stopPropagation(); setMenu(p => !p); }}>
          <MoreVertical size={16} />
        </button>
        {menu && (
          <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
            <button onClick={() => { onDelete(); setMenu(false); }}>
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Sección cambio de estado + timeline
───────────────────────────────────────────────────────── */
const TabHistorial: React.FC<{ cliente: Cliente; onUpdate: () => void }> = ({ cliente, onUpdate }) => {
  const { user, profile } = useAuth();
  const [nuevoEstado, setNuevoEstado] = useState<EstadoExpediente>(cliente.estado);
  const [notas, setNotas]             = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const handleCambiar = async () => {
    if (!notas.trim()) { setError('Ingresá una nota para el cambio de estado.'); return; }
    if (!user) return;
    
    setLoading(true);
    try {
      await supabaseClientesService.cambiarEstado(user.id, cliente.id, {
        estadoActual: cliente.estado,
        nuevoEstado,
        notas: notas.trim(),
        autor: profile?.nombre_completo || profile?.email || 'Usuario'
      });
      setNotas('');
      setError('');
      onUpdate();
    } catch (e: any) {
      setError(e?.message || 'Error al cambiar estado.');
    } finally {
      setLoading(false);
    }
  };

  const historial = [...(cliente.historialEstados || [])].reverse();

  return (
    <div className="tab-historial">
      <div className="card cambio-estado-panel">
        <div className="card-header"><h3>Cambiar Estado del Expediente</h3></div>
        <div className="card-body">
          <div className="estado-cambio-grid">
            <div className="form-group">
              <label>Nuevo Estado</label>
              <select className="form-control no-icon" value={nuevoEstado}
                onChange={e => setNuevoEstado(e.target.value as EstadoExpediente)}>
                {ESTADOS.map(e => (
                  <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
                ))}
              </select>
            </div>
            <div className="form-group estado-notas-field">
              <label>Nota obligatoria del movimiento *</label>
              <textarea className="form-control no-icon" rows={2} value={notas}
                onChange={e => { setNotas(e.target.value); setError(''); }}
                placeholder="Ej: Demanda presentada. Sellado abonado $4.200. Proveído recibido." />
              {error && <span className="field-error">{error}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button className="btn-primary flex-center gap-2" onClick={handleCambiar}
              disabled={nuevoEstado === cliente.estado || loading}>
              {loading ? <span className="upload-spinner" /> : <RefreshCw size={15} />} Registrar Cambio de Estado
            </button>
          </div>
          {nuevoEstado === cliente.estado && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.5rem' }}>
              Seleccioná un estado diferente al actual para registrar el cambio.
            </p>
          )}
        </div>
      </div>

      <div className="timeline">
        <h3 className="timeline-title">Historia Clínica del Expediente</h3>
        {historial.map((entry, i) => {
          const estNuevo = ESTADO_CONFIG[entry.estadoNuevo] || ESTADO_CONFIG['activo'];
          const estAnterior = ESTADO_CONFIG[entry.estadoAnterior] || ESTADO_CONFIG['activo'];
          const esAlta = entry.estadoAnterior === entry.estadoNuevo;
          return (
            <div key={entry.id} className={`timeline-entry ${i === 0 ? 'latest' : ''}`}>
              <div className="tl-dot" style={{ background: estNuevo.color, borderColor: `${estNuevo.color}40` }} />
              <div className="tl-body">
                <div className="tl-header">
                  <div className="tl-estados">
                    {!esAlta && (
                      <>
                        <span className="tl-estado" style={{ background: estAnterior.bg, color: estAnterior.color }}>{estAnterior.label}</span>
                        <span className="tl-arrow">→</span>
                      </>
                    )}
                    <span className="tl-estado" style={{ background: estNuevo.bg, color: estNuevo.color }}>
                      {esAlta ? '📋 Alta' : estNuevo.label}
                    </span>
                  </div>
                  <span className="tl-fecha">{formatFechaHs(entry.fecha)}</span>
                </div>
                <p className="tl-notas">{entry.notas}</p>
                {entry.autor && <span className="tl-autor">— {entry.autor}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Sección de documentos
───────────────────────────────────────────────────────── */
const TabDocumentos: React.FC<{ cliente: Cliente; onUpdate: () => void }> = ({ cliente, onUpdate }) => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [descripcion, setDescripcion] = useState('');
  const [subiendo, setSubiendo]       = useState(false);
  const [error, setError]             = useState('');
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB for Supabase Storage

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > MAX_SIZE) {
      setError(`El archivo supera el límite de 5 MB (${formatBytes(file.size)}). Comprimilo antes de subirlo.`);
      return;
    }
    setSubiendo(true);
    setError('');
    
    try {
      await supabaseClientesService.addDocumento(user.id, cliente.id, file, {
        tipo: getTipoDocumento(file.name),
        descripcion: descripcion.trim() || undefined
      });
      setDescripcion('');
      e.target.value = '';
      onUpdate();
    } catch (err: any) {
      setError('Error al subir el archivo: ' + (err?.message || 'Reintentá más tarde.'));
    } finally {
      setSubiendo(false);
    }
  };

  const handleDelete = async (doc: DocumentoExpediente) => {
    if (!user || !confirm('¿Eliminar este documento permanentemente?')) return;
    try {
      await supabaseClientesService.removeDocumento(user.id, doc as any);
      onUpdate();
    } catch {
      setError('Error al eliminar el documento.');
    }
  };

  const handleDownload = (doc: DocumentoExpediente) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else if (doc.dataUrl) {
      const a = document.createElement('a');
      a.href = doc.dataUrl;
      a.download = doc.nombre;
      a.click();
    }
  };

  return (
    <div className="tab-documentos">
      <div className="upload-zone card" onClick={() => inputRef.current?.click()} style={{ position: 'relative' }}>
        <input ref={inputRef} type="file" style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.csv"
          onChange={handleFile} disabled={subiendo} />
        <Upload size={32} color={subiendo ? "var(--text-muted)" : "var(--brand-primary)"} />
        <div className="uz-text">
          <strong>{subiendo ? 'Subiendo documento a la nube...' : 'Clic para subir un documento'}</strong>
          <span>PDF, Word, Excel, imágenes · Máx. 5 MB</span>
        </div>
        {subiendo && <div className="upload-spinner" style={{ position: 'absolute', right: '1.5rem' }} />}
      </div>

      <div className="upload-meta">
        <div className="form-group" style={{ flex: 1 }}>
          <label>Descripción del documento (opcional antes de subir)</label>
          <input className="form-control no-icon" value={descripcion}
            onChange={e => setDescripcion(e.target.value)} disabled={subiendo}
            placeholder="Ej: Demanda inicial, Sentencia de primera instancia..." />
        </div>
      </div>

      {error && (
        <div className="info-box danger">
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {!(cliente.documentos && cliente.documentos.length > 0) ? (
        <div className="doc-empty">
          <Files size={40} color="var(--text-muted)" />
          <p>Sin documentos en el expediente. Subí el primero haciendo clic arriba.</p>
        </div>
      ) : (
        <div className="docs-list">
          {cliente.documentos.map(doc => (
            <div key={doc.id} className="doc-item">
              <span className="doc-icon">{getDocIcono(doc.tipo)}</span>
              <div className="doc-info">
                <strong className="doc-nombre">{doc.nombre}</strong>
                {doc.descripcion && <span className="doc-desc">{doc.descripcion}</span>}
                <span className="doc-meta">{formatBytes(doc.tamano)} · {doc.fechaCarga}</span>
              </div>
              <div className="doc-actions">
                {(doc.url || doc.dataUrl) && (
                  <button className="btn-doc-action" title="Abrir / Descargar" onClick={() => handleDownload(doc)}>
                    <Download size={15} />
                  </button>
                )}
                <button className="btn-doc-action danger" title="Eliminar" onClick={() => handleDelete(doc)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Vista de Detalle
───────────────────────────────────────────────────────── */
const DetalleCliente: React.FC<{ cliente: Cliente; onBack: () => void; onEdit: (c: Cliente) => void; onRefresh: () => void }> = ({ cliente, onBack, onEdit, onRefresh }) => {
  const navigate = useNavigate();
  const [tab, setTab]         = useState<TabDetalle>('expediente');

  const est = ESTADO_CONFIG[cliente.estado] || ESTADO_CONFIG['activo'];
  const TABS: { id: TabDetalle; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'expediente', label: 'Expediente',    icon: <FileText size={15} /> },
    { id: 'docs',       label: 'Documentos',    icon: <Files size={15} />,    badge: (cliente.documentos||[]).length },
    { id: 'historial',  label: 'Historial',     icon: <History size={15} />,  badge: (cliente.historialEstados||[]).length },
    { id: 'calculos',   label: 'Cálculos',      icon: <Calculator size={15} />, badge: (cliente.casos||[]).length },
  ];

  return (
    <div className="detalle-view animate-fade-in">
      <div className="detalle-topbar">
        <button className="btn-back" onClick={onBack}>← Volver a Clientes</button>
        <div className="detalle-topbar-right">
          <span className="estado-pill-lg" style={{ background: est.bg, color: est.color }}>{est.label}</span>
          <button className="btn-secondary flex-center gap-2" onClick={() => onEdit(cliente)}>
            <Edit3 size={15} /> Editar Datos
          </button>
        </div>
      </div>

      <div className="detalle-hero-bar">
        <div className="detalle-avatar-lg">{cliente.apellidoNombre.split(',')[0].trim().slice(0, 2).toUpperCase()}</div>
        <div className="detalle-hero-info">
          <h2>{cliente.apellidoNombre}</h2>
          <div className="hero-chips">
            {cliente.cuil && <span>CUIL: <strong>{cliente.cuil}</strong></span>}
            {cliente.dni && <span>DNI: <strong>{cliente.dni}</strong></span>}
            {cliente.nroExpediente && <span className="chip-exp">{cliente.nroExpediente}</span>}
          </div>
          {cliente.juzgado && <div className="hero-juzgado">{cliente.juzgado}</div>}
        </div>
        <div className="detalle-quick-actions">
          <button className="qa-btn-sm" onClick={() => navigate('/haber-inicial')}><Calculator size={16} /> Haber Inicial</button>
          <button className="qa-btn-sm" onClick={() => navigate('/retroactivo')}><ClipboardList size={16} /> Retroactivo</button>
          <button className="qa-btn-sm" onClick={() => navigate('/reajustes')}><ArrowUpRight size={16} /> Reajuste</button>
        </div>
      </div>

      <nav className="tabs-nav" style={{ marginTop: '1.5rem' }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} <span>{t.label}</span>
            {t.badge !== undefined && t.badge > 0 && <span className="tab-badge">{t.badge}</span>}
          </button>
        ))}
      </nav>

      <div className="tab-content animate-fade-in" key={tab}>
        {tab === 'expediente' && (
          <div className="expediente-grid">
            <div className="card">
              <div className="card-header"><h3>Datos Personales</h3></div>
              <div className="card-body">
                <div className="df-grid">
                  {cliente.email     && <div className="df-row"><Mail size={14} /><span>{cliente.email}</span></div>}
                  {cliente.telefono  && <div className="df-row"><Phone size={14} /><span>{cliente.telefono}</span></div>}
                  {cliente.fechaNacimiento && <div className="df-row"><Calendar size={14} /><span>Nac: <strong>{cliente.fechaNacimiento}</strong></span></div>}
                  {cliente.sexo      && <div className="df-row"><User size={14} /><span>{cliente.sexo === 'M' ? 'Masculino' : 'Femenino'}</span></div>}
                  <div className="df-row"><CheckCircle2 size={14} /><span>Alta: <strong>{cliente.fechaAlta}</strong></span></div>
                </div>
              </div>
            </div>
            {cliente.notas && (
              <div className="card">
                <div className="card-header"><h3>Notas Internas</h3></div>
                <div className="card-body">
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{cliente.notas}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'docs' && <TabDocumentos cliente={cliente} onUpdate={onRefresh} />}
        {tab === 'historial' && <TabHistorial cliente={cliente} onUpdate={onRefresh} />}

        {tab === 'calculos' && (
          <div>
            {!(cliente.casos && cliente.casos.length > 0)
              ? <p className="empty-text" style={{ padding: '2rem', textAlign: 'center' }}>Sin cálculos vinculados.</p>
              : cliente.casos.map(caso => {
                const tc = TIPO_CALCULO_CONFIG[caso.tipo];
                return (
                  <div key={caso.id} className="caso-item card" style={{ marginBottom: '0.625rem' }}>
                    <span className="caso-icon">{tc?.icon || '🧮'}</span>
                    <div className="caso-info">
                      <strong>{tc?.label || caso.tipo} {caso.fallo ? `— Fallo ${caso.fallo}` : ''}</strong>
                      <span>{caso.descripcion}</span>
                      <span className="caso-fecha">{caso.fechaCalculo}</span>
                    </div>
                    {caso.resultado && <span className="caso-resultado font-mono">{formatCurrency(caso.resultado)}</span>}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Formulario Nuevo / Editar
───────────────────────────────────────────────────────── */
const FormCliente: React.FC<{
  inicial?: Partial<Cliente>;
  onSave: (data: Omit<Cliente, 'id' | 'fechaAlta' | 'casos' | 'documentos' | 'historialEstados'>) => Promise<void>;
  onCancel: () => void;
}> = ({ inicial, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    apellidoNombre: inicial?.apellidoNombre ?? '',
    cuil: inicial?.cuil ?? '',
    dni: inicial?.dni ?? '',
    email: inicial?.email ?? '',
    telefono: inicial?.telefono ?? '',
    fechaNacimiento: inicial?.fechaNacimiento ?? '',
    sexo: inicial?.sexo as 'M' | 'F' | undefined,
    nroExpediente: inicial?.nroExpediente ?? '',
    juzgado: inicial?.juzgado ?? '',
    estado: inicial?.estado ?? ('activo' as EstadoExpediente),
    notas: inicial?.notas ?? '',
  });
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.apellidoNombre) return;
    setLoading(true);
    try {
      await onSave(form as any);
    } catch (e: any) {
      alert('Error guardando cliente: ' + (e.message || 'Verificá los datos ingresados.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-cliente card animate-fade-in">
      <div className="card-header">
        <h2>{inicial?.id ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
        <button className="btn-icon" onClick={onCancel} disabled={loading}><X size={18} /></button>
      </div>
      <div className="card-body">
        <div className="form-grid">
          <div className="form-group col-span-2">
            <label>Apellido y Nombre *</label>
            <input className="form-control no-icon" value={form.apellidoNombre} onChange={e => set('apellidoNombre', e.target.value)} placeholder="García, Marta Susana" required />
          </div>
          <div className="form-group">
            <label>CUIL</label>
            <input className="form-control no-icon" value={form.cuil} onChange={e => set('cuil', e.target.value)} placeholder="27-12345678-4" />
          </div>
          <div className="form-group">
            <label>DNI</label>
            <input className="form-control no-icon" value={form.dni} onChange={e => set('dni', e.target.value)} placeholder="12345678" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control no-icon" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input className="form-control no-icon" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input type="date" className="form-control no-icon" value={form.fechaNacimiento} onChange={e => set('fechaNacimiento', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Sexo</label>
            <select className="form-control no-icon" value={form.sexo ?? ''} onChange={e => set('sexo', e.target.value)}>
              <option value="">— Seleccionar —</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
          <div className="form-group col-span-2" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
            <label>N° de Expediente</label>
            <input className="form-control no-icon" value={form.nroExpediente} onChange={e => set('nroExpediente', e.target.value)} placeholder="EXP-10492" />
          </div>
          <div className="form-group col-span-2">
            <label>Juzgado / Tribunal</label>
            <input className="form-control no-icon" value={form.juzgado} onChange={e => set('juzgado', e.target.value)} />
          </div>
          {!inicial?.id && (
            <div className="form-group">
              <label>Estado Inicial del Expediente</label>
              <select className="form-control no-icon" value={form.estado} onChange={e => set('estado', e.target.value)}>
                {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>)}
              </select>
            </div>
          )}
          <div className="form-group col-span-2">
            <label>Notas Internas</label>
            <textarea className="form-control no-icon textarea-notes" rows={3} value={form.notas} onChange={e => set('notas', e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className="btn-primary flex-center gap-2" onClick={handleSubmit} disabled={loading || !form.apellidoNombre}>
            {loading ? <span className="upload-spinner" /> : <Save size={16} />} Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Componente principal
───────────────────────────────────────────────────────── */
export const GestionClientes: React.FC = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading]   = useState(true);
  const [vista, setVista]       = useState<'lista' | 'detalle' | 'formulario'>('lista');
  const [selectedId, setSelId]  = useState<string | null>(null);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoExpediente | 'todos'>('todos');

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await supabaseClientesService.getClientes(user.id);
      setClientes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const filtrados = useMemo(() => clientes.filter(c => {
    const q = busqueda.toLowerCase();
    const match = c.apellidoNombre.toLowerCase().includes(q)
      || (c.cuil||'').includes(q)
      || (c.nroExpediente ?? '').toLowerCase().includes(q);
    const est = filtroEstado === 'todos' || c.estado === filtroEstado;
    return match && est;
  }), [clientes, busqueda, filtroEstado]);

  const handleSave = async (data: any) => {
    if (!user) return;
    if (editando) {
      await supabaseClientesService.updateCliente(user.id, editando.id, data);
    } else {
      await supabaseClientesService.addCliente(user.id, data);
    }
    await load();
    setVista('lista');
    setEditando(null);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm('¿Eliminar este expediente y todos sus documentos permanentemente?')) return;
    try {
      await supabaseClientesService.deleteCliente(user.id, id);
      await load();
      if (selectedId === id) { setVista('lista'); setSelId(null); }
    } catch (e) {
      alert('Error eliminando el cliente.');
    }
  };

  const stats = useMemo(() => ({
    total:       clientes.length,
    activos:     clientes.filter(c => c.estado === 'activo').length,
    sentencia:   clientes.filter(c => c.estado === 'sentencia').length,
    liquidacion: clientes.filter(c => c.estado === 'liquidacion').length,
    cobrado:     clientes.filter(c => c.estado === 'cobrado').length,
  }), [clientes]);

  if (loading) {
    return <div className="clientes-view animate-fade-in flex-center" style={{ minHeight: '60vh', color: 'var(--text-muted)' }}><span className="upload-spinner" style={{ width: 30, height: 30, borderWidth: 3 }}/></div>;
  }

  if (vista === 'formulario') {
    return (
      <div className="clientes-view">
        <header className="page-header">
          <h1 className="page-title">{editando ? 'Editar Cliente' : 'Nuevo Cliente'}</h1>
        </header>
        <FormCliente
          inicial={editando ?? undefined}
          onSave={handleSave}
          onCancel={() => { setVista('lista'); setEditando(null); }}
        />
      </div>
    );
  }

  if (vista === 'detalle' && selectedId) {
    const clienteEncontrado = clientes.find(c => c.id === selectedId);
    if (!clienteEncontrado) return null; // Shouldn't happen realistically
    return (
      <div className="clientes-view">
        <DetalleCliente
          cliente={clienteEncontrado}
          onBack={() => { setVista('lista'); setSelId(null); }}
          onEdit={(c) => { setEditando(c); setVista('formulario'); }}
          onRefresh={load}
        />
      </div>
    );
  }

  return (
    <div className="clientes-view animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Gestión de Clientes</h1>
          <p className="page-subtitle">Expedientes digitales · Historial · Documentos</p>
        </div>
        <button className="btn-primary flex-center gap-2" onClick={() => { setEditando(null); setVista('formulario'); }}>
          <Plus size={16} /> Nuevo Cliente
        </button>
      </header>

      <div className="clientes-stats">
        {[
          { label: 'Total', val: stats.total, color: 'var(--brand-primary)' },
          { label: 'Activos', val: stats.activos, color: '#3b82f6' },
          { label: 'Sentencia', val: stats.sentencia, color: '#f59e0b' },
          { label: 'Liquidación', val: stats.liquidacion, color: '#f97316' },
          { label: 'Cobrados', val: stats.cobrado, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="stat-mini" style={{ borderTopColor: s.color }}>
            <span className="stat-mini-val" style={{ color: s.color }}>{s.val}</span>
            <span className="stat-mini-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-bar" style={{ width: 360, flex: 'none' }}>
          <Search size={16} className="search-icon" />
          <input placeholder="Buscar por nombre, CUIL o expediente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <div className="estado-filter">
          <Filter size={14} />
          {(['todos', ...ESTADOS] as const).map(e => (
            <button key={e}
              className={`ef-btn ${filtroEstado === e ? 'active' : ''}`}
              style={filtroEstado === e && e !== 'todos'
                ? { background: ESTADO_CONFIG[e as EstadoExpediente]?.bg, color: ESTADO_CONFIG[e as EstadoExpediente]?.color }
                : {}}
              onClick={() => setFiltroEstado(e)}
            >
              {e === 'todos' ? 'Todos' : ESTADO_CONFIG[e].label}
            </button>
          ))}
        </div>
      </div>

      <div className="clientes-lista">
        {filtrados.length === 0 ? (
          <div className="empty-state card">
            <User size={40} color="var(--text-muted)" />
            <h3>Sin resultados</h3>
            <p>No se encontraron clientes con los filtros aplicados.</p>
          </div>
        ) : filtrados.map(c => (
          <ClienteCard key={c.id} c={c}
            onClick={() => { setSelId(c.id); setVista('detalle'); }}
            onDelete={() => handleDelete(c.id)}
          />
        ))}
      </div>
    </div>
  );
};
