/**
 * Componente para visualizar el Histórico de operaciones
 */

import { useState } from 'react';
import type { HistoricoItem } from '../types';
import { exportarHistoricoCSV, generarInformeHTML } from '../services/documentoMaestro';

interface HistoricoProps {
  historico: HistoricoItem[];
}

export const Historico: React.FC<HistoricoProps> = ({ historico }) => {
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  const historicoFiltrado = historico.filter((h) => {
    if (filtroTipo !== 'TODOS' && h.tipo !== filtroTipo) return false;
    if (filtroFechaInicio && h.fecha < filtroFechaInicio) return false;
    if (filtroFechaFin && h.fecha > filtroFechaFin) return false;
    return true;
  });

  const handleExportarCSV = () => {
    const csv = exportarHistoricoCSV(historicoFiltrado);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerarPDF = () => {
    const html = generarInformeHTML(historicoFiltrado, {
      fechaInicio: filtroFechaInicio,
      fechaFin: filtroFechaFin,
      tipo: filtroTipo !== 'TODOS' ? filtroTipo : undefined,
    });

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
    }
  };

  return (
    <div className="historico-container">
      <div className="historico-header">
        <div>
          <h2>📋 Histórico de Operaciones</h2>
          <p className="subtitle">
            Total de registros: <strong>{historicoFiltrado.length}</strong>
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-success btn-sm" onClick={handleExportarCSV}>
            📥 Exportar CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleGenerarPDF}>
            🖨️ Generar Informe PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtro-group">
          <label>Tipo de Operación:</label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filtro-select"
          >
            <option value="TODOS">Todas</option>
            <option value="IMPORTACION_MAESTRO">Importación Maestro</option>
            <option value="ACTUALIZACION_INVENTARIO">Actualización Inventario</option>
            <option value="ACTUALIZACION_PREVISION">Actualización Previsión</option>
            <option value="SINCRONIZACION">Sincronización</option>
          </select>
        </div>

        <div className="filtro-group">
          <label>Fecha Inicio:</label>
          <input
            type="date"
            value={filtroFechaInicio}
            onChange={(e) => setFiltroFechaInicio(e.target.value)}
            className="filtro-input"
          />
        </div>

        <div className="filtro-group">
          <label>Fecha Fin:</label>
          <input
            type="date"
            value={filtroFechaFin}
            onChange={(e) => setFiltroFechaFin(e.target.value)}
            className="filtro-input"
          />
        </div>

        {(filtroTipo !== 'TODOS' || filtroFechaInicio || filtroFechaFin) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setFiltroTipo('TODOS');
              setFiltroFechaInicio('');
              setFiltroFechaFin('');
            }}
          >
            🔄 Limpiar Filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      {historicoFiltrado.length === 0 ? (
        <div className="empty-state">
          <p>📭 No hay registros en el histórico</p>
          {historico.length > 0 && (
            <p className="text-muted">Intenta ajustar los filtros</p>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="historico-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Usuario</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {historicoFiltrado.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.fecha).toLocaleDateString('es-ES')}</td>
                  <td>{new Date(item.fechaHora).toLocaleTimeString('es-ES')}</td>
                  <td>
                    <span className={`badge badge-${getTipoBadgeClass(item.tipo)}`}>
                      {formatTipo(item.tipo)}
                    </span>
                  </td>
                  <td>{item.usuario || '-'}</td>
                  <td>{item.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .historico-container {
          padding: 20px;
        }

        .historico-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }

        .historico-header h2 {
          margin: 0 0 8px 0;
          color: #1e293b;
        }

        .subtitle {
          margin: 0;
          color: #64748b;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .filtros-section {
          display: flex;
          gap: 15px;
          align-items: flex-end;
          margin-bottom: 20px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          flex-wrap: wrap;
        }

        .filtro-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .filtro-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
        }

        .filtro-select,
        .filtro-input {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 0.95rem;
          background: white;
        }

        .filtro-select {
          min-width: 200px;
        }

        .filtro-input {
          min-width: 150px;
        }

        .table-container {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .historico-table {
          width: 100%;
          border-collapse: collapse;
        }

        .historico-table th {
          background: #f1f5f9;
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
          position: sticky;
          top: 0;
        }

        .historico-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }

        .historico-table tbody tr:hover {
          background: #f8fafc;
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .badge-primary {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge-success {
          background: #dcfce7;
          color: #166534;
        }

        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-info {
          background: #e0f2fe;
          color: #075985;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .empty-state p {
          margin: 10px 0;
        }

        .text-muted {
          color: #94a3b8;
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
};

function getTipoBadgeClass(tipo: string): string {
  switch (tipo) {
    case 'IMPORTACION_MAESTRO':
      return 'primary';
    case 'ACTUALIZACION_INVENTARIO':
      return 'success';
    case 'ACTUALIZACION_PREVISION':
      return 'warning';
    case 'SINCRONIZACION':
      return 'info';
    default:
      return 'primary';
  }
}

function formatTipo(tipo: string): string {
  return tipo.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
