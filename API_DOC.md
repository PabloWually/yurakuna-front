# Yurakuna API Documentation

Esta documentación contiene la estructura exacta de endpoints, esquemas de validación y payloads esperados por la API de Yurakuna (versión actual basada en DDD `apps/api/`). Está diseñada para que un agente autónomo o desarrollador pueda construir y consumir el Frontend sin ambigüedades.

---

## 1. Información General

- **Base URL (Desarrollo):** `http://localhost:3000`
- **Prefijo Global de la API:** `/api`
- **Autenticación:** Las rutas protegidas requieren el header `Authorization: Bearer <access_token>`.
- **Formato:** Todas las peticiones y respuestas con body utilizan formato JSON (`Content-Type: application/json`).

---

## 2. Tipos Reutilizables y Paginación

### 2.1 Peticiones de Listado Avanzado (`Criteria`)
Todos los endpoints de listado usan el método **`POST`** a la ruta `/list` y aceptan el objeto general de búsqueda \`Criteria\`:

```typescript
// Body de POST /api/*/list
{
  limit?: number;     // Por defecto: 10
  offset?: number;    // Por defecto: 0
  filters?: Filter[]; // Opcional
}

// Estructura de Filter
{
  field: string;
  value: any;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
}
```

---

## 3. Endpoints de la API

### Auth (`/api/auth`)

| Endpoint | Method | Requiere Auth | Descripción |
|----------|--------|---------------|-------------|
| `/login` | `POST` | NO | Autenticarse e iniciar sesión. |
| `/register` | `POST` | NO | Registrar un nuevo usuario. |
| `/refresh` | `POST` | NO | Renovar el Access Token usando un Refresh Token. |
| `/logout` | `POST` | SÍ | Cerrar sesión (revocar token). |
| `/logout-all` | `POST` | SÍ | Revocar todos los tokens del usuario actual. |

**Payloads de Auth:**
```typescript
// POST /login
{
  email: string; // Formato email
  password: string; // Mínimo 1 carácter
}

// POST /register
{
  email: string;
  password: string; // Mínimo 8 caracteres
  name: string; // Mínimo 1 carácter
  role?: 'admin' | 'client' | 'user'; // Opcional
}

// POST /refresh y POST /logout
{
  refreshToken: string;
}
```

---

### Clients (`/api/clients`)

| Endpoint | Method | Permiso Req. | Descripción |
|----------|--------|--------------|-------------|
| `/:id` | `GET` | `clients:read` | Obtener un cliente por su ID. |
| `/list` | `POST`| `clients:read` | Listar clientes (usa payload `Criteria`). |
| `/` | `POST`| `clients:create` | Crear un cliente. |
| `/:id` | `PATCH`| `clients:update` | Actualizar campos de un cliente. |

**Payloads de Clients:**
```typescript
// POST /
{
  userId?: string; // Opcional (Asociar a un user ID)
  name: string; // Mínimo 1 carácter
  email: string; // Formato email
  phone?: string; // Opcional
  address?: string; // Opcional
}

// PATCH /:id
{
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
```

---

### Products (`/api/products`)

| Endpoint | Method | Permiso Req. | Descripción |
|----------|--------|--------------|-------------|
| `/:id` | `GET` | `products:read` | Obtener un producto por ID. |
| `/list` | `POST` | `products:read` | Listar productos filtrados/paginados. |
| `/` | `POST` | `products:create` | Crear producto. |
| `/:id` | `PATCH`| `products:update` | Actualizar producto existente. |
| `/:id` | `DELETE`|`products:delete`| Eliminar producto. |

**Payloads de Products:**
```typescript
// POST /
{
  name: string; // Requerido
  description?: string;
  unit: 'kg' | 'unities' | 'lb' | 'g' | 'liters';
  pricePerUnit: number; // Número positivo
  currentStock?: number; // No negativo
}

// PATCH /:id (Igual a POST pero todos opcionales)
```

---

### Orders (`/api/orders`)

| Endpoint | Method | Permiso Req. | Descripción |
|----------|--------|--------------|-------------|
| `/:id` | `GET` | `orders:read` | Obtener una orden por ID. |
| `/list` | `POST` | `orders:read` | Buscar/Listar órdenes. |
| `/` | `POST` | `orders:create` | Crear orden. |
| `/:id` | `PATCH`| `orders:update` | Cambiar estado/actualizar orden. |
| `/:id` | `DELETE`|`orders:delete`| Eliminar orden (cancelar). |

**Payloads de Orders:**
```typescript
// POST /
{
  clientId: string; // ID válido
  createdById: string; // ID del creador (user account requestor)
  items: Array<{
    productId: string;
    quantity: number; // Número positivo
  }>; // Mínimo 1 item requerido
}

// PATCH /:id
{
  status?: 'draft' | 'confirmed' | 'delivered' | 'cancelled';
}
```

---

### Deliveries (`/api/deliveries`)

| Endpoint | Method | Permiso Req. | Descripción |
|----------|--------|--------------|-------------|
| `/:id` | `GET` | `deliveries:read` | Obtener entrega por ID. |
| `/list` | `POST` | `deliveries:read` | Buscar entregas. |
| `/` | `POST` | `deliveries:create` | Registrar envío. |
| `/:id` | `PATCH`| `deliveries:update` | Actualizar estado de envío. |
| `/:id` | `DELETE`|`deliveries:delete`| Eliminar un registro de entrega. |

**Payloads de Deliveries:**
```typescript
// POST /
{
  orderId: string;
  clientId: string;
  deliveryAddress: string;
  notes?: string;
}

// PATCH /:id
{
  status?: 'pending' | 'in_transit' | 'completed' | 'failed';
  deliveredAt?: Date | string; // Opcional, timestamp
  notes?: string;
}
```

---

### Stock & Shrinkage (`/api/stock`)

| Endpoint | Method | Permiso Req. | Descripción |
|----------|--------|--------------|-------------|
| `/movements/list` | `POST` | `stock:read` | Listar movimientos de stock. |
| `/movements` | `POST` | `stock:create` | Registrar movimiento (in/out). |
| `/shrinkage/list` | `POST` | `stock:read` | Listar mermas registradas. |
| `/shrinkage` | `POST` | `stock:create` | Registrar un producto dañado/caducado. |

**Payloads de Stock:**
```typescript
// POST /movements
{
  productId: string;
  type: 'in' | 'out' | 'adjustment' | 'shrinkage';
  quantity: number; // Positivo
  reason?: string;
}

// POST /shrinkage
{
  productId: string;
  quantity: number; // Positivo
  cause: 'damaged' | 'expired';
  notes?: string;
}
```

---

### Users (`/api/users`)

| Endpoint | Method | Permiso Req. | Descripción |
|----------|--------|--------------|-------------|
| `/` | `POST` | `users:create` | Creación de usuarios (Admin dashboard). |

**Payloads de Users:**
```typescript
// POST /
{
  email: string;
  password: string; // Mínimo 6 caracteres (OJO: es distinto al auth/register que pide 8)
  name: string;
  role: 'admin' | 'client' | 'user'; // Obligatorio aquí
}
```

---

## 4. Notas para el Frontend

1. **Arquitectura:** Para las grillas, tablas de datos, etc., donde haya filtros o paginación, recuerda usar un `POST` adjuntando el objeto `{ limit, offset, filters }`.
2. **Tokens de Acceso:** La API provee un Refresh Token (`POST /api/auth/refresh`). Implementar configuración con axios interceptors para rotarlos de manera automática y silenciosa al recibir un HTTP 401.
3. **Manejo de Errores:** Errores de Zod retornan estructuras específicas donde cada campo que falló tiene su mensaje indicando por qué (ej: "Email inválido", "El precio debe ser positivo"). Manejarlos globalmente.
