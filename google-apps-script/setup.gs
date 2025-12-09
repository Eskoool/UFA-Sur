/**
 * UFA Sur - Google Sheets Database Setup
 *
 * Este script configura automáticamente el Google Sheet con las pestañas
 * y estructura necesaria para el sistema de gestión de farmacia UFA Sur.
 *
 * Instrucciones:
 * 1. Abre tu Google Sheet
 * 2. Ve a Extensiones > Apps Script
 * 3. Copia y pega este código completo
 * 4. Guarda el proyecto
 * 5. Recarga el Google Sheet
 * 6. Usa el menú "🏥 UFA Sur" que aparecerá
 */

/**
 * Configuración inicial de la base de datos
 */
function setupUFASurDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Eliminar hojas existentes excepto la primera
  const sheets = ss.getSheets();
  for (let i = sheets.length - 1; i > 0; i--) {
    ss.deleteSheet(sheets[i]);
  }

  // ==========================================
  // PESTAÑA 1: MAESTRO DE ARTÍCULOS
  // ==========================================
  const maestroSheet = sheets[0];
  maestroSheet.setName('Maestro de Artículos');
  maestroSheet.clear();

  const maestroHeaders = [
    'ID',
    'Código',
    'Descripción',
    'UPE',
    'Nevera',
    'Estado',
    'Última Actualización'
  ];

  maestroSheet.getRange(1, 1, 1, maestroHeaders.length)
    .setValues([maestroHeaders])
    .setBackground('#4285F4')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Formato de columnas
  maestroSheet.setColumnWidth(1, 100);  // ID
  maestroSheet.setColumnWidth(2, 120);  // Código
  maestroSheet.setColumnWidth(3, 300);  // Descripción
  maestroSheet.setColumnWidth(4, 80);   // UPE
  maestroSheet.setColumnWidth(5, 80);   // Nevera
  maestroSheet.setColumnWidth(6, 100);  // Estado
  maestroSheet.setColumnWidth(7, 150);  // Última Actualización

  // Validación para columna "Nevera"
  const neveraRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Sí', 'No'])
    .setAllowInvalid(false)
    .build();
  maestroSheet.getRange('E2:E1000').setDataValidation(neveraRule);

  // Validación para columna "Estado"
  const estadoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Activo', 'Inactivo', 'Descatalogado'])
    .setAllowInvalid(false)
    .build();
  maestroSheet.getRange('F2:F1000').setDataValidation(estadoRule);

  // Formato condicional para Estado
  const activeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Activo')
    .setBackground('#D9EAD3')
    .setRanges([maestroSheet.getRange('F2:F1000')])
    .build();

  const inactiveRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Inactivo')
    .setBackground('#F4CCCC')
    .setRanges([maestroSheet.getRange('F2:F1000')])
    .build();

  maestroSheet.setConditionalFormatRules([activeRule, inactiveRule]);

  // ==========================================
  // PESTAÑA 2: INVENTARIOS
  // ==========================================
  const inventarioSheet = ss.insertSheet('Inventarios');

  const inventarioHeaders = [
    'ID',
    'Medicamento ID',
    'Fecha',
    'Teórico',
    'Real',
    'Diferencia',
    'Ajustado',
    'Notas'
  ];

  inventarioSheet.getRange(1, 1, 1, inventarioHeaders.length)
    .setValues([inventarioHeaders])
    .setBackground('#34A853')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Formato de columnas
  inventarioSheet.setColumnWidth(1, 100);  // ID
  inventarioSheet.setColumnWidth(2, 120);  // Medicamento ID
  inventarioSheet.setColumnWidth(3, 110);  // Fecha
  inventarioSheet.setColumnWidth(4, 100);  // Teórico
  inventarioSheet.setColumnWidth(5, 100);  // Real
  inventarioSheet.setColumnWidth(6, 100);  // Diferencia
  inventarioSheet.setColumnWidth(7, 100);  // Ajustado
  inventarioSheet.setColumnWidth(8, 300);  // Notas

  // Fórmula automática para columna "Diferencia" (F = E - D)
  inventarioSheet.getRange('F2:F1000')
    .setFormula('=IF(OR(ISBLANK(D2),ISBLANK(E2)),"",E2-D2)');

  // Validación para columna "Ajustado"
  const ajustadoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Sí', 'No'])
    .setAllowInvalid(false)
    .build();
  inventarioSheet.getRange('G2:G1000').setDataValidation(ajustadoRule);

  // Formato condicional para Diferencia
  const diferenciaPositivaRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(0)
    .setBackground('#D9EAD3')
    .setRanges([inventarioSheet.getRange('F2:F1000')])
    .build();

  const diferenciaNegativaRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0)
    .setBackground('#F4CCCC')
    .setRanges([inventarioSheet.getRange('F2:F1000')])
    .build();

  inventarioSheet.setConditionalFormatRules([diferenciaPositivaRule, diferenciaNegativaRule]);

  // ==========================================
  // PESTAÑA 3: PREVISIÓN DE NECESIDADES
  // ==========================================
  const previsionSheet = ss.insertSheet('Previsión de Necesidades');

  const previsionHeaders = [
    'ID',
    'Medicamento ID',
    'Semana',
    'Fecha Inicio',
    'Fecha Fin',
    'XSFAR1',
    'XSFAR',
    'Total',
    'Stock Actual',
    'Pte. Pedido',
    'Notas'
  ];

  previsionSheet.getRange(1, 1, 1, previsionHeaders.length)
    .setValues([previsionHeaders])
    .setBackground('#FBBC04')
    .setFontColor('#000000')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Formato de columnas
  previsionSheet.setColumnWidth(1, 100);  // ID
  previsionSheet.setColumnWidth(2, 120);  // Medicamento ID
  previsionSheet.setColumnWidth(3, 100);  // Semana
  previsionSheet.setColumnWidth(4, 110);  // Fecha Inicio
  previsionSheet.setColumnWidth(5, 110);  // Fecha Fin
  previsionSheet.setColumnWidth(6, 80);   // XSFAR1
  previsionSheet.setColumnWidth(7, 80);   // XSFAR
  previsionSheet.setColumnWidth(8, 80);   // Total
  previsionSheet.setColumnWidth(9, 120);  // Stock Actual
  previsionSheet.setColumnWidth(10, 100); // Pte. Pedido
  previsionSheet.setColumnWidth(11, 250); // Notas

  // Fórmula automática para columna "Total" (H = F + G)
  previsionSheet.getRange('H2:H1000')
    .setFormula('=IF(OR(ISBLANK(F2),ISBLANK(G2)),"",F2+G2)');

  // Validación para columna "Pte. Pedido"
  const pedidoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Sí', 'No'])
    .setAllowInvalid(false)
    .build();
  previsionSheet.getRange('J2:J1000').setDataValidation(pedidoRule);

  // Formato condicional para Pte. Pedido
  const pendienteRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Sí')
    .setBackground('#FCE5CD')
    .setFontColor('#E67C00')
    .setRanges([previsionSheet.getRange('J2:J1000')])
    .build();

  previsionSheet.setConditionalFormatRules([pendienteRule]);

  // ==========================================
  // CONFIGURACIÓN GENERAL
  // ==========================================
  [maestroSheet, inventarioSheet, previsionSheet].forEach(sheet => {
    sheet.setFrozenRows(1); // Congelar fila de encabezados
    sheet.getRange(2, 1, 1000, sheet.getLastColumn())
      .setVerticalAlignment('middle');
  });

  // Proteger fórmulas
  const protection = previsionSheet.getRange('H2:H1000').protect()
    .setDescription('Columna de total calculada automáticamente');
  protection.setWarningOnly(true);

  SpreadsheetApp.getUi().alert(
    '✅ ¡Base de datos configurada correctamente!\n\n' +
    'Se han creado 3 pestañas:\n' +
    '1. Maestro de Artículos\n' +
    '2. Inventarios\n' +
    '3. Previsión de Necesidades\n\n' +
    'Todas las validaciones y formatos están listos.'
  );
}

/**
 * Exportar datos a formato JSON
 */
function exportToJSON() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {
    exportDate: new Date().toISOString(),
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    data: {}
  };

  // Exportar cada pestaña
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    const data = sheet.getDataRange().getValues();

    if (data.length > 1) {
      const headers = data[0];
      const rows = data.slice(1);

      result.data[sheetName] = rows
        .filter(row => row.some(cell => cell !== '')) // Filtrar filas vacías
        .map(row => {
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = row[i];
          });
          return obj;
        });
    }
  });

  // Mostrar JSON en el log
  Logger.log(JSON.stringify(result, null, 2));

  // Mostrar resumen en UI
  const ui = SpreadsheetApp.getUi();
  let summary = '📊 Datos exportados:\n\n';
  Object.keys(result.data).forEach(sheetName => {
    summary += `${sheetName}: ${result.data[sheetName].length} registros\n`;
  });
  summary += '\nRevisa el Log para ver el JSON completo (Ver > Registros)';

  ui.alert(summary);

  return JSON.stringify(result);
}

/**
 * Importar datos desde JSON
 * Requiere que ejecutes esta función desde el editor de Apps Script
 * y proporciones el JSON como parámetro
 */
function importFromJSON(jsonData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

  Object.keys(data.data || data).forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log(`Pestaña "${sheetName}" no encontrada. Saltando...`);
      return;
    }

    const records = data.data ? data.data[sheetName] : data[sheetName];
    if (!records || records.length === 0) return;

    // Obtener headers existentes
    const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Preparar datos para insertar
    const rows = records.map(record => {
      return existingHeaders.map(header => record[header] || '');
    });

    // Limpiar datos antiguos (excepto header)
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
    }

    // Insertar nuevos datos
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
  });

  SpreadsheetApp.getUi().alert('✅ Datos importados correctamente!');
}

/**
 * Generar datos de ejemplo
 */
function insertSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Datos de ejemplo para Maestro de Artículos
  const maestroSheet = ss.getSheetByName('Maestro de Artículos');
  const sampleMedicamentos = [
    ['med-001', 'PAR500', 'PARACETAMOL 500MG COMP', 20, 'No', 'Activo', new Date()],
    ['med-002', 'IBU600', 'IBUPROFENO 600MG COMP', 30, 'No', 'Activo', new Date()],
    ['med-003', 'AMO500', 'AMOXICILINA 500MG CAPS', 21, 'Sí', 'Activo', new Date()],
    ['med-004', 'OME20', 'OMEPRAZOL 20MG COMP', 28, 'No', 'Activo', new Date()],
    ['med-005', 'LOR10', 'LORATADINA 10MG COMP', 30, 'No', 'Activo', new Date()]
  ];
  maestroSheet.getRange(2, 1, sampleMedicamentos.length, sampleMedicamentos[0].length)
    .setValues(sampleMedicamentos);

  // Datos de ejemplo para Inventarios
  const inventarioSheet = ss.getSheetByName('Inventarios');
  const sampleInventarios = [
    ['inv-001', 'med-001', new Date(), 150, 145, '', 'No', 'Inventario inicial'],
    ['inv-002', 'med-002', new Date(), 80, 82, '', 'No', 'Recuento semanal'],
    ['inv-003', 'med-003', new Date(), 100, 95, '', 'Sí', 'Ajuste por caducidad'],
    ['inv-004', 'med-004', new Date(), 65, 65, '', 'No', 'Inventario mensual']
  ];
  inventarioSheet.getRange(2, 1, sampleInventarios.length, sampleInventarios[0].length)
    .setValues(sampleInventarios);

  // Datos de ejemplo para Previsión
  const previsionSheet = ss.getSheetByName('Previsión de Necesidades');
  const samplePrevisiones = [
    ['prev-001', 'med-001', 'Semana 49', new Date(2024, 11, 2), new Date(2024, 11, 8), 25, 30, '', 145, 'No', ''],
    ['prev-002', 'med-002', 'Semana 49', new Date(2024, 11, 2), new Date(2024, 11, 8), 10, 15, '', 80, 'Sí', 'Pedido urgente'],
    ['prev-003', 'med-003', 'Semana 49', new Date(2024, 11, 2), new Date(2024, 11, 8), 5, 8, '', 100, 'No', ''],
    ['prev-004', 'med-004', 'Semana 49', new Date(2024, 11, 2), new Date(2024, 11, 8), 15, 12, '', 65, 'No', '']
  ];
  previsionSheet.getRange(2, 1, samplePrevisiones.length, samplePrevisiones[0].length)
    .setValues(samplePrevisiones);

  SpreadsheetApp.getUi().alert('✅ Datos de ejemplo insertados correctamente!');
}

/**
 * Limpiar todos los datos (mantener estructura)
 */
function clearAllData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚠️ Confirmar limpieza',
    '¿Estás seguro de que quieres eliminar TODOS los datos?\n\nEsta acción no se puede deshacer.',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();

    sheets.forEach(sheet => {
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
      }
    });

    ui.alert('✅ Todos los datos han sido eliminados.');
  }
}

/**
 * Crear menú personalizado
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏥 UFA Sur')
    .addItem('⚙️ Configurar Base de Datos', 'setupUFASurDatabase')
    .addSeparator()
    .addItem('📤 Exportar a JSON', 'exportToJSON')
    .addItem('📝 Insertar Datos de Ejemplo', 'insertSampleData')
    .addSeparator()
    .addItem('🗑️ Limpiar Todos los Datos', 'clearAllData')
    .addToUi();
}
