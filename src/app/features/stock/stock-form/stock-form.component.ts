import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { StockService } from '../services/stock.service';
import { ProductService } from '../../products/services/product.service';
import { CreateStockMovementSchema } from '../services/stock.validation';
import { CreateStockMovementRequest, StockMovementType, Product } from '../../../core/models';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatAutocompleteModule,
  ],
  templateUrl: './stock-form.component.html',
  styleUrl: './stock-form.component.scss',
})
export class StockFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private stockService = inject(StockService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  stockForm: FormGroup;
  loading = signal(false);
  products = signal<Product[]>([]);

  // Type options
  typeOptions: Array<{ value: StockMovementType; label: string }> = [
    { value: 'in', label: 'Entrada' },
    { value: 'out', label: 'Salida' },
    { value: 'adjustment', label: 'Ajuste' },
    { value: 'shrinkage', label: 'Merma' },
  ];

  constructor() {
    this.stockForm = this.fb.group({
      productId: ['', Validators.required],
      type: ['in', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.01)]],
      reason: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Load products for dropdown
   */
  loadProducts(): void {
    this.productService.listProducts({ limit: 1000, offset: 0 }).subscribe({
      next: (response) => {
        this.products.set(response.data);
      },
      error: (error) => {
        this.snackBar.open('Error al cargar productos', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading products:', error);
      },
    });
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    // Validate with Zod
    const formData = this.stockForm.value;

    try {
      CreateStockMovementSchema.parse(formData);
      this.createMovement(formData);
    } catch (error: any) {
      this.snackBar.open(error.errors?.[0]?.message || 'Error de validación', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  /**
   * Create stock movement
   */
  createMovement(data: CreateStockMovementRequest): void {
    this.loading.set(true);

    this.stockService.createMovement(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Movimiento registrado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/stock']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al registrar movimiento';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error creating movement:', error);
      },
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/stock']);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.stockForm.get(fieldName);

    if (!field || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field.hasError('min')) {
      const minValue = field.errors?.['min']?.min;
      return `El valor mínimo es ${minValue}`;
    }

    return '';
  }
}
