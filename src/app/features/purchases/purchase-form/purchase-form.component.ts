import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  AbstractControl,
  ReactiveFormsModule,
  Validators,
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
import { MatTableModule } from '@angular/material/table';

import { PurchaseService } from '../services/purchase.service';
import { CreatePurchaseSchema, UpdatePurchaseSchema } from '../services/purchase.validation';
import {
  Purchase,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  Provider,
  Product,
  PurchaseItem,
} from '../../../core/models';
import { ProviderService } from '../../providers/services/provider.service';
import { ProductService } from '../../products/services/product.service';
import { TokenService } from '../../../core/auth/services/token.service';

@Component({
  selector: 'app-purchase-form',
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
  templateUrl: './purchase-form.component.html',
  styleUrl: './purchase-form.component.scss',
})
export class PurchaseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private purchaseService = inject(PurchaseService);
  private providerService = inject(ProviderService);
  private productService = inject(ProductService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  purchaseForm: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  purchaseId: string | null = null;
  currentPurchaseStatus = signal<string>('');

  // Dropdown data
  providers = signal<Provider[]>([]);
  products = signal<Product[]>([]);

  // Purchase total
  purchaseTotal = signal(0);

  // Reactive list of item controls for mat-table dataSource
  itemControlsList = signal<AbstractControl[]>([]);

  // Track selected product IDs to prevent duplicates
  selectedProductIds = signal<Set<string>>(new Set());

  // Status options (only for edit mode)
  statusOptions: Array<{ value: string; label: string }> = [
    { value: 'draft', label: 'Borrador' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  // Line items table columns
  itemColumns = ['product', 'quantity', 'price', 'total', 'actions'];

  constructor() {
    this.purchaseForm = this.fb.group({
      providerId: ['', Validators.required],
      items: this.fb.array([]),
      status: [''], // Only for edit mode
    });
  }

  ngOnInit(): void {
    // Load providers and products for dropdowns
    this.loadProviders();
    this.loadProducts();

    // Check if we're in edit mode
    this.purchaseId = this.route.snapshot.paramMap.get('id');

    if (this.purchaseId) {
      this.isEditMode.set(true);
      this.loadPurchase(this.purchaseId);
    } else {
      // Add one empty line item for new purchases
      this.addItem();
    }
  }

  /**
   * Get items FormArray
   */
  get items(): FormArray {
    return this.purchaseForm.get('items') as FormArray;
  }

  /**
   * Create an item FormGroup
   */
  createItemFormGroup(item?: PurchaseItem): FormGroup {
    const product = item?.productId ? this.products().find((p) => p.id === item.productId) : null;

    const group = this.fb.group({
      id: [item?.id || ''], // Item ID (for edit mode)
      productId: [item?.productId || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(0)]],
      pricePerUnit: [
        item?.pricePerUnit ?? product?.pricePerUnit ?? 0,
        [Validators.required, Validators.min(0)],
      ],
      productName: [item?.productName || product?.name || ''],
    });

    // Listen to product changes to auto-fill price (but keep it editable)
    group.get('productId')?.valueChanges.subscribe((productId) => {
      const selectedProduct = this.products().find((p) => p.id === productId);
      if (selectedProduct) {
        group.patchValue({
          pricePerUnit: selectedProduct.pricePerUnit,
          productName: selectedProduct.name,
        });
        this.calculateTotal();
      }
      this.refreshSelectedProductIds();
    });

    // Listen to quantity and pricePerUnit changes to recalculate total
    group.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });

    group.get('pricePerUnit')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });

    // Listen to product changes to auto-fill price (but keep it editable)
    group.get('productId')?.valueChanges.subscribe((productId) => {
      const selectedProduct = this.products().find((p) => p.id === productId);
      if (selectedProduct) {
        group.patchValue({
          pricePerUnit: selectedProduct.pricePerUnit,
          productName: selectedProduct.name,
        });
        this.calculateTotal();
      }
      this.refreshSelectedProductIds();
    });

    // Listen to quantity and pricePerUnit changes to recalculate total
    group.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });

    group.get('pricePerUnit')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });

    return group;
  }

  /**
   * Add a new line item
   */
  addItem(): void {
    this.items.push(this.createItemFormGroup());
    this.itemControlsList.set([...this.items.controls]);
    this.refreshSelectedProductIds();
  }

  /**
   * Remove a line item
   */
  removeItem(index: number): void {
    this.items.removeAt(index);
    this.itemControlsList.set([...this.items.controls]);
    this.refreshSelectedProductIds();
    this.calculateTotal();
  }

  /**
   * Refresh the set of selected product IDs (to prevent duplicates)
   */
  refreshSelectedProductIds(): void {
    const ids = new Set(
      this.items.controls
        .map((ctrl) => ctrl.get('productId')?.value as string)
        .filter((id) => !!id),
    );
    this.selectedProductIds.set(ids);
  }

  /**
   * Get products available for a given row (excludes products selected in other rows)
   */
  getAvailableProducts(currentIndex: number): Product[] {
    const currentSelection = this.items.at(currentIndex)?.get('productId')?.value as string;
    const selected = this.selectedProductIds();
    return this.products().filter((p) => p.id === currentSelection || !selected.has(p.id));
  }

  /**
   * Calculate line total for a specific FormArray index
   */
  getLineTotal(index: number): number {
    const item = this.items.at(index).value;
    return (Number(item.quantity) || 0) * (Number(item.pricePerUnit) || 0);
  }

  /**
   * Calculate line total from an AbstractControl directly.
   * Used in the template: *matCellDef does NOT expose `index` in its context,
   * so we pass the control reference instead of relying on the row index.
   */
  getLineTotalFromControl(ctrl: AbstractControl): number {
    const qty = Number(ctrl.get('quantity')?.value) || 0;
    const price = Number(ctrl.get('pricePerUnit')?.value) || 0;
    return qty * price;
  }

  /**
   * Calculate purchase total
   */
  calculateTotal(): void {
    let total = 0;
    for (const ctrl of this.items.controls) {
      const qty = Number(ctrl.get('quantity')?.value) || 0;
      const price = Number(ctrl.get('pricePerUnit')?.value) || 0;
      total += qty * price;
    }
    this.purchaseTotal.set(total);
  }

  /**
   * Load providers for dropdown
   */
  loadProviders(): void {
    this.providerService.listProviders({ limit: 1000, offset: 0 }).subscribe({
      next: (response) => {
        this.providers.set(response.data);
      },
      error: (error) => {
        console.error('Error loading providers:', error);
        this.snackBar.open('Error al cargar proveedores', 'Cerrar', {
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
   * Load purchase data for editing
   */
  loadPurchase(id: string): void {
    this.loading.set(true);

    this.purchaseService.getPurchase(id).subscribe({
      next: (purchase) => {
        // Store the current status
        this.currentPurchaseStatus.set(purchase.status);

        // Populate form
        this.purchaseForm.patchValue({
          providerId: purchase.providerId,
          status: purchase.status,
        });

        // Clear existing items and add purchase items
        this.items.clear();
        purchase.items.forEach((item) => {
          this.items.push(this.createItemFormGroup(item));
        });
        this.itemControlsList.set([...this.items.controls]);
        this.refreshSelectedProductIds();

        this.calculateTotal();
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar compra', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading purchase:', error);
        this.router.navigate(['/purchases']);
      },
    });
  }

  /**
   * Check if items can be edited (purchase is in draft status)
   */
  canEditItems(): boolean {
    return this.isEditMode() && this.currentPurchaseStatus() === 'draft';
  }

  /**
   * Submit form (create or update)
   */
  onSubmit(): void {
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      return;
    }

    if (!this.isEditMode() && this.items.length === 0) {
      this.snackBar.open('Debe agregar al menos un producto', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const formData = this.purchaseForm.value;
    console.log('form data', formData);

    try {
      if (this.isEditMode()) {
        // For update, only send status
        const updateData: UpdatePurchaseRequest = {
          status: formData.status,
        };
        UpdatePurchaseSchema.parse(updateData);
        this.updatePurchase(updateData);
      } else {
        // For create, send provider, items, and creator
        const userId = this.tokenService.getUserIdFromToken();
        if (!userId) {
          this.snackBar.open('No se pudo obtener el ID del usuario', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          return;
        }

        const createData: CreatePurchaseRequest = {
          providerId: formData.providerId,
          createdById: userId,
          items: formData.items.map((item: PurchaseItem) => ({
            productId: item.productId,
            quantity: item.quantity,
            pricePerUnit: +item.pricePerUnit,
          })),
        };
        CreatePurchaseSchema.parse(createData);
        this.createPurchase(createData);
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
   * Create new purchase
   */
  createPurchase(data: CreatePurchaseRequest): void {
    this.loading.set(true);
    console.log('create purchase', data);

    this.purchaseService.createPurchase(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Compra creada exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/purchases']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al crear compra';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error creating purchase:', error);
      },
    });
  }

  /**
   * Update existing purchase
   */
  updatePurchase(data: UpdatePurchaseRequest): void {
    if (!this.purchaseId) return;

    this.loading.set(true);

    this.purchaseService.updatePurchase(this.purchaseId, data).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Compra actualizada exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/purchases']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al actualizar compra';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error updating purchase:', error);
      },
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/purchases']);
  }

  // ===== ITEM MANAGEMENT FOR EDIT MODE =====

  /**
   * Add item to existing purchase (draft only)
   */
  addItemToPurchase(): void {
    if (!this.purchaseId) return;

    const lastItemForm = this.items.at(this.items.length - 1);
    if (!lastItemForm || lastItemForm.invalid) {
      this.snackBar.open('Por favor completa el último producto antes de agregar otro', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const itemData = {
      productId: lastItemForm.get('productId')?.value,
      quantity: lastItemForm.get('quantity')?.value,
      pricePerUnit: lastItemForm.get('pricePerUnit')?.value,
    };

    this.loading.set(true);
    this.purchaseService.addPurchaseItem(this.purchaseId, itemData).subscribe({
      next: (newItem) => {
        this.loading.set(false);
        // Reload the purchase to refresh items with IDs from server
        this.loadPurchase(this.purchaseId!);
        this.snackBar.open('Producto agregado exitosamente', 'Cerrar', {
          duration: 3000,
        });
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al agregar producto';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error adding item:', error);
      },
    });
  }

  /**
   * Save item in existing purchase (add if new, update if existing - draft only)
   */
  updatePurchaseItemAtIndex(index: number): void {
    if (!this.purchaseId) return;

    const itemControl = this.items.at(index);
    const itemId = itemControl.get('id')?.value;

    if (itemControl.invalid) {
      this.snackBar.open('Por favor completa los datos del producto correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    // If no ID, it's a new item - use add
    if (!itemId) {
      const itemData = {
        productId: itemControl.get('productId')?.value,
        quantity: +itemControl.get('quantity')?.value,
        pricePerUnit: +itemControl.get('pricePerUnit')?.value,
      };

      this.loading.set(true);
      this.purchaseService.addPurchaseItem(this.purchaseId, itemData).subscribe({
        next: (newItem) => {
          this.loading.set(false);
          // Reload the purchase to refresh items with IDs from server
          this.loadPurchase(this.purchaseId!);
          this.snackBar.open('Producto agregado exitosamente', 'Cerrar', {
            duration: 3000,
          });
        },
        error: (error) => {
          this.loading.set(false);
          const errorMessage = error.error?.message || 'Error al agregar producto';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          console.error('Error adding item:', error);
        },
      });
      return;
    }

    // If has ID, it's an existing item - use update
    const itemData = {
      quantity: +itemControl.get('quantity')?.value,
      pricePerUnit: +itemControl.get('pricePerUnit')?.value,
    };

    this.loading.set(true);
    this.purchaseService.updatePurchaseItem(this.purchaseId, itemId, itemData).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', {
          duration: 3000,
        });
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
   * Delete item from existing purchase (draft only)
   */
  deletePurchaseItemAtIndex(index: number): void {
    if (!this.purchaseId) return;

    const itemControl = this.items.at(index);
    const itemId = itemControl.get('id')?.value;

    if (!itemId) {
      this.snackBar.open('No se puede eliminar este producto', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    this.loading.set(true);
    this.purchaseService.deletePurchaseItem(this.purchaseId, itemId).subscribe({
      next: () => {
        this.loading.set(false);
        // Reload the purchase to refresh items
        this.loadPurchase(this.purchaseId!);
        this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', {
          duration: 3000,
        });
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
    const field = this.purchaseForm.get(fieldName);

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
      return '$0.00';
    }
    return `$${Number(amount).toFixed(2)}`;
  }
}
