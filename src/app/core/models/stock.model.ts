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
  quantityBefore: number | null;
  quantityAfter: number | null;
  reason?: string | null;
  purchaseId: string | null; // Origin: purchase that generated this movement
  deliveryId: string | null; // Origin: delivery that generated this movement
  shrinkageId: string | null; // Origin: shrinkage that generated this movement
  isActive: boolean;
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
  quantity: number; // API may return as string "5.00"
  cause: ShrinkageCause;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
}

// Create shrinkage request
export interface CreateShrinkageRequest {
  productId: string;
  quantity: number;
  cause: ShrinkageCause;
  notes?: string;
}
