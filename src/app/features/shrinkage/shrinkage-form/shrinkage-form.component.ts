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

import { ShrinkageService } from '../services/shrinkage.service';
import { ProductService } from '../../products/services/product.service';
import { CreateShrinkageSchema } from '../services/shrinkage.validation';
import { CreateShrinkageRequest, ShrinkageCause, Product } from '../../../core/models';

@Component({
  selector: 'app-shrinkage-form',
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
  ],
  templateUrl: './shrinkage-form.component.html',
  styleUrl: './shrinkage-form.component.scss',
})
export class ShrinkageFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private shrinkageService = inject(ShrinkageService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  shrinkageForm: FormGroup;
  loading = signal(false);
  products = signal<Product[]>([]);

  // Cause options
  causeOptions: Array<{ value: ShrinkageCause; label: string }> = [
    { value: 'damaged', label: 'Dañado' },
    { value: 'expired', label: 'Caducado' },
  ];

  constructor() {
    this.shrinkageForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.01)]],
      cause: ['damaged', Validators.required],
      notes: [''],
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
    if (this.shrinkageForm.invalid) {
      this.shrinkageForm.markAllAsTouched();
      return;
    }

    // Validate with Zod
    const formData = this.shrinkageForm.value;

    try {
      CreateShrinkageSchema.parse(formData);
      this.createShrinkage(formData);
    } catch (error: any) {
      this.snackBar.open(error.errors?.[0]?.message || 'Error de validación', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  /**
   * Create shrinkage record
   */
  createShrinkage(data: CreateShrinkageRequest): void {
    this.loading.set(true);

    this.shrinkageService.createShrinkage(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Merma registrada exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/shrinkage']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al registrar merma';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error creating shrinkage:', error);
      },
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/shrinkage']);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.shrinkageForm.get(fieldName);

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
