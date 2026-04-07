-- ==============================================================================
-- SCRIPT DE SEMBRADO DE CLIENTES DE PRUEBA (MOCK DATA)
-- Ejecutalo en: Supabase Dashboard → SQL Editor → New Query
-- Instrucciones: Simplemente dale a "Run". Esto creará 3 falsos clientes de prueba
-- vinculados a tu cuenta de administrador ('creapp.ar@gmail.com').
-- ==============================================================================

DO $$
DECLARE
    admin_id UUID;
    cliente_a UUID;
    cliente_b UUID;
    cliente_c UUID;
BEGIN
    -- 1. Buscar a tu cuenta principal (reemplaza si querés que vaya a otro usuario)
    SELECT id INTO admin_id FROM profiles WHERE email = 'creapp.ar@gmail.com' LIMIT 1;
    
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró la cuenta creapp.ar@gmail.com. Creála primero iniciando sesión.';
    END IF;

    -- 2. Insertar Cliente 1 (Sentencia firme, a liquidar)
    INSERT INTO clientes (user_id, apellido_nombre, cuil, dni, nro_expediente, juzgado, estado, notas, fecha_alta)
    VALUES (
        admin_id, 
        'Gómez, Carlos Horacio', 
        '20-12345678-5', 
        '12345678', 
        'FSS 12344/2019', 
        'Juzgado Federal N° 2', 
        'sentencia', 
        'Sentencia firme. ANSES no apeló. Falta preparar cálculos de movilidad y retroactivos con tasa pasiva BCRA.',
        NOW() - INTERVAL '3 months'
    ) RETURNING id INTO cliente_a;

    -- 3. Insertar Cliente 2 (Activo, reciente, jubilación PBU)
    INSERT INTO clientes (user_id, apellido_nombre, cuil, nro_expediente, juzgado, estado, notas, fecha_alta)
    VALUES (
        admin_id, 
        'Martínez, Elena Beatriz', 
        '27-23456789-1', 
        'FSS 4567/2023', 
        'Juzgado Federal N° 1', 
        'activo', 
        'Ingresando pedido de reajuste inicial por fallo Elliff. Aguardando a que el cliente firme el poder.',
        NOW() - INTERVAL '5 days'
    ) RETURNING id INTO cliente_b;

    -- 4. Insertar Cliente 3 (Cobrado, finalizado)
    INSERT INTO clientes (user_id, apellido_nombre, cuil, nro_expediente, juzgado, estado, notas, fecha_alta)
    VALUES (
        admin_id, 
        'Fernández, José Luis', 
        '20-09876543-2', 
        'FSS 988/2015', 
        'Juzgado Federal N° 3', 
        'cobrado', 
        'Expediente finalizado. Cobró el mes pasado reajuste por Badaro.',
        NOW() - INTERVAL '4 years'
    ) RETURNING id INTO cliente_c;

    -- 5. Crear historiales clínicos para mostrar el Timeline
    -- Cliente A
    INSERT INTO historial_estados (cliente_id, user_id, estado_anterior, estado_nuevo, notas, autor, fecha)
    VALUES 
    (cliente_a, admin_id, 'activo', 'activo', 'Alta en el sistema.', 'Sistema', NOW() - INTERVAL '3 months'),
    (cliente_a, admin_id, 'activo', 'presentado', 'Presentación de demanda inicial acompañada de prueba documental.', 'Dr. Badaro', NOW() - INTERVAL '2 months'),
    (cliente_a, admin_id, 'presentado', 'sentencia', 'Sentencia favorable primera instancia.', 'Dr. Badaro', NOW() - INTERVAL '15 days');
    
    -- Cliente B
    INSERT INTO historial_estados (cliente_id, user_id, estado_anterior, estado_nuevo, notas, autor, fecha)
    VALUES 
    (cliente_b, admin_id, 'activo', 'activo', 'Alta. Entrevista clínica.', 'Recepción', NOW() - INTERVAL '5 days');

    -- Cliente C
    INSERT INTO historial_estados (cliente_id, user_id, estado_anterior, estado_nuevo, notas, autor, fecha)
    VALUES 
    (cliente_c, admin_id, 'activo', 'activo', 'Alta en el sistema.', 'Sistema', NOW() - INTERVAL '4 years'),
    (cliente_c, admin_id, 'activo', 'presentado', 'Presentación de demanda inicial.', 'Gestoría', NOW() - INTERVAL '3 years'),
    (cliente_c, admin_id, 'presentado', 'liquidacion', 'Aprobación de la liquidación de ANSES por 1.2M pesos.', 'Estudio', NOW() - INTERVAL '2 years'),
    (cliente_c, admin_id, 'liquidacion', 'cobrado', 'El titular confirmó visualización del depósito.', 'Cobranzas', NOW() - INTERVAL '1 years');

    -- 6. Crear un cálculo de prueba falso solo para visualización
    INSERT INTO calculos (cliente_id, user_id, tipo, descripcion, fallo, resultado, fecha_calculo)
    VALUES 
    (cliente_c, admin_id, 'retroactivo', 'Liquidación retroactiva aprobada', 'Badaro / Elliff', 1250000.00, NOW() - INTERVAL '2 years 1 month'),
    (cliente_a, admin_id, 'reajuste', 'Simulación inicial de reajuste PBU', 'Quiet', 345000.50, NOW() - INTERVAL '10 days');

END $$;
