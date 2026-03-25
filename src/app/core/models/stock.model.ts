import { StockMovementType, ShrinkageCause } from './common.model';

/**
 * Stock-related interfaces
 */

// Stock movement interface
export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  createdAt: string;
}

// Create stock movement request
export interface CreateStockMovementRequest {
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
}

// Shrinkage interface
export interface Shrinkage {
  id: string;
  productId: string;
  quantity: number;
  cause: ShrinkageCause;
  notes?: string;
  createdAt: string;
}

// Create shrinkage request
export interface CreateShrinkageRequest {
  productId: string;
  quantity: number;
  cause: ShrinkageCause;
  notes?: string;
}
