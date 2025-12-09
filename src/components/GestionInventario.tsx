import React, { useState } from 'react';
import type { Medicamento, InventarioItem } from '../types';

interface Props {
  medicamentos: Medicamento[];
  getInventarios: (medicamentoId: string) => InventarioItem[];
  onAddInventario: (inventario: InventarioItem) => void;
  onUpdateInventario: (medicamentoId: string, fecha: string, updates: Partial<InventarioItem>) => void;
}

export const GestionInventario: React.FC<Props> = ({
  medicamentos,
  getInventarios,
  onAddInventario,
  onUpdateInventario,
}) => {
  const [selectedMedicamentoId, setSelectedMedicamentoId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    teorico: '',
    real: '',
    notas: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMedicamentoId) return;

    const teorico = parseInt(formData.teorico) || 0;
    const real = parseInt(formData.real) || 0;
    const diferencia = real - teorico;

    const newInventario: InventarioItem = {
      medicamentoId: selectedMedicamentoId,
      fecha: formData.fecha,
      teorico,
      real,
      diferencia,
      ajustado: false,
      notas: formData.notas,
    };

    onAddInventario(newInventario);

    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      teorico: '',
      real: '',
      notas: '',
    });
    setShowForm(false);
  };

  const handleAjustar = (medicamentoId: string, fecha: string) => {
    if (window.confirm('¿Marcar este inventario como ajustado?')) {
      onUpdateInventario(medicamentoId, fecha, { ajustado: true });
    }
  };

  const filteredMedicamentos = medicamentos.filter((med) =>
    med.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMedicamento = medicamentos.find((m) => m.id === selectedMedicamentoId);
  const inventarios = selectedMedicamentoId ? getInventarios(selectedMedicamentoId) : [];

  // Obtener lunes más reciente
  const getLastMonday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 6 : day - 1; // Si es domingo, retroceder 6 días
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff);
    return monday.toISOString().split('T')[0];
  };

  return (
    <div className="gestion-inventario">
      <div className="inventario-header">
        <h2>Gestión de Inventario</h2>
        <p className="inventario-info">
          📅 Inventario quincenal (cada 15 días, los lunes)
        </p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Buscar medicamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="inventario-grid">
        <div className="medicamentos-list">
          <h3>Medicamentos</h3>
          <div className="medicamentos-scroll">
            {filteredMedicamentos.map((medicamento) => {
              const hasInventarios = getInventarios(medicamento.id).length > 0;
              const lastInventario = getInventarios(medicamento.id).sort((a, b) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
              )[0];

              return (
                <div
                  key={medicamento.id}
                  className={`medicamento-item ${selectedMedicamentoId === medicamento.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedMedicamentoId(medicamento.id);
                    setShowForm(false);
                  }}
                >
                  <div className="medicamento-item-header">
                    <strong>{medicamento.descripcion}</strong>
                    {medicamento.nevera && <span className="badge-nevera">❄️</span>}
                  </div>
                  <div className="medicamento-item-details">
                    <span className="codigo">{medicamento.codigo}</span>
                    <span className="upe">UPE: {medicamento.upe}</span>
                  </div>
                  {medicamento.existencia !== undefined && (
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                      📦 Stock maestro: {medicamento.existencia}
                    </div>
                  )}
                  {hasInventarios && lastInventario && (
                    <div className="last-inventario">
                      Último: {new Date(lastInventario.fecha).toLocaleDateString('es-ES')}
                      {lastInventario.diferencia !== 0 && (
                        <span className={lastInventario.diferencia > 0 ? 'diff-positive' : 'diff-negative'}>
                          {lastInventario.diferencia > 0 ? '+' : ''}{lastInventario.diferencia}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="inventario-details">
          {selectedMedicamento ? (
            <>
              <div className="details-header">
                <h3>{selectedMedicamento.descripcion}</h3>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    // Pre-rellenar el campo teórico con la existencia del documento maestro
                    const existenciaInicial = selectedMedicamento.existencia?.toString() ?? '';
                    setFormData({
                      fecha: getLastMonday(),
                      teorico: existenciaInicial,
                      real: '',
                      notas: '',
                    });
                    setShowForm(true);
                  }}
                >
                  + Nuevo Inventario
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleSubmit} className="inventario-form">
                  <h4>Registrar Inventario</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Fecha *</label>
                      <input
                        type="date"
                        required
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Stock Teórico *
                        {selectedMedicamento.existencia !== undefined && (
                          <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '8px' }}>
                            📦 (Del maestro: {selectedMedicamento.existencia})
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.teorico}
                        onChange={(e) => setFormData({ ...formData, teorico: e.target.value })}
                        placeholder="Cantidad esperada en sistema"
                      />
                    </div>

                    <div className="form-group">
                      <label>Stock Real (Contado) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.real}
                        onChange={(e) => setFormData({ ...formData, real: e.target.value })}
                        placeholder="Cantidad contada"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Notas</label>
                      <textarea
                        value={formData.notas}
                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                        placeholder="Observaciones sobre la diferencia..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {formData.teorico && formData.real && (
                    <div className="diferencia-preview">
                      <strong>Diferencia: </strong>
                      <span className={
                        parseInt(formData.real) - parseInt(formData.teorico) === 0 ? 'diff-zero' :
                        parseInt(formData.real) - parseInt(formData.teorico) > 0 ? 'diff-positive' : 'diff-negative'
                      }>
                        {parseInt(formData.real) - parseInt(formData.teorico) > 0 ? '+' : ''}
                        {parseInt(formData.real) - parseInt(formData.teorico)}
                      </span>
                      <div className="diferencia-info">
                        {parseInt(formData.real) - parseInt(formData.teorico) > 0 && (
                          <p>⚠️ Exceso de stock - Revisar devoluciones</p>
                        )}
                        {parseInt(formData.real) - parseInt(formData.teorico) < 0 && (
                          <p>⚠️ Falta de stock - Revisar dispensaciones</p>
                        )}
                        {parseInt(formData.real) - parseInt(formData.teorico) === 0 && (
                          <p>✅ Stock coincide</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="submit" className="btn btn-success">
                      Guardar Inventario
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <div className="inventarios-history">
                <h4>Historial de Inventarios</h4>
                {inventarios.length > 0 ? (
                  <table className="inventarios-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Teórico</th>
                        <th>Real</th>
                        <th>Diferencia</th>
                        <th>Estado</th>
                        <th>Notas</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventarios
                        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                        .map((inv, index) => (
                          <tr key={`${inv.medicamentoId}-${inv.fecha}-${index}`}>
                            <td>{new Date(inv.fecha).toLocaleDateString('es-ES')}</td>
                            <td>{inv.teorico}</td>
                            <td>{inv.real}</td>
                            <td className={
                              inv.diferencia === 0 ? 'diff-zero' :
                              inv.diferencia > 0 ? 'diff-positive' : 'diff-negative'
                            }>
                              {inv.diferencia > 0 ? '+' : ''}{inv.diferencia}
                            </td>
                            <td>
                              {inv.ajustado ? (
                                <span className="badge badge-success">✓ Ajustado</span>
                              ) : (
                                <span className="badge badge-warning">Pendiente</span>
                              )}
                            </td>
                            <td className="notas-cell">{inv.notas || '-'}</td>
                            <td>
                              {!inv.ajustado && inv.diferencia !== 0 && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleAjustar(inv.medicamentoId, inv.fecha)}
                                  title="Marcar como ajustado"
                                >
                                  Ajustar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <p>No hay inventarios registrados para este medicamento</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Selecciona un medicamento para ver su inventario</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
