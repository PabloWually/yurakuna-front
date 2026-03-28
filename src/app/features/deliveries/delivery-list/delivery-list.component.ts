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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { DeliveryService } from '../services/delivery.service';
import { Delivery, Criteria } from '../../../core/models';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-delivery-list',
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
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
  ],
  templateUrl: './delivery-list.component.html',
  styleUrl: './delivery-list.component.scss',
})
export class DeliveryListComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // State
  deliveries = signal<Delivery[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  // Search form
  searchForm: FormGroup;

  // Table columns
  displayedColumns = ['order', 'client', 'address', 'status', 'deliveredAt', 'actions'];

  // Status labels for display
  statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    in_transit: 'En Tránsito',
    completed: 'Completado',
    failed: 'Fallido',
  };

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    this.loadDeliveries();
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
        this.loadDeliveries();
      });
  }

  /**
   * Load deliveries from API
   */
  loadDeliveries(): void {
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
        field: 'deliveryAddress',
        operator: 'ilike',
        value: `%${searchTerm}%`,
      });
    }

    this.deliveryService.listDeliveries(criteria).subscribe({
      next: (response) => {
        this.deliveries.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar entregas', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading deliveries:', error);
      },
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadDeliveries();
  }

  /**
   * Navigate to create delivery page
   */
  createDelivery(): void {
    this.router.navigate(['/deliveries/new']);
  }

  /**
   * Navigate to edit delivery page
   */
  editDelivery(delivery: Delivery): void {
    this.router.navigate(['/deliveries', delivery.id, 'edit']);
  }

  /**
   * Delete delivery with confirmation
   */
  deleteDelivery(delivery: Delivery): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Entrega',
        message: `¿Estás seguro de que deseas eliminar esta entrega?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.set(true);
        this.deliveryService.deleteDelivery(delivery.id).subscribe({
          next: () => {
            this.snackBar.open('Entrega eliminada exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadDeliveries();
          },
          error: (error) => {
            this.loading.set(false);
            this.snackBar.open('Error al eliminar entrega', 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar'],
            });
            console.error('Error deleting delivery:', error);
          },
        });
      }
    });
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  /**
   * Get status chip color
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'accent',
      in_transit: 'primary',
      completed: 'primary',
      failed: 'warn',
    };
    return colors[status] || 'primary';
  }

  /**
   * Format date for display
   */
  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * Confirm Dialog Component (reusable inline component)
 */
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ data.cancelText }}</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        {{ data.confirmText }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
