# 🏥 UFA Sur - Sistema de Gestión de Farmacia

Aplicación web para la gestión de medicamentos en la Farmacia del Hospital del Sur (UFA Sur).

## 📋 Características

### 1. Catálogo de Medicamentos
- Gestión completa del catálogo de medicamentos
- Información de cada medicamento:
  - Descripción
  - UPE (Unidades Por Envase)
  - Código del artículo
  - Indicador de nevera (refrigeración)
- Búsqueda por descripción o código
- Agregar, editar y eliminar medicamentos

### 2. Previsión de Necesidades
- Visualización por semanas (martes a jueves)
- Seguimiento de 3 semanas simultáneamente
- Gestión de dos agendas:
  - **XSFAR1**: Farmacéuticos
  - **XSFAR**: Técnico de farmacia
- Cálculo automático de:
  - TOTAL: Suma de ambas agendas
  - PTE PREPARAR: Cantidad pendiente de preparar
  - Estado de pedido pendiente
- Indicadores visuales:
  - 🔴 Rojo: Stock insuficiente (negativo)
  - 🟢 Verde: Stock suficiente (positivo)
  - 🟡 Amarillo: Requiere preparación
- Edición en línea de valores

### 3. Gestión de Inventario
- Inventario quincenal (cada 15 días, los lunes)
- Registro de:
  - Stock teórico
  - Stock real (contado)
  - Diferencia automática
  - Notas y observaciones
- Historial completo de inventarios
- Sistema de ajustes:
  - Exceso de stock → Revisar devoluciones
  - Falta de stock → Revisar dispensaciones
- Marcado de inventarios ajustados

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js (versión 18 o superior)
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd UFA-Sur

# Instalar dependencias
npm install
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Compilar para Producción

```bash
npm run build
```

Los archivos compilados estarán en el directorio `dist/`

### Previsualizar Build de Producción

```bash
npm run preview
```

## 🗂️ Estructura del Proyecto

```
UFA-Sur/
├── src/
│   ├── components/          # Componentes React
│   │   ├── CatalogoMedicamentos.tsx
│   │   ├── PrevisionNecesidades.tsx
│   │   └── GestionInventario.tsx
│   ├── hooks/              # Hooks personalizados
│   │   └── useAppState.ts
│   ├── types/              # Definiciones TypeScript
│   │   └── index.ts
│   ├── data/               # Datos iniciales
│   │   └── initialData.ts
│   ├── App.tsx             # Componente principal
│   ├── App.css             # Estilos principales
│   ├── main.tsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── public/                 # Archivos estáticos
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 💾 Almacenamiento de Datos

La aplicación utiliza **localStorage** del navegador para almacenar todos los datos:
- Medicamentos
- Semanas
- Previsiones
- Inventarios

Los datos persisten entre sesiones del navegador. Para resetear los datos, usar el botón "🔄 Resetear" en la esquina superior derecha.

## 📱 Navegación

La aplicación cuenta con 3 secciones principales accesibles desde el menú de navegación:

1. **📊 Previsión de Necesidades**: Vista principal para gestionar las necesidades semanales
2. **📦 Gestión de Inventario**: Control de inventario quincenal
3. **💊 Catálogo de Medicamentos**: Administración del catálogo

## 🎯 Flujo de Trabajo Recomendado

### Previsión Semanal (Martes a Jueves)
1. Ir a "Previsión de Necesidades"
2. Seleccionar la semana actual
3. Ingresar cantidades en XSFAR1 y XSFAR
4. El sistema calcula automáticamente:
   - Total de unidades
   - Pendiente de preparar
5. Marcar pedidos pendientes con checkbox
6. Navegar entre semanas según necesidad

### Inventario Quincenal (Lunes)
1. Ir a "Gestión de Inventario"
2. Seleccionar el medicamento
3. Hacer clic en "+ Nuevo Inventario"
4. Ingresar:
   - Stock teórico (esperado)
   - Stock real (contado)
5. El sistema calcula la diferencia
6. Añadir notas si es necesario
7. Una vez ajustado el stock, marcar como "Ajustado"

### Gestión del Catálogo
1. Ir a "Catálogo de Medicamentos"
2. Usar el buscador para encontrar medicamentos
3. Agregar nuevos con "+ Nuevo Medicamento"
4. Editar o eliminar existentes según necesidad

## 🔧 Tecnologías Utilizadas

- **React 18**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **CSS3**: Estilos con variables CSS
- **localStorage**: Persistencia de datos

## 📝 Datos de Ejemplo

La aplicación incluye 15 medicamentos de ejemplo basados en el catálogo real:
- ABACAVIR / LAMIVUDINA 600/300 mg comp.
- ABACAVIR 300 mg comp oral
- ABATACEPT 125 MG JGA PRECARGADA 1 ML SC
- ADALIMUMAB 40 mg jeringa (HUMIRA)
- Y más...

Las semanas se generan automáticamente para los próximos 3 meses.

## 🎨 Características de Diseño

- Diseño responsive (móvil, tablet, desktop)
- Interfaz intuitiva y moderna
- Códigos de color para estados:
  - Azul: Información
  - Verde: Exitoso/Positivo
  - Rojo: Error/Negativo
  - Amarillo: Advertencia
  - Cyan: Nevera
- Tablas editables en línea
- Búsqueda en tiempo real

## 🔒 Privacidad y Seguridad

- Todos los datos se almacenan localmente en el navegador
- No se envía información a servidores externos
- Los datos permanecen en el dispositivo del usuario

## 📄 Licencia

Este proyecto es de código abierto y está disponible para el Hospital del Sur.

## 👥 Soporte

Para soporte o consultas:
- Crear un issue en el repositorio
- Contactar al departamento de farmacia del Hospital del Sur

---

Desarrollado con ❤️ para el Hospital del Sur - UFA Sur
