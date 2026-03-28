import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  Criteria,
  PaginatedResponse
} from '../../../core/models';

/**
 * Service for managing products (CRUD operations)
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private api = inject(ApiService);
  private readonly BASE_PATH = '/products';

  /**
   * Get a single product by ID
   */
  getProduct(id: string): Observable<Product> {
    return this.api.get<Product>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * List products with pagination and filters
   * Uses POST /products/list with Criteria pattern
   */
  listProducts(criteria: Criteria): Observable<PaginatedResponse<Product>> {
    return this.api.post<PaginatedResponse<Product>>(`${this.BASE_PATH}/list`, criteria);
  }

  /**
   * Create a new product
   */
  createProduct(data: CreateProductRequest): Observable<Product> {
    return this.api.post<Product>(this.BASE_PATH, data);
  }

  /**
   * Update an existing product
   */
  updateProduct(id: string, data: UpdateProductRequest): Observable<Product> {
    return this.api.patch<Product>(`${this.BASE_PATH}/${id}`, data);
  }

  /**
   * Delete a product
   */
  deleteProduct(id: string): Observable<void> {
    return this.api.delete<void>(`${this.BASE_PATH}/${id}`);
  }
}
