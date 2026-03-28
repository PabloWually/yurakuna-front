import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

import { UserService } from '../services/user.service';
import { User, Criteria } from '../../../core/models';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // State
  users = signal<User[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  // Search form
  searchForm: FormGroup;

  // Table columns
  displayedColumns = ['name', 'email', 'role', 'createdAt', 'actions'];

  // Role labels for display
  roleLabels: Record<string, string> = {
    admin: 'Administrador',
    user: 'Usuario',
    client: 'Cliente',
  };

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
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
        this.pageIndex.set(0);
        this.loadUsers();
      });
  }

  /**
   * Load users from API
   */
  loadUsers(): void {
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
        field: 'name',
        operator: 'ilike',
        value: `%${searchTerm}%`,
      });
    }

    this.userService.listUsers(criteria).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading users:', error);
      },
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadUsers();
  }

  /**
   * Navigate to create user page
   */
  createUser(): void {
    this.router.navigate(['/users/new']);
  }

  /**
   * Navigate to edit user page
   */
  editUser(user: User): void {
    this.router.navigate(['/users', user.id, 'edit']);
  }

  /**
   * Delete user with confirmation
   */
  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Usuario',
        message: `¿Estás seguro de que deseas eliminar al usuario "${user.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.set(true);
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('Usuario eliminado exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadUsers();
          },
          error: (error) => {
            this.loading.set(false);
            this.snackBar.open('Error al eliminar usuario', 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar'],
            });
            console.error('Error deleting user:', error);
          },
        });
      }
    });
  }

  /**
   * Get role label for display
   */
  getRoleLabel(role: string): string {
    return this.roleLabels[role] || role;
  }

  /**
   * Get role chip color
   */
  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      admin: 'warn',
      user: 'primary',
      client: 'accent',
    };
    return colors[role] || 'primary';
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
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
