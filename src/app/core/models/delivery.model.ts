import { Client } from './client.model';
import { DeliveryStatus } from './common.model';

/**
 * Delivery-related interfaces
 */

// Delivery item (present in GET /:id response)
export interface DeliveryItem {
  id: string;
  deliveryId: string;
  orderItemId: string;
  productId: string;
  quantity: string; // API returns as string decimal e.g. "2.00"
  isActive: boolean;
  createdAt: string;
}

// Delivery interface (list response — no items)
export interface Delivery {
  id: string;
  orderId: string;
  clientId: string;
  deliveryAddress: string;
  status: DeliveryStatus;
  notes?: string;
  deliveredAt?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  items?: DeliveryItem[]; // Present in GET /:id, absent in list
  client?: Client;
}

// Delivery with items (GET /:id response)
export interface DeliveryWithItems extends Delivery {
  items: DeliveryItem[];
}

// Create delivery request — BREAKING CHANGE: items is now required
export interface CreateDeliveryRequest {
  orderId: string;
  clientId: string;
  deliveryAddress: string;
  notes?: string;
  items: Array<{
    orderItemId: string;
    productId: string;
    quantity: number;
  }>;
}

// Update delivery request
export interface UpdateDeliveryRequest {
  status?: DeliveryStatus;
  deliveredAt?: Date | string;
  notes?: string;
}
