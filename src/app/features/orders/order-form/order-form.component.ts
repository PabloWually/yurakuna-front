import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { OrderService } from '../services/order.service';
import { CreateOrderSchema, UpdateOrderSchema } from '../services/order.validation';
import {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  Client,
  Product,
  OrderItem,
} from '../../../core/models';
import { ClientService } from '../../clients/services/client.service';
import { ProductService } from '../../products/services/product.service';
import { TokenService } from '../../../core/auth/services/token.service';

@Component({
  selector: 'app-order-form',
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
    MatTableModule,
  ],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss',
})
export class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private clientService = inject(ClientService);
  private productService = inject(ProductService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  orderForm: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  orderId: string | null = null;

  // Dropdown data
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);

  // Order total
  orderTotal = signal(0);

  // Status options (only for edit mode)
  statusOptions: Array<{ value: string; label: string }> = [
    { value: 'draft', label: 'Borrador' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  // Line items table columns
  itemColumns = ['product', 'quantity', 'price', 'total', 'actions'];

  constructor() {
    this.orderForm = this.fb.group({
      clientId: ['', Validators.required],
      items: this.fb.array([]),
      status: [''], // Only for edit mode
    });
  }

  ngOnInit(): void {
    // Load clients and products for dropdowns
    this.loadClients();
    this.loadProducts();

    // Check if we're in edit mode
    this.orderId = this.route.snapshot.paramMap.get('id');

    if (this.orderId) {
      this.isEditMode.set(true);
      this.loadOrder(this.orderId);
    } else {
      // Add one empty line item for new orders
      this.addItem();
    }
  }

  /**
   * Get items FormArray
   */
  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  /**
   * Create a new item FormGroup
   */
  createItemFormGroup(item?: OrderItem): FormGroup {
    const product = item?.productId ? this.products().find((p) => p.id === item.productId) : null;

    const group = this.fb.group({
      productId: [item?.productId || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      pricePerUnit: [item?.pricePerUnit || product?.pricePerUnit || 0],
      productName: [item?.productName || product?.name || ''],
    });

    // Listen to product changes to auto-fill price
    group.get('productId')?.valueChanges.subscribe((productId) => {
      const selectedProduct = this.products().find((p) => p.id === productId);
      if (selectedProduct) {
        group.patchValue({
          pricePerUnit: selectedProduct.pricePerUnit,
          productName: selectedProduct.name,
        });
        this.calculateTotal();
      }
    });

    // Listen to quantity changes to recalculate total
    group.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });

    return group;
  }

  /**
   * Add a new line item
   */
  addItem(): void {
    this.items.push(this.createItemFormGroup());
  }

  /**
   * Remove a line item
   */
  removeItem(index: number): void {
    this.items.removeAt(index);
    this.calculateTotal();
  }

  /**
   * Calculate line total
   */
  getLineTotal(index: number): number {
    const item = this.items.at(index).value;
    return (item.quantity || 0) * (item.pricePerUnit || 0);
  }

  /**
   * Calculate order total
   */
  calculateTotal(): void {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      total += this.getLineTotal(i);
    }
    this.orderTotal.set(total);
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
   * Load products for dropdown
   */
  loadProducts(): void {
    this.productService.listProducts({ limit: 1000, offset: 0 }).subscribe({
      next: (response) => {
        this.products.set(response.data);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error al cargar productos', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  /**
   * Load order data for editing
   */
  loadOrder(id: string): void {
    this.loading.set(true);

    this.orderService.getOrder(id).subscribe({
      next: (order) => {
        // Populate form
        this.orderForm.patchValue({
          clientId: order.clientId,
          status: order.status,
        });

        // Clear existing items and add order items
        this.items.clear();
        order.items.forEach((item) => {
          this.items.push(this.createItemFormGroup(item));
        });

        this.calculateTotal();
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar pedido', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading order:', error);
        this.router.navigate(['/orders']);
      },
    });
  }

  /**
   * Submit form (create or update)
   */
  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    if (this.items.length === 0) {
      this.snackBar.open('Debe agregar al menos un producto', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const formData = this.orderForm.value;

    try {
      if (this.isEditMode()) {
        // For update, only send status
        const updateData: UpdateOrderRequest = {
          status: formData.status,
        };
        UpdateOrderSchema.parse(updateData);
        this.updateOrder(updateData);
      } else {
        // For create, send client, items, and creator
        const userId = this.tokenService.getUserIdFromToken();
        if (!userId) {
          this.snackBar.open('No se pudo obtener el ID del usuario', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          return;
        }

        const createData: CreateOrderRequest = {
          clientId: formData.clientId,
          createdById: userId,
          items: formData.items.map((item: OrderItem) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        };
        CreateOrderSchema.parse(createData);
        this.createOrder(createData);
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
   * Create new order
   */
  createOrder(data: CreateOrderRequest): void {
    this.loading.set(true);

    this.orderService.createOrder(data).subscribe({
      next: (order) => {
        this.loading.set(false);
        this.snackBar.open('Pedido creado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al crear pedido';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error creating order:', error);
      },
    });
  }

  /**
   * Update existing order
   */
  updateOrder(data: UpdateOrderRequest): void {
    if (!this.orderId) return;

    this.loading.set(true);

    this.orderService.updateOrder(this.orderId, data).subscribe({
      next: (order) => {
        this.loading.set(false);
        this.snackBar.open('Pedido actualizado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al actualizar pedido';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error updating order:', error);
      },
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/orders']);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.orderForm.get(fieldName);

    if (!field || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }

    return '';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number | undefined | null): string {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return '€0.00';
    }
    return `€${Number(amount).toFixed(2)}`;
  }
}
