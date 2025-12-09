export interface Medicamento {
  id: string;
  descripcion: string;
  upe: number; // Unidades Por Envase
  nevera: boolean;
  codigo: string;
}

export interface ConteoSemanal {
  xsfar1: number; // Farmacéuticos
  xsfar: number;  // Técnico farmacia
  total: number;
  ptePrepararCalculado?: number; // Calculado automáticamente
  ptePedido: boolean;
}

export interface Semana {
  id: string;
  nombre: string; // Ej: "SEMANA: 09-11 Diciembre"
  fechaInicio: string; // ISO date
  fechaFin: string;    // ISO date
}

export interface PrevisionMedicamento {
  medicamentoId: string;
  semanas: {
    [semanaId: string]: ConteoSemanal;
  };
}

export interface InventarioItem {
  medicamentoId: string;
  fecha: string; // ISO date
  teorico: number;
  real: number;
  diferencia: number; // real - teorico
  ajustado: boolean;
  notas?: string;
}

export interface AppState {
  medicamentos: Medicamento[];
  semanas: Semana[];
  previsiones: PrevisionMedicamento[];
  inventarios: InventarioItem[];
  semanaActualIndex: number; // Para mostrar las 3 semanas actuales
}
