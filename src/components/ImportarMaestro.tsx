/**
 * Componente para importar el Documento Maestro
 */

import React, { useState, useRef } from 'react';
import { procesarDocumentoMaestro, crearHistoricoImportacion } from '../services/documentoMaestro';
import type { Medicamento, HistoricoItem } from '../types';

interface ImportarMaestroProps {
  onImportar: (medicamentos: Medicamento[], historico: HistoricoItem) => void;
  onClose: () => void;
}

export const ImportarMaestro: React.FC<ImportarMaestroProps> = ({ onImportar, onClose }) => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<{
    medicamentos: Medicamento[];
    errores: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArchivo(file);
      setResultado(null);
    }
  };

  const handleProcesar = async () => {
    if (!archivo) return;

    setProcesando(true);
    setResultado(null);

    try {
      const { medicamentos, errores } = await procesarDocumentoMaestro(archivo);
      setResultado({ medicamentos, errores });
    } catch (error) {
      setResultado({
        medicamentos: [],
        errores: [`Error inesperado: ${error}`],
      });
    } finally {
      setProcesando(false);
    }
  };

  const handleConfirmarImportacion = () => {
    if (!resultado || resultado.medicamentos.length === 0) return;

    const historico = crearHistoricoImportacion(resultado.medicamentos.length);
    onImportar(resultado.medicamentos, historico);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📥 Importar Documento Maestro</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Instrucciones */}
          <div className="alert alert-info">
            <h4>📋 Formato del Archivo</h4>
            <p>El archivo puede ser <strong>CSV, Excel o ODT</strong> con los siguientes campos:</p>
            <ul>
              <li><code>cod_articulo</code> - Código del artículo (requerido)</li>
              <li><code>denominaci</code> - Denominación (requerido)</li>
              <li><code>existencia</code> - Stock actual (requerido)</li>
              <li><code>ud_pte_cons</code> - Unidades pendientes (pedido)</li>
              <li>Y otros campos opcionales...</li>
            </ul>
            <p><strong>Formatos admitidos:</strong> .csv, .xlsx, .xls, .ods, .odt</p>
          </div>

          {/* Selector de archivo */}
          <div className="upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.xlsx,.xls,.ods,.odt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
              {archivo ? (
                <div className="file-selected">
                  <span className="file-icon">📄</span>
                  <div>
                    <p className="file-name">{archivo.name}</p>
                    <p className="file-size">{(archivo.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📁</span>
                  <p>Haz clic para seleccionar archivo</p>
                  <p className="text-muted">CSV, Excel (.xlsx, .xls) u ODT (.ods, .odt)</p>
                </div>
              )}
            </div>

            {archivo && !resultado && (
              <button
                className="btn btn-primary btn-large"
                onClick={handleProcesar}
                disabled={procesando}
              >
                {procesando ? '⏳ Procesando...' : '🔍 Procesar Archivo'}
              </button>
            )}
          </div>

          {/* Resultados */}
          {resultado && (
            <div className="results-section">
              {resultado.errores.length > 0 && (
                <div className="alert alert-warning">
                  <h4>⚠️ Advertencias ({resultado.errores.length})</h4>
                  <ul className="error-list">
                    {resultado.errores.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {resultado.errores.length > 10 && (
                      <li>... y {resultado.errores.length - 10} más</li>
                    )}
                  </ul>
                </div>
              )}

              {resultado.medicamentos.length > 0 && (
                <div className="alert alert-success">
                  <h4>✅ Procesado Correctamente</h4>
                  <p>
                    <strong>{resultado.medicamentos.length}</strong> artículos listos para
                    importar
                  </p>

                  {/* Vista previa */}
                  <div className="preview-section">
                    <h5>Vista previa (primeros 5):</h5>
                    <table className="preview-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Descripción</th>
                          <th>Existencia</th>
                          <th>Pte. Pedido</th>
                          <th>Nevera</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.medicamentos.slice(0, 5).map((med) => (
                          <tr key={med.id}>
                            <td>{med.codigo}</td>
                            <td>{med.descripcion}</td>
                            <td>{med.existencia || 0}</td>
                            <td>{med.ud_pte_cons || 0}</td>
                            <td>{med.nevera ? '❄️ Sí' : 'No'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {resultado.medicamentos.length > 5 && (
                      <p className="text-muted">
                        ... y {resultado.medicamentos.length - 5} más
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {resultado && resultado.medicamentos.length > 0 && (
            <button className="btn btn-success" onClick={handleConfirmarImportacion}>
              ✅ Confirmar e Importar ({resultado.medicamentos.length} artículos)
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>

      <style>{`
        .modal-large {
          max-width: 900px;
        }

        .alert {
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .alert-info {
          background: #e0f2fe;
          border-left: 4px solid #0284c7;
        }

        .alert-warning {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
        }

        .alert-success {
          background: #dcfce7;
          border-left: 4px solid #10b981;
        }

        .alert h4 {
          margin: 0 0 10px 0;
          font-size: 1.1rem;
        }

        .alert ul {
          margin: 10px 0 0 20px;
        }

        .alert code {
          background: rgba(0, 0, 0, 0.05);
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.9em;
        }

        .upload-section {
          margin: 20px 0;
        }

        .upload-box {
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 15px;
        }

        .upload-box:hover {
          border-color: #2563eb;
          background: #f8fafc;
        }

        .upload-placeholder {
          color: #64748b;
        }

        .upload-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 10px;
        }

        .upload-placeholder p {
          margin: 5px 0;
        }

        .text-muted {
          color: #94a3b8;
          font-size: 0.9em;
        }

        .file-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .file-icon {
          font-size: 3rem;
        }

        .file-name {
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .file-size {
          margin: 5px 0 0 0;
          color: #64748b;
          font-size: 0.9em;
        }

        .btn-large {
          width: 100%;
          padding: 12px;
          font-size: 1.1rem;
        }

        .results-section {
          margin-top: 20px;
        }

        .error-list {
          max-height: 200px;
          overflow-y: auto;
        }

        .preview-section {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .preview-section h5 {
          margin: 0 0 10px 0;
          font-size: 1rem;
          color: #475569;
        }

        .preview-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 0.9em;
        }

        .preview-table th {
          background: #f1f5f9;
          padding: 8px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #cbd5e1;
        }

        .preview-table td {
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .preview-table tbody tr:hover {
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
};
