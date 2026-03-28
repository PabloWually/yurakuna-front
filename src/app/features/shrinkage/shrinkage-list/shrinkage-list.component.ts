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

import { ShrinkageService } from '../services/shrinkage.service';
import { Shrinkage, Criteria } from '../../../core/models';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-shrinkage-list',
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
  templateUrl: './shrinkage-list.component.html',
  styleUrl: './shrinkage-list.component.scss',
})
export class ShrinkageListComponent implements OnInit {
  private shrinkageService = inject(ShrinkageService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // State
  shrinkages = signal<Shrinkage[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  // Search form
  searchForm: FormGroup;

  // Table columns
  displayedColumns = ['product', 'quantity', 'cause', 'notes', 'createdAt'];

  // Cause labels for display
  causeLabels: Record<string, string> = {
    damaged: 'Dañado',
    expired: 'Caducado',
  };

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    this.loadShrinkages();
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
        this.loadShrinkages();
      });
  }

  /**
   * Load shrinkages from API
   */
  loadShrinkages(): void {
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

    this.shrinkageService.listShrinkage(criteria).subscribe({
      next: (response) => {
        this.shrinkages.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar mermas', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading shrinkages:', error);
      },
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadShrinkages();
  }

  /**
   * Navigate to create shrinkage page
   */
  createShrinkage(): void {
    this.router.navigate(['/shrinkage/new']);
  }

  /**
   * Get cause label for display
   */
  getCauseLabel(cause: string): string {
    return this.causeLabels[cause] || cause;
  }

  /**
   * Get cause chip color
   */
  getCauseColor(cause: string): string {
    return cause === 'damaged' ? 'warn' : 'accent';
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
