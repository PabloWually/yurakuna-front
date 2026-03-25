import { DeliveryStatus } from './common.model';

/**
 * Delivery-related interfaces
 */

// Delivery interface
export interface Delivery {
  id: string;
  orderId: string;
  clientId: string;
  deliveryAddress: string;
  status: DeliveryStatus;
  notes?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Create delivery request
export interface CreateDeliveryRequest {
  orderId: string;
  clientId: string;
  deliveryAddress: string;
  notes?: string;
}

// Update delivery request
export interface UpdateDeliveryRequest {
  status?: DeliveryStatus;
  deliveredAt?: Date | string;
  notes?: string;
}
