# 🚀 Guía de Despliegue en Render (Actualizada)

Esta guía te ayudará a desplegar tu backend Django con autenticación 2FA en Render correctamente.

## ⚠️ PROBLEMA RESUELTO: 2FA no funcionaba en producción

**Causa raíz:** Las sesiones se almacenaban en memoria/SQLite, causando pérdida de códigos 2FA en producción con múltiples instancias.

**Solución implementada:**
- ✅ Sesiones almacenadas en PostgreSQL (`SESSION_ENGINE = 'django.contrib.sessions.backends.db'`)
- ✅ Credenciales de email movidas a variables de entorno
- ✅ Configuración de seguridad mejorada para producción
- ✅ WhiteNoise para servir archivos estáticos

---

## 📋 Requisitos Previos

1. **Cuenta en GitHub** (gratuita)
2. **Cuenta en Render** (gratuita): https://render.com
3. **Cuenta de Gmail con contraseña de aplicación**
4. **Firebase project** (para Google Login)

---

## 🔧 Paso 1: Preparar Variables de Entorno

Antes de desplegar, necesitas obtener las siguientes credenciales:

### 1.1 Generar SECRET_KEY de Django

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copia el resultado, lo necesitarás después.

### 1.2 Obtener Contraseña de Aplicación de Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com
2. Activa la **verificación en dos pasos** (si no la tienes)
3. Busca **"Contraseñas de aplicaciones"**
4. Genera una nueva contraseña para **"Correo"**
5. Copia la contraseña de **16 dígitos** (sin espacios)

### 1.3 Preparar Credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **"Project Settings" > "Service Accounts"**
4. Click en **"Generate new private key"**
5. Descarga el archivo JSON
6. **Copia TODO el contenido del archivo** (lo usarás como variable de entorno)

---

## 🗄️ Paso 2: Crear Base de Datos PostgreSQL en Render

1. Inicia sesión en [Render](https://render.com)
2. Click en **"New +"** → Selecciona **"PostgreSQL"**
3. Configura:
   - **Name**: `django-db` (o el nombre que prefieras)
   - **Database**: `django_production`
   - **User**: `django_user`
   - **Region**: Selecciona el más cercano
   - **Plan**: **Free**
4. Click en **"Create Database"**
5. **IMPORTANTE**: Espera a que el estado cambie a **"Available"**
6. Copia la **"Internal Database URL"** (formato: `postgres://usuario:password@host:5432/db`)

---

## 🌐 Paso 3: Crear Web Service en Render

1. En el dashboard, click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Selecciona el repositorio: `backenddddddddd` (o como se llame tu repo)
4. Configura:
   - **Name**: `django-backend` (o el nombre que prefieras)
   - **Region**: **El mismo que la base de datos**
   - **Branch**: `claude/fix-two-factor-auth-deployment-01XqDLLP58fb7LxYZ9kohu3C` (o `main`)
   - **Root Directory**: (dejar vacío)
   - **Runtime**: **Python 3**
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn core.wsgi:application`
   - **Plan**: **Free**

**NO HAGAS CLIC EN "Create Web Service" TODAVÍA** - Primero configura las variables de entorno.

---

## 🔐 Paso 4: Configurar Variables de Entorno (CRÍTICO)

En la sección **"Environment"** del Web Service, agrega estas variables **ANTES** de crear el servicio:

### Variables OBLIGATORIAS:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DEBUG` | `False` | **IMPORTANTE:** Debe ser False en producción |
| `SECRET_KEY` | `<tu-secret-key-generada>` | La que generaste en Paso 1.1 |
| `ALLOWED_HOSTS` | `.onrender.com` | Permite todos los subdominios de Render |
| `DATABASE_URL` | `<internal-database-url>` | La URL que copiaste en Paso 2 |
| `EMAIL_HOST_USER` | `tu-email@gmail.com` | Tu email de Gmail |
| `EMAIL_HOST_PASSWORD` | `<app-password>` | La contraseña de 16 dígitos del Paso 1.2 |
| `FIREBASE_CREDENTIALS` | `{...}` | TODO el contenido JSON del Paso 1.3 |

### Variables de CORS/CSRF (actualizar después):

| Variable | Valor Inicial | Actualizar Después |
|----------|---------------|---------------------|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200` | Agregar: `https://tu-frontend.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | `http://localhost:4200` | Agregar: `https://tu-backend.onrender.com,https://tu-frontend.vercel.app` |

**Ejemplo de FIREBASE_CREDENTIALS:**
```json
{"type":"service_account","project_id":"mi-proyecto","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@mi-proyecto.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk..."}
```

**⚠️ IMPORTANTE:** Copia el JSON completo en una sola línea (sin saltos de línea adicionales).

---

## 🚀 Paso 5: Iniciar Deploy

1. Revisa que todas las variables de entorno estén configuradas
2. Click en **"Create Web Service"**
3. Render comenzará a:
   - Clonar tu repositorio
   - Instalar dependencias (`pip install -r requirements.txt`)
   - Ejecutar `build.sh` (collectstatic + migraciones)
   - Iniciar Gunicorn
4. **Espera 5-10 minutos** para el primer deploy

---

## ✅ Paso 6: Verificar el Deployment

Una vez que veas **"Live"** en verde:

1. Copia tu URL: `https://tu-backend.onrender.com`
2. Prueba el endpoint de salud: `https://tu-backend.onrender.com/api/usuarios/csrf/`
3. Deberías ver:
   ```json
   {"csrfToken": "..."}
   ```

---

## 🔄 Paso 7: Actualizar CORS/CSRF con URLs Reales

Una vez que tengas las URLs reales del backend y frontend:

1. Ve a tu Web Service en Render
2. Click en **"Environment"** (menú izquierdo)
3. Edita estas variables:

```
CORS_ALLOWED_ORIGINS=https://tu-backend.onrender.com,https://tu-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://tu-backend.onrender.com,https://tu-frontend.vercel.app
```

4. **Guarda los cambios** - Render reiniciará automáticamente el servicio

---

## 🎯 Paso 8: Configurar Frontend (Angular en Vercel)

### 8.1 Actualizar `environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.onrender.com/api/usuarios',
  firebase: {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    // ... resto de configuración Firebase
  }
};
```

### 8.2 Desplegar en Vercel:

1. Ve a [Vercel](https://vercel.com)
2. Importa tu repositorio de frontend
3. Configura:
   - **Framework Preset**: Angular
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/frontend-angular/browser` (ajustar según tu proyecto)
4. Deploy

---

## 🧪 Paso 9: Probar la Aplicación Completa

1. **Registro de usuario:**
   - Completa el formulario de registro
   - Deberías recibir un email con el código 2FA
   - Ingresa el código para verificar

2. **Login:**
   - Ingresa email y contraseña
   - Deberías recibir otro código 2FA por email
   - Ingresa el código para iniciar sesión

3. **Google Login:**
   - Click en "Iniciar con Google"
   - Autoriza la aplicación
   - Deberías iniciar sesión automáticamente (sin 2FA)

---

## 🐛 Troubleshooting

### ❌ Error: "No se pudo enviar el correo"

**Causa:** Configuración incorrecta de Gmail.

**Solución:**
1. Verifica que `EMAIL_HOST_PASSWORD` sea la **contraseña de aplicación** (16 dígitos), NO tu contraseña normal
2. Asegúrate que la verificación en dos pasos esté activada
3. Revisa los logs de Render para ver el error específico

### ❌ Error: "Sesión 2FA inválida"

**Causa:** Las sesiones se perdieron (problema resuelto con esta actualización).

**Solución:**
1. Verifica que `DATABASE_URL` esté configurada correctamente
2. Comprueba que las migraciones se ejecutaron (`python manage.py migrate`)
3. Revisa los logs: debería haber una tabla `django_session` en PostgreSQL

### ❌ Error: "Token de Google inválido"

**Causa:** Credenciales de Firebase incorrectas.

**Solución:**
1. Verifica que `FIREBASE_CREDENTIALS` tenga el JSON completo
2. Asegúrate que no haya saltos de línea adicionales
3. Comprueba que el proyecto de Firebase sea el correcto

### ❌ Error 500 en producción

**Solución:**
1. Ve a **Logs** en Render (menú izquierdo)
2. Busca el error específico
3. Verifica que `DEBUG=False`
4. Comprueba que todas las variables de entorno estén configuradas

### ❌ El servicio se "duerme" (15 minutos sin uso)

**Causa:** Plan Free de Render.

**Solución:**
- Espera ~30 segundos en la primera petición después de que se duerma
- O actualiza a plan pagado ($7/mes) para mantenerlo activo 24/7

### ❌ CORS Policy Error

**Causa:** Frontend no está en `CORS_ALLOWED_ORIGINS`.

**Solución:**
1. Agrega la URL de tu frontend a `CORS_ALLOWED_ORIGINS`
2. Agrega también a `CSRF_TRUSTED_ORIGINS`
3. Guarda y espera a que Render reinicie

---

## 📊 Comparación: Antes vs Después

| Aspecto | ❌ Antes | ✅ Después |
|---------|---------|-----------|
| **Sesiones** | Memoria/SQLite (se pierden) | PostgreSQL (persisten) |
| **Credenciales** | Hardcodeadas en código | Variables de entorno |
| **Base de Datos** | SQLite (no funciona en Render) | PostgreSQL |
| **Archivos Estáticos** | No configurado | WhiteNoise |
| **Seguridad** | Básica | HSTS, SSL redirect, headers de seguridad |
| **2FA en producción** | ❌ No funciona | ✅ Funciona correctamente |

---

## 🎉 ¡Listo!

Tu backend Django está ahora correctamente desplegado en producción con:

- ✅ PostgreSQL como base de datos persistente
- ✅ Sesiones en base de datos (2FA funciona correctamente)
- ✅ Credenciales seguras en variables de entorno
- ✅ HTTPS automático con certificados SSL
- ✅ Deploy automático al hacer push a GitHub
- ✅ Logs accesibles en tiempo real
- ✅ Dos métodos de autenticación (Email/Password + Google OAuth)
- ✅ Dos métodos de seguridad (2FA por email + Pregunta secreta)

**URL del backend**: `https://tu-backend.onrender.com`

---

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Django Production Checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)
- [WhiteNoise Documentation](http://whitenoise.evans.io/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

## 🆘 Necesitas Ayuda?

Si encuentras problemas adicionales:

1. Revisa los **logs** en Render
2. Comprueba que **todas las variables de entorno** estén configuradas
3. Verifica que el frontend esté usando la URL correcta del backend
4. Asegúrate que **DEBUG=False** en producción

**¡Tu aplicación está lista para producción!** 🚀
