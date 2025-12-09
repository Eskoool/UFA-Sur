/**
 * Google Sheets Integration Service
 *
 * Servicio para sincronizar datos con Google Sheets
 */

import type { AppState, Medicamento, InventarioItem } from '../types';

// Configuración de Google Sheets
interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey?: string;
  accessToken?: string;
}

// Tipos para las respuestas de la API
interface SheetData {
  range: string;
  values: any[][];
}

/**
 * Clase para manejar la integración con Google Sheets
 */
export class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  /**
   * Configurar credenciales
   */
  setCredentials(accessToken: string) {
    this.config.accessToken = accessToken;
  }

  /**
   * Obtener headers para las peticiones
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    return headers;
  }

  /**
   * Leer datos de una pestaña
   */
  async readSheet(sheetName: string, range: string = 'A:Z'): Promise<any[][]> {
    const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${sheetName}!${range}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al leer Google Sheets: ${response.statusText}`);
      }

      const data: SheetData = await response.json();
      return data.values || [];
    } catch (error) {
      console.error('Error reading sheet:', error);
      throw error;
    }
  }

  /**
   * Escribir datos en una pestaña
   */
  async writeSheet(
    sheetName: string,
    range: string,
    values: any[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<void> {
    const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${sheetName}!${range}?valueInputOption=${valueInputOption}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ values }),
      });

      if (!response.ok) {
        throw new Error(`Error al escribir en Google Sheets: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error writing sheet:', error);
      throw error;
    }
  }

  /**
   * Añadir filas al final de una pestaña
   */
  async appendSheet(sheetName: string, values: any[][]): Promise<void> {
    const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${sheetName}!A:Z:append?valueInputOption=USER_ENTERED`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ values }),
      });

      if (!response.ok) {
        throw new Error(`Error al añadir datos en Google Sheets: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error appending to sheet:', error);
      throw error;
    }
  }

  /**
   * Limpiar una pestaña (excepto headers)
   */
  async clearSheet(sheetName: string): Promise<void> {
    const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${sheetName}!A2:Z:clear`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al limpiar Google Sheets: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error clearing sheet:', error);
      throw error;
    }
  }

  /**
   * Exportar estado completo a Google Sheets
   */
  async exportAppState(state: AppState): Promise<void> {
    try {
      // 1. Exportar Maestro de Artículos
      const medicamentosData = state.medicamentos.map((med) => [
        med.id,
        med.codigo,
        med.descripcion,
        med.upe,
        med.nevera ? 'Sí' : 'No',
        'Activo',
        new Date().toISOString().split('T')[0],
      ]);

      await this.clearSheet('Maestro de Artículos');
      if (medicamentosData.length > 0) {
        await this.appendSheet('Maestro de Artículos', medicamentosData);
      }

      // 2. Exportar Inventarios
      const inventariosData = state.inventarios.map((inv) => [
        `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        inv.medicamentoId,
        inv.fecha,
        inv.teorico,
        inv.real,
        inv.diferencia,
        inv.ajustado ? 'Sí' : 'No',
        inv.notas || '',
      ]);

      await this.clearSheet('Inventarios');
      if (inventariosData.length > 0) {
        await this.appendSheet('Inventarios', inventariosData);
      }

      // 3. Exportar Previsión de Necesidades
      const previsionesData: any[][] = [];
      state.previsiones.forEach((prev) => {
        Object.entries(prev.semanas).forEach(([semanaId, conteo]) => {
          const semana = state.semanas.find((s) => s.id === semanaId);
          if (semana) {
            previsionesData.push([
              `prev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              prev.medicamentoId,
              semana.nombre,
              semana.fechaInicio,
              semana.fechaFin,
              conteo.xsfar1,
              conteo.xsfar,
              conteo.total,
              0, // Stock actual (se debe calcular)
              conteo.ptePedido ? 'Sí' : 'No',
              '',
            ]);
          }
        });
      });

      await this.clearSheet('Previsión de Necesidades');
      if (previsionesData.length > 0) {
        await this.appendSheet('Previsión de Necesidades', previsionesData);
      }
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Importar datos desde Google Sheets al estado de la app
   */
  async importToAppState(): Promise<Partial<AppState>> {
    try {
      // 1. Importar Maestro de Artículos
      const medicamentosData = await this.readSheet('Maestro de Artículos');
      const medicamentos: Medicamento[] = medicamentosData.slice(1).map((row) => ({
        id: row[0] || `med-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        codigo: row[1] || '',
        descripcion: row[2] || '',
        upe: parseInt(row[3]) || 1,
        nevera: row[4] === 'Sí',
      }));

      // 2. Importar Inventarios
      const inventariosData = await this.readSheet('Inventarios');
      const inventarios: InventarioItem[] = inventariosData.slice(1).map((row) => ({
        medicamentoId: row[1] || '',
        fecha: row[2] || new Date().toISOString().split('T')[0],
        teorico: parseInt(row[3]) || 0,
        real: parseInt(row[4]) || 0,
        diferencia: parseInt(row[5]) || 0,
        ajustado: row[6] === 'Sí',
        notas: row[7] || '',
      }));

      // 3. Importar Previsión de Necesidades
      const previsionesData = await this.readSheet('Previsión de Necesidades');
      const previsiones: any[] = [];

      // Agrupar por medicamento
      const previsionesMap = new Map<string, any>();
      previsionesData.slice(1).forEach((row) => {
        const medicamentoId = row[1];
        const semanaId = row[2]; // Usar el nombre de la semana como ID temporal

        if (!previsionesMap.has(medicamentoId)) {
          previsionesMap.set(medicamentoId, {
            medicamentoId,
            semanas: {},
          });
        }

        previsionesMap.get(medicamentoId).semanas[semanaId] = {
          xsfar1: parseInt(row[5]) || 0,
          xsfar: parseInt(row[6]) || 0,
          total: parseInt(row[7]) || 0,
          ptePedido: row[9] === 'Sí',
        };
      });

      previsiones.push(...Array.from(previsionesMap.values()));

      return {
        medicamentos,
        inventarios,
        previsiones,
      };
    } catch (error) {
      console.error('Error importing from Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Verificar conexión con Google Sheets
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${this.config.spreadsheetId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing connection:', error);
      return false;
    }
  }
}

/**
 * Iniciar flujo de autenticación OAuth de Google
 */
export function initiateGoogleAuth() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = window.location.origin;
  const scope = 'https://www.googleapis.com/auth/spreadsheets';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent(scope)}`;

  window.location.href = authUrl;
}

/**
 * Obtener token de acceso desde la URL (después de redirect)
 */
export function getAccessTokenFromUrl(): string | null {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

/**
 * Guardar configuración en localStorage
 */
export function saveGoogleSheetsConfig(config: GoogleSheetsConfig) {
  localStorage.setItem('google-sheets-config', JSON.stringify(config));
}

/**
 * Cargar configuración desde localStorage
 */
export function loadGoogleSheetsConfig(): GoogleSheetsConfig | null {
  const config = localStorage.getItem('google-sheets-config');
  return config ? JSON.parse(config) : null;
}
