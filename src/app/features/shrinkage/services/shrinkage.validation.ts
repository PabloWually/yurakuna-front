import { z } from 'zod';

/**
 * Zod schemas for shrinkage validation
 * These match the API requirements from API_DOC.md
 */

// Shrinkage cause enum
export const ShrinkageCauseSchema = z.enum(['damaged', 'expired']);

// Create shrinkage schema
export const CreateShrinkageSchema = z.object({
  productId: z.string().min(1, 'El producto es requerido'),
  quantity: z.number().positive('La cantidad debe ser positiva'),
  cause: ShrinkageCauseSchema,
  notes: z.string().optional(),
});

// Type inference
export type CreateShrinkageFormData = z.infer<typeof CreateShrinkageSchema>;
