import { z } from 'zod';

export const PurchaseItemSchema = z.object({
  productId: z.string().min(1, 'El producto es requerido'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  pricePerUnit: z.number().min(0, 'El precio no puede ser negativo'),
});

export const CreatePurchaseSchema = z.object({
  providerId: z.string().min(1, 'El proveedor es requerido'),
  createdById: z.string().min(1),
  items: z.array(PurchaseItemSchema).min(1, 'Debe agregar al menos un producto'),
});

export const UpdatePurchaseSchema = z.object({
  status: z.enum(['draft', 'confirmed', 'cancelled']).optional(),
});

export type CreatePurchaseFormData = z.infer<typeof CreatePurchaseSchema>;
export type UpdatePurchaseFormData = z.infer<typeof UpdatePurchaseSchema>;
