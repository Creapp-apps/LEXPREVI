// ============================================================
//  Store de Clientes v2 — con Documentos e Historial de Estados
// ============================================================

export type EstadoExpediente = 'activo' | 'presentado' | 'sentencia' | 'liquidacion' | 'cobrado' | 'archivo';
export type TipoCalculo = 'haber_inicial' | 'reajuste' | 'retroactivo' | 'movilidad' | 'derecho';
export type TipoDocumento = 'pdf' | 'imagen' | 'word' | 'excel' | 'otro';

export interface DocumentoExpediente {
  id: string;
  nombre: string;
  tipo: TipoDocumento;
  tamano: number;           // bytes
  fechaCarga: string;
  descripcion?: string;
  dataUrl?: string;         // base64 para archivos ≤ 1MB
  url?: string;             // para archivos en memoria (blob)
}

export interface HistorialEntry {
  id: string;
  fecha: string;            // ISO timestamp
  estadoAnterior: EstadoExpediente;
  estadoNuevo: EstadoExpediente;
  notas: string;
  autor?: string;
}

export interface CasoCliente {
  id: string;
  tipo: TipoCalculo;
  descripcion: string;
  fechaCalculo: string;
  resultado?: number;
  fallo?: string;
}

export interface Cliente {
  id: string;
  apellidoNombre: string;
  cuil: string;
  dni?: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  sexo?: 'M' | 'F';
  nroExpediente?: string;
  juzgado?: string;
  estado: EstadoExpediente;
  fechaAlta: string;
  notas?: string;
  casos: CasoCliente[];
  documentos: DocumentoExpediente[];
  historialEstados: HistorialEntry[];
}

const KEY = 'lexprevi_clientes';

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Clientes de demo ──────────────────────────────────────
const DEMO_CLIENTES: Cliente[] = [
  {
    id: 'cli_demo_1',
    apellidoNombre: 'García, Marta Susana',
    cuil: '27-18234567-8',
    dni: '18234567',
    email: 'mgarcia@email.com',
    telefono: '011-5555-1234',
    fechaNacimiento: '1955-04-10',
    sexo: 'F',
    nroExpediente: 'EXP-10492',
    juzgado: 'Juzgado Federal de la Seguridad Social Nº 3',
    estado: 'liquidacion',
    fechaAlta: '2024-01-15',
    notas: 'Caso de reajuste por Badaro. Sentencia favorable. En etapa de liquidación.',
    casos: [
      { id: generateId(), tipo: 'haber_inicial',  descripcion: 'Cálculo haber inicial',    fechaCalculo: '2024-01-20', resultado: 485200 },
      { id: generateId(), tipo: 'reajuste',       descripcion: 'Reajuste Badaro 1995-2006', fechaCalculo: '2024-02-10', resultado: 772480, fallo: 'Badaro' },
      { id: generateId(), tipo: 'retroactivo',    descripcion: 'Liquidación retroactivo',   fechaCalculo: '2024-03-01', resultado: 3116864 },
    ],
    documentos: [],
    historialEstados: [
      { id: generateId(), fecha: '2024-01-15T10:00:00', estadoAnterior: 'activo', estadoNuevo: 'activo', notas: 'Alta del expediente.', autor: 'Dr. Juan Doe' },
      { id: generateId(), fecha: '2024-02-05T14:30:00', estadoAnterior: 'activo', estadoNuevo: 'presentado', notas: 'Demanda presentada en Juzgado Nº 3. Sellado de actuación realizado.', autor: 'Dr. Juan Doe' },
      { id: generateId(), fecha: '2024-03-20T09:15:00', estadoAnterior: 'presentado', estadoNuevo: 'sentencia', notas: 'Sentencia favorable. Se hace lugar a la demanda por diferencias Badaro.', autor: 'Dr. Juan Doe' },
      { id: generateId(), fecha: '2024-04-01T11:00:00', estadoAnterior: 'sentencia', estadoNuevo: 'liquidacion', notas: 'Ingresada la liquidación del retroactivo. Monto: $3.116.864.', autor: 'Dr. Juan Doe' },
    ],
  },
  {
    id: 'cli_demo_2',
    apellidoNombre: 'Pérez, Juan Carlos',
    cuil: '20-12345678-9',
    dni: '12345678',
    email: 'jperez@email.com',
    telefono: '011-5555-5678',
    fechaNacimiento: '1950-08-22',
    sexo: 'M',
    nroExpediente: 'EXP-10491',
    juzgado: 'Cámara Federal de la Seguridad Social Sala I',
    estado: 'sentencia',
    fechaAlta: '2023-11-05',
    notas: 'En espera de sentencia definitiva. Fallo Alaniz + Delaude combinados.',
    casos: [
      { id: generateId(), tipo: 'movilidad', descripcion: 'Movilidad DNU 274/2024', fechaCalculo: '2023-12-01', resultado: 202990 },
      { id: generateId(), tipo: 'reajuste',  descripcion: 'Fallo Alaniz mar-2020',   fechaCalculo: '2024-01-15', resultado: 135550, fallo: 'Alaniz' },
    ],
    documentos: [],
    historialEstados: [
      { id: generateId(), fecha: '2023-11-05T09:00:00', estadoAnterior: 'activo', estadoNuevo: 'activo', notas: 'Alta del expediente. Caso de movilidad + Alaniz.', autor: 'Dr. Juan Doe' },
      { id: generateId(), fecha: '2024-01-10T16:00:00', estadoAnterior: 'activo', estadoNuevo: 'presentado', notas: 'Demanda presentada en Cámara Sala I.', autor: 'Dr. Juan Doe' },
      { id: generateId(), fecha: '2024-03-01T10:45:00', estadoAnterior: 'presentado', estadoNuevo: 'sentencia', notas: 'Auto de sentencia en deliberación.', autor: 'Dr. Juan Doe' },
    ],
  },
  {
    id: 'cli_demo_3',
    apellidoNombre: 'López, Silvia Beatriz',
    cuil: '27-22345678-4',
    dni: '22345678',
    telefono: '0341-5555-9012',
    fechaNacimiento: '1958-01-30',
    sexo: 'F',
    estado: 'activo',
    fechaAlta: '2024-03-20',
    notas: 'Caso nuevo. Aún en análisis de viabilidad.',
    casos: [
      { id: generateId(), tipo: 'derecho', descripcion: 'Análisis de derecho al beneficio', fechaCalculo: '2024-03-21' },
    ],
    documentos: [],
    historialEstados: [
      { id: generateId(), fecha: '2024-03-20T08:30:00', estadoAnterior: 'activo', estadoNuevo: 'activo', notas: 'Primera consulta. En análisis preliminar.', autor: 'Dr. Juan Doe' },
    ],
  },
  {
    id: 'cli_demo_4',
    apellidoNombre: 'Fernández, Alberto Oscar',
    cuil: '20-15678901-3',
    dni: '15678901',
    email: 'afernandez@email.com',
    nroExpediente: 'EXP-10489',
    juzgado: 'Juzgado Federal de la Seguridad Social Nº 7',
    estado: 'cobrado',
    fechaAlta: '2022-06-10',
    notas: 'Caso cerrado. Retroactivo cobrado.',
    casos: [
      { id: generateId(), tipo: 'haber_inicial', descripcion: 'Haber inicial con Elliff', fechaCalculo: '2022-07-01', resultado: 320000, fallo: 'Elliff' },
      { id: generateId(), tipo: 'retroactivo',   descripcion: 'Liquidación final cobrada', fechaCalculo: '2023-09-15', resultado: 5200000 },
    ],
    documentos: [],
    historialEstados: [
      { id: generateId(), fecha: '2022-06-10T09:00:00', estadoAnterior: 'activo', estadoNuevo: 'activo', notas: 'Inicio del expediente.', autor: 'Dr. Juan Doe' },
      { id: generateId(), fecha: '2022-08-01T14:00:00', estadoAnterior: 'activo', estadoNuevo: 'presentado', notas: 'Demanda presentada.', autor: 'Dr. Juan Doe' },
      { id: generateId(), fecha: '2023-05-15T11:30:00', estadoAnterior: 'presentado', estadoNuevo: 'sentencia', notas: 'Sentencia favorable con aplicación Elliff.', autor: 'Dr. Juan Doe' },
      { id: generateId(), fecha: '2023-08-01T10:00:00', estadoAnterior: 'sentencia', estadoNuevo: 'liquidacion', notas: 'Liquidación aprobada por el juzgado.', autor: 'Dr. Juan Doe' },
      { id: generateId(), fecha: '2023-10-05T16:00:00', estadoAnterior: 'liquidacion', estadoNuevo: 'cobrado', notas: 'Retroactivo cobrado íntegramente. Expediente cerrado.', autor: 'Dr. Juan Doe' },
    ],
  },
];

// ── CRUD ──────────────────────────────────────────────────
export function getClientes(): Cliente[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { localStorage.setItem(KEY, JSON.stringify(DEMO_CLIENTES)); return DEMO_CLIENTES; }
    // Migrate: add missing fields
    const parsed: Cliente[] = JSON.parse(raw);
    return parsed.map(c => ({
      ...c,
      documentos: c.documentos ?? [],
      historialEstados: c.historialEstados ?? [],
    }));
  } catch { return DEMO_CLIENTES; }
}

export function saveClientes(clientes: Cliente[]) {
  localStorage.setItem(KEY, JSON.stringify(clientes));
}

export function updateCliente(id: string, data: Partial<Cliente>): void {
  saveClientes(getClientes().map(c => c.id === id ? { ...c, ...data } : c));
}

export function addCliente(data: Omit<Cliente, 'id' | 'fechaAlta' | 'casos' | 'documentos' | 'historialEstados'>): Cliente {
  const now = new Date().toISOString();
  const c: Cliente = {
    ...data,
    id: generateId('cli'),
    fechaAlta: now.split('T')[0],
    casos: [],
    documentos: [],
    historialEstados: [
      { id: generateId(), fecha: now, estadoAnterior: data.estado, estadoNuevo: data.estado, notas: 'Alta del expediente.', autor: 'Dr. Juan Doe' },
    ],
  };
  saveClientes([...getClientes(), c]);
  return c;
}

export function deleteCliente(id: string): void {
  saveClientes(getClientes().filter(c => c.id !== id));
}

export function cambiarEstado(
  clienteId: string,
  nuevoEstado: EstadoExpediente,
  notas: string,
  autor: string = 'Dr. Juan Doe'
): void {
  const clientes = getClientes();
  const idx = clientes.findIndex(c => c.id === clienteId);
  if (idx === -1) return;
  const c = clientes[idx];
  const entry: HistorialEntry = {
    id: generateId(),
    fecha: new Date().toISOString(),
    estadoAnterior: c.estado,
    estadoNuevo: nuevoEstado,
    notas,
    autor,
  };
  clientes[idx] = { ...c, estado: nuevoEstado, historialEstados: [...c.historialEstados, entry] };
  saveClientes(clientes);
}

export function addDocumento(clienteId: string, doc: Omit<DocumentoExpediente, 'id' | 'fechaCarga'>): DocumentoExpediente {
  const clientes = getClientes();
  const idx = clientes.findIndex(c => c.id === clienteId);
  if (idx === -1) throw new Error('Cliente no encontrado');
  const nuevo: DocumentoExpediente = { ...doc, id: generateId('doc'), fechaCarga: new Date().toISOString().split('T')[0] };
  clientes[idx].documentos = [...clientes[idx].documentos, nuevo];
  saveClientes(clientes);
  return nuevo;
}

export function removeDocumento(clienteId: string, docId: string): void {
  const clientes = getClientes();
  const idx = clientes.findIndex(c => c.id === clienteId);
  if (idx === -1) return;
  clientes[idx].documentos = clientes[idx].documentos.filter(d => d.id !== docId);
  saveClientes(clientes);
}

// ── Helpers ──────────────────────────────────────────────
export function getTipoDocumento(filename: string): TipoDocumento {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'imagen';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  return 'otro';
}

export function getDocIcono(tipo: TipoDocumento): string {
  const map: Record<TipoDocumento, string> = { pdf: '📄', imagen: '🖼️', word: '📝', excel: '📊', otro: '📎' };
  return map[tipo];
}

export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

export const ESTADO_CONFIG: Record<EstadoExpediente, { label: string; color: string; bg: string; orden: number }> = {
  activo:      { label: 'Activo',      color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   orden: 1 },
  presentado:  { label: 'Presentado',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',   orden: 2 },
  sentencia:   { label: 'Sentencia',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   orden: 3 },
  liquidacion: { label: 'Liquidación', color: '#f97316', bg: 'rgba(249,115,22,0.1)',   orden: 4 },
  cobrado:     { label: 'Cobrado',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',   orden: 5 },
  archivo:     { label: 'Archivo',     color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', orden: 6 },
};

export const TIPO_CALCULO_CONFIG: Record<TipoCalculo, { label: string; icon: string }> = {
  haber_inicial: { label: 'Haber Inicial', icon: '🧮' },
  reajuste:      { label: 'Reajuste',      icon: '⚖️' },
  retroactivo:   { label: 'Retroactivo',   icon: '📋' },
  movilidad:     { label: 'Movilidad',     icon: '📈' },
  derecho:       { label: 'Derecho',       icon: '✅' },
};

export function formatCurrency(v: number): string {
  return `$ ${v.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatFechaHs(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}
