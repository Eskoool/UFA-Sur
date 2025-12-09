# 💾 Base de Datos Compartida con Drive

## 📋 Descripción

La aplicación UFA Sur ahora puede exportar e importar su base de datos completa en formato JSON. Esto permite compartir los datos entre diferentes ordenadores usando cualquier servicio de almacenamiento en la nube (Google Drive, OneDrive, Dropbox, etc.).

## 🚀 Cómo Funciona

### 1. **Exportar Base de Datos**

En la cabecera de la aplicación, haz clic en el botón **"💾 Exportar DB"**:
- Se descargará un archivo JSON con todos los datos
- El archivo se llama: `ufa-sur-database-YYYY-MM-DD.json`
- Contiene:
  - ✅ Todos los medicamentos
  - ✅ Todas las semanas
  - ✅ Todas las previsiones
  - ✅ Todo el inventario
  - ✅ Configuración actual

### 2. **Guardar en Drive**

Una vez descargado el archivo:
1. Súbelo a tu carpeta de Drive (Google Drive, OneDrive, etc.)
2. Todos los ordenadores que tengan acceso a esa carpeta podrán usarlo
3. Ejemplo de estructura:
   ```
   📁 Mi Drive/
   └── 📁 UFA-Sur/
       └── 📄 ufa-sur-database-2024-12-09.json
   ```

### 3. **Importar Base de Datos**

En cualquier ordenador, haz clic en **"📁 Importar DB"**:
1. Selecciona el archivo JSON desde tu carpeta de Drive
2. La aplicación cargará todos los datos
3. Verás un mensaje de confirmación: "✅ Datos importados correctamente"

⚠️ **IMPORTANTE**: La importación **reemplaza todos los datos actuales** con los del archivo.

## 🔄 Integración con n8n

Puedes usar n8n para automatizar la sincronización y evitar conflictos de acceso simultáneo:

### Ejemplo de Workflows n8n:

#### **Workflow 1: Sincronización Automática**
```
1. [Watch Folder] → Monitorear cambios en carpeta Drive
2. [If] → ¿El archivo es más reciente?
3. [HTTP Request] → Notificar a usuarios activos
4. [Wait] → Esperar confirmación
5. [Update] → Sincronizar cambios
```

#### **Workflow 2: Sistema de Turnos**
```
1. [Webhook] → Usuario solicita acceso
2. [Check Lock] → ¿Alguien más está usando?
3. [Create Lock] → Crear archivo .lock
4. [Notify User] → Permitir acceso
5. [Wait] → Esperar que termine
6. [Remove Lock] → Liberar acceso
```

#### **Workflow 3: Respaldo Automático**
```
1. [Schedule] → Cada hora
2. [Read File] → Leer archivo actual
3. [Copy] → Crear respaldo con timestamp
4. [Upload] → Subir a carpeta "Backups"
```

## 📝 Flujo de Trabajo Recomendado

### **Para Trabajo Individual:**
1. Al iniciar: **Importar DB** desde Drive
2. Trabajar normalmente en la aplicación
3. Al terminar: **Exportar DB** y guardarlo en Drive
4. Repetir el proceso en otro ordenador

### **Para Trabajo en Equipo (con n8n):**
1. n8n asigna turnos de acceso
2. Usuario 1 importa DB y trabaja
3. Usuario 1 exporta DB al terminar
4. n8n notifica a Usuario 2 que puede acceder
5. Usuario 2 importa la versión actualizada
6. Continuar el ciclo

## 🔒 Prevención de Conflictos

### **Sistema Manual:**
- Comunicación entre usuarios (ej: "Estoy usando la app")
- Usar nombres de archivo con timestamp: `db-2024-12-09-14-30.json`

### **Sistema con n8n (Recomendado):**
- Crear un archivo `.lock` cuando alguien está trabajando
- n8n monitorea y solo permite un usuario a la vez
- Notificaciones automáticas cuando está disponible

## 📦 Estructura del Archivo JSON

```json
{
  "medicamentos": [...],
  "semanas": [...],
  "previsiones": [...],
  "inventarios": [...],
  "semanaActualIndex": 0
}
```

## ⚠️ Consideraciones Importantes

1. **Respaldos**: Guarda copias de seguridad regularmente
2. **Sincronización**: Asegúrate de que Drive haya sincronizado el archivo antes de importarlo
3. **Conflictos**: Si dos personas exportan al mismo tiempo, el último archivo sobrescribirá al anterior
4. **Tamaño**: El archivo JSON crece con los datos, pero es muy eficiente (generalmente < 1MB)

## 🆘 Solución de Problemas

### "Error al importar datos"
- Verifica que el archivo sea un JSON válido
- Asegúrate de que no esté corrupto
- Intenta con un respaldo anterior

### "Los datos no aparecen actualizados"
- Espera a que Drive sincronice el archivo
- Actualiza la carpeta de Drive
- Verifica que estás importando el archivo más reciente

### "Perdí datos"
- Verifica la carpeta de respaldos
- Busca archivos con fechas anteriores
- Revisa la papelera de Drive

## 📞 Soporte

Si encuentras problemas o necesitas ayuda con la configuración de n8n, revisa la documentación oficial:
- n8n: https://docs.n8n.io/
- Google Drive API: https://developers.google.com/drive
