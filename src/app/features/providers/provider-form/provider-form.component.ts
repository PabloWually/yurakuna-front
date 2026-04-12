import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ProviderService } from '../services/provider.service';
import { CreateProviderSchema, UpdateProviderSchema } from '../services/provider.validation';
import { Provider, CreateProviderRequest, UpdateProviderRequest } from '../../../core/models';

@Component({
  selector: 'app-provider-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule,
  ],
  templateUrl: './provider-form.component.html',
  styleUrl: './provider-form.component.scss',
})
export class ProviderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private providerService = inject(ProviderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  providerForm: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  providerId: string | null = null;

  constructor() {
    this.providerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.providerId = this.route.snapshot.paramMap.get('id');

    if (this.providerId) {
      this.isEditMode.set(true);
      this.loadProvider(this.providerId);
    }
  }

  /**
   * Load provider data for editing
   */
  loadProvider(id: string): void {
    this.loading.set(true);

    this.providerService.getProvider(id).subscribe({
      next: (provider) => {
        this.providerForm.patchValue({
          name: provider.name,
          email: provider.email,
          phone: provider.phone || '',
          address: provider.address || '',
          isActive: provider.isActive,
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar proveedor', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading provider:', error);
        this.router.navigate(['/providers']);
      },
    });
  }

  /**
   * Submit form (create or update)
   */
  onSubmit(): void {
    if (this.providerForm.invalid) {
      this.providerForm.markAllAsTouched();
      return;
    }

    // Validate with Zod
    const formData = this.providerForm.value;

    try {
      if (this.isEditMode()) {
        // Validate update data
        UpdateProviderSchema.parse(formData);
        this.updateProvider(formData);
      } else {
        // Validate create data
        CreateProviderSchema.parse(formData);
        this.createProvider(formData);
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
   * Create new provider
   */
  createProvider(data: CreateProviderRequest): void {
    this.loading.set(true);

    this.providerService.createProvider(data).subscribe({
      next: (provider) => {
        this.loading.set(false);
        this.snackBar.open('Proveedor creado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/providers']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al crear proveedor';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error creating provider:', error);
      },
    });
  }

  /**
   * Update existing provider
   */
  updateProvider(data: UpdateProviderRequest): void {
    if (!this.providerId) return;

    this.loading.set(true);

    this.providerService.updateProvider(this.providerId, data).subscribe({
      next: (provider) => {
        this.loading.set(false);
        this.snackBar.open('Proveedor actualizado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/providers']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al actualizar proveedor';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error updating provider:', error);
      },
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/providers']);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.providerForm.get(fieldName);

    if (!field || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field.hasError('email')) {
      return 'Email inválido';
    }

    if (field.hasError('minlength')) {
      return 'El nombre es requerido';
    }

    return '';
  }
}
