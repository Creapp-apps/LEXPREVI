import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CalculadoraMovilidad } from './modules/Movilidad/CalculadoraMovilidad';
import { HaberInicial } from './modules/HaberInicial/HaberInicial';
import { ComparativaIndices } from './modules/Comparativa/ComparativaIndices';
import { Retroactivo } from './modules/Retroactivo/Retroactivo';
import { ReajustesFallos } from './modules/Reajustes/ReajustesFallos';
import { GestionClientes } from './modules/Clientes/GestionClientes';
import { Configuracion } from './modules/Configuracion/Configuracion';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/movilidad" element={<CalculadoraMovilidad />} />
            <Route path="/haber-inicial" element={<HaberInicial />} />
            <Route path="/comparativa" element={<ComparativaIndices />} />
            <Route path="/retroactivo" element={<Retroactivo />} />
            <Route path="/reajustes"  element={<ReajustesFallos />} />
            <Route path="/clientes"   element={<GestionClientes />} />
            <Route path="/config"     element={<Configuracion />} />
            <Route path="*" element={
              <div className="placeholder-view animate-fade-in">
                <h2>Sección en Construcción</h2>
                <p>Este módulo será desarrollado próximamente.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
