import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  StockMovement,
  CreateStockMovementRequest,
  Criteria,
  PaginatedResponse,
} from '../../../core/models';

/**
 * Service for managing stock movements
 * Note: Stock has list and create only - no get by ID, update, or delete
 */
@Injectable({
  providedIn: 'root',
})
export class StockService {
  private api = inject(ApiService);
  private readonly BASE_PATH = '/stock';

  /**
   * List stock movements with pagination and filters
   * Uses POST /stock/movements/list with Criteria pattern
   */
  listMovements(criteria: Criteria): Observable<PaginatedResponse<StockMovement>> {
    return this.api.post<PaginatedResponse<StockMovement>>(
      `${this.BASE_PATH}/movements/list`,
      criteria,
    );
  }

  /**
   * Create a new stock movement (in, out, adjustment, shrinkage)
   */
  createMovement(data: CreateStockMovementRequest): Observable<StockMovement> {
    return this.api.post<StockMovement>(`${this.BASE_PATH}/movements`, data);
  }
}
