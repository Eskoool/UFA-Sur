# 📊 Configuración de Google Sheets para UFA Sur

## 🎯 Estructura del Google Sheet

El Google Sheet tendrá **3 pestañas principales** para gestionar toda la información de la farmacia:

### 📋 Pestaña 1: **Maestro de Artículos**

Catálogo completo de medicamentos disponibles.

**Columnas:**
```
| ID | Código Nacional | Nombre | Presentación | Laboratorio | PVP | Categoría | Estado | Última Actualización |
```

**Ejemplo de datos:**
```
| med-001 | 123456 | Paracetamol | 500mg x 20 comp | LabFarma | 5.50 | Analgésicos | Activo | 2024-12-09 |
| med-002 | 789012 | Ibuprofeno | 600mg x 30 comp | MedLab | 8.75 | Antiinflamatorios | Activo | 2024-12-09 |
```

### 📦 Pestaña 2: **Inventarios**

Registro de entradas y salidas de medicamentos.

**Columnas:**
```
| ID | Medicamento ID | Fecha | Tipo | Cantidad | Stock Anterior | Stock Nuevo | Lote | Caducidad | Notas |
```

**Tipos de movimiento:**
- `ENTRADA` - Recepción de medicamentos
- `SALIDA` - Dispensación de medicamentos
- `AJUSTE` - Corrección de inventario
- `BAJA` - Medicamento caducado/dañado

**Ejemplo de datos:**
```
| inv-001 | med-001 | 2024-12-09 | ENTRADA | 100 | 50 | 150 | L2024-123 | 2025-12-31 | Pedido semanal |
| inv-002 | med-001 | 2024-12-09 | SALIDA | 5 | 150 | 145 | L2024-123 | 2025-12-31 | Receta urgente |
```

### 📊 Pestaña 3: **Previsión de Necesidades**

Control semanal de necesidades y pedidos.

**Columnas:**
```
| ID | Medicamento ID | Semana | Fecha Inicio | Fecha Fin | XSFAR1 | XSFAR | Total | Stock Actual | Pte. Pedido | Notas |
```

**Ejemplo de datos:**
```
| prev-001 | med-001 | Semana 49 | 2024-12-02 | 2024-12-08 | 25 | 30 | 55 | 145 | No | - |
| prev-002 | med-002 | Semana 49 | 2024-12-02 | 2024-12-08 | 10 | 15 | 25 | 80 | Sí | Pedido urgente |
```

---

## 🚀 Configuración Inicial (Paso a Paso)

### Paso 1: Crear el Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja llamada: **"UFA Sur - Base de Datos"**
3. Copia el ID del Sheet desde la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```

### Paso 2: Configurar las Pestañas

Usa el **Apps Script** que te proporciono más abajo para configurar automáticamente todas las pestañas con:
- ✅ Nombres correctos
- ✅ Columnas con formato
- ✅ Validaciones de datos
- ✅ Formato condicional
- ✅ Fórmulas automáticas

### Paso 3: Configurar Permisos

1. En el Google Sheet, haz clic en **"Compartir"**
2. Añade a todos los usuarios que necesiten acceso
3. Para n8n, crea un servicio de cuenta (ver sección siguiente)

---

## 🔧 Apps Script de Configuración

Copia este script en **Extensiones > Apps Script** del Google Sheet:

```javascript
function setupUFASurDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Eliminar hojas existentes excepto la primera
  const sheets = ss.getSheets();
  for (let i = sheets.length - 1; i > 0; i--) {
    ss.deleteSheet(sheets[i]);
  }

  // Configurar Pestaña 1: Maestro de Artículos
  const maestroSheet = sheets[0];
  maestroSheet.setName('Maestro de Artículos');

  const maestroHeaders = [
    'ID', 'Código Nacional', 'Nombre', 'Presentación',
    'Laboratorio', 'PVP', 'Categoría', 'Estado', 'Última Actualización'
  ];
  maestroSheet.getRange(1, 1, 1, maestroHeaders.length)
    .setValues([maestroHeaders])
    .setBackground('#4285F4')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Configurar Pestaña 2: Inventarios
  const inventarioSheet = ss.insertSheet('Inventarios');

  const inventarioHeaders = [
    'ID', 'Medicamento ID', 'Fecha', 'Tipo', 'Cantidad',
    'Stock Anterior', 'Stock Nuevo', 'Lote', 'Caducidad', 'Notas'
  ];
  inventarioSheet.getRange(1, 1, 1, inventarioHeaders.length)
    .setValues([inventarioHeaders])
    .setBackground('#34A853')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Validación para columna "Tipo"
  const tipoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['ENTRADA', 'SALIDA', 'AJUSTE', 'BAJA'])
    .build();
  inventarioSheet.getRange('D2:D1000').setDataValidation(tipoRule);

  // Configurar Pestaña 3: Previsión de Necesidades
  const previsionSheet = ss.insertSheet('Previsión de Necesidades');

  const previsionHeaders = [
    'ID', 'Medicamento ID', 'Semana', 'Fecha Inicio', 'Fecha Fin',
    'XSFAR1', 'XSFAR', 'Total', 'Stock Actual', 'Pte. Pedido', 'Notas'
  ];
  previsionSheet.getRange(1, 1, 1, previsionHeaders.length)
    .setValues([previsionHeaders])
    .setBackground('#FBBC04')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Fórmula automática para columna "Total" (H = F + G)
  previsionSheet.getRange('H2:H1000')
    .setFormula('=IF(F2<>"", F2+G2, "")');

  // Ajustar ancho de columnas
  [maestroSheet, inventarioSheet, previsionSheet].forEach(sheet => {
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    sheet.setFrozenRows(1); // Congelar fila de encabezados
  });

  SpreadsheetApp.getUi().alert('✅ Base de datos configurada correctamente!');
}

// Función para exportar datos en formato JSON
function exportToJSON() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {};

  // Exportar cada pestaña
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    result[sheet.getName()] = rows.map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
  });

  Logger.log(JSON.stringify(result, null, 2));
  return JSON.stringify(result);
}

// Menú personalizado
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏥 UFA Sur')
    .addItem('⚙️ Configurar Base de Datos', 'setupUFASurDatabase')
    .addItem('📤 Exportar a JSON', 'exportToJSON')
    .addToUi();
}
```

**Para ejecutar:**
1. Pega el código en **Apps Script**
2. Guarda el proyecto
3. Recarga el Google Sheet
4. Verás un nuevo menú **"🏥 UFA Sur"**
5. Haz clic en **"⚙️ Configurar Base de Datos"**
6. ¡Listo! Las pestañas se crearán automáticamente

---

## 🔐 Configurar Google Sheets API

### Para la Aplicación Web:

1. **Crear proyecto en Google Cloud Console:**
   - Ve a [console.cloud.google.com](https://console.cloud.google.com)
   - Crea un nuevo proyecto: "UFA Sur Integration"

2. **Habilitar Google Sheets API:**
   - En el menú, ve a **"APIs y servicios" > "Biblioteca"**
   - Busca **"Google Sheets API"**
   - Haz clic en **"Habilitar"**

3. **Crear credenciales OAuth 2.0:**
   - Ve a **"APIs y servicios" > "Credenciales"**
   - Haz clic en **"Crear credenciales" > "ID de cliente de OAuth"**
   - Tipo: **"Aplicación web"**
   - Orígenes autorizados: `http://localhost:5173` (para desarrollo)
   - URIs de redirección: `http://localhost:5173`

4. **Guardar credenciales:**
   - Descarga el JSON de credenciales
   - Lo usarás en la aplicación

### Para n8n:

1. **Crear Cuenta de Servicio:**
   - En Google Cloud Console
   - **"Credenciales" > "Crear credenciales" > "Cuenta de servicio"**
   - Nombre: "n8n-ufa-sur"
   - Rol: **"Editor"**

2. **Descargar clave JSON:**
   - Entra a la cuenta de servicio
   - Pestaña **"Claves"**
   - **"Agregar clave" > "JSON"**
   - Guarda el archivo

3. **Compartir el Sheet con la cuenta de servicio:**
   - Copia el email de la cuenta de servicio (ej: `n8n-ufa-sur@proyecto.iam.gserviceaccount.com`)
   - En tu Google Sheet, haz clic en **"Compartir"**
   - Pega el email y dale permisos de **"Editor"**

---

## 📡 Ejemplos de Workflows n8n

### Workflow 1: Sincronización Bidireccional

```
┌─────────────────┐
│  Schedule       │ Cada 5 minutos
│  Trigger        │
└────────┬────────┘
         │
┌────────▼────────┐
│  Google Sheets  │ Leer datos actualizados
│  Read           │
└────────┬────────┘
         │
┌────────▼────────┐
│  HTTP Request   │ Enviar a API de la app
│  POST           │
└────────┬────────┘
         │
┌────────▼────────┐
│  Set            │ Actualizar timestamp
│                 │
└─────────────────┘
```

### Workflow 2: Alertas Automáticas

```
┌─────────────────┐
│  Google Sheets  │ Monitorear cambios
│  Trigger        │
└────────┬────────┘
         │
┌────────▼────────┐
│  IF             │ ¿Stock bajo?
│                 │
└───┬─────────┬───┘
    │         │
    NO       YES
    │         │
    └───►  ┌──▼──────────┐
           │  Email      │ Enviar alerta
           │  Send       │
           └─────────────┘
```

### Workflow 3: Exportación Automática

```
┌─────────────────┐
│  Schedule       │ Cada noche a las 23:00
│  Trigger        │
└────────┬────────┘
         │
┌────────▼────────┐
│  Google Sheets  │ Leer todas las pestañas
│  Read All       │
└────────┬────────┘
         │
┌────────▼────────┐
│  Convert to     │ Convertir a JSON
│  JSON           │
└────────┬────────┘
         │
┌────────▼────────┐
│  Google Drive   │ Guardar backup
│  Upload         │
└─────────────────┘
```

---

## 🎯 Ventajas de Google Sheets

✅ **Colaboración en tiempo real** - Varios usuarios simultáneamente
✅ **Historial de cambios** - Google guarda todas las versiones
✅ **Fácil de usar** - Interfaz familiar para todos
✅ **Integraciones nativas** - n8n tiene nodos específicos para Sheets
✅ **Fórmulas potentes** - Cálculos automáticos
✅ **Gratis** - Hasta 5 millones de celdas
✅ **Accesible** - Desde cualquier dispositivo

---

## 📝 Próximos Pasos

1. ✅ Crear el Google Sheet con el Apps Script
2. ⏳ Configurar la API de Google Sheets
3. ⏳ Integrar la app web con Google Sheets
4. ⏳ Crear workflows en n8n
5. ⏳ Probar sincronización completa

---

## 🆘 Solución de Problemas

**Error: "La API no está habilitada"**
- Verifica que Google Sheets API esté habilitada en Cloud Console

**Error: "Permiso denegado"**
- Asegúrate de compartir el Sheet con la cuenta de servicio

**Error: "Cuota excedida"**
- Google Sheets API tiene límites: 100 requests/100 segundos/usuario
- Ajusta la frecuencia de sincronización en n8n

---

¿Quieres que implemente la integración con Google Sheets API en la aplicación ahora?
