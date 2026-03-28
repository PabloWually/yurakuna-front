import { z } from 'zod';

/**
 * Zod schemas for delivery validation
 * These match the API requirements from API_DOC.md
 */

// Delivery status enum
export const DeliveryStatusSchema = z.enum(['pending', 'in_transit', 'completed', 'failed']);

// Create delivery schema
export const CreateDeliverySchema = z.object({
  orderId: z.string().min(1, 'El pedido es requerido'),
  clientId: z.string().min(1, 'El cliente es requerido'),
  deliveryAddress: z.string().min(1, 'La dirección de entrega es requerida'),
  notes: z.string().optional(),
});

// Update delivery schema (all fields optional)
export const UpdateDeliverySchema = z.object({
  status: DeliveryStatusSchema.optional(),
  deliveredAt: z.string().optional(), // ISO date string
  notes: z.string().optional(),
});

// Type inference
export type CreateDeliveryFormData = z.infer<typeof CreateDeliverySchema>;
export type UpdateDeliveryFormData = z.infer<typeof UpdateDeliverySchema>;
