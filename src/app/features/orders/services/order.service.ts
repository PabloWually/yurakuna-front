import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  Criteria,
  PaginatedResponse,
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
  getOrder(id: string): Observable<Order> {
    return this.apiService.get<Order>(`${this.BASE_URL}/${id}`);
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
}
