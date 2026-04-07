import { supabase } from '../lib/supabase';
import type { Cliente, EstadoExpediente, DocumentoExpediente, HistorialEntry, CasoCliente, TipoDocumento, TipoCalculo } from '../utils/clientesStore';

export const supabaseClientesService = {
  
  async getClientes(userId: string): Promise<Cliente[]> {
    const { data: clientesData, error: errC } = await supabase
      .from('clientes')
      .select(`
        *,
        documentos (*),
        historial_estados (*),
        calculos (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (errC) throw errC;

    return (clientesData || []).map((c: any) => ({
      id: c.id,
      apellidoNombre: c.apellido_nombre,
      cuil: c.cuil,
      dni: c.dni,
      email: c.email,
      telefono: c.telefono,
      fechaNacimiento: c.fecha_nacimiento,
      sexo: c.sexo,
      nroExpediente: c.nro_expediente,
      juzgado: c.juzgado,
      estado: c.estado as EstadoExpediente,
      fechaAlta: c.fecha_alta.split('T')[0],
      notas: c.notas,
      casos: (c.calculos || []).map((calc: any) => ({
        id: calc.id,
        tipo: calc.tipo as TipoCalculo,
        descripcion: calc.descripcion,
        fechaCalculo: calc.fecha_calculo.split('T')[0],
        resultado: calc.resultado,
        fallo: calc.fallo,
      })),
      documentos: (c.documentos || []).map((doc: any) => ({
        id: doc.id,
        nombre: doc.nombre,
        tipo: doc.tipo as TipoDocumento,
        tamano: doc.tamano,
        descripcion: doc.descripcion,
        fechaCarga: doc.fecha_carga.split('T')[0],
        url: doc.storage_path 
          ? supabase.storage.from('documentos').getPublicUrl(doc.storage_path).data.publicUrl
          : undefined,
        dataUrl: undefined // deprecated in favor of storage URL
      })),
      historialEstados: (c.historial_estados || [])
        .sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
        .map((h: any) => ({
          id: h.id,
          fecha: h.fecha,
          estadoAnterior: h.estado_anterior as EstadoExpediente,
          estadoNuevo: h.estado_nuevo as EstadoExpediente,
          notas: h.notas,
          autor: h.autor,
        }))
    }));
  },

  async addCliente(userId: string, data: Partial<Cliente>): Promise<string> {
    const { data: inserted, error } = await supabase.from('clientes').insert({
      user_id: userId,
      apellido_nombre: data.apellidoNombre,
      cuil: data.cuil,
      dni: data.dni,
      email: data.email,
      telefono: data.telefono,
      fecha_nacimiento: data.fechaNacimiento,
      sexo: data.sexo,
      nro_expediente: data.nroExpediente,
      juzgado: data.juzgado,
      estado: data.estado,
      notas: data.notas,
    }).select('id').single();

    if (error) throw error;

    // Alta en historial
    await supabase.from('historial_estados').insert({
      cliente_id: inserted.id,
      user_id: userId,
      estado_anterior: data.estado,
      estado_nuevo: data.estado,
      notas: 'Alta del expediente.',
      autor: 'Sistema',
    });

    return inserted.id;
  },

  async updateCliente(userId: string, clienteId: string, data: Partial<Cliente>) {
    const { error } = await supabase.from('clientes').update({
      apellido_nombre: data.apellidoNombre,
      cuil: data.cuil,
      dni: data.dni,
      email: data.email,
      telefono: data.telefono,
      fecha_nacimiento: data.fechaNacimiento,
      sexo: data.sexo,
      nro_expediente: data.nroExpediente,
      juzgado: data.juzgado,
      estado: data.estado,
      notas: data.notas,
      updated_at: new Date().toISOString()
    }).eq('id', clienteId).eq('user_id', userId);

    if (error) throw error;
  },

  async deleteCliente(userId: string, clienteId: string) {
    const { error } = await supabase.from('clientes').delete().eq('id', clienteId).eq('user_id', userId);
    if (error) throw error;
  },

  async cambiarEstado(userId: string, clienteId: string, info: { estadoActual: EstadoExpediente, nuevoEstado: EstadoExpediente, notas: string, autor: string }) {
    // 1. Update cliente
    await supabase.from('clientes').update({
      estado: info.nuevoEstado,
      updated_at: new Date().toISOString()
    }).eq('id', clienteId).eq('user_id', userId);

    // 2. Insert historial
    await supabase.from('historial_estados').insert({
      cliente_id: clienteId,
      user_id: userId,
      estado_anterior: info.estadoActual,
      estado_nuevo: info.nuevoEstado,
      notas: info.notas,
      autor: info.autor
    });
  },

  async addDocumento(userId: string, clienteId: string, file: File, metadata: Partial<DocumentoExpediente>) {
    // 1. Subir a storage
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/${clienteId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Guardar registro en DB
    const { error: dbError } = await supabase.from('documentos').insert({
      cliente_id: clienteId,
      user_id: userId,
      nombre: file.name,
      tipo: metadata.tipo,
      tamano: file.size,
      descripcion: metadata.descripcion,
      storage_path: filePath
    });

    if (dbError) throw dbError;
  },

  async removeDocumento(userId: string, doc: { id: string; storage_path?: string }) {
    if (doc.storage_path) {
      await supabase.storage.from('documentos').remove([doc.storage_path]);
    }
    const { error } = await supabase.from('documentos').delete().eq('id', doc.id).eq('user_id', userId);
    if (error) throw error;
  }
};
