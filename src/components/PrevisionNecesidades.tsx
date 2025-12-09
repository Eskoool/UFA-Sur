import React, { useState } from 'react';
import { Medicamento, Semana, ConteoSemanal } from '../types';

interface Props {
  medicamentos: Medicamento[];
  semanas: Semana[];
  semanaActualIndex: number;
  getPrevision: (medicamentoId: string, semanaId: string) => ConteoSemanal;
  onUpdatePrevision: (medicamentoId: string, semanaId: string, conteo: Partial<ConteoSemanal>) => void;
  onChangeSemanaIndex: (index: number) => void;
}

export const PrevisionNecesidades: React.FC<Props> = ({
  medicamentos,
  semanas,
  semanaActualIndex,
  getPrevision,
  onUpdatePrevision,
  onChangeSemanaIndex,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{
    medicamentoId: string;
    semanaId: string;
    field: 'xsfar1' | 'xsfar' | 'ptePedido';
  } | null>(null);

  const semanasVisibles = semanas.slice(semanaActualIndex, semanaActualIndex + 3);

  const handleCellEdit = (
    medicamentoId: string,
    semanaId: string,
    field: 'xsfar1' | 'xsfar' | 'ptePedido',
    value: string | boolean
  ) => {
    const updates: Partial<ConteoSemanal> = {};

    if (field === 'ptePedido') {
      updates[field] = value as boolean;
    } else {
      const numValue = parseInt(value as string) || 0;
      updates[field] = numValue;
    }

    onUpdatePrevision(medicamentoId, semanaId, updates);
    setEditingCell(null);
  };

  const calcularPtePreparar = (medicamento: Medicamento, semana: Semana): number => {
    const prevision = getPrevision(medicamento.id, semana.id);
    // Lógica: si total es negativo, necesitamos preparar la diferencia
    // Si es positivo, tenemos stock suficiente
    return Math.max(0, -prevision.total);
  };

  const filteredMedicamentos = medicamentos.filter((med) =>
    med.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="prevision-necesidades">
      <div className="prevision-header">
        <h2>Previsión de Necesidades - Stock en Unidades</h2>
        <div className="semana-navigation">
          <button
            className="btn btn-sm"
            onClick={() => onChangeSemanaIndex(Math.max(0, semanaActualIndex - 1))}
            disabled={semanaActualIndex === 0}
          >
            ← Anterior
          </button>
          <span className="semana-info">
            Mostrando semanas {semanaActualIndex + 1} - {Math.min(semanaActualIndex + 3, semanas.length)}
          </span>
          <button
            className="btn btn-sm"
            onClick={() => onChangeSemanaIndex(Math.min(semanas.length - 3, semanaActualIndex + 1))}
            disabled={semanaActualIndex >= semanas.length - 3}
          >
            Siguiente →
          </button>
        </div>
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

      <div className="prevision-table-container">
        <table className="prevision-table">
          <thead>
            <tr>
              <th rowSpan={2} className="sticky-col">Descripción</th>
              <th rowSpan={2}>UPE</th>
              <th rowSpan={2}>Nevera</th>
              <th rowSpan={2}>Código</th>
              {semanasVisibles.map((semana) => (
                <th key={semana.id} colSpan={5} className="semana-header">
                  {semana.nombre}
                </th>
              ))}
            </tr>
            <tr>
              {semanasVisibles.map((semana) => (
                <React.Fragment key={semana.id}>
                  <th>XSFAR1</th>
                  <th>XSFAR</th>
                  <th>TOTAL</th>
                  <th>PTE PREPARAR</th>
                  <th>¿Pte pedido?</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredMedicamentos.map((medicamento) => (
              <tr key={medicamento.id}>
                <td className="sticky-col">{medicamento.descripcion}</td>
                <td>{medicamento.upe}</td>
                <td>{medicamento.nevera ? '❄️' : '-'}</td>
                <td>{medicamento.codigo}</td>
                {semanasVisibles.map((semana) => {
                  const prevision = getPrevision(medicamento.id, semana.id);
                  const ptePreparar = calcularPtePreparar(medicamento, semana);
                  const needsStock = prevision.total < 0;

                  return (
                    <React.Fragment key={semana.id}>
                      <td
                        className="editable-cell"
                        onClick={() => setEditingCell({ medicamentoId: medicamento.id, semanaId: semana.id, field: 'xsfar1' })}
                      >
                        {editingCell?.medicamentoId === medicamento.id &&
                         editingCell?.semanaId === semana.id &&
                         editingCell?.field === 'xsfar1' ? (
                          <input
                            type="number"
                            autoFocus
                            defaultValue={prevision.xsfar1}
                            onBlur={(e) => handleCellEdit(medicamento.id, semana.id, 'xsfar1', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCellEdit(medicamento.id, semana.id, 'xsfar1', (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="cell-input"
                          />
                        ) : (
                          prevision.xsfar1 || '-'
                        )}
                      </td>
                      <td
                        className="editable-cell"
                        onClick={() => setEditingCell({ medicamentoId: medicamento.id, semanaId: semana.id, field: 'xsfar' })}
                      >
                        {editingCell?.medicamentoId === medicamento.id &&
                         editingCell?.semanaId === semana.id &&
                         editingCell?.field === 'xsfar' ? (
                          <input
                            type="number"
                            autoFocus
                            defaultValue={prevision.xsfar}
                            onBlur={(e) => handleCellEdit(medicamento.id, semana.id, 'xsfar', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCellEdit(medicamento.id, semana.id, 'xsfar', (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="cell-input"
                          />
                        ) : (
                          prevision.xsfar || '-'
                        )}
                      </td>
                      <td className={needsStock ? 'negative-stock' : 'positive-stock'}>
                        {prevision.total || 0}
                      </td>
                      <td className={ptePreparar > 0 ? 'needs-preparation' : ''}>
                        {ptePreparar > 0 ? ptePreparar : '-'}
                      </td>
                      <td
                        className="editable-cell checkbox-cell"
                        onClick={() => handleCellEdit(medicamento.id, semana.id, 'ptePedido', !prevision.ptePedido)}
                      >
                        <input
                          type="checkbox"
                          checked={prevision.ptePedido}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    </React.Fragment>
                  );
                })}
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

      <div className="prevision-legend">
        <h4>Leyenda:</h4>
        <ul>
          <li><span className="legend-item negative">TOTAL negativo</span>: No se cubren las necesidades</li>
          <li><span className="legend-item positive">TOTAL positivo</span>: Stock suficiente</li>
          <li><span className="legend-item preparation">PTE PREPARAR</span>: Cantidad que falta por preparar</li>
          <li>Haz clic en las celdas para editar los valores</li>
        </ul>
      </div>
    </div>
  );
};
