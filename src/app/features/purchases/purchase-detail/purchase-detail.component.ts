import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';

import { PurchaseService } from '../services/purchase.service';
import { PurchaseDetail } from '../../../core/models';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTableModule,
    MatDividerModule,
  ],
  templateUrl: './purchase-detail.component.html',
  styleUrl: './purchase-detail.component.scss',
})
export class PurchaseDetailComponent implements OnInit {
  private purchaseService = inject(PurchaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  purchase = signal<PurchaseDetail | null>(null);
  loading = signal(false);

  itemColumns = ['productId', 'productName', 'quantity', 'pricePerUnit', 'subtotal'];

  statusLabels: Record<string, string> = {
    draft: 'Borrador',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPurchase(id);
    }
  }

  loadPurchase(id: string): void {
    this.loading.set(true);
    this.purchaseService.getPurchase(id).subscribe({
      next: (purchase) => {
        this.purchase.set(purchase);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar la compra', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading purchase:', error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/purchases']);
  }

  editPurchase(): void {
    const id = this.purchase()?.id;
    if (id) {
      this.router.navigate(['/purchases', id, 'edit']);
    }
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      draft: 'accent',
      confirmed: 'primary',
      cancelled: 'warn',
    };
    return colors[status] || 'primary';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getSubtotal(quantity: number, price?: number): number {
    return quantity * (price ?? 0);
  }
}
