/**
 * Servicio para procesar el Documento Maestro
 * Soporta archivos CSV, Excel (.xlsx, .xls) y ODT
 */

import * as XLSX from 'xlsx';
import type { DocumentoMaestro, Medicamento, HistoricoItem } from '../types';

/**
 * Parsear archivo CSV
 */
function parseCSV(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(/[,;\t]/).map(h => h.trim());
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/[,;\t]/);
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Parsear archivo Excel u ODT usando XLSX
 */
async function parseExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Obtener la primera hoja
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Convertir fila del documento maestro a objeto tipado
 */
function rowToDocumentoMaestro(row: any): DocumentoMaestro {
  return {
    cod_articulo: String(row.cod_articulo || '').trim(),
    denominaci: String(row.denominaci || '').trim(),
    existencia: parseFloat(row.existencia) || 0,
    pmedio: parseFloat(row.pmedio) || 0,
    stock_min: parseFloat(row.stock_min) || 0,
    ubica: String(row.ubica || '').trim(),
    epigr: String(row.epigr || '').trim(),
    abcstock: String(row.abcstock || '').trim(),
    consumed: parseFloat(row.consumed) || 0,
    fec_baja: String(row.fec_baja || '').trim(),
    descripcio: String(row.descripcio || '').trim(),
    ud_pte_cons: parseFloat(row.ud_pte_cons) || 0,
    ud_pte_rec: parseFloat(row.ud_pte_rec) || 0,
    nom_almacen: String(row.nom_almacen || '').trim(),
    id_estante: String(row.id_estante || '').trim(),
    estado: String(row.estado || 'N').trim(),
  };
}

/**
 * Convertir Documento Maestro a Medicamento
 */
export function documentoMaestroToMedicamento(doc: DocumentoMaestro): Medicamento {
  // Detectar si requiere nevera por la ubicación o descripción
  const requiereNevera =
    doc.ubica.toUpperCase().includes('NEV') ||
    doc.descripcio.toUpperCase().includes('NEVERA') ||
    doc.nom_almacen.toUpperCase().includes('NEVERA');

  return {
    id: `med-${doc.cod_articulo}`,
    codigo: doc.cod_articulo,
    descripcion: doc.denominaci || doc.descripcio,
    upe: 1, // Por defecto, se puede ajustar manualmente
    nevera: requiereNevera,
    // Datos adicionales del maestro
    existencia: doc.existencia,
    stock_min: doc.stock_min,
    ubicacion: doc.ubica,
    epigr: doc.epigr,
    abcstock: doc.abcstock,
    ud_pte_cons: doc.ud_pte_cons,
    ud_pte_rec: doc.ud_pte_rec,
  };
}

/**
 * Procesar archivo del documento maestro
 */
export async function procesarDocumentoMaestro(file: File): Promise<{
  medicamentos: Medicamento[];
  documentos: DocumentoMaestro[];
  errores: string[];
}> {
  const errores: string[] = [];

  try {
    const extension = file.name.split('.').pop()?.toLowerCase();
    let rows: any[] = [];

    // Procesar según el tipo de archivo
    if (extension === 'csv' || extension === 'txt') {
      const text = await file.text();
      rows = parseCSV(text);
    } else if (extension === 'xlsx' || extension === 'xls' || extension === 'ods' || extension === 'odt') {
      // Usar XLSX para Excel y ODT
      rows = await parseExcel(file);
    } else {
      errores.push(`Tipo de archivo no soportado: ${extension}. Formatos admitidos: CSV, Excel (.xlsx, .xls), ODT (.ods, .odt)`);
      return { medicamentos: [], documentos: [], errores };
    }

    // Validar que tenga los campos requeridos
    if (rows.length === 0) {
      errores.push('El archivo está vacío o no tiene el formato correcto.');
      return { medicamentos: [], documentos: [], errores };
    }

    const primeraFila = rows[0];
    const camposRequeridos = ['cod_articulo', 'denominaci', 'existencia'];
    const camposFaltantes = camposRequeridos.filter(campo => !(campo in primeraFila));

    if (camposFaltantes.length > 0) {
      errores.push(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`);
      return { medicamentos: [], documentos: [], errores };
    }

    // Convertir filas a documentos maestro
    const documentos: DocumentoMaestro[] = [];
    const medicamentos: Medicamento[] = [];

    rows.forEach((row, index) => {
      try {
        const doc = rowToDocumentoMaestro(row);

        // Validar que tenga al menos código y denominación
        if (!doc.cod_articulo || !doc.denominaci) {
          errores.push(`Fila ${index + 2}: Falta código o denominación`);
          return;
        }

        documentos.push(doc);
        medicamentos.push(documentoMaestroToMedicamento(doc));
      } catch (error) {
        errores.push(`Fila ${index + 2}: Error al procesar - ${error}`);
      }
    });

    return { medicamentos, documentos, errores };
  } catch (error) {
    errores.push(`Error al leer el archivo: ${error}`);
    return { medicamentos: [], documentos: [], errores };
  }
}

/**
 * Crear entrada de histórico para importación
 */
export function crearHistoricoImportacion(
  cantidadMedicamentos: number,
  usuario?: string
): HistoricoItem {
  const now = new Date();
  return {
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tipo: 'IMPORTACION_MAESTRO',
    fecha: now.toISOString().split('T')[0],
    fechaHora: now.toISOString(),
    usuario: usuario || 'Sistema',
    descripcion: `Importación de documento maestro: ${cantidadMedicamentos} artículos`,
    datos: {
      cantidadMedicamentos,
      timestamp: now.toISOString(),
    },
  };
}

/**
 * Exportar histórico a CSV
 */
export function exportarHistoricoCSV(historico: HistoricoItem[]): string {
  const headers = ['ID', 'Tipo', 'Fecha', 'Hora', 'Usuario', 'Descripción'];
  const rows = historico.map(h => [
    h.id,
    h.tipo,
    h.fecha,
    new Date(h.fechaHora).toLocaleTimeString('es-ES'),
    h.usuario || '',
    h.descripcion,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
}

/**
 * Generar informe PDF (HTML para impresión)
 */
export function generarInformeHTML(historico: HistoricoItem[], filtros?: {
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: string;
}): string {
  let historicoFiltrado = historico;

  if (filtros) {
    if (filtros.fechaInicio) {
      historicoFiltrado = historicoFiltrado.filter(h => h.fecha >= filtros.fechaInicio!);
    }
    if (filtros.fechaFin) {
      historicoFiltrado = historicoFiltrado.filter(h => h.fecha <= filtros.fechaFin!);
    }
    if (filtros.tipo) {
      historicoFiltrado = historicoFiltrado.filter(h => h.tipo === filtros.tipo);
    }
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Informe Histórico - UFA Sur</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          color: #2563eb;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 10px;
        }
        .info {
          margin: 20px 0;
          padding: 10px;
          background: #f0f9ff;
          border-left: 4px solid #2563eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: #2563eb;
          color: white;
          padding: 12px;
          text-align: left;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        tr:hover {
          background: #f9fafb;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 0.9em;
        }
        @media print {
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>🏥 Informe Histórico de Operaciones</h1>
      <div class="info">
        <p><strong>Hospital del Sur - UFA Sur</strong></p>
        <p><strong>Fecha del informe:</strong> ${new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p><strong>Total de registros:</strong> ${historicoFiltrado.length}</p>
      </div>

      <table>
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
          ${historicoFiltrado.map(h => `
            <tr>
              <td>${new Date(h.fecha).toLocaleDateString('es-ES')}</td>
              <td>${new Date(h.fechaHora).toLocaleTimeString('es-ES')}</td>
              <td>${h.tipo.replace(/_/g, ' ')}</td>
              <td>${h.usuario || '-'}</td>
              <td>${h.descripcion}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>© 2024 UFA Sur - Hospital del Sur | Sistema de Gestión de Farmacia</p>
      </div>

      <div class="no-print" style="margin-top: 30px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
          🖨️ Imprimir / Guardar como PDF
        </button>
      </div>
    </body>
    </html>
  `;

  return html;
}
