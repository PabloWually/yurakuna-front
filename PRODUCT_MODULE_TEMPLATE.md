# Product Module Template Guide

This document provides a complete blueprint for implementing CRUD modules in the Yurakuna application. The **Products Module** serves as the reference implementation that should be replicated for:

- Clients
- Orders
- Deliveries
- Stock
- Shrinkage
- Users

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Implementation Checklist](#implementation-checklist)
4. [Service Layer Pattern](#service-layer-pattern)
5. [Validation Layer Pattern](#validation-layer-pattern)
6. [List Component Pattern](#list-component-pattern)
7. [Form Component Pattern](#form-component-pattern)
8. [Routing Pattern](#routing-pattern)
9. [Module-Specific Customizations](#module-specific-customizations)

---

## Architecture Overview

Each CRUD module follows these principles:

- **Standalone Components**: No NgModules, all components are standalone
- **Signal-based State**: Uses Angular Signals for reactive state management
- **Material Design**: Consistent UI with Angular Material components
- **Criteria Pattern**: Backend uses POST /api/\*/list with pagination and filters
- **Zod Validation**: Client-side validation matching backend schemas
- **Lazy Loading**: All feature routes are lazy-loaded for performance
- **DRY Principle**: Reusable patterns across all modules

---

## File Structure

```
src/app/features/{module-name}/
├── services/
│   ├── {entity}.service.ts          # CRUD operations
│   └── {entity}.validation.ts       # Zod schemas
├── {entity}-list/
│   ├── {entity}-list.component.ts   # List/table component
│   ├── {entity}-list.component.html # List template
│   └── {entity}-list.component.scss # List styles
├── {entity}-form/
│   ├── {entity}-form.component.ts   # Create/Edit form component
│   ├── {entity}-form.component.html # Form template
│   └── {entity}-form.component.scss # Form styles
└── {module-name}.routes.ts          # Feature routing
```

**Example for Products:**

```
src/app/features/products/
├── services/
│   ├── product.service.ts
│   └── product.validation.ts
├── product-list/
│   ├── product-list.component.ts
│   ├── product-list.component.html
│   └── product-list.component.scss
├── product-form/
│   ├── product-form.component.ts
│   ├── product-form.component.html
│   └── product-form.component.scss
└── products.routes.ts
```

---

## Implementation Checklist

### Phase 1: Service Layer

- [ ] Create `{entity}.service.ts` with CRUD methods
- [ ] Create `{entity}.validation.ts` with Zod schemas
- [ ] Reference `/API_DOC.md` for exact field requirements
- [ ] Add models to `/src/app/core/models/` if not already present

### Phase 2: List Component

- [ ] Create `{entity}-list.component.ts` with table logic
- [ ] Create `{entity}-list.component.html` with Material table
- [ ] Create `{entity}-list.component.scss` with styles
- [ ] Implement search with debounce
- [ ] Implement pagination with MatPaginator
- [ ] Implement delete with confirmation dialog
- [ ] Add edit navigation
- [ ] Add empty state

### Phase 3: Form Component

- [ ] Create `{entity}-form.component.ts` with form logic
- [ ] Create `{entity}-form.component.html` with reactive form
- [ ] Create `{entity}-form.component.scss` with styles
- [ ] Implement dual mode (create/edit) based on route param
- [ ] Add Zod validation before API call
- [ ] Add error handling and success notifications
- [ ] Add loading states

### Phase 4: Routing

- [ ] Create `{module-name}.routes.ts` with 3 routes (list, new, edit)
- [ ] Add route to `/src/app/app.routes.ts` under admin layout
- [ ] Add navigation link to sidebar in `admin-layout.component.html`

### Phase 5: Testing

- [ ] Test create flow
- [ ] Test list with pagination
- [ ] Test search functionality
- [ ] Test edit flow
- [ ] Test delete with confirmation
- [ ] Test validation errors
- [ ] Test empty states

---

## Service Layer Pattern

### File: `services/{entity}.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Entity,
  CreateEntityRequest,
  UpdateEntityRequest,
  Criteria,
  PaginatedResponse,
} from '../../../core/models';

@Injectable({
  providedIn: 'root',
})
export class EntityService {
  private api = inject(ApiService);
  private readonly BASE_PATH = '/entities'; // Change to match API endpoint

  /**
   * Get a single entity by ID
   */
  getEntity(id: string): Observable<Entity> {
    return this.api.get<Entity>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * List entities with pagination and filters
   * Uses POST /entities/list with Criteria pattern
   */
  listEntities(criteria: Criteria): Observable<PaginatedResponse<Entity>> {
    return this.api.post<PaginatedResponse<Entity>>(`${this.BASE_PATH}/list`, criteria);
  }

  /**
   * Create a new entity
   */
  createEntity(data: CreateEntityRequest): Observable<Entity> {
    return this.api.post<Entity>(this.BASE_PATH, data);
  }

  /**
   * Update an existing entity
   */
  updateEntity(id: string, data: UpdateEntityRequest): Observable<Entity> {
    return this.api.patch<Entity>(`${this.BASE_PATH}/${id}`, data);
  }

  /**
   * Delete an entity
   */
  deleteEntity(id: string): Observable<void> {
    return this.api.delete<void>(`${this.BASE_PATH}/${id}`);
  }
}
```

**Key Points:**

- Use dependency injection with `inject()` (modern Angular pattern)
- All methods return Observables
- Use typed responses from `core/models`
- BASE_PATH matches the API endpoint from API_DOC.md
- List method uses POST with Criteria pattern (not GET)

---

## Validation Layer Pattern

### File: `services/{entity}.validation.ts`

```typescript
import { z } from 'zod';

/**
 * Zod schemas for entity validation
 * These match the API requirements from API_DOC.md
 */

// Create entity schema
export const CreateEntitySchema = z.object({
  field1: z.string().min(1, 'Field is required'),
  field2: z.number().positive('Must be positive'),
  field3: z.enum(['option1', 'option2', 'option3']),
  optionalField: z.string().optional(),
});

// Update entity schema (all fields optional)
export const UpdateEntitySchema = z.object({
  field1: z.string().min(1, 'Field is required').optional(),
  field2: z.number().positive('Must be positive').optional(),
  field3: z.enum(['option1', 'option2', 'option3']).optional(),
  optionalField: z.string().optional(),
});

// Type inference
export type CreateEntityFormData = z.infer<typeof CreateEntitySchema>;
export type UpdateEntityFormData = z.infer<typeof UpdateEntitySchema>;
```

**Key Points:**

- Reference `/API_DOC.md` for exact field requirements
- Create schema has all required fields
- Update schema makes all fields optional (PATCH semantics)
- Use Spanish error messages for user-facing validation
- Export inferred types for TypeScript type safety

**Common Zod Validators:**

```typescript
z.string().min(1, 'Required'); // Required string
z.string().email('Invalid email'); // Email validation
z.string().optional(); // Optional string
z.number().positive('Must be positive'); // Positive number
z.number().nonnegative('Cannot be negative'); // >= 0
z.number().min(0).max(100); // Range validation
z.enum(['a', 'b', 'c']); // Enum/dropdown
z.date(); // Date field
z.boolean(); // Checkbox
```

---

## List Component Pattern

### File: `{entity}-list/{entity}-list.component.ts`

**Essential Imports:**

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { EntityService } from '../services/entity.service';
import { Entity, Criteria } from '../../../core/models';
```

**Component Structure:**

```typescript
@Component({
  selector: 'app-entity-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
  ],
  templateUrl: './entity-list.component.html',
  styleUrl: './entity-list.component.scss',
})
export class EntityListComponent implements OnInit {
  private entityService = inject(EntityService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // State (using Signals)
  entities = signal<Entity[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  // Search form
  searchForm: FormGroup;

  // Table columns - customize based on entity
  displayedColumns = ['field1', 'field2', 'field3', 'actions'];

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    this.loadEntities();
    this.setupSearchListener();
  }

  /**
   * Setup search input listener with debounce
   */
  setupSearchListener(): void {
    this.searchForm
      .get('search')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex.set(0); // Reset to first page
        this.loadEntities();
      });
  }

  /**
   * Load entities from API
   */
  loadEntities(): void {
    this.loading.set(true);

    const criteria: Criteria = {
      limit: this.pageSize(),
      offset: this.pageIndex() * this.pageSize(),
      filters: [],
    };

    // Add search filter if search term exists
    const searchTerm = this.searchForm.get('search')?.value?.trim();
    if (searchTerm) {
      criteria.filters?.push({
        field: 'name', // Change to appropriate search field
        operator: 'ilike',
        value: `%${searchTerm}%`,
      });
    }

    this.entityService.listEntities(criteria).subscribe({
      next: (response) => {
        this.entities.set(response.data); // API returns 'data' array
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar datos', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading entities:', error);
      },
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadEntities();
  }

  /**
   * Navigate to create page
   */
  createEntity(): void {
    this.router.navigate(['/entities/new']);
  }

  /**
   * Navigate to edit page
   */
  editEntity(entity: Entity): void {
    this.router.navigate(['/entities', entity.id, 'edit']);
  }

  /**
   * Delete entity with confirmation
   */
  deleteEntity(entity: Entity): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar',
        message: `¿Estás seguro de que deseas eliminar "${entity.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.set(true);
        this.entityService.deleteEntity(entity.id).subscribe({
          next: () => {
            this.snackBar.open('Eliminado exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadEntities();
          },
          error: (error) => {
            this.loading.set(false);
            this.snackBar.open('Error al eliminar', 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar'],
            });
            console.error('Error deleting entity:', error);
          },
        });
      }
    });
  }
}

/**
 * Confirm Dialog Component (reusable inline component)
 */
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ data.cancelText }}</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        {{ data.confirmText }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
```

**Key Points:**

- Use Signals for all reactive state
- Debounce search input (300ms) to reduce API calls
- Reset to page 0 when search changes
- Criteria pattern: POST with limit/offset/filters
- Confirmation dialog for destructive actions
- Loading states and error handling
- Spanish messages for user-facing text

---

## Form Component Pattern

### File: `{entity}-form/{entity}-form.component.ts`

**Essential Imports:**

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { EntityService } from '../services/entity.service';
import { CreateEntitySchema, UpdateEntitySchema } from '../services/entity.validation';
import { Entity, CreateEntityRequest, UpdateEntityRequest } from '../../../core/models';
```

**Component Structure:**

```typescript
@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './entity-form.component.html',
  styleUrl: './entity-form.component.scss',
})
export class EntityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private entityService = inject(EntityService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  entityForm: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  entityId: string | null = null;

  constructor() {
    this.entityForm = this.fb.group({
      field1: ['', [Validators.required, Validators.minLength(1)]],
      field2: [0, [Validators.required, Validators.min(0)]],
      field3: ['', Validators.required],
      optionalField: [''],
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.entityId = this.route.snapshot.paramMap.get('id');

    if (this.entityId) {
      this.isEditMode.set(true);
      this.loadEntity(this.entityId);
    }
  }

  /**
   * Load entity data for editing
   */
  loadEntity(id: string): void {
    this.loading.set(true);

    this.entityService.getEntity(id).subscribe({
      next: (entity) => {
        this.entityForm.patchValue({
          field1: entity.field1,
          field2: entity.field2,
          field3: entity.field3,
          optionalField: entity.optionalField || '',
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar datos', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading entity:', error);
        this.router.navigate(['/entities']);
      },
    });
  }

  /**
   * Submit form (create or update)
   */
  onSubmit(): void {
    if (this.entityForm.invalid) {
      this.entityForm.markAllAsTouched();
      return;
    }

    // Validate with Zod
    const formData = this.entityForm.value;

    try {
      if (this.isEditMode()) {
        UpdateEntitySchema.parse(formData);
        this.updateEntity(formData);
      } else {
        CreateEntitySchema.parse(formData);
        this.createEntity(formData);
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
   * Create new entity
   */
  createEntity(data: CreateEntityRequest): void {
    this.loading.set(true);

    this.entityService.createEntity(data).subscribe({
      next: (entity) => {
        this.loading.set(false);
        this.snackBar.open('Creado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/entities']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al crear';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error creating entity:', error);
      },
    });
  }

  /**
   * Update existing entity
   */
  updateEntity(data: UpdateEntityRequest): void {
    if (!this.entityId) return;

    this.loading.set(true);

    this.entityService.updateEntity(this.entityId, data).subscribe({
      next: (entity) => {
        this.loading.set(false);
        this.snackBar.open('Actualizado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/entities']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al actualizar';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error updating entity:', error);
      },
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/entities']);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.entityForm.get(fieldName);

    if (!field || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field.hasError('minlength')) {
      return 'Texto muy corto';
    }

    if (field.hasError('min')) {
      const minValue = field.errors?.['min']?.min;
      return `El valor mínimo es ${minValue}`;
    }

    if (field.hasError('email')) {
      return 'Email inválido';
    }

    return '';
  }
}
```

**Key Points:**

- Dual mode: check route param for `id` to determine create vs edit
- Load existing data in edit mode via `ngOnInit`
- Zod validation before API call (client-side validation)
- Separate methods for create and update
- Cancel button navigates back to list
- Error messages in Spanish
- Loading states during API operations

---

## Routing Pattern

### File: `{module-name}.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const ENTITIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./entity-list/entity-list.component').then((m) => m.EntityListComponent),
    title: 'Entities - Yurakuna',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./entity-form/entity-form.component').then((m) => m.EntityFormComponent),
    title: 'New Entity - Yurakuna',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./entity-form/entity-form.component').then((m) => m.EntityFormComponent),
    title: 'Edit Entity - Yurakuna',
  },
];
```

**Integration in `app.routes.ts`:**

```typescript
{
  path: '',
  component: AdminLayoutComponent,
  canActivate: [authGuard],
  children: [
    // ... other routes
    {
      path: 'entities',
      loadChildren: () =>
        import('./features/entities/entities.routes').then((m) => m.ENTITIES_ROUTES),
    },
  ]
}
```

**Add to Sidebar (`admin-layout.component.html`):**

```html
<a
  mat-list-item
  routerLink="/entities"
  routerLinkActive="active"
  [routerLinkActiveOptions]="{ exact: true }"
>
  <mat-icon matListItemIcon>icon_name</mat-icon>
  <span matListItemTitle>Entities</span>
</a>
```

---

## Module-Specific Customizations

### Clients Module

**Unique Fields:**

- `userId` (optional, FK to User)
- `name`, `email`, `phone`, `address`

**Table Columns:**

```typescript
displayedColumns = ['name', 'email', 'phone', 'actions'];
```

**Search Field:**

```typescript
field: 'name'; // or 'email'
```

**Material Icon:**

```typescript
<mat-icon>people</mat-icon>
```

---

### Orders Module

**Unique Fields:**

- `clientId` (FK to Client)
- `deliveryId` (optional, FK to Delivery)
- `items` (array of OrderItem)
- `totalAmount`
- `status` (enum: pending, confirmed, completed, cancelled)

**Table Columns:**

```typescript
displayedColumns = ['client', 'totalAmount', 'status', 'createdAt', 'actions'];
```

**Complex Features:**

- Order items management (add/remove products)
- Total calculation
- Status badges with colors
- Client dropdown/autocomplete

**Material Icon:**

```typescript
<mat-icon>shopping_cart</mat-icon>
```

**Status Colors:**

```typescript
getStatusColor(status: string): string {
  const colors = {
    pending: 'accent',
    confirmed: 'primary',
    completed: 'primary',
    cancelled: 'warn'
  };
  return colors[status] || 'primary';
}
```

---

### Deliveries Module

**Unique Fields:**

- `orderId` (FK to Order)
- `deliveryDate`
- `status` (enum: pending, in_transit, delivered, failed)
- `address`
- `notes`

**Table Columns:**

```typescript
displayedColumns = ['order', 'deliveryDate', 'address', 'status', 'actions'];
```

**Date Handling:**

```typescript
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// In form
deliveryDate: [new Date(), Validators.required];
```

**Material Icon:**

```typescript
<mat-icon>local_shipping</mat-icon>
```

---

### Stock Module

**Unique Fields:**

- `productId` (FK to Product)
- `quantity`
- `operation` (enum: in, out)
- `reason`
- `notes`

**Table Columns:**

```typescript
displayedColumns = ['product', 'quantity', 'operation', 'reason', 'date', 'actions'];
```

**Operation Badge:**

```typescript
getOperationColor(operation: string): string {
  return operation === 'in' ? 'primary' : 'warn';
}
```

**Material Icon:**

```typescript
<mat-icon>warehouse</mat-icon>
```

---

### Shrinkage Module

**Unique Fields:**

- `productId` (FK to Product)
- `quantity`
- `reason` (enum: expired, damaged, theft, other)
- `notes`

**Table Columns:**

```typescript
displayedColumns = ['product', 'quantity', 'reason', 'date', 'actions'];
```

**Material Icon:**

```typescript
<mat-icon>trending_down</mat-icon>
```

---

### Users Module

**Unique Fields:**

- `name`, `email`, `password`
- `role` (enum: admin, client, user)

**Permissions:**

- Admin-only access (use `roleGuard`)

**Table Columns:**

```typescript
displayedColumns = ['name', 'email', 'role', 'createdAt', 'actions'];
```

**Form Special Handling:**

- Password field only on create (not edit)
- Password confirmation field

**Material Icon:**

```typescript
<mat-icon>manage_accounts</mat-icon>
```

**Route Guard:**

```typescript
// In app.routes.ts
{
  path: 'users',
  canActivate: [authGuard, roleGuard],
  data: { requiredPermissions: ['users:read'] },
  loadChildren: () =>
    import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
}
```

---

## Common HTML Template Patterns

### List Template Structure

```html
<div class="entity-list-container">
  <!-- Header -->
  <div class="page-header">
    <div class="header-content">
      <div class="title-section">
        <h1>
          <mat-icon>icon_name</mat-icon>
          Title
        </h1>
        <p class="subtitle">Description</p>
      </div>
      <button mat-raised-button color="primary" (click)="createEntity()">
        <mat-icon>add</mat-icon>
        New Entity
      </button>
    </div>
  </div>

  <!-- Search -->
  <mat-card class="search-card">
    <mat-card-content>
      <form [formGroup]="searchForm">
        <mat-form-field class="search-field" appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput formControlName="search" placeholder="Search..." />
          <mat-icon matPrefix>search</mat-icon>
          @if (searchForm.get('search')?.value) {
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="searchForm.patchValue({ search: '' })"
          >
            <mat-icon>close</mat-icon>
          </button>
          }
        </mat-form-field>
      </form>
    </mat-card-content>
  </mat-card>

  <!-- Table -->
  <mat-card class="table-card">
    @if (loading()) {
    <div class="loading-container">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Loading...</p>
    </div>
    } @else if (entities().length === 0) {
    <div class="empty-state">
      <mat-icon>icon_name</mat-icon>
      <h2>No data</h2>
      <p>Create your first entity.</p>
      <button mat-raised-button color="primary" (click)="createEntity()">
        <mat-icon>add</mat-icon>
        Create
      </button>
    </div>
    } @else {
    <div class="table-container">
      <table mat-table [dataSource]="entities()">
        <!-- Define columns here -->
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>

    <mat-paginator
      [length]="totalItems()"
      [pageSize]="pageSize()"
      [pageIndex]="pageIndex()"
      [pageSizeOptions]="[5, 10, 25, 50]"
      (page)="onPageChange($event)"
      showFirstLastButtons
    >
    </mat-paginator>
    }
  </mat-card>
</div>
```

### Form Template Structure

```html
<div class="entity-form-container">
  <!-- Header -->
  <div class="page-header">
    <div class="header-content">
      <div class="title-section">
        <h1>
          <mat-icon>{{ isEditMode() ? 'edit' : 'add' }}</mat-icon>
          {{ isEditMode() ? 'Edit Entity' : 'New Entity' }}
        </h1>
        <p class="subtitle">Fill the form</p>
      </div>
    </div>
  </div>

  <!-- Form Card -->
  <mat-card class="form-card">
    @if (loading() && isEditMode()) {
    <div class="loading-container">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Loading...</p>
    </div>
    } @else {
    <mat-card-content>
      <form [formGroup]="entityForm" (ngSubmit)="onSubmit()">
        <!-- Form fields here -->

        <!-- Actions -->
        <div class="form-actions">
          <button mat-button type="button" (click)="cancel()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
            @if (loading()) {
            <mat-spinner diameter="20"></mat-spinner>
            <span>{{ isEditMode() ? 'Updating...' : 'Creating...' }}</span>
            } @else {
            <mat-icon>{{ isEditMode() ? 'save' : 'add' }}</mat-icon>
            {{ isEditMode() ? 'Update' : 'Create' }} }
          </button>
        </div>
      </form>
    </mat-card-content>
    }
  </mat-card>
</div>
```

---

## Common SCSS Patterns

### List Component Styles

```scss
.entity-list-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;

  .page-header {
    margin-bottom: 2rem;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;

      .title-section {
        h1 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          font-size: 2rem;
          font-weight: 500;
        }

        .subtitle {
          margin: 0.5rem 0 0 0;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }
  }

  .search-card {
    margin-bottom: 1.5rem;

    .search-field {
      width: 100%;
      max-width: 500px;
    }
  }

  .table-card {
    .loading-container,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;

      mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }
    }

    .table-container {
      overflow-x: auto;

      table {
        width: 100%;
      }

      .actions-cell {
        display: flex;
        gap: 0.5rem;
      }
    }
  }
}
```

### Form Component Styles

```scss
.entity-form-container {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;

  .page-header {
    margin-bottom: 2rem;

    .header-content {
      .title-section {
        h1 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          font-size: 2rem;
          font-weight: 500;
        }

        .subtitle {
          margin: 0.5rem 0 0 0;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }
  }

  .form-card {
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;

      &.full-width {
        width: 100%;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.12);

      button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }
}
```

---

## Testing Checklist

Before considering a module complete, test the following:

### List Component

- [ ] Table loads with data
- [ ] Pagination works (change page size, go to next/previous page)
- [ ] Search filters results correctly
- [ ] Search debounce works (doesn't fire on every keystroke)
- [ ] Clear search button appears and works
- [ ] Empty state shows when no data
- [ ] Empty state shows when search returns no results
- [ ] Loading spinner shows during API calls
- [ ] Edit button navigates to edit form
- [ ] Delete button opens confirmation dialog
- [ ] Delete confirmation works
- [ ] Delete cancellation works
- [ ] Error handling (simulate API error)

### Form Component

- [ ] Create mode: form starts empty
- [ ] Edit mode: form loads with existing data
- [ ] All fields render correctly
- [ ] Required field validation works
- [ ] Zod validation catches invalid data
- [ ] Submit button disabled during loading
- [ ] Create success redirects to list
- [ ] Edit success redirects to list
- [ ] Cancel button navigates to list
- [ ] Error messages display correctly
- [ ] API errors show in snackbar
- [ ] Loading spinner shows during submit

### Routing

- [ ] `/entities` shows list
- [ ] `/entities/new` shows create form
- [ ] `/entities/:id/edit` shows edit form with data
- [ ] Sidebar link highlights correctly
- [ ] Page titles set correctly

---

## Quick Reference

### Generate New Module (Manual Steps)

1. **Create directory structure:**

   ```bash
   mkdir -p src/app/features/{module-name}/services
   mkdir -p src/app/features/{module-name}/{entity}-list
   mkdir -p src/app/features/{module-name}/{entity}-form
   ```

2. **Copy and adapt from Products:**
   - Service: `product.service.ts` → `{entity}.service.ts`
   - Validation: `product.validation.ts` → `{entity}.validation.ts`
   - List component: `product-list/*` → `{entity}-list/*`
   - Form component: `product-form/*` → `{entity}-form/*`
   - Routes: `products.routes.ts` → `{module-name}.routes.ts`

3. **Global replace patterns:**
   - `Product` → `Entity`
   - `product` → `entity`
   - `products` → `entities`
   - `/products` → `/entities`

4. **Customize:**
   - Update displayedColumns
   - Update form fields
   - Update validation schemas (reference API_DOC.md)
   - Update Material icons
   - Update Spanish labels

5. **Integrate:**
   - Add route to `app.routes.ts`
   - Add sidebar link to `admin-layout.component.html`
   - Test all CRUD operations

---

## Summary

This template provides everything needed to implement CRUD modules consistently and efficiently. By following this pattern:

- **Time Savings**: ~80% of code is reusable
- **Consistency**: Same UX across all modules
- **Maintainability**: Predictable structure
- **Quality**: Battle-tested patterns
- **Scalability**: Easy to extend

**Next Module to Implement:** Clients (simplest after Products)
**Most Complex Module:** Orders (has relationships and item management)

---

**Last Updated:** 2026-03-27  
**Reference Implementation:** `/src/app/features/products/`
