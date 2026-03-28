import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Shrinkage,
  CreateShrinkageRequest,
  Criteria,
  PaginatedResponse,
} from '../../../core/models';

/**
 * Service for managing shrinkage records
 * Note: Shrinkage has list and create only - no get by ID, update, or delete
 */
@Injectable({
  providedIn: 'root',
})
export class ShrinkageService {
  private api = inject(ApiService);
  private readonly BASE_PATH = '/stock';

  /**
   * List shrinkage records with pagination and filters
   * Uses POST /stock/shrinkage/list with Criteria pattern
   */
  listShrinkage(criteria: Criteria): Observable<PaginatedResponse<Shrinkage>> {
    return this.api.post<PaginatedResponse<Shrinkage>>(
      `${this.BASE_PATH}/shrinkage/list`,
      criteria,
    );
  }

  /**
   * Create a new shrinkage record (damaged or expired products)
   */
  createShrinkage(data: CreateShrinkageRequest): Observable<Shrinkage> {
    return this.api.post<Shrinkage>(`${this.BASE_PATH}/shrinkage`, data);
  }
}
