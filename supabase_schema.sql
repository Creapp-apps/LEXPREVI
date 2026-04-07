-- ============================================================
--  LexPrevi — Schema SQL completo
--  Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── 1. Habilitar extensión UUID ──────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. PLANES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           TEXT NOT NULL,           -- 'STARTER' | 'ENTERPRISE'
  max_expedientes  INTEGER,                 -- NULL = ilimitado
  precio_anual     NUMERIC(10,2),
  descripcion      TEXT,
  activo           BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Planes iniciales
INSERT INTO planes (nombre, max_expedientes, precio_anual, descripcion) VALUES
  ('STARTER',    50,   200.00, 'Hasta 50 expedientes por año. Todos los módulos incluidos.'),
  ('ENTERPRISE', NULL, NULL,   'Expedientes ilimitados. Para estudios jurídicos. Precio a convenir.');

-- ── 3. PROFILES ──────────────────────────────────────────────
-- Extiende auth.users. Se crea automáticamente al registrarse.
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT,
  nombre_completo   TEXT,
  nombre_estudio    TEXT DEFAULT 'Estudio Jurídico',
  matricula         TEXT,
  cuit              TEXT,
  telefono          TEXT,
  direccion         TEXT,
  ciudad            TEXT,
  rol               TEXT DEFAULT 'abogado', -- 'admin' | 'abogado'
  activo            BOOLEAN DEFAULT true,
  notas_admin       TEXT,
  fecha_alta        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. SUSCRIPCIONES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suscripciones (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id           UUID NOT NULL REFERENCES planes(id),
  estado            TEXT DEFAULT 'trial',   -- 'trial' | 'activo' | 'vencido' | 'suspendido'
  fecha_inicio      DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  monto_pagado      NUMERIC(10,2),
  forma_pago        TEXT,                   -- 'transferencia' | 'efectivo' | 'mp'
  notas             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. CLIENTES (Expedientes) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  apellido_nombre   TEXT NOT NULL,
  cuil              TEXT,
  dni               TEXT,
  email             TEXT,
  telefono          TEXT,
  fecha_nacimiento  DATE,
  sexo              CHAR(1),
  nro_expediente    TEXT,
  juzgado           TEXT,
  estado            TEXT DEFAULT 'activo',  -- activo|presentado|sentencia|liquidacion|cobrado|archivo
  notas             TEXT,
  fecha_alta        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. HISTORIAL DE ESTADOS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS historial_estados (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id        UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  estado_anterior   TEXT NOT NULL,
  estado_nuevo      TEXT NOT NULL,
  notas             TEXT NOT NULL,
  autor             TEXT,
  fecha             TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. DOCUMENTOS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documentos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id        UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nombre            TEXT NOT NULL,
  tipo              TEXT,                   -- 'pdf' | 'imagen' | 'word' | 'excel' | 'otro'
  tamano            INTEGER,               -- bytes
  descripcion       TEXT,
  storage_path      TEXT,                  -- ruta en Supabase Storage
  fecha_carga       TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. CALCULOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calculos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id        UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo              TEXT NOT NULL,          -- haber_inicial|reajuste|retroactivo|movilidad|derecho
  descripcion       TEXT,
  fallo             TEXT,
  resultado         NUMERIC(18,2),
  datos_calculo     JSONB,
  fecha_calculo     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. CONFIGURACIÓN DEL ESTUDIO ─────────────────────────────
CREATE TABLE IF NOT EXISTS configuracion_estudio (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nombre_estudio        TEXT DEFAULT 'Estudio Jurídico Previsional',
  responsable           TEXT,
  cuit                  TEXT,
  matricula             TEXT,
  direccion             TEXT,
  ciudad                TEXT DEFAULT 'Ciudad Autónoma de Buenos Aires',
  telefono              TEXT,
  email                 TEXT,
  pbu                   NUMERIC(12,2) DEFAULT 89632.86,
  haber_maximo          NUMERIC(12,2) DEFAULT 2184406.42,
  tasa_defecto          TEXT DEFAULT 'pasiva_bcra',
  porcentaje_obra_social NUMERIC(5,2) DEFAULT 3,
  inscripto_ganancias   BOOLEAN DEFAULT false,
  alicuota_ganancias    NUMERIC(5,2) DEFAULT 15,
  tema                  TEXT DEFAULT 'system',
  formato_periodo       TEXT DEFAULT 'YYYY-MM',
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estados    ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_estudio ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes               ENABLE ROW LEVEL SECURITY;

-- Función helper: es admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE(rol = 'admin', false)
  FROM profiles
  WHERE id = auth.uid()
$$;

-- PLANES: todos pueden leer
CREATE POLICY "planes_select_all" ON planes FOR SELECT USING (true);

-- PROFILES
CREATE POLICY "profiles_select_own"   ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE USING (id = auth.uid() OR is_admin());
CREATE POLICY "profiles_insert_admin" ON profiles FOR INSERT WITH CHECK (is_admin() OR id = auth.uid());
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (is_admin());

-- SUSCRIPCIONES
CREATE POLICY "suscripciones_select" ON suscripciones FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "suscripciones_all_admin" ON suscripciones FOR ALL USING (is_admin());

-- CLIENTES
CREATE POLICY "clientes_select" ON clientes FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "clientes_insert" ON clientes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "clientes_update" ON clientes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "clientes_delete" ON clientes FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- HISTORIAL
CREATE POLICY "historial_select" ON historial_estados FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "historial_insert" ON historial_estados FOR INSERT WITH CHECK (user_id = auth.uid());

-- DOCUMENTOS
CREATE POLICY "docs_select" ON documentos FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "docs_insert" ON documentos FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "docs_delete" ON documentos FOR DELETE USING (user_id = auth.uid());

-- CALCULOS
CREATE POLICY "calc_select" ON calculos FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "calc_insert" ON calculos FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "calc_delete" ON calculos FOR DELETE USING (user_id = auth.uid());

-- CONFIG
CREATE POLICY "config_select" ON configuracion_estudio FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "config_upsert" ON configuracion_estudio FOR ALL USING (user_id = auth.uid());

-- ============================================================
--  TRIGGER: crear profile + config al registrarse
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  starter_plan_id UUID;
BEGIN
  -- Crear perfil
  INSERT INTO profiles (id, email, nombre_completo, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', ''),
    CASE WHEN NEW.email = 'creapp.ar@gmail.com' THEN 'admin' ELSE 'abogado' END
  );

  -- Crear config default
  INSERT INTO configuracion_estudio (user_id, email)
  VALUES (NEW.id, NEW.email);

  -- Asignar trial con plan Starter
  SELECT id INTO starter_plan_id FROM planes WHERE nombre = 'STARTER' LIMIT 1;
  INSERT INTO suscripciones (user_id, plan_id, estado, fecha_vencimiento)
  VALUES (NEW.id, starter_plan_id, 'trial', CURRENT_DATE + INTERVAL '15 days');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
--  STORAGE BUCKET para documentos
-- ============================================================
-- Ejecutar también en: Storage → New bucket
-- Nombre: "documentos"
-- Public: NO (privado)
-- Luego crear esta policy en el bucket:
--   Authenticated users can upload/read their own files
--   Path prefix: {user_id}/
