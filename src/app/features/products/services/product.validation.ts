import { z } from 'zod';

/**
 * Zod schemas for product validation
 * These match the API requirements from API_DOC.md
 */

// Product unit enum
export const ProductUnitSchema = z.enum(['kg', 'unities', 'lb', 'g', 'liters']);

// Create product schema
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  unit: ProductUnitSchema,
  pricePerUnit: z.number().positive('El precio debe ser positivo'),
  currentStock: z.number().nonnegative('El stock no puede ser negativo').optional()
});

// Update product schema (all fields optional)
export const UpdateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  description: z.string().optional(),
  unit: ProductUnitSchema.optional(),
  pricePerUnit: z.number().positive('El precio debe ser positivo').optional(),
  currentStock: z.number().nonnegative('El stock no puede ser negativo').optional()
});

// Type inference
export type CreateProductFormData = z.infer<typeof CreateProductSchema>;
export type UpdateProductFormData = z.infer<typeof UpdateProductSchema>;
