import { Client } from './client.model';
import { OrderStatus } from './common.model';

/**
 * Order-related interfaces
 */

// Order item interface
export interface OrderItem {
  id?: string; // Present in API responses, needed for delivery orderItemId
  productId: string;
  quantity: number;
  pricePerUnit?: number;
  productName?: string;
}

// Order interface
export interface Order {
  id: string;
  clientId: string;
  createdById: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  client: Client;
}

// Create order request
export interface CreateOrderRequest {
  clientId: string;
  createdById: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

// Update order request
export interface UpdateOrderRequest {
  status?: OrderStatus;
}
