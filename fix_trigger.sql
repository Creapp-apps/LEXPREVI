-- Ejecutá esto en el SQL Editor de Supabase para corregir el error del trigger:

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  starter_plan_id UUID;
BEGIN
  -- 1. Crear perfil
  INSERT INTO profiles (id, email, nombre_completo, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', ''),
    CASE WHEN NEW.email = 'creapp.ar@gmail.com' THEN 'admin' ELSE 'abogado' END
  );

  -- 2. Crear config default
  INSERT INTO configuracion_estudio (user_id, email)
  VALUES (NEW.id, NEW.email);

  -- 3. Asignar suscripción solo si el plan existe, para evitar error de NOT NULL
  SELECT id INTO starter_plan_id FROM planes WHERE nombre = 'STARTER' LIMIT 1;
  IF starter_plan_id IS NOT NULL THEN
    INSERT INTO suscripciones (user_id, plan_id, estado, fecha_vencimiento)
    VALUES (NEW.id, starter_plan_id, 'trial', CURRENT_DATE + INTERVAL '15 days');
  END IF;

  RETURN NEW;
END;
$$;
