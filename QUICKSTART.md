# 🚀 Guía de Inicio Rápido - Yurakuna Frontend

## ⚡ Inicio Rápido

### 1. Levantar el Servidor de Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### 2. Acceder a la Aplicación

#### Opción A: Registrar Nuevo Usuario
1. Navega a `http://localhost:4200`
2. Serás redirigido automáticamente a `/auth/login`
3. Haz clic en **"Regístrate aquí"**
4. Completa el formulario:
   - **Nombre**: Tu nombre completo
   - **Email**: tu@email.com
   - **Contraseña**: mínimo 8 caracteres
   - **Confirmar Contraseña**: debe coincidir
5. Haz clic en **"Registrarse"**
6. Serás autenticado automáticamente y redirigido al dashboard

#### Opción B: Iniciar Sesión (si ya tienes cuenta)
1. Navega a `http://localhost:4200/auth/login`
2. Ingresa tu email y contraseña
3. Haz clic en **"Iniciar Sesión"**
4. Serás redirigido al dashboard

### 3. Explorar la Aplicación

Una vez autenticado, tendrás acceso a:

- **Dashboard**: Página principal con accesos rápidos
- **Productos**: Gestión de hortalizas (próximamente)
- **Clientes**: Gestión de clientes (próximamente)
- **Pedidos**: Gestión de órdenes (próximamente)
- **Entregas**: Control de envíos (próximamente)
- **Stock**: Control de inventario (próximamente)
- **Merma**: Registro de productos dañados (próximamente)
- **Usuarios**: Gestión de usuarios - solo para administradores (próximamente)

---

## 🔑 Funcionalidades Implementadas (Fase 2)

### ✅ Sistema de Autenticación Completo

#### Login (`/auth/login`)
- Formulario reactivo con validación
- Email y contraseña requeridos
- Visualización de contraseña (toggle)
- Manejo de errores con mensajes claros
- Redirección automática después del login
- Recordar URL de retorno (returnUrl)

#### Registro (`/auth/register`)
- Formulario con validación completa
- Campos: nombre, email, contraseña, confirmar contraseña
- Validación de contraseñas coincidentes
- Mínimo 8 caracteres para contraseña
- Manejo de errores (email duplicado, etc.)
- Auto-login después de registro exitoso

#### Seguridad
- JWT Tokens con refresh automático
- Tokens almacenados en localStorage
- HTTP Interceptor para agregar tokens automáticamente
- Refresh automático al recibir 401
- Logout con limpieza de sesión

### ✅ Layout Completo

#### Admin Layout
- **Sidebar navegable** con iconos Material
- **Responsive**: Se adapta a móviles (drawer mode)
- **Navegación activa**: Resalta la ruta actual
- **Menú de usuario**: Avatar, nombre, rol, logout
- **Filtro por roles**: Muestra solo opciones permitidas
- **Logo de Yurakuna** integrado

#### Características del Sidebar
- Cierre/apertura con botón toggle
- En móvil: overlay que se cierra al navegar
- En desktop: sidebar fijo y siempre visible
- Items de navegación:
  - Dashboard
  - Productos
  - Clientes
  - Pedidos
  - Entregas
  - Stock
  - Merma
  - Usuarios (solo admin)

### ✅ Guards de Seguridad

#### authGuard
```typescript
// Protege rutas que requieren autenticación
{
  path: 'dashboard',
  canActivate: [authGuard],
  component: DashboardComponent
}
```

#### roleGuard
```typescript
// Protege rutas por rol de usuario
{
  path: 'users',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['admin'] },
  component: UsersComponent
}
```

### ✅ Páginas Adicionales

- **Dashboard**: Página de bienvenida con accesos rápidos
- **Unauthorized** (`/unauthorized`): Página de acceso denegado

---

## 🎨 Diseño y UI

### Tema de Colores
- **Primario**: Verde (#4caf50) - Inspira en logo Yurakuna
- **Acento**: Naranja (#ff9800) - Energía y vitalidad
- **Warn**: Rojo - Alertas y errores

### Componentes Material
- Cards
- Forms (outline style)
- Buttons
- Icons
- Snackbar (notificaciones)
- Sidenav/Drawer
- Toolbar
- Menu
- Spinner (loading)

### Responsive
- Mobile-first approach
- Breakpoints:
  - Mobile: < 600px
  - Tablet: 600px - 960px
  - Desktop: > 960px

---

## 📁 Estructura de Archivos Creados

```
src/app/
├── features/
│   ├── auth/
│   │   ├── login/
│   │   │   ├── login.component.ts       ✅ Nuevo
│   │   │   ├── login.component.html     ✅ Nuevo
│   │   │   └── login.component.scss     ✅ Nuevo
│   │   ├── register/
│   │   │   ├── register.component.ts    ✅ Nuevo
│   │   │   ├── register.component.html  ✅ Nuevo
│   │   │   └── register.component.scss  ✅ Nuevo
│   │   └── auth.routes.ts               ✅ Nuevo
│   │
│   └── dashboard/
│       ├── dashboard.component.ts       ✅ Nuevo
│       ├── dashboard.component.html     ✅ Nuevo
│       └── dashboard.component.scss     ✅ Nuevo
│
├── layout/
│   └── admin-layout/
│       ├── admin-layout.component.ts    ✅ Nuevo
│       ├── admin-layout.component.html  ✅ Nuevo
│       └── admin-layout.component.scss  ✅ Nuevo
│
├── shared/
│   └── pages/
│       └── unauthorized/
│           ├── unauthorized.component.ts   ✅ Nuevo
│           ├── unauthorized.component.html ✅ Nuevo
│           └── unauthorized.component.scss ✅ Nuevo
│
└── app.routes.ts                        ✅ Actualizado
```

---

## 🧪 Pruebas Manuales

### Test 1: Registro de Usuario
1. ✅ Ir a `/auth/register`
2. ✅ Intentar enviar formulario vacío → debe mostrar errores
3. ✅ Ingresar email inválido → debe mostrar error
4. ✅ Contraseña < 8 caracteres → debe mostrar error
5. ✅ Contraseñas no coinciden → debe mostrar error
6. ✅ Formulario válido → debe registrar y redirigir a dashboard

### Test 2: Login
1. ✅ Ir a `/auth/login`
2. ✅ Credenciales incorrectas → debe mostrar error
3. ✅ Credenciales correctas → debe autenticar y redirigir
4. ✅ ReturnUrl → debe redirigir a la URL original

### Test 3: Navegación
1. ✅ Sin autenticar, intentar ir a `/dashboard` → redirige a login
2. ✅ Autenticado, navegar entre secciones → debe funcionar
3. ✅ Cerrar sesión → debe limpiar tokens y redirigir a login

### Test 4: Responsive
1. ✅ Reducir ventana < 600px → sidebar debe cambiar a overlay
2. ✅ En móvil, abrir menú → debe overlay encima del contenido
3. ✅ Al navegar en móvil → sidebar debe cerrarse automáticamente

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm start              # Servidor dev en localhost:4200
npm run watch          # Build en modo watch

# Producción
npm run build:prod     # Build optimizado para producción

# Testing
npm test               # Ejecutar tests con Vitest

# Linting
npm run lint           # Verificar código (cuando esté configurado)
```

---

## 📝 Notas Importantes

### API Backend
- **IMPORTANTE**: Asegúrate de que tu API backend esté corriendo en `http://localhost:3000`
- Si tu API está en otra URL, modifica `src/environments/environment.ts`

### Tokens
- Los tokens se almacenan en `localStorage`
- Access Token: usado para autenticar requests
- Refresh Token: usado para renovar access tokens
- El interceptor HTTP maneja el refresh automáticamente

### Roles de Usuario
- **admin**: Acceso completo a todas las funcionalidades
- **client**: Acceso limitado (definir en futuras fases)
- **user**: Acceso básico (definir en futuras fases)

---

## 🐛 Problemas Comunes

### "Cannot connect to API"
- ✅ Verifica que el backend esté corriendo
- ✅ Verifica la URL en `environment.ts`
- ✅ Revisa CORS en el backend

### "Token expired"
- El sistema debería refrescar automáticamente
- Si persiste, cierra sesión e inicia de nuevo

### Sidebar no se muestra
- En móvil es normal (modo overlay)
- Haz clic en el botón de menú (☰) para abrirlo

---

## 🎯 Próximos Pasos

### Fase 3: Módulo de Productos
- [ ] Lista de productos con tabla Material
- [ ] Paginación y filtros
- [ ] Formulario crear/editar producto
- [ ] Validación con Zod
- [ ] Integración con API

Este módulo servirá de **template** para los demás módulos (Clientes, Pedidos, etc.).

---

¡Listo para desarrollar! 🚀
