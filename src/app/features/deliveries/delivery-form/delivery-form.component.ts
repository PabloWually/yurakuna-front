import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  AbstractControl,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';

import { DeliveryService } from '../services/delivery.service';
import { CreateDeliverySchema, UpdateDeliverySchema } from '../services/delivery.validation';
import {
  DeliveryWithItems,
  DeliveryItem,
  CreateDeliveryRequest,
  UpdateDeliveryRequest,
  Client,
  OrderItem,
  Order,
} from '../../../core/models';
import { ClientService } from '../../clients/services/client.service';
import { OrderService } from '../../orders/services/order.service';

@Component({
  selector: 'app-delivery-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    MatCheckboxModule,
    MatTableModule,
    MatDividerModule,
  ],
  templateUrl: './delivery-form.component.html',
  styleUrl: './delivery-form.component.scss',
})
export class DeliveryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private deliveryService = inject(DeliveryService);
  private clientService = inject(ClientService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  deliveryForm: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  deliveryId: string | null = null;
  currentDeliveryStatus = signal<string>('');

  // Loaded delivery (edit mode)
  currentDelivery = signal<DeliveryWithItems | null>(null);

  // Dropdown data
  clients = signal<Client[]>([]);
  confirmedOrders = signal<Order[]>([]);
  ordersLoading = signal(false);

  // Order items for create mode
  orderItems = signal<OrderItem[]>([]);
  orderLoading = signal(false);
  orderLoaded = signal(false);

  // Reactive list of item controls for mat-table dataSource
  itemControlsList = signal<AbstractControl[]>([]);

  // Status options (only for edit mode)
  statusOptions: Array<{ value: string; label: string }> = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_transit', label: 'En Tránsito' },
    { value: 'completed', label: 'Completado' },
    { value: 'failed', label: 'Fallido' },
  ];

  // Line items table columns (create mode only)
  itemColumns = ['include', 'product', 'maxQty', 'quantity'];

  constructor() {
    this.deliveryForm = this.fb.group({
      orderId: ['', Validators.required],
      clientId: ['', Validators.required],
      deliveryAddress: ['', [Validators.required, Validators.minLength(5)]],
      notes: [''],
      items: this.fb.array([]),
      // Edit mode only fields
      status: [''],
      deliveredAt: [null],
    });
  }

  ngOnInit(): void {
    // Load clients and confirmed orders for dropdowns
    this.loadClients();
    this.loadConfirmedOrders();

    // Check if we're in edit mode
    this.deliveryId = this.route.snapshot.paramMap.get('id');

    if (this.deliveryId) {
      this.isEditMode.set(true);
      this.loadDelivery(this.deliveryId);
    }
  }

  /**
   * Get items FormArray
   */
  get items(): FormArray {
    return this.deliveryForm.get('items') as FormArray;
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
   * Load confirmed orders for dropdown
   */
  loadConfirmedOrders(): void {
    this.ordersLoading.set(true);
    this.orderService
      .listOrders({
        limit: 1000,
        offset: 0,
        filters: [{ field: 'status', value: 'confirmed', operator: 'eq' }],
      })
      .subscribe({
        next: (response) => {
          this.confirmedOrders.set(response.data);
          this.ordersLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading confirmed orders:', error);
          this.ordersLoading.set(false);
          this.snackBar.open('Error al cargar pedidos confirmados', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  /**
   * Load order items (create mode — triggered on order selection)
   */
  loadOrderItems(): void {
    const orderId = this.deliveryForm.get('orderId')?.value;
    if (!orderId) return;

    this.orderLoading.set(true);
    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.orderItems.set(order.items);
        this.deliveryForm.patchValue({ clientId: order.clientId });
        this.buildItemsFormArray(order.items);
        this.orderLoaded.set(true);
        this.orderLoading.set(false);
      },
      error: () => {
        this.orderLoading.set(false);
        this.snackBar.open('No se encontró el pedido', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  /**
   * Build items FormArray from order items
   */
  buildItemsFormArray(items: OrderItem[]): void {
    this.items.clear();
    items.forEach((item) => {
      const group = this.fb.group({
        include: [true],
        orderItemId: [item.id || ''],
        productId: [item.productId],
        productName: [item.productName || item.productId],
        maxQuantity: [item.quantity],
        quantity: [
          item.quantity,
          [Validators.required, Validators.min(0.01), Validators.max(item.quantity)],
        ],
      });
      this.items.push(group);
    });
    this.itemControlsList.set([...this.items.controls]);
  }

  /**
   * Load delivery data for editing
   */
  loadDelivery(id: string): void {
    this.loading.set(true);

    this.deliveryService.getDelivery(id).subscribe({
      next: (delivery) => {
        this.currentDelivery.set(delivery);
        this.currentDeliveryStatus.set(delivery.status);
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
   * Check if items can be edited (delivery is in pending status)
   */
  canEditItems(): boolean {
    return this.isEditMode() && this.currentDeliveryStatus() === 'pending';
  }

  /**
   * Whether to show the 'completed' status warning banner
   */
  showCompletedWarning(): boolean {
    const currentStatus = this.currentDelivery()?.status;
    const selectedStatus = this.deliveryForm.get('status')?.value;
    return selectedStatus === 'completed' || currentStatus === 'completed';
  }

  /**
   * Submit form (create or update)
   */
  onSubmit(): void {
    if (this.deliveryForm.invalid) {
      this.deliveryForm.markAllAsTouched();
      return;
    }

    const formData = this.deliveryForm.value;

    // Format deliveredAt if present
    if (formData.deliveredAt) {
      formData.deliveredAt = new Date(formData.deliveredAt).toISOString();
    }

    try {
      if (this.isEditMode()) {
        const updateData: UpdateDeliveryRequest = {
          status: formData.status,
          deliveredAt: formData.deliveredAt || undefined,
          notes: formData.notes || undefined,
        };
        UpdateDeliverySchema.parse(updateData);
        this.updateDelivery(updateData);
      } else {
        // Build items from checked rows only
        const selectedItems = this.items.controls
          .filter((ctrl) => ctrl.get('include')?.value)
          .map((ctrl) => ({
            orderItemId: ctrl.get('orderItemId')?.value,
            productId: ctrl.get('productId')?.value,
            quantity: Number(ctrl.get('quantity')?.value),
          }));

        if (selectedItems.length === 0) {
          this.snackBar.open('Debe seleccionar al menos un producto', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          return;
        }

        const createData: CreateDeliveryRequest = {
          orderId: formData.orderId,
          clientId: formData.clientId,
          deliveryAddress: formData.deliveryAddress,
          notes: formData.notes || undefined,
          items: selectedItems,
        };
        CreateDeliverySchema.parse(createData);
        this.createDelivery(createData);
      }
    } catch (error: any) {
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
      next: () => {
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
      next: () => {
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

  // ===== ITEM MANAGEMENT FOR EDIT MODE =====

  /**
   * Update item in existing delivery (pending only)
   */
  updateDeliveryItemAtIndex(index: number): void {
    if (!this.deliveryId) return;

    const delivery = this.currentDelivery();
    if (!delivery || index >= delivery.items.length) return;

    const itemToUpdate = delivery.items[index];
    // Get the updated quantity from the delivery item (modified by ngModel binding)
    const updatedQuantity = Number(itemToUpdate.quantity) || 0;

    if (!updatedQuantity || updatedQuantity <= 0) {
      this.snackBar.open('La cantidad debe ser mayor a 0', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const updateData = {
      quantity: updatedQuantity,
    };

    this.loading.set(true);
    this.deliveryService.updateDeliveryItem(this.deliveryId, itemToUpdate.id, updateData).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        // Reload the delivery to refresh items
        this.loadDelivery(this.deliveryId!);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al actualizar producto';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error updating item:', error);
      },
    });
  }

  /**
   * Delete item from existing delivery (pending only)
   */
  deleteDeliveryItemAtIndex(index: number): void {
    if (!this.deliveryId) return;

    const delivery = this.currentDelivery();
    if (!delivery || index >= delivery.items.length) return;

    const itemToDelete = delivery.items[index];

    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    this.loading.set(true);
    this.deliveryService.deleteDeliveryItem(this.deliveryId, itemToDelete.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        // Reload the delivery to refresh items
        this.loadDelivery(this.deliveryId!);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al eliminar producto';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error deleting item:', error);
      },
    });
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

  /**
   * Get item quantity error for a row
   */
  getItemQuantityError(ctrl: AbstractControl): string {
    const quantityCtrl = ctrl.get('quantity');
    if (!quantityCtrl || !quantityCtrl.touched) return '';
    if (quantityCtrl.hasError('required')) return 'Requerido';
    if (quantityCtrl.hasError('min')) return 'Mín 0.01';
    if (quantityCtrl.hasError('max')) return 'Excede máximo';
    return '';
  }

  /**
   * Returns the existing delivery items (for edit mode read-only display)
   */
  existingItems(): DeliveryItem[] {
    return this.currentDelivery()?.items ?? [];
  }
}
