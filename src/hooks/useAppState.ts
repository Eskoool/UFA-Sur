import { useState, useEffect } from 'react';
import type { AppState, Medicamento, Semana, InventarioItem } from '../types';
import { initialMedicamentos, initialSemanas } from '../data/initialData';

const STORAGE_KEY = 'ufa-sur-pharmacy-data';

const getInitialState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing stored data:', error);
    }
  }

  return {
    medicamentos: initialMedicamentos,
    semanas: initialSemanas,
    previsiones: [],
    inventarios: [],
    semanaActualIndex: 0,
  };
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addMedicamento = (medicamento: Medicamento) => {
    setState((prev) => ({
      ...prev,
      medicamentos: [...prev.medicamentos, medicamento],
    }));
  };

  const updateMedicamento = (id: string, updates: Partial<Medicamento>) => {
    setState((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  };

  const deleteMedicamento = (id: string) => {
    setState((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((m) => m.id !== id),
      previsiones: prev.previsiones.filter((p) => p.medicamentoId !== id),
      inventarios: prev.inventarios.filter((i) => i.medicamentoId !== id),
    }));
  };

  const updatePrevision = (medicamentoId: string, semanaId: string, conteo: Partial<any>) => {
    setState((prev) => {
      const previsionIndex = prev.previsiones.findIndex(
        (p) => p.medicamentoId === medicamentoId
      );

      let newPrevisiones = [...prev.previsiones];

      if (previsionIndex === -1) {
        newPrevisiones.push({
          medicamentoId,
          semanas: {
            [semanaId]: {
              xsfar1: conteo.xsfar1 || 0,
              xsfar: conteo.xsfar || 0,
              total: (conteo.xsfar1 || 0) + (conteo.xsfar || 0),
              ptePedido: conteo.ptePedido || false,
            },
          },
        });
      } else {
        const currentSemana = newPrevisiones[previsionIndex].semanas[semanaId] || {
          xsfar1: 0,
          xsfar: 0,
          total: 0,
          ptePedido: false,
        };

        const updatedSemana = {
          ...currentSemana,
          ...conteo,
        };

        updatedSemana.total = updatedSemana.xsfar1 + updatedSemana.xsfar;

        newPrevisiones[previsionIndex] = {
          ...newPrevisiones[previsionIndex],
          semanas: {
            ...newPrevisiones[previsionIndex].semanas,
            [semanaId]: updatedSemana,
          },
        };
      }

      return {
        ...prev,
        previsiones: newPrevisiones,
      };
    });
  };

  const getPrevision = (medicamentoId: string, semanaId: string) => {
    const prevision = state.previsiones.find((p) => p.medicamentoId === medicamentoId);
    return prevision?.semanas[semanaId] || {
      xsfar1: 0,
      xsfar: 0,
      total: 0,
      ptePedido: false,
    };
  };

  const addInventario = (inventario: InventarioItem) => {
    setState((prev) => ({
      ...prev,
      inventarios: [...prev.inventarios, inventario],
    }));
  };

  const updateInventario = (medicamentoId: string, fecha: string, updates: Partial<InventarioItem>) => {
    setState((prev) => ({
      ...prev,
      inventarios: prev.inventarios.map((inv) =>
        inv.medicamentoId === medicamentoId && inv.fecha === fecha
          ? { ...inv, ...updates }
          : inv
      ),
    }));
  };

  const getInventarios = (medicamentoId: string) => {
    return state.inventarios.filter((inv) => inv.medicamentoId === medicamentoId);
  };

  const addSemana = (semana: Semana) => {
    setState((prev) => ({
      ...prev,
      semanas: [...prev.semanas, semana],
    }));
  };

  const setSemanaActualIndex = (index: number) => {
    setState((prev) => ({
      ...prev,
      semanaActualIndex: index,
    }));
  };

  const resetData = () => {
    setState({
      medicamentos: initialMedicamentos,
      semanas: initialSemanas,
      previsiones: [],
      inventarios: [],
      semanaActualIndex: 0,
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ufa-sur-database-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const importedState = JSON.parse(result) as AppState;
            setState(importedState);
            resolve();
          } else {
            reject(new Error('Error al leer el archivo'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  };

  return {
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
    addSemana,
    setSemanaActualIndex,
    resetData,
    exportData,
    importData,
  };
};
