import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, ADMIN_EMAIL } from '../lib/supabase';

/* ── Tipos ─────────────────────────────────────────────── */
export interface Profile {
  id: string;
  email: string;
  nombre_completo: string;
  nombre_estudio: string;
  matricula?: string;
  rol: 'admin' | 'abogado';
  activo: boolean;
}

export interface Suscripcion {
  estado: 'trial' | 'activo' | 'vencido' | 'suspendido';
  fecha_vencimiento: string | null;
  plan_nombre: string;
  max_expedientes: number | null;
}

interface AuthContextValue {
  user:         User | null;
  session:      Session | null;
  profile:      Profile | null;
  suscripcion:  Suscripcion | null;
  isAdmin:      boolean;
  isLoading:    boolean;
  isSuspended:  boolean;
  signIn:  (email: string, password: string) => Promise<{ error: string | null }>;
  signUp:  (email: string, password: string, meta: { nombre_completo: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};

/* ── Provider ───────────────────────────────────────────── */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session,     setSession]     = useState<Session | null>(null);
  const [user,        setUser]        = useState<User | null>(null);
  const [profile,     setProfile]     = useState<Profile | null>(null);
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);

  const fetchProfile = async (uid: string) => {
    const [{ data: prof }, { data: sus }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).single(),
      supabase
        .from('suscripciones')
        .select('estado, fecha_vencimiento, planes(nombre, max_expedientes)')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    if (prof) setProfile(prof as Profile);
    if (sus) {
      const p = (sus as any).planes;
      setSuscripcion({
        estado:            sus.estado as Suscripcion['estado'],
        fecha_vencimiento: sus.fecha_vencimiento,
        plan_nombre:       p?.nombre ?? 'STARTER',
        max_expedientes:   p?.max_expedientes ?? 50,
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setSuscripcion(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, meta: { nombre_completo: string }) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: meta },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSuscripcion(null);
  };

  const isAdmin      = profile?.email === ADMIN_EMAIL || profile?.rol === 'admin';
  const isSuspended  = !isAdmin && (
    suscripcion?.estado === 'suspendido' ||
    suscripcion?.estado === 'vencido'   ||
    profile?.activo === false
  );

  return (
    <AuthContext.Provider value={{
      user, session, profile, suscripcion,
      isAdmin, isLoading, isSuspended,
      signIn, signUp, signOut,
      refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve(),
    }}>
      {children}
    </AuthContext.Provider>
  );
};
