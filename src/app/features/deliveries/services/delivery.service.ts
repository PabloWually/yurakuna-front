import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Delivery,
  DeliveryWithItems,
  DeliveryItem,
  CreateDeliveryRequest,
  UpdateDeliveryRequest,
  Criteria,
  PaginatedResponse,
} from '../../../core/models';

/**
 * Service for managing deliveries (CRUD operations)
 */
@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private api = inject(ApiService);
  private readonly BASE_PATH = '/deliveries';

  /**
   * Get a single delivery by ID — returns DeliveryWithItems
   */
  getDelivery(id: string): Observable<DeliveryWithItems> {
    return this.api.get<DeliveryWithItems>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * List deliveries with pagination and filters
   * Uses POST /deliveries/list with Criteria pattern
   */
  listDeliveries(criteria: Criteria): Observable<PaginatedResponse<Delivery>> {
    return this.api.post<PaginatedResponse<Delivery>>(`${this.BASE_PATH}/list`, criteria);
  }

  /**
   * Create a new delivery
   */
  createDelivery(data: CreateDeliveryRequest): Observable<Delivery> {
    return this.api.post<Delivery>(this.BASE_PATH, data);
  }

  /**
   * Update an existing delivery
   */
  updateDelivery(id: string, data: UpdateDeliveryRequest): Observable<Delivery> {
    return this.api.patch<Delivery>(`${this.BASE_PATH}/${id}`, data);
  }

  /**
   * Delete a delivery
   */
  deleteDelivery(id: string): Observable<void> {
    return this.api.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  // ===== ITEM MANAGEMENT =====

  /**
   * Add item to delivery (only in pending status)
   * POST /deliveries/:id/items
   */
  addDeliveryItem(
    deliveryId: string,
    data: { orderItemId: string; productId: string; quantity: number }
  ): Observable<DeliveryItem> {
    return this.api.post<DeliveryItem>(`${this.BASE_PATH}/${deliveryId}/items`, data);
  }

  /**
   * Update item in delivery (only in pending status)
   * PATCH /deliveries/:id/items/:itemId
   */
  updateDeliveryItem(
    deliveryId: string,
    itemId: string,
    data: { quantity: number }
  ): Observable<DeliveryItem> {
    return this.api.patch<DeliveryItem>(
      `${this.BASE_PATH}/${deliveryId}/items/${itemId}`,
      data
    );
  }

  /**
   * Delete item from delivery (only in pending status)
   * DELETE /deliveries/:id/items/:itemId
   */
  deleteDeliveryItem(deliveryId: string, itemId: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(
      `${this.BASE_PATH}/${deliveryId}/items/${itemId}`
    );
  }
}
