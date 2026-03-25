import { ProductUnit } from './common.model';

/**
 * Product-related interfaces
 */

// Product interface
export interface Product {
  id: string;
  name: string;
  description?: string;
  unit: ProductUnit;
  pricePerUnit: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

// Create product request
export interface CreateProductRequest {
  name: string;
  description?: string;
  unit: ProductUnit;
  pricePerUnit: number;
  currentStock?: number;
}

// Update product request
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  unit?: ProductUnit;
  pricePerUnit?: number;
  currentStock?: number;
}
