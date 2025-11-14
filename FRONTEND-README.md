# Frontend Angular - Sistema de Autenticación

Frontend completo en Angular 17 que consume el backend de autenticación Django con 2FA. 100% funcional y listo para desplegar en Vercel.

## Características

- **Autenticación completa**: Login, registro, recuperación de contraseña
- **2FA (Autenticación de dos factores)**: Código de 6 dígitos enviado por email
- **Login con Google**: Integración con Firebase Authentication
- **Diseño moderno**: UI responsive con gradientes y animaciones
- **Standalone Components**: Usa la arquitectura moderna de Angular
- **Interceptores HTTP**: Manejo automático de CSRF y tokens de autenticación
- **Guards de ruta**: Protección de rutas autenticadas
- **Manejo de errores**: Mensajes de error claros y límite de intentos en 2FA

## Estructura del Proyecto

```
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/              # Componente de inicio de sesión
│   │   │   ├── register/           # Componente de registro
│   │   │   ├── verify-2fa/         # Verificación de código 2FA
│   │   │   ├── recuperar/          # Solicitud de recuperación de contraseña
│   │   │   ├── restablecer/        # Restablecimiento de contraseña
│   │   │   └── dashboard/          # Panel de usuario autenticado
│   │   ├── services/
│   │   │   ├── auth.service.ts     # Servicio de autenticación
│   │   │   └── csrf.service.ts     # Servicio de CSRF
│   │   ├── guards/
│   │   │   └── auth.guard.ts       # Guard para rutas protegidas
│   │   ├── interceptors/
│   │   │   ├── csrf.interceptor.ts # Interceptor de CSRF
│   │   │   └── auth.interceptor.ts # Interceptor de autenticación
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts          # Configuración desarrollo
│   │   └── environment.prod.ts     # Configuración producción
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
├── tsconfig.json
├── vercel.json                     # Configuración de Vercel
└── README.md
```

## Endpoints del Backend

El frontend consume los siguientes endpoints del backend:

- `GET /api/usuarios/csrf/` - Obtener token CSRF
- `POST /api/usuarios/register/` - Registro de usuario
- `POST /api/usuarios/register/2fa/verificar/` - Verificar código 2FA de registro
- `POST /api/usuarios/login/` - Iniciar sesión
- `POST /api/usuarios/login/2fa/verificar/` - Verificar código 2FA de login
- `POST /api/usuarios/login/google/` - Login con Google
- `POST /api/usuarios/recuperar/` - Solicitar recuperación de contraseña
- `POST /api/usuarios/restablecer/` - Restablecer contraseña

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Firebase (para Google Auth)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Authentication** y activa el proveedor de **Google**
4. Obtén las credenciales de configuración

5. Actualiza `src/environments/environment.ts` y `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: false, // true para production
  apiUrl: 'https://backendbina.vercel.app/api/usuarios',
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROJECT_ID.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT_ID.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  }
};
```

### 3. Configurar URL del Backend

Si necesitas cambiar la URL del backend, modifica `apiUrl` en los archivos de environment.

## Desarrollo Local

Para ejecutar el proyecto en modo desarrollo:

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

## Compilar para Producción

```bash
npm run build
```

Los archivos compilados estarán en `dist/angular-auth-frontend/`

## Desplegar en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. Sube el código a GitHub
2. Ve a [Vercel](https://vercel.com/) e inicia sesión
3. Haz clic en **"Add New Project"**
4. Selecciona tu repositorio
5. Vercel detectará automáticamente que es un proyecto Angular
6. Configura las siguientes opciones:
   - **Framework Preset**: Angular
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/angular-auth-frontend`
7. Haz clic en **"Deploy"**

### Opción 2: Desde CLI de Vercel

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Inicia sesión:
```bash
vercel login
```

3. Despliega:
```bash
vercel
```

4. Para producción:
```bash
vercel --prod
```

### Variables de Entorno en Vercel

Si necesitas configurar variables de entorno en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a **Settings** > **Environment Variables**
3. Agrega las siguientes variables (si es necesario):
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - etc.

## Flujo de Autenticación

### Registro
1. Usuario completa el formulario de registro
2. Backend envía código 2FA al email
3. Usuario ingresa el código de 6 dígitos
4. Si es válido, se crea la sesión y redirige al dashboard

### Login
1. Usuario ingresa email y contraseña
2. Backend envía código 2FA al email
3. Usuario ingresa el código de 6 dígitos
4. Si es válido, se crea la sesión y redirige al dashboard

### Login con Google
1. Usuario hace clic en "Continuar con Google"
2. Se abre popup de autenticación de Google
3. Backend valida el token de Google
4. Si es válido, se crea la sesión y redirige al dashboard (sin 2FA)

### Recuperación de Contraseña
1. Usuario ingresa su email
2. Backend envía código de verificación
3. Usuario ingresa código y nueva contraseña
4. Contraseña actualizada, redirige al login

## Seguridad

- **CSRF Protection**: Interceptor automático que obtiene y envía tokens CSRF
- **JWT Tokens**: Almacenados en localStorage y enviados en cada petición
- **Guards**: Protección de rutas que requieren autenticación
- **2FA**: Límite de 5 intentos para verificación de códigos
- **Validación**: Validación de formularios en frontend y backend

## Tecnologías Utilizadas

- **Angular 17**: Framework principal
- **Angular Fire**: Integración con Firebase
- **RxJS**: Manejo de observables y streams
- **TypeScript**: Lenguaje de programación
- **CSS3**: Estilos y animaciones

## Personalización

### Cambiar Colores

Edita `src/styles.css` y modifica las variables de color:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Cambiar Logo

Reemplaza `src/favicon.ico` con tu logo.

### Agregar Más Campos al Registro

1. Modifica `src/app/components/register/register.component.html`
2. Agrega los campos en `register.component.ts`
3. Actualiza el servicio `auth.service.ts` para enviar los nuevos campos

## Solución de Problemas

### Error de CORS

Si experimentas errores de CORS, verifica que el backend tenga configurado correctamente:
- `CORS_ALLOWED_ORIGINS` debe incluir tu dominio de Vercel
- El backend debe estar corriendo y accesible

### Firebase no funciona

1. Verifica que las credenciales en `environment.ts` sean correctas
2. Asegúrate de que Google Auth esté habilitado en Firebase Console
3. Verifica que el dominio de Vercel esté autorizado en Firebase

### Error al desplegar en Vercel

1. Asegúrate de que `vercel.json` esté correctamente configurado
2. Verifica que el `package.json` tenga el script de build
3. Revisa los logs de Vercel para más detalles

## Mejoras Futuras

- [ ] Recordar sesión (checkbox "Recordarme")
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] Notificaciones push
- [ ] Perfil de usuario editable
- [ ] Autenticación biométrica
- [ ] Tests unitarios y e2e

## Licencia

MIT

## Contacto

Para soporte o consultas, contacta al desarrollador.

---

**Nota**: Recuerda mantener tus credenciales de Firebase y otros secretos seguros. Nunca los subas a repositorios públicos.
