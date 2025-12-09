import { useState, useRef } from 'react';
import { useAppState } from './hooks/useAppState';
import { useGoogleSheets } from './hooks/useGoogleSheets';
import { CatalogoMedicamentos } from './components/CatalogoMedicamentos';
import { PrevisionNecesidades } from './components/PrevisionNecesidades';
import { GestionInventario } from './components/GestionInventario';
import { GoogleSheetsConfig } from './components/GoogleSheetsConfig';
import './App.css';

type TabType = 'catalogo' | 'prevision' | 'inventario';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('prevision');
  const [showGoogleSheetsConfig, setShowGoogleSheetsConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    state,
    setState,
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
    exportData,
    importData,
  } = useAppState();

  const {
    isConnected,
    isLoading: sheetsLoading,
    syncToSheets,
    syncFromSheets,
  } = useGoogleSheets();

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importData(file);
        alert('✅ Datos importados correctamente');
      } catch (error) {
        alert('❌ Error al importar datos: ' + (error as Error).message);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSyncToSheets = async () => {
    if (!isConnected) {
      alert('⚠️ Primero debes configurar y conectar con Google Sheets');
      setShowGoogleSheetsConfig(true);
      return;
    }

    try {
      await syncToSheets(state);
      alert('✅ Datos sincronizados a Google Sheets correctamente');
    } catch (error) {
      alert('❌ Error al sincronizar: ' + (error as Error).message);
    }
  };

  const handleSyncFromSheets = async () => {
    if (!isConnected) {
      alert('⚠️ Primero debes configurar y conectar con Google Sheets');
      setShowGoogleSheetsConfig(true);
      return;
    }

    if (!window.confirm('¿Deseas importar datos desde Google Sheets? Esto reemplazará tus datos actuales.')) {
      return;
    }

    try {
      const importedData = await syncFromSheets();
      setState((prev) => ({
        ...prev,
        ...importedData,
      }));
      alert('✅ Datos importados desde Google Sheets correctamente');
    } catch (error) {
      alert('❌ Error al importar: ' + (error as Error).message);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏥 UFA Sur - Farmacia Hospital del Sur</h1>
          <p className="subtitle">Sistema de Gestión de Medicamentos</p>
        </div>
        <div className="header-actions">
          {/* Google Sheets */}
          <button
            className={`btn btn-sm ${isConnected ? 'btn-info' : 'btn-warning'}`}
            onClick={() => setShowGoogleSheetsConfig(true)}
            title="Configurar Google Sheets"
          >
            {isConnected ? '📊 Sheets Conectado' : '⚙️ Config Sheets'}
          </button>
          {isConnected && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={handleSyncToSheets}
                disabled={sheetsLoading}
                title="Exportar datos a Google Sheets"
              >
                ⬆️ A Sheets
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSyncFromSheets}
                disabled={sheetsLoading}
                title="Importar datos desde Google Sheets"
              >
                ⬇️ De Sheets
              </button>
            </>
          )}

          {/* Archivos JSON */}
          <div className="separator" />
          <button
            className="btn btn-success btn-sm"
            onClick={exportData}
            title="Exportar base de datos a archivo JSON"
          >
            💾 Exportar JSON
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Importar base de datos desde archivo JSON"
          >
            📁 Importar JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />

          <div className="separator" />
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

      {showGoogleSheetsConfig && (
        <GoogleSheetsConfig onClose={() => setShowGoogleSheetsConfig(false)} />
      )}
    </div>
  );
}

export default App;
