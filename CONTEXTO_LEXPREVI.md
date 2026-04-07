# LexPrevi - Plataforma Previsional Premium (SaaS Multi-tenant)
## Contexto de Desarrollo y Arquitectura

Este documento preserva todo el contexto del desarrollo realizado para LexPrevi hasta abril de 2026, para ser utilizado en futuras sesiones o mantenimientos.

### 1. Visión General del Proyecto
LexPrevi evolucionó de una app local a **plataforma SaaS multi-tenant** previsional diseñada para abogados en Argentina.
El sistema permite a estudios jurídicos tener cuentas independientes, gestionar pagos, y administrar expedientes con seguridad perimetral total (RLS).

**Stack Tecnológico:**
*   **Vite + React (TypeScript):** Componentización y tipado fuerte.
*   **CSS Puro (Custom Properties):** Diseño Premium, dark/light mode mediante `data-theme`.
*   **Supabase (PostgreSQL + Auth + Storage):** Autenticación, Base de datos relacional y guardado de archivos.

### 2. Capa de Autenticación y Multi-tenant (Supabase)
Todo el sistema está protegido y segmentado:
*   **Perfiles (`profiles`):** Cada usuario registrado tiene un perfil con un rol (`admin` o `abogado`).
*   **Planes y Suscripciones (`planes`, `suscripciones`):** Existen planes (`STARTER`, `ENTERPRISE`) y estados de suscripción (`trial`, `activo`, `vencido`, `suspendido`).
*   **Row Level Security (RLS):** Cada consulta a Supabase (clientes, documentos, cálculos, historial) está filtrada automáticamente a nivel de base de datos (`user_id = auth.uid()`). A nivel de código, las queries simplemente hacen `select('*')` y Supabase devuelve solo lo que le pertenece a ese usuario.

### 3. Módulos Implementados

1.  **Landing Page / Login (`/bienvenido`):** Página pública con precios, registro ("Solicitar Acceso") e inicio de sesión.
2.  **Panel de Administración (`/admin`):** Solo visible por el rol `admin` (creapp.ar@gmail.com). Permite dar de alta cuentas, asignar planes, registrar pagos, y suspender usuarios morosos.
3.  **Haber Inicial, Movilidad, Comparativa Índices:** Herramientas de cálculo libres de contexto de estado.
4.  **Retroactivo:** Motor de liquidación con 4 tasas de interés.
5.  **Reajustes & Fallos:** Badaro, Alaniz, Delaude, Elliff, Vergara.
6.  **Gestión de Clientes (Expediente Digital):** CRUD completo. Cada expediente tiene 4 solapas: Expediente, Documentos (Supabase Storage), Historial (línea de tiempo obligatoria) y Cálculos vinculados.

### 4. Estado Actual (Fase de Migración)
En la última sesión (abril 2026), se configuró toda la arquitectura de Supabase:
*   Se corrió el `supabase_schema.sql` en la base de datos (tablas, RLS, triggers).
*   Se crearon las interfaces y el `AuthContext`.
*   Se construyó el Panel de Administración y la Landing Page.

**PENDIENTE PARA LA PRÓXIMA SESIÓN (FASE 3 Y 5 DEL PLAN):**
Los módulos internos (Clientes, Configuración) todavía están "cableados" para usar `localStorage` (`src/utils/clientesStore.ts` y `configStore.ts`). 
El **próximo paso inmediato** es reemplazar esos archivos por integraciones reales con Supabase (`supabaseClientesService.ts`) para que los expedientes se guarden en la nube en lugar del navegador, vinculados al `user_id`. Además, falta migrar la subida de Base64 de documentos hacia los buckets de Supabase Storage.

### 5. Configuración de Entorno
Para levantar el proyecto, se requiere un `.env.local` con:
*   `VITE_SUPABASE_URL`
*   `VITE_SUPABASE_ANON_KEY`
*   `VITE_ADMIN_EMAIL=creapp.ar@gmail.com`
