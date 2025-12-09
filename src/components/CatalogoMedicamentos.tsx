import React, { useState } from 'react';
import { Medicamento } from '../types';

interface Props {
  medicamentos: Medicamento[];
  onAdd: (medicamento: Medicamento) => void;
  onUpdate: (id: string, updates: Partial<Medicamento>) => void;
  onDelete: (id: string) => void;
}

export const CatalogoMedicamentos: React.FC<Props> = ({
  medicamentos,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    descripcion: '',
    upe: '',
    nevera: false,
    codigo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      onUpdate(editingId, {
        descripcion: formData.descripcion,
        upe: parseInt(formData.upe),
        nevera: formData.nevera,
        codigo: formData.codigo,
      });
      setEditingId(null);
    } else {
      const newMedicamento: Medicamento = {
        id: Date.now().toString(),
        descripcion: formData.descripcion,
        upe: parseInt(formData.upe),
        nevera: formData.nevera,
        codigo: formData.codigo,
      };
      onAdd(newMedicamento);
    }

    setFormData({ descripcion: '', upe: '', nevera: false, codigo: '' });
    setIsAdding(false);
  };

  const handleEdit = (medicamento: Medicamento) => {
    setFormData({
      descripcion: medicamento.descripcion,
      upe: medicamento.upe.toString(),
      nevera: medicamento.nevera,
      codigo: medicamento.codigo,
    });
    setEditingId(medicamento.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setFormData({ descripcion: '', upe: '', nevera: false, codigo: '' });
    setEditingId(null);
    setIsAdding(false);
  };

  const filteredMedicamentos = medicamentos.filter((med) =>
    med.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="catalogo-medicamentos">
      <div className="catalogo-header">
        <h2>Catálogo de Medicamentos</h2>
        <button
          className="btn btn-primary"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          + Nuevo Medicamento
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Buscar por descripción o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="medicamento-form">
          <h3>{editingId ? 'Editar Medicamento' : 'Nuevo Medicamento'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Descripción *</label>
              <input
                type="text"
                required
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Nombre del medicamento"
              />
            </div>

            <div className="form-group">
              <label>UPE (Unidades por Envase) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.upe}
                onChange={(e) => setFormData({ ...formData, upe: e.target.value })}
                placeholder="Ej: 30"
              />
            </div>

            <div className="form-group">
              <label>Código *</label>
              <input
                type="text"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ej: V02032"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.nevera}
                  onChange={(e) => setFormData({ ...formData, nevera: e.target.checked })}
                />
                <span>Requiere Nevera</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="medicamentos-table-container">
        <table className="medicamentos-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>UPE</th>
              <th>Nevera</th>
              <th>Código</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicamentos.map((medicamento) => (
              <tr key={medicamento.id}>
                <td>{medicamento.descripcion}</td>
                <td>{medicamento.upe}</td>
                <td>
                  {medicamento.nevera ? (
                    <span className="badge badge-info">❄️ Sí</span>
                  ) : (
                    <span className="badge badge-secondary">No</span>
                  )}
                </td>
                <td>{medicamento.codigo}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => handleEdit(medicamento)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar ${medicamento.descripcion}?`)) {
                          onDelete(medicamento.id);
                        }
                      }}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMedicamentos.length === 0 && (
          <div className="empty-state">
            <p>No se encontraron medicamentos</p>
          </div>
        )}
      </div>

      <div className="catalogo-footer">
        <p>Total de medicamentos: {medicamentos.length}</p>
      </div>
    </div>
  );
};
