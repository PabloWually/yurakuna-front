import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Provider,
  CreateProviderRequest,
  UpdateProviderRequest,
  Criteria,
  PaginatedResponse,
} from '../../../core/models';

/**
 * Service for managing providers (CRUD operations)
 */
@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private api = inject(ApiService);
  private readonly BASE_PATH = '/providers';

  /**
   * Get a single provider by ID
   */
  getProvider(id: string): Observable<Provider> {
    return this.api.get<Provider>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * List providers with pagination and filters
   * Uses POST /providers/list with Criteria pattern
   */
  listProviders(criteria: Criteria): Observable<PaginatedResponse<Provider>> {
    return this.api.post<PaginatedResponse<Provider>>(`${this.BASE_PATH}/list`, criteria);
  }

  /**
   * Create a new provider
   */
  createProvider(data: CreateProviderRequest): Observable<Provider> {
    return this.api.post<Provider>(this.BASE_PATH, data);
  }

  /**
   * Update an existing provider
   */
  updateProvider(id: string, data: UpdateProviderRequest): Observable<Provider> {
    return this.api.patch<Provider>(`${this.BASE_PATH}/${id}`, data);
  }

  /**
   * Delete a provider
   */
  deleteProvider(id: string): Observable<void> {
    return this.api.delete<void>(`${this.BASE_PATH}/${id}`);
  }
}
