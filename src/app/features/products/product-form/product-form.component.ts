import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductService } from '../services/product.service';
import { CreateProductSchema, UpdateProductSchema } from '../services/product.validation';
import {
  Product,
  ProductUnit,
  CreateProductRequest,
  UpdateProductRequest,
} from '../../../core/models';

@Component({
  selector: 'app-product-form',
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
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  productForm: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  productId: string | null = null;

  // Unit options
  unitOptions: Array<{ value: ProductUnit; label: string }> = [
    { value: 'kg', label: 'Kilogramo (kg)' },
    { value: 'g', label: 'Gramo (g)' },
    { value: 'lb', label: 'Libra (lb)' },
    { value: 'unities', label: 'Unidades' },
    { value: 'liters', label: 'Litros' },
  ];

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      unit: ['kg', Validators.required],
      pricePerUnit: [0, [Validators.required, Validators.min(0.01)]],
      currentStock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.productId = this.route.snapshot.paramMap.get('id');

    if (this.productId) {
      this.isEditMode.set(true);
      this.loadProduct(this.productId);
    }
  }

  /**
   * Load product data for editing
   */
  loadProduct(id: string): void {
    this.loading.set(true);

    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description || '',
          unit: product.unit,
          pricePerUnit: product.pricePerUnit,
          currentStock: product.currentStock,
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar producto', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading product:', error);
        this.router.navigate(['/products']);
      },
    });
  }

  /**
   * Submit form (create or update)
   */
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    console.log('formData', this.productForm.value);
    // Validate with Zod
    const formData = this.productForm.value;

    try {
      if (this.isEditMode()) {
        formData.pricePerUnit = +formData.pricePerUnit;
        formData.currentStock = +formData.currentStock;
        UpdateProductSchema.parse(formData);
        this.updateProduct(formData);
      } else {
        // Validate create data
        CreateProductSchema.parse(formData);
        this.createProduct(formData);
      }
    } catch (error: any) {
      // Zod validation error
      this.snackBar.open(error.errors?.[0]?.message || 'Error de validación', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  /**
   * Create new product
   */
  createProduct(data: CreateProductRequest): void {
    this.loading.set(true);

    this.productService.createProduct(data).subscribe({
      next: (product) => {
        this.loading.set(false);
        this.snackBar.open('Producto creado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al crear producto';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error creating product:', error);
      },
    });
  }

  /**
   * Update existing product
   */
  updateProduct(data: UpdateProductRequest): void {
    if (!this.productId) return;

    this.loading.set(true);
    console.log('data', data);

    this.productService.updateProduct(this.productId, data).subscribe({
      next: (product) => {
        this.loading.set(false);
        this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al actualizar producto';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error updating product:', error);
      },
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);

    if (!field || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field.hasError('minlength')) {
      return 'El nombre es requerido';
    }

    if (field.hasError('min')) {
      const minValue = field.errors?.['min']?.min;
      return `El valor mínimo es ${minValue}`;
    }

    return '';
  }
}
