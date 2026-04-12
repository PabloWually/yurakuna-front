import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Purchase,
  PurchaseDetail,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  Criteria,
  PaginatedResponse,
} from '../../../core/models';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private apiService = inject(ApiService);
  private readonly BASE_URL = '/purchases';

  /**
   * Get a single purchase by ID
   */
  getPurchase(id: string): Observable<PurchaseDetail> {
    return this.apiService.get<PurchaseDetail>(`${this.BASE_URL}/${id}`);
  }

  /**
   * List purchases with pagination and filters
   */
  listPurchases(criteria: Criteria): Observable<PaginatedResponse<Purchase>> {
    return this.apiService.post<PaginatedResponse<Purchase>>(`${this.BASE_URL}/list`, criteria);
  }

  /**
   * Create a new purchase
   */
  createPurchase(data: CreatePurchaseRequest): Observable<Purchase> {
    return this.apiService.post<Purchase>(this.BASE_URL, data);
  }

  /**
   * Update an existing purchase
   */
  updatePurchase(id: string, data: UpdatePurchaseRequest): Observable<Purchase> {
    return this.apiService.patch<Purchase>(`${this.BASE_URL}/${id}`, data);
  }

  /**
   * Delete a purchase
   */
  deletePurchase(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.BASE_URL}/${id}`);
  }
}
