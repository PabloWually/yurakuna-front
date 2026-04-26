import { z } from 'zod';

/**
 * Order item validation schema
 */
const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID es requerido'),
  quantity: z.number().min(0, 'La cantidad debe ser al menos 1'),
});

/**
 * Create order validation schema
 */
export const CreateOrderSchema = z.object({
  clientId: z.string().min(1, 'Cliente es requerido'),
  createdById: z.string().min(1, 'Creador es requerido'),
  items: z.array(OrderItemSchema).min(1, 'Debe incluir al menos un producto'),
});

/**
 * Update order validation schema
 */
export const UpdateOrderSchema = z.object({
  status: z.enum(['draft', 'confirmed', 'delivered', 'cancelled']).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
