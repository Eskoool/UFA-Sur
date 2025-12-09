/**
 * Hook personalizado para integración con Google Sheets
 */

import { useState, useEffect, useCallback } from 'react';
import {
  GoogleSheetsService,
  loadGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  getAccessTokenFromUrl,
  initiateGoogleAuth,
} from '../services/googleSheets';
import type { AppState } from '../types';

interface UseGoogleSheetsResult {
  isConfigured: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  configure: (spreadsheetId: string) => void;
  connect: () => void;
  disconnect: () => void;
  syncToSheets: (state: AppState) => Promise<void>;
  syncFromSheets: () => Promise<Partial<AppState>>;
  testConnection: () => Promise<boolean>;
}

export const useGoogleSheets = (): UseGoogleSheetsResult => {
  const [service, setService] = useState<GoogleSheetsService | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuración al montar
  useEffect(() => {
    const config = loadGoogleSheetsConfig();
    if (config && config.spreadsheetId) {
      const newService = new GoogleSheetsService(config);
      setService(newService);
      setIsConfigured(true);

      // Si hay access token, marcar como conectado
      if (config.accessToken) {
        setIsConnected(true);
      }
    }

    // Verificar si venimos de un redirect de OAuth
    const accessToken = getAccessTokenFromUrl();
    if (accessToken) {
      // Guardar token
      const config = loadGoogleSheetsConfig();
      if (config) {
        config.accessToken = accessToken;
        saveGoogleSheetsConfig(config);

        const newService = new GoogleSheetsService(config);
        setService(newService);
        setIsConnected(true);

        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  /**
   * Configurar Spreadsheet ID
   */
  const configure = useCallback((spreadsheetId: string) => {
    const config = {
      spreadsheetId,
      accessToken: loadGoogleSheetsConfig()?.accessToken,
    };

    saveGoogleSheetsConfig(config);
    const newService = new GoogleSheetsService(config);
    setService(newService);
    setIsConfigured(true);
    setError(null);
  }, []);

  /**
   * Conectar con Google (OAuth)
   */
  const connect = useCallback(() => {
    if (!isConfigured) {
      setError('Primero configura el Spreadsheet ID');
      return;
    }
    initiateGoogleAuth();
  }, [isConfigured]);

  /**
   * Desconectar
   */
  const disconnect = useCallback(() => {
    const config = loadGoogleSheetsConfig();
    if (config) {
      delete config.accessToken;
      saveGoogleSheetsConfig(config);
    }
    setIsConnected(false);
    setError(null);
  }, []);

  /**
   * Sincronizar datos locales a Google Sheets
   */
  const syncToSheets = useCallback(
    async (state: AppState) => {
      if (!service || !isConnected) {
        setError('No estás conectado a Google Sheets');
        throw new Error('No estás conectado a Google Sheets');
      }

      setIsLoading(true);
      setError(null);

      try {
        await service.exportAppState(state);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [service, isConnected]
  );

  /**
   * Sincronizar datos de Google Sheets a local
   */
  const syncFromSheets = useCallback(async (): Promise<Partial<AppState>> => {
    if (!service || !isConnected) {
      setError('No estás conectado a Google Sheets');
      throw new Error('No estás conectado a Google Sheets');
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await service.importToAppState();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, isConnected]);

  /**
   * Probar conexión
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!service) {
      return false;
    }

    setIsLoading(true);
    try {
      const result = await service.testConnection();
      setIsConnected(result);
      return result;
    } catch (err) {
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  return {
    isConfigured,
    isConnected,
    isLoading,
    error,
    configure,
    connect,
    disconnect,
    syncToSheets,
    syncFromSheets,
    testConnection,
  };
};
