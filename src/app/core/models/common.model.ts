/**
 * Common types used across the application
 */

// Filter operators for list endpoints
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';

// Filter interface for Criteria
export interface Filter {
  field: string;
  value: any;
  operator: FilterOperator;
}

// Criteria interface for list endpoints (POST /api/*/list)
export interface Criteria {
  limit?: number; // Default: 10
  offset?: number; // Default: 0
  filters?: Filter[]; // Optional
}

// Generic paginated response
export interface PaginatedResponse<T> {
  data: T[]; // API returns 'data' not 'items'
  total: number;
  limit: number;
  offset: number;
}

// User roles
export type UserRole = 'admin' | 'client' | 'user';

// Product units
export type ProductUnit = 'kg' | 'unities' | 'lb' | 'g' | 'liters';

// Order status
export type OrderStatus = 'draft' | 'confirmed' | 'delivered' | 'cancelled';

// Delivery status
export type DeliveryStatus = 'pending' | 'in_transit' | 'completed' | 'failed';

// Stock movement types
export type StockMovementType = 'in' | 'out' | 'adjustment' | 'shrinkage';

// Shrinkage causes
export type ShrinkageCause = 'damaged' | 'expired';

// Purchase status
export type PurchaseStatus = 'draft' | 'confirmed' | 'cancelled';
