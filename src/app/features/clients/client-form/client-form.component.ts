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

import { ClientService } from '../services/client.service';
import { CreateClientSchema, UpdateClientSchema } from '../services/client.validation';
import { Client, CreateClientRequest, UpdateClientRequest } from '../../../core/models';

@Component({
  selector: 'app-client-form',
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
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  clientForm: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  clientId: string | null = null;

  constructor() {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.clientId = this.route.snapshot.paramMap.get('id');

    if (this.clientId) {
      this.isEditMode.set(true);
      this.loadClient(this.clientId);
    }
  }

  /**
   * Load client data for editing
   */
  loadClient(id: string): void {
    this.loading.set(true);

    this.clientService.getClient(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          name: client.name,
          email: client.email,
          phone: client.phone || '',
          address: client.address || '',
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar cliente', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading client:', error);
        this.router.navigate(['/clients']);
      },
    });
  }

  /**
   * Submit form (create or update)
   */
  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    // Validate with Zod
    const formData = this.clientForm.value;

    try {
      if (this.isEditMode()) {
        // Validate update data
        UpdateClientSchema.parse(formData);
        this.updateClient(formData);
      } else {
        // Validate create data
        CreateClientSchema.parse(formData);
        this.createClient(formData);
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
   * Create new client
   */
  createClient(data: CreateClientRequest): void {
    this.loading.set(true);

    this.clientService.createClient(data).subscribe({
      next: (client) => {
        this.loading.set(false);
        this.snackBar.open('Cliente creado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/clients']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al crear cliente';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error creating client:', error);
      },
    });
  }

  /**
   * Update existing client
   */
  updateClient(data: UpdateClientRequest): void {
    if (!this.clientId) return;

    this.loading.set(true);

    this.clientService.updateClient(this.clientId, data).subscribe({
      next: (client) => {
        this.loading.set(false);
        this.snackBar.open('Cliente actualizado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/clients']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al actualizar cliente';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error updating client:', error);
      },
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/clients']);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.clientForm.get(fieldName);

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
