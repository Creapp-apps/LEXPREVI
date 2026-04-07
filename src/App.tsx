import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CalculadoraMovilidad } from './modules/Movilidad/CalculadoraMovilidad';
import { HaberInicial } from './modules/HaberInicial/HaberInicial';
import { ComparativaIndices } from './modules/Comparativa/ComparativaIndices';
import { Retroactivo } from './modules/Retroactivo/Retroactivo';
import { ReajustesFallos } from './modules/Reajustes/ReajustesFallos';
import { GestionClientes } from './modules/Clientes/GestionClientes';
import { Configuracion } from './modules/Configuracion/Configuracion';
import { AdminPanel } from './modules/Admin/AdminPanel';
import { LandingLogin } from './pages/LandingLogin';
import { RegistroExitoso } from './pages/RegistroExitoso';
import { SuspendedAccount } from './pages/SuspendedAccount';
import './App.css';

/* ── Loading spinner ── */
const Loader = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#050d1a',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      border: '3px solid rgba(255,255,255,0.1)',
      borderTopColor: '#3b82f6',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ── Ruta protegida ── */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isSuspended } = useAuth();
  if (isLoading)  return <Loader />;
  if (!user)      return <Navigate to="/bienvenido" replace />;
  if (isSuspended) return <SuspendedAccount />;
  return <>{children}</>;
};

/* ── Layout principal con sidebar ── */
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader />;

  return (
    <Router>
      <Routes>
        {/* Landing/Login — si ya está logueado redirigir al app */}
        <Route path="/bienvenido" element={
          user ? <Navigate to="/" replace /> : <LandingLogin />
        } />
        <Route path="/registro-exitoso" element={
          user ? <Navigate to="/" replace /> : <RegistroExitoso />
        } />

        {/* App protegida */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/movilidad" element={
          <ProtectedRoute><AppLayout><CalculadoraMovilidad /></AppLayout></ProtectedRoute>
        } />
        <Route path="/haber-inicial" element={
          <ProtectedRoute><AppLayout><HaberInicial /></AppLayout></ProtectedRoute>
        } />
        <Route path="/comparativa" element={
          <ProtectedRoute><AppLayout><ComparativaIndices /></AppLayout></ProtectedRoute>
        } />
        <Route path="/retroactivo" element={
          <ProtectedRoute><AppLayout><Retroactivo /></AppLayout></ProtectedRoute>
        } />
        <Route path="/reajustes" element={
          <ProtectedRoute><AppLayout><ReajustesFallos /></AppLayout></ProtectedRoute>
        } />
        <Route path="/clientes" element={
          <ProtectedRoute><AppLayout><GestionClientes /></AppLayout></ProtectedRoute>
        } />
        <Route path="/config" element={
          <ProtectedRoute><AppLayout><Configuracion /></AppLayout></ProtectedRoute>
        } />
        {/* Panel Admin — solo para admin */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AppLayout>
              {(() => { const { isAdmin } = useAuth(); return isAdmin ? <AdminPanel /> : <Navigate to="/" replace />; })()}
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Cualquier otra ruta */}
        <Route path="*" element={
          user ? <Navigate to="/" replace /> : <Navigate to="/bienvenido" replace />
        } />
      </Routes>
    </Router>
  );
}

export default App;
