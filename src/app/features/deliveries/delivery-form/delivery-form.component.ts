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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { DeliveryService } from '../services/delivery.service';
import { CreateDeliverySchema, UpdateDeliverySchema } from '../services/delivery.validation';
import {
  Delivery,
  CreateDeliveryRequest,
  UpdateDeliveryRequest,
  Client,
} from '../../../core/models';
import { ClientService } from '../../clients/services/client.service';

@Component({
  selector: 'app-delivery-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './delivery-form.component.html',
  styleUrl: './delivery-form.component.scss',
})
export class DeliveryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private deliveryService = inject(DeliveryService);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  deliveryForm: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  deliveryId: string | null = null;

  // Dropdown data
  clients = signal<Client[]>([]);

  // Status options (only for edit mode)
  statusOptions: Array<{ value: string; label: string }> = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_transit', label: 'En Tránsito' },
    { value: 'completed', label: 'Completado' },
    { value: 'failed', label: 'Fallido' },
  ];

  constructor() {
    this.deliveryForm = this.fb.group({
      orderId: ['', Validators.required],
      clientId: ['', Validators.required],
      deliveryAddress: ['', [Validators.required, Validators.minLength(5)]],
      notes: [''],
      // Edit mode only fields
      status: [''],
      deliveredAt: [null],
    });
  }

  ngOnInit(): void {
    // Load clients for dropdown
    this.loadClients();

    // Check if we're in edit mode
    this.deliveryId = this.route.snapshot.paramMap.get('id');

    if (this.deliveryId) {
      this.isEditMode.set(true);
      this.loadDelivery(this.deliveryId);
    }
  }

  /**
   * Load clients for dropdown
   */
  loadClients(): void {
    this.clientService.listClients({ limit: 1000, offset: 0 }).subscribe({
      next: (response) => {
        this.clients.set(response.data);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.snackBar.open('Error al cargar clientes', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  /**
   * Load delivery data for editing
   */
  loadDelivery(id: string): void {
    this.loading.set(true);

    this.deliveryService.getDelivery(id).subscribe({
      next: (delivery) => {
        this.deliveryForm.patchValue({
          orderId: delivery.orderId,
          clientId: delivery.clientId,
          deliveryAddress: delivery.deliveryAddress,
          notes: delivery.notes || '',
          status: delivery.status,
          deliveredAt: delivery.deliveredAt ? new Date(delivery.deliveredAt) : null,
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar entrega', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading delivery:', error);
        this.router.navigate(['/deliveries']);
      },
    });
  }

  /**
   * Submit form (create or update)
   */
  onSubmit(): void {
    if (this.deliveryForm.invalid) {
      this.deliveryForm.markAllAsTouched();
      return;
    }

    // Prepare form data
    const formData = this.deliveryForm.value;

    // Format deliveredAt if present
    if (formData.deliveredAt) {
      formData.deliveredAt = new Date(formData.deliveredAt).toISOString();
    }

    try {
      if (this.isEditMode()) {
        // For update, only send updateable fields
        const updateData: UpdateDeliveryRequest = {
          status: formData.status,
          deliveredAt: formData.deliveredAt || undefined,
          notes: formData.notes || undefined,
        };
        UpdateDeliverySchema.parse(updateData);
        this.updateDelivery(updateData);
      } else {
        // For create, send creation fields
        const createData: CreateDeliveryRequest = {
          orderId: formData.orderId,
          clientId: formData.clientId,
          deliveryAddress: formData.deliveryAddress,
          notes: formData.notes || undefined,
        };
        CreateDeliverySchema.parse(createData);
        this.createDelivery(createData);
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
   * Create new delivery
   */
  createDelivery(data: CreateDeliveryRequest): void {
    this.loading.set(true);

    this.deliveryService.createDelivery(data).subscribe({
      next: (delivery) => {
        this.loading.set(false);
        this.snackBar.open('Entrega creada exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/deliveries']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al crear entrega';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error creating delivery:', error);
      },
    });
  }

  /**
   * Update existing delivery
   */
  updateDelivery(data: UpdateDeliveryRequest): void {
    if (!this.deliveryId) return;

    this.loading.set(true);

    this.deliveryService.updateDelivery(this.deliveryId, data).subscribe({
      next: (delivery) => {
        this.loading.set(false);
        this.snackBar.open('Entrega actualizada exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/deliveries']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al actualizar entrega';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error updating delivery:', error);
      },
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/deliveries']);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.deliveryForm.get(fieldName);

    if (!field || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field.hasError('minlength')) {
      return 'La dirección debe tener al menos 5 caracteres';
    }

    return '';
  }
}
