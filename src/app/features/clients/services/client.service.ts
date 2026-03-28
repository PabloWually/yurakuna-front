import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  Criteria,
  PaginatedResponse,
} from '../../../core/models';

/**
 * Service for managing clients (CRUD operations)
 */
@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private api = inject(ApiService);
  private readonly BASE_PATH = '/clients';

  /**
   * Get a single client by ID
   */
  getClient(id: string): Observable<Client> {
    return this.api.get<Client>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * List clients with pagination and filters
   * Uses POST /clients/list with Criteria pattern
   */
  listClients(criteria: Criteria): Observable<PaginatedResponse<Client>> {
    return this.api.post<PaginatedResponse<Client>>(`${this.BASE_PATH}/list`, criteria);
  }

  /**
   * Create a new client
   */
  createClient(data: CreateClientRequest): Observable<Client> {
    return this.api.post<Client>(this.BASE_PATH, data);
  }

  /**
   * Update an existing client
   */
  updateClient(id: string, data: UpdateClientRequest): Observable<Client> {
    return this.api.patch<Client>(`${this.BASE_PATH}/${id}`, data);
  }
}
