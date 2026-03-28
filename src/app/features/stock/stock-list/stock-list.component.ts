import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { StockService } from '../services/stock.service';
import { StockMovement, Criteria } from '../../../core/models';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss',
})
export class StockListComponent implements OnInit {
  private stockService = inject(StockService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // State
  movements = signal<StockMovement[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  // Search form
  searchForm: FormGroup;

  // Table columns
  displayedColumns = ['product', 'type', 'quantity', 'reason', 'createdAt'];

  // Type labels for display
  typeLabels: Record<string, string> = {
    in: 'Entrada',
    out: 'Salida',
    adjustment: 'Ajuste',
    shrinkage: 'Merma',
  };

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    this.loadMovements();
    this.setupSearchListener();
  }

  /**
   * Setup search input listener with debounce
   */
  setupSearchListener(): void {
    this.searchForm
      .get('search')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadMovements();
      });
  }

  /**
   * Load stock movements from API
   */
  loadMovements(): void {
    this.loading.set(true);

    const criteria: Criteria = {
      limit: this.pageSize(),
      offset: this.pageIndex() * this.pageSize(),
      filters: [],
    };

    // Add search filter if search term exists
    const searchTerm = this.searchForm.get('search')?.value?.trim();
    if (searchTerm) {
      criteria.filters?.push({
        field: 'product.name',
        operator: 'ilike',
        value: `%${searchTerm}%`,
      });
    }

    this.stockService.listMovements(criteria).subscribe({
      next: (response) => {
        this.movements.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar movimientos', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading movements:', error);
      },
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadMovements();
  }

  /**
   * Navigate to create movement page
   */
  createMovement(): void {
    this.router.navigate(['/stock/new']);
  }

  /**
   * Get type label for display
   */
  getTypeLabel(type: string): string {
    return this.typeLabels[type] || type;
  }

  /**
   * Get type chip color
   */
  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      in: 'primary',
      out: 'warn',
      adjustment: 'accent',
      shrinkage: 'warn',
    };
    return colors[type] || 'primary';
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
