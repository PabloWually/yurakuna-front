import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Delivery,
  DeliveryWithItems,
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
}
