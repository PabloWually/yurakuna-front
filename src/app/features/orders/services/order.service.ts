import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  Criteria,
  PaginatedResponse,
  OrderDetail,
  OrderItem,
} from '../../../core/models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiService = inject(ApiService);
  private readonly BASE_URL = '/orders';

  /**
   * Get a single order by ID
   */
  getOrder(id: string): Observable<OrderDetail> {
    return this.apiService.get<OrderDetail>(`${this.BASE_URL}/${id}`);
  }

  /**
   * List orders with pagination and filters
   */
  listOrders(criteria: Criteria): Observable<PaginatedResponse<Order>> {
    return this.apiService.post<PaginatedResponse<Order>>(`${this.BASE_URL}/list`, criteria);
  }

  /**
   * Create a new order
   */
  createOrder(data: CreateOrderRequest): Observable<Order> {
    return this.apiService.post<Order>(this.BASE_URL, data);
  }

  /**
   * Update an existing order
   */
  updateOrder(id: string, data: UpdateOrderRequest): Observable<Order> {
    return this.apiService.patch<Order>(`${this.BASE_URL}/${id}`, data);
  }

  /**
   * Delete an order
   */
  deleteOrder(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.BASE_URL}/${id}`);
  }

  // ===== ITEM MANAGEMENT =====

  /**
   * Add item to order (only in draft status)
   * POST /orders/:id/items
   */
  addOrderItem(
    orderId: string,
    data: { productId: string; quantity: number }
  ): Observable<OrderItem> {
    return this.apiService.post<OrderItem>(`${this.BASE_URL}/${orderId}/items`, data);
  }

  /**
   * Update item in order (only in draft status)
   * PATCH /orders/:id/items/:itemId
   */
  updateOrderItem(
    orderId: string,
    itemId: string,
    data: { quantity: number }
  ): Observable<OrderItem> {
    return this.apiService.patch<OrderItem>(
      `${this.BASE_URL}/${orderId}/items/${itemId}`,
      data
    );
  }

  /**
   * Delete item from order (only in draft status)
   * DELETE /orders/:id/items/:itemId
   */
  deleteOrderItem(orderId: string, itemId: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(
      `${this.BASE_URL}/${orderId}/items/${itemId}`
    );
  }
}
