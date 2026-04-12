# Documentación Técnica - Yurakuna Frontend

## 📋 Resumen del Proyecto

Proyecto Angular 21 para gestión de hortalizas con arquitectura modular basada en standalone components.

## 🏗️ Arquitectura

### Principios de Diseño

1. **Standalone Components**: Sin NgModules, componentes autocontenidos
2. **Feature-Based Structure**: Organización por dominios de negocio
3. **Lazy Loading**: Carga diferida de módulos para optimizar performance
4. **Smart/Presentational Pattern**: Separación de lógica de negocio y presentación
5. **Repository Pattern**: Abstracción de la capa de datos

### Estructura de Carpetas

```
src/app/
├── core/                           # Singleton services y configuración global
│   ├── auth/                       # Sistema de autenticación
│   │   ├── guards/                 # Guards de rutas
│   │   │   ├── auth.guard.ts       # Protección de rutas autenticadas
│   │   │   └── role.guard.ts       # Protección por roles
│   │   ├── interceptors/           # HTTP interceptors
│   │   │   └── auth.interceptor.ts # Manejo automático de tokens JWT
│   │   └── services/               # Servicios de autenticación
│   │       ├── auth.service.ts     # Login, register, logout
│   │       └── token.service.ts    # Gestión de tokens
│   ├── models/                     # TypeScript interfaces
│   │   ├── common.model.ts         # Tipos comunes (Criteria, Filter, etc.)
│   │   ├── auth.model.ts           # Modelos de autenticación
│   │   ├── client.model.ts         # Modelos de clientes
│   │   ├── product.model.ts        # Modelos de productos
│   │   ├── order.model.ts          # Modelos de órdenes
│   │   ├── delivery.model.ts       # Modelos de entregas
│   │   ├── stock.model.ts          # Modelos de stock y merma
│   │   └── index.ts                # Barrel export
│   └── services/                   # Servicios globales
│       └── api.service.ts          # Servicio base HTTP
│
├── features/                       # Módulos de funcionalidades
│   ├── auth/                       # [PENDIENTE] Login y registro
│   ├── products/                   # [PENDIENTE] Gestión de productos
│   ├── clients/                    # [PENDIENTE] Gestión de clientes
│   ├── orders/                     # [PENDIENTE] Gestión de pedidos
│   ├── deliveries/                 # [PENDIENTE] Gestión de entregas
│   ├── stock/                      # [PENDIENTE] Control de stock
│   ├── shrinkage/                  # [PENDIENTE] Control de merma
│   └── users/                      # [PENDIENTE] Gestión de usuarios
│
├── layout/                         # [PENDIENTE] Layouts de aplicación
│   ├── admin-layout/               # Layout para administrador
│   ├── client-layout/              # Layout para cliente
│   └── public-layout/              # Layout público (login, register)
│
└── shared/                         # [PENDIENTE] Componentes reutilizables
    ├── components/                 # Componentes compartidos
    ├── directives/                 # Directivas personalizadas
    ├── pipes/                      # Pipes personalizados
    └── utils/                      # Utilidades y helpers
```

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

1. **Login/Register**: Usuario envía credenciales
2. **Respuesta**: API retorna `accessToken`, `refreshToken` y datos del usuario
3. **Almacenamiento**: Tokens guardados en `localStorage`
4. **Interceptor**: Agrega automáticamente `Authorization: Bearer <token>` a todas las requests
5. **Refresh**: Al recibir 401, intenta refrescar el token automáticamente
6. **Logout**: Limpia tokens y redirige a login

### Servicios

#### `TokenService`
```typescript
// Métodos principales
setAccessToken(token: string): void
getAccessToken(): string | null
setRefreshToken(token: string): void
getRefreshToken(): string | null
clearTokens(): void
isAuthenticated(): boolean
```

#### `AuthService`
```typescript
// Métodos principales
login(credentials: LoginRequest): Observable<AuthResponse>
register(data: RegisterRequest): Observable<AuthResponse>
refreshToken(refreshToken: string): Observable<AuthResponse>
logout(): void
logoutAll(): Observable<void>
isAuthenticated(): boolean
getUserRole(): string | null

// Signal reactivo
currentUser: Signal<User | null>
```

### Guards

#### `authGuard`
Protege rutas que requieren autenticación. Redirige a `/auth/login` si no está autenticado.

```typescript
// Uso en rutas
{
  path: 'dashboard',
  canActivate: [authGuard],
  component: DashboardComponent
}
```

#### `roleGuard`
Protege rutas basándose en roles de usuario. Requiere que la ruta especifique roles permitidos.

```typescript
// Uso en rutas
{
  path: 'admin',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['admin'] },
  component: AdminComponent
}
```

### Interceptor

#### `authInterceptor`
- Agrega automáticamente el token de acceso a las requests
- Maneja errores 401 (Unauthorized)
- Refresca tokens automáticamente
- Previene múltiples requests de refresh simultáneos

## 🌐 Comunicación con API

### Servicio Base: `ApiService`

Abstrae las llamadas HTTP al backend.

```typescript
// Métodos disponibles
get<T>(endpoint: string, params?: HttpParams): Observable<T>
post<T>(endpoint: string, body: any): Observable<T>
patch<T>(endpoint: string, body: any): Observable<T>
delete<T>(endpoint: string): Observable<T>
put<T>(endpoint: string, body: any): Observable<T>
```

### Ejemplo de Uso

```typescript
// En un servicio de feature
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}

  getProduct(id: string): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`);
  }

  listProducts(criteria: Criteria): Observable<PaginatedResponse<Product>> {
    return this.api.post<PaginatedResponse<Product>>('/products/list', criteria);
  }

  createProduct(data: CreateProductRequest): Observable<Product> {
    return this.api.post<Product>('/products', data);
  }
}
```

## 📊 Modelos de Datos

### Criteria Pattern (Filtros y Paginación)

Todos los endpoints de listado usan POST con este patrón:

```typescript
interface Criteria {
  limit?: number;     // Default: 10
  offset?: number;    // Default: 0
  filters?: Filter[];
}

interface Filter {
  field: string;
  value: any;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
}

// Ejemplo de uso
const criteria: Criteria = {
  limit: 20,
  offset: 0,
  filters: [
    { field: 'name', operator: 'like', value: 'tomate' },
    { field: 'currentStock', operator: 'gt', value: 0 }
  ]
};
```

### Tipos Principales

Ver archivos en `src/app/core/models/`:
- `common.model.ts` - Tipos compartidos
- `auth.model.ts` - Usuario, login, register
- `product.model.ts` - Productos
- `client.model.ts` - Clientes
- `order.model.ts` - Pedidos
- `delivery.model.ts` - Entregas
- `stock.model.ts` - Stock y merma

## 🎨 Theming y Estilos

### Angular Material Theme

Colores basados en el logo de Yurakuna:
- **Primary**: Verde (Material Green Palette)
- **Accent**: Naranja (Material Orange Palette)
- **Warn**: Rojo (Material Red Palette)

### Clases Utilitarias

```scss
// Ancho completo
.full-width { width: 100%; }

// Centrado de texto
.text-center { text-align: center; }

// Margin top
.mt-1 { margin-top: 8px; }
.mt-2 { margin-top: 16px; }
.mt-3 { margin-top: 24px; }
.mt-4 { margin-top: 32px; }

// Margin bottom
.mb-1 { margin-bottom: 8px; }
.mb-2 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 32px; }

// Padding
.p-1 { padding: 8px; }
.p-2 { padding: 16px; }
.p-3 { padding: 24px; }
.p-4 { padding: 32px; }
```

## 🛣️ Sistema de Rutas

### Configuración Actual

Las rutas están preparadas pero comentadas hasta que se creen los componentes:

```typescript
routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  // Auth routes (pending)
  // Protected routes (pending)
  { path: '**', redirectTo: '/' }
]
```

### Rutas Planificadas

```typescript
// Rutas públicas
/auth/login
/auth/register

// Rutas protegidas (requieren autenticación)
/dashboard
/products
/products/new
/products/:id/edit
/clients
/clients/new
/clients/:id/edit
/orders
/orders/new
/orders/:id
/deliveries
/deliveries/new
/deliveries/:id
/stock
/stock/movements
/shrinkage
/users (solo admin)

// Error pages
/unauthorized
/not-found
```

## 🔧 Configuración de Entornos

### Development (`environment.ts`)
```typescript
{
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiTimeout: 30000,
  tokenRefreshEnabled: true
}
```

### Production (`environment.prod.ts`)
```typescript
{
  production: true,
  apiUrl: 'https://api.yurakuna.com/api',
  apiTimeout: 30000,
  tokenRefreshEnabled: true
}
```

## 📦 Dependencias Principales

```json
{
  "@angular/core": "^21.2.0",
  "@angular/material": "^21.2.0",
  "@angular/forms": "^21.2.0",
  "rxjs": "~7.8.0",
  "zod": "^3.24.1",
  "date-fns": "^4.1.0"
}
```

## 🚀 Próximos Pasos

### Fase 2: Sistema de Autenticación (SIGUIENTE)
- [ ] Componente de login
- [ ] Componente de registro
- [ ] Layout público
- [ ] Rutas de autenticación
- [ ] Página de "No autorizado"

### Fase 3: Layouts Base
- [ ] Admin layout (sidebar, header, navegación)
- [ ] Client layout (navegación simplificada)
- [ ] Componentes de navegación

### Fase 4: Módulo de Productos (Template para otros)
- [ ] Lista de productos con tabla Material
- [ ] Formulario de productos (crear/editar)
- [ ] Servicio de productos
- [ ] Paginación y filtros
- [ ] Validación con Zod

### Fase 5-10: Resto de Módulos
Aplicar el patrón del módulo de productos a:
- Clientes
- Pedidos
- Entregas
- Stock
- Merma
- Usuarios

## 📝 Convenciones de Código

### Naming Conventions
- **Componentes**: PascalCase + `.component.ts` (ej: `ProductListComponent`)
- **Servicios**: PascalCase + `.service.ts` (ej: `ProductService`)
- **Modelos**: PascalCase + `.model.ts` (ej: `Product`)
- **Guards**: camelCase + `.guard.ts` (ej: `authGuard`)
- **Interceptors**: camelCase + `.interceptor.ts` (ej: `authInterceptor`)

### File Structure Pattern
```
feature/
├── feature-list/
│   ├── feature-list.component.ts
│   ├── feature-list.component.html
│   ├── feature-list.component.scss
│   └── feature-list.component.spec.ts
├── feature-form/
│   └── ...
└── services/
    └── feature.service.ts
```

### Component Pattern
```typescript
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, ...],
  templateUrl: './feature-name.component.html',
  styleUrl: './feature-name.component.scss'
})
export class FeatureNameComponent {
  // Signals
  data = signal<Type[]>([]);
  loading = signal(false);
  
  // Injects
  private service = inject(ServiceName);
  
  // Lifecycle
  ngOnInit() {}
  
  // Methods
}
```

## 🧪 Testing

Testing configurado con Vitest. Estructura pendiente de implementación.

---

**Última actualización**: Fase 1 completada - 25/03/2026
