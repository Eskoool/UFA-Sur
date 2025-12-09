// Documento Maestro importado desde Excel/CSV/ODT
export interface DocumentoMaestro {
  cod_articulo: string;
  denominaci: string;
  existencia: number;
  pmedio: number;
  stock_min: number;
  ubica: string;
  epigr: string;
  abcstock: string;
  consumed: number;
  fec_baja: string;
  descripcio: string;
  ud_pte_cons: number;
  ud_pte_rec: number;
  nom_almacen: string;
  id_estante: string;
  estado: string;
}

export interface Medicamento {
  id: string;
  descripcion: string;
  upe: number; // Unidades Por Envase
  nevera: boolean;
  codigo: string;
  // Campos adicionales del documento maestro
  existencia?: number;
  stock_min?: number;
  ubicacion?: string;
  epigr?: string;
  abcstock?: string;
  ud_pte_cons?: number; // Unidades pendientes de consumir (pedido pendiente)
  ud_pte_rec?: number;  // Unidades pendientes de recibir
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
  // Trazabilidad
  fechaHora?: string; // Timestamp ISO
  usuario?: string;
}

// Histórico de operaciones
export interface HistoricoItem {
  id: string;
  tipo: 'IMPORTACION_MAESTRO' | 'ACTUALIZACION_INVENTARIO' | 'ACTUALIZACION_PREVISION' | 'SINCRONIZACION';
  fecha: string; // ISO date
  fechaHora: string; // Timestamp ISO
  usuario?: string;
  descripcion: string;
  datos?: any; // Datos adicionales en formato JSON
}

export interface AppState {
  medicamentos: Medicamento[];
  semanas: Semana[];
  previsiones: PrevisionMedicamento[];
  inventarios: InventarioItem[];
  historico: HistoricoItem[];
  semanaActualIndex: number; // Para mostrar las 3 semanas actuales
  ultimaImportacionMaestro?: string; // Fecha de última importación
}
