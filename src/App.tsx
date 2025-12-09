import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { CatalogoMedicamentos } from './components/CatalogoMedicamentos';
import { PrevisionNecesidades } from './components/PrevisionNecesidades';
import { GestionInventario } from './components/GestionInventario';
import './App.css';

type TabType = 'catalogo' | 'prevision' | 'inventario';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('prevision');
  const {
    state,
    addMedicamento,
    updateMedicamento,
    deleteMedicamento,
    updatePrevision,
    getPrevision,
    addInventario,
    updateInventario,
    getInventarios,
    setSemanaActualIndex,
    resetData,
  } = useAppState();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏥 UFA Sur - Farmacia Hospital del Sur</h1>
          <p className="subtitle">Sistema de Gestión de Medicamentos</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres resetear todos los datos?')) {
                resetData();
              }
            }}
            title="Resetear datos"
          >
            🔄 Resetear
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-button ${activeTab === 'prevision' ? 'active' : ''}`}
          onClick={() => setActiveTab('prevision')}
        >
          📊 Previsión de Necesidades
        </button>
        <button
          className={`nav-button ${activeTab === 'inventario' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventario')}
        >
          📦 Gestión de Inventario
        </button>
        <button
          className={`nav-button ${activeTab === 'catalogo' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalogo')}
        >
          💊 Catálogo de Medicamentos
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'catalogo' && (
          <CatalogoMedicamentos
            medicamentos={state.medicamentos}
            onAdd={addMedicamento}
            onUpdate={updateMedicamento}
            onDelete={deleteMedicamento}
          />
        )}

        {activeTab === 'prevision' && (
          <PrevisionNecesidades
            medicamentos={state.medicamentos}
            semanas={state.semanas}
            semanaActualIndex={state.semanaActualIndex}
            getPrevision={getPrevision}
            onUpdatePrevision={updatePrevision}
            onChangeSemanaIndex={setSemanaActualIndex}
          />
        )}

        {activeTab === 'inventario' && (
          <GestionInventario
            medicamentos={state.medicamentos}
            getInventarios={getInventarios}
            onAddInventario={addInventario}
            onUpdateInventario={updateInventario}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2024 UFA Sur - Hospital del Sur | Sistema de Gestión de Farmacia</p>
      </footer>
    </div>
  );
}

export default App;
