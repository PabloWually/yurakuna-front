import { z } from 'zod';

/**
 * Zod schemas for stock movement validation
 * These match the API requirements from API_DOC.md
 */

// Stock movement type enum
export const StockMovementTypeSchema = z.enum(['in', 'out', 'adjustment', 'shrinkage']);

// Create stock movement schema
export const CreateStockMovementSchema = z.object({
  productId: z.string().min(1, 'El producto es requerido'),
  type: StockMovementTypeSchema,
  quantity: z.number().positive('La cantidad debe ser positiva'),
  reason: z.string().optional(),
});

// Type inference
export type CreateStockMovementFormData = z.infer<typeof CreateStockMovementSchema>;
