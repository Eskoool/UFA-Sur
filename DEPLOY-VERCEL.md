# 🚀 Deploy a Vercel - UFA Sur

## Configuración Actual

El proyecto ya tiene configurado `vercel.json` con:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ SPA Routing configurado

---

## 📦 Opción 1: Deploy desde GitHub (Recomendado)

### **Paso 1: Conectar con Vercel**

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Add New..."** → **"Project"**
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio **"UFA-Sur"**

### **Paso 2: Configurar el Proyecto**

Vercel detectará automáticamente la configuración:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Variables de Entorno (opcional):**
Si quieres usar Google Sheets API:
```
VITE_GOOGLE_CLIENT_ID=tu-client-id-aqui.apps.googleusercontent.com
```

### **Paso 3: Deploy**

1. Haz clic en **"Deploy"**
2. Espera 1-2 minutos mientras Vercel construye tu proyecto
3. ✅ ¡Listo! Tu app estará en: `https://ufa-sur.vercel.app`

---

## 📱 Opción 2: Deploy desde CLI

### **Instalar Vercel CLI:**

```bash
npm install -g vercel
```

### **Hacer Deploy:**

```bash
# Desde la raíz del proyecto
vercel

# Seguir las instrucciones:
# - Set up and deploy? Yes
# - Which scope? [tu usuario]
# - Link to existing project? No
# - What's your project's name? ufa-sur
# - In which directory is your code? ./
# - Want to override the settings? No

# Deploy a producción
vercel --prod
```

---

## 🔄 Configuración de Deploy Automático

### **Deploy Automático con Git:**

Vercel puede deployar automáticamente cuando:
- ✅ Haces push a la rama `main` → Deploy a producción
- ✅ Haces push a otras ramas → Preview deploy
- ✅ Abres un Pull Request → Preview automático

**Configurar en Vercel Dashboard:**
1. Ve a tu proyecto en Vercel
2. **Settings** → **Git**
3. Configura:
   - Production Branch: `main`
   - Deploy Hooks: activa si quieres webhooks

---

## 📊 Después del Deploy

### **URL de tu aplicación:**
```
Producción: https://ufa-sur.vercel.app
Preview: https://ufa-sur-git-[branch].vercel.app
```

### **Verificar el Deploy:**

1. Abre la URL en tu navegador
2. Prueba importar un documento maestro
3. Verifica el histórico
4. Prueba la conexión con Google Sheets (si configuraste las variables)

---

## 🔧 Configuración Avanzada

### **Dominios Personalizados:**

1. En Vercel Dashboard → **Settings** → **Domains**
2. Añade tu dominio: `farmacia-ufasur.com`
3. Configura los DNS según las instrucciones

### **Variables de Entorno:**

```bash
# En Vercel Dashboard → Settings → Environment Variables
VITE_GOOGLE_CLIENT_ID=xxx
# Marca: Production, Preview, Development
```

### **Optimizar Build:**

El proyecto ya usa:
- ✅ Vite para builds rápidos
- ✅ Tree-shaking automático
- ✅ Code-splitting
- ✅ Minificación

---

## 🐛 Solución de Problemas

### **Error: "Build failed"**
```bash
# Verificar que el build funcione localmente
npm run build

# Si funciona localmente, limpiar cache de Vercel:
# En Dashboard → Deployments → [último deploy] → Redeploy
```

### **Error: "Module not found"**
```bash
# Asegurarte de que package.json esté actualizado
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### **Archivos grandes (xlsx library)**
La librería xlsx es grande (~600KB), pero Vercel lo manejará sin problemas.
El bundle final es ~590KB gzipped a ~191KB.

---

## 📈 Monitoreo

Vercel proporciona:
- ✅ Analytics de velocidad
- ✅ Logs en tiempo real
- ✅ Métricas de uso
- ✅ Error tracking

Accede en: **Dashboard → Analytics**

---

## ✅ Checklist Final

Antes de hacer deploy a producción:

- [ ] El build local funciona: `npm run build`
- [ ] Probaste la importación de maestro
- [ ] Probaste el histórico
- [ ] Configuraste variables de entorno (si necesitas)
- [ ] Hiciste push de todos los cambios
- [ ] La rama está actualizada en GitHub

**Luego:**
- [ ] Conecta el repo en Vercel
- [ ] Configura variables de entorno
- [ ] Deploy
- [ ] Prueba la URL de producción
- [ ] Comparte la URL con tu equipo

---

## 🎉 ¡Listo!

Tu aplicación UFA Sur estará disponible en:
```
https://ufa-sur.vercel.app
```

**Actualizaciones futuras:**
Solo necesitas hacer `git push` y Vercel se encargará del resto.

---

¿Necesitas ayuda? Revisa la documentación de Vercel:
https://vercel.com/docs
