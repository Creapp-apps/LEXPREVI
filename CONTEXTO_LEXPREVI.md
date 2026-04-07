# LexPrevi - Plataforma Previsional Premium
## Contexto de Desarrollo y Arquitectura

Este documento preserva todo el contexto del desarrollo realizado para LexPrevi hasta abril de 2026, para ser utilizado en futuras sesiones o mantenimientos.

### 1. Visión General del Proyecto
LexPrevi es una plataforma SaaS previsional diseñada para abogados en Argentina. Su objetivo es calcular haberes iniciales, movilidades, reajustes por fallos jurisprudenciales y liquidaciones de retroactivos de forma precisa, visual y "Premium". Todo el sistema se ejecuta del lado del cliente (Vite + React + TypeScript) con persistencia local por el momento.

**Stack Tecnológico:**
*   **Vite + React (TypeScript):** Componentización y tipado fuerte.
*   **CSS Puro (Custom Properties):** Diseño Premium, dark/light mode mediante `data-theme`, variables de CSS.
*   **Lucide React:** Iconografía.
*   **Recharts:** Gráficos comparativos (barras apiladas, líneas).
*   **Persistencia:** `localStorage` (Clientes, Configuración).

### 2. Módulos Implementados (Completados 100%)

1.  **Dashboard (`/`):** Vista general.
2.  **Haber Inicial (`/haber-inicial`):** Cálculo del primer haber.
3.  **Movilidad Reciente (`/movilidad`):** Cálculo de actualización de haberes.
4.  **Comparativa Índices (`/comparativa`):** Gráficos comparativos.
5.  **Retroactivo (`/retroactivo`):** Motor de cálculo con 4 Tasas de interés y amortizaciones.
6.  **Reajustes & Fallos (`/reajustes`):** Implementación de Badaro, Alaniz, Delaude, Elliff, Vergara.
7.  **Gestión de Clientes (`/clientes`):** CRUD vía localStorage con Expediente Digital, Documentos (Dropzone base64 hasta 2MB), Historial (Línea de tiempo) y Cálculos vinculados. Estrictamente ligado a un historial clínico forzado de estados.
8.  **Configuración (`/config`):** Datos del Estudio, Valores legales por defecto (PBU, Haber Máximo, Tasa default), Preferencias Visuales (Data Theme: Claro, Oscuro).

### 3. Flujo de Trabajo Futuro (Próximos Pasos Pendientes)
Si volvés a abrir este proyecto, deberías considerar:
1.  **Backend Real:** Migrar de `localStorage` a **Supabase**. La estructura de `Cliente` y `AppConfig` ya está modelada perfecta para tablas relacionales. Los documentos deberán pasar de Base64 a Supabase Storage S3 buckets.
2.  **Generación de Reportes PDF:** Implementar `jspdf` y `html2canvas`.
3.  **Fallos PBU y Autónomos:** Completar motores (Marinati, Vargas, Liechtenstein).
