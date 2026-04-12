import { z } from 'zod';

/**
 * Zod schemas for delivery validation
 */

// Delivery status enum
export const DeliveryStatusSchema = z.enum(['pending', 'in_transit', 'completed', 'failed']);

// Delivery item schema
export const DeliveryItemSchema = z.object({
  orderItemId: z.string().min(1, 'El item del pedido es requerido'),
  productId: z.string().min(1, 'El producto es requerido'),
  quantity: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
});

// Create delivery schema — BREAKING CHANGE: items now required
export const CreateDeliverySchema = z.object({
  orderId: z.string().min(1, 'El pedido es requerido'),
  clientId: z.string().min(1, 'El cliente es requerido'),
  deliveryAddress: z.string().min(1, 'La dirección de entrega es requerida'),
  notes: z.string().optional(),
  items: z.array(DeliveryItemSchema).min(1, 'Debe seleccionar al menos un producto'),
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
