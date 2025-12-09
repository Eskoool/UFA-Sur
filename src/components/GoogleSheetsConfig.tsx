/**
 * Componente para configurar la integración con Google Sheets
 */

import { useState } from 'react';
import { useGoogleSheets } from '../hooks/useGoogleSheets';

interface GoogleSheetsConfigProps {
  onClose: () => void;
}

export const GoogleSheetsConfig: React.FC<GoogleSheetsConfigProps> = ({ onClose }) => {
  const {
    isConfigured,
    isConnected,
    isLoading,
    error,
    configure,
    connect,
    disconnect,
    testConnection,
  } = useGoogleSheets();

  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleConfigure = () => {
    if (spreadsheetId.trim()) {
      configure(spreadsheetId.trim());
      setSpreadsheetId('');
    }
  };

  const handleTestConnection = async () => {
    const result = await testConnection();
    if (result) {
      alert('✅ Conexión exitosa con Google Sheets');
    } else {
      alert('❌ No se pudo conectar con Google Sheets');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Configuración de Google Sheets</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Estado de conexión */}
          <div className="connection-status">
            <div className="status-item">
              <span className="status-label">Configurado:</span>
              <span className={`status-badge ${isConfigured ? 'success' : 'error'}`}>
                {isConfigured ? '✓ Sí' : '✗ No'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Conectado:</span>
              <span className={`status-badge ${isConnected ? 'success' : 'error'}`}>
                {isConnected ? '✓ Sí' : '✗ No'}
              </span>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Paso 1: Configurar Spreadsheet ID */}
          <div className="config-section">
            <h3>📋 Paso 1: Configurar Spreadsheet ID</h3>
            <p className="help-text">
              Ingresa el ID de tu Google Sheet. Lo encuentras en la URL:
              <br />
              <code>https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit</code>
            </p>

            <div className="form-group">
              <label htmlFor="spreadsheetId">Spreadsheet ID:</label>
              <input
                type="text"
                id="spreadsheetId"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="form-control"
                disabled={isLoading}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleConfigure}
              disabled={!spreadsheetId.trim() || isLoading}
            >
              💾 Guardar Configuración
            </button>

            <button
              className="btn btn-link"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              {showInstructions ? '▼' : '▶'} Ver instrucciones detalladas
            </button>

            {showInstructions && (
              <div className="instructions-box">
                <ol>
                  <li>
                    Crea un nuevo Google Sheet o usa uno existente en{' '}
                    <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer">
                      sheets.google.com
                    </a>
                  </li>
                  <li>
                    Ve a <strong>Extensiones {'>'} Apps Script</strong>
                  </li>
                  <li>
                    Copia el código del archivo{' '}
                    <code>google-apps-script/setup.gs</code> del proyecto
                  </li>
                  <li>Guarda y recarga el Google Sheet</li>
                  <li>
                    Usa el menú <strong>🏥 UFA Sur {'>'} ⚙️ Configurar Base de Datos</strong>
                  </li>
                  <li>Copia el ID del Sheet desde la URL</li>
                  <li>Pégalo aquí arriba y guarda</li>
                </ol>
              </div>
            )}
          </div>

          {/* Paso 2: Conectar con Google */}
          {isConfigured && (
            <div className="config-section">
              <h3>🔐 Paso 2: Autenticar con Google</h3>
              <p className="help-text">
                Necesitas autenticarte con tu cuenta de Google para permitir el acceso al Sheet.
              </p>

              {!isConnected ? (
                <button className="btn btn-success" onClick={connect} disabled={isLoading}>
                  🔑 Conectar con Google
                </button>
              ) : (
                <div>
                  <p className="success-text">✅ Conectado exitosamente</p>
                  <button className="btn btn-warning" onClick={disconnect} disabled={isLoading}>
                    🔓 Desconectar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Probar conexión */}
          {isConfigured && isConnected && (
            <div className="config-section">
              <h3>🧪 Paso 3: Probar Conexión</h3>
              <p className="help-text">Verifica que la configuración funcione correctamente.</p>

              <button
                className="btn btn-info"
                onClick={handleTestConnection}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Probando...' : '🧪 Probar Conexión'}
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          max-width: 700px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }

        .btn-close:hover {
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: flex-end;
        }

        .connection-status {
          display: flex;
          gap: 20px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .status-label {
          font-weight: 600;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .status-badge.success {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.error {
          background: #f8d7da;
          color: #721c24;
        }

        .config-section {
          margin: 25px 0;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
        }

        .config-section h3 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #333;
        }

        .help-text {
          color: #666;
          font-size: 0.95rem;
          margin-bottom: 15px;
          line-height: 1.5;
        }

        .help-text code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.9em;
          color: #d63384;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-control:focus {
          outline: none;
          border-color: #4285F4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
        }

        .instructions-box {
          margin-top: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .instructions-box ol {
          margin: 0;
          padding-left: 20px;
        }

        .instructions-box li {
          margin-bottom: 8px;
        }

        .instructions-box a {
          color: #4285F4;
          text-decoration: none;
        }

        .instructions-box a:hover {
          text-decoration: underline;
        }

        .alert {
          padding: 12px 15px;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .success-text {
          color: #155724;
          font-weight: 600;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          margin-right: 10px;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #4285F4;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #357ae8;
        }

        .btn-success {
          background: #34A853;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #2d8e47;
        }

        .btn-warning {
          background: #FBBC04;
          color: #333;
        }

        .btn-warning:hover:not(:disabled) {
          background: #e5ab04;
        }

        .btn-info {
          background: #17a2b8;
          color: white;
        }

        .btn-info:hover:not(:disabled) {
          background: #138496;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #5a6268;
        }

        .btn-link {
          background: none;
          color: #4285F4;
          text-decoration: none;
          padding: 5px 10px;
        }

        .btn-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
