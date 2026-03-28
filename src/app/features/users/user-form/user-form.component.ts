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

import { UserService } from '../services/user.service';
import { CreateUserSchema, UpdateUserSchema } from '../services/user.validation';
import { User, CreateUserRequest, UserRole } from '../../../core/models';

@Component({
  selector: 'app-user-form',
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
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  userForm: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  userId: string | null = null;

  // Role options
  roleOptions: Array<{ value: UserRole; label: string }> = [
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' },
    { value: 'client', label: 'Cliente' },
  ];

  constructor() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required],
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.userId = this.route.snapshot.paramMap.get('id');

    if (this.userId) {
      this.isEditMode.set(true);
      // Make password optional in edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.loadUser(this.userId);
    }
  }

  /**
   * Load user data for editing
   */
  loadUser(id: string): void {
    this.loading.set(true);

    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
          // Don't set password - leave it empty
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar usuario', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading user:', error);
        this.router.navigate(['/users']);
      },
    });
  }

  /**
   * Submit form (create or update)
   */
  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formData = this.userForm.value;

    // Remove password from update if it's empty
    if (this.isEditMode() && !formData.password) {
      delete formData.password;
    }

    try {
      if (this.isEditMode()) {
        // Validate update data
        UpdateUserSchema.parse(formData);
        this.updateUser(formData);
      } else {
        // Validate create data
        CreateUserSchema.parse(formData);
        this.createUser(formData);
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
   * Create new user
   */
  createUser(data: CreateUserRequest): void {
    this.loading.set(true);

    this.userService.createUser(data).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.snackBar.open('Usuario creado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al crear usuario';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error creating user:', error);
      },
    });
  }

  /**
   * Update existing user
   */
  updateUser(data: Partial<CreateUserRequest>): void {
    if (!this.userId) return;

    this.loading.set(true);

    this.userService.updateUser(this.userId, data).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al actualizar usuario';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error updating user:', error);
      },
    });
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/users']);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);

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
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    return '';
  }
}
