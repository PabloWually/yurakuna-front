import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { User, CreateUserRequest, Criteria, PaginatedResponse } from '../../../core/models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiService = inject(ApiService);
  private readonly BASE_URL = '/users';

  /**
   * Get a single user by ID
   */
  getUser(id: string): Observable<User> {
    return this.apiService.get<User>(`${this.BASE_URL}/${id}`);
  }

  /**
   * List users with pagination and filters
   */
  listUsers(criteria: Criteria): Observable<PaginatedResponse<User>> {
    return this.apiService.post<PaginatedResponse<User>>(`${this.BASE_URL}/list`, criteria);
  }

  /**
   * Create a new user (admin only)
   */
  createUser(data: CreateUserRequest): Observable<User> {
    return this.apiService.post<User>(this.BASE_URL, data);
  }

  /**
   * Update an existing user
   */
  updateUser(id: string, data: Partial<CreateUserRequest>): Observable<User> {
    return this.apiService.patch<User>(`${this.BASE_URL}/${id}`, data);
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.BASE_URL}/${id}`);
  }
}
