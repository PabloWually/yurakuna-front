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

import { ClientService } from '../services/client.service';
import { Client, Criteria } from '../../../core/models';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-client-list',
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
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss',
})
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // State
  clients = signal<Client[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  // Search form
  searchForm: FormGroup;

  // Table columns
  displayedColumns = ['name', 'email', 'phone', 'actions'];

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    this.loadClients();
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
        this.loadClients();
      });
  }

  /**
   * Load clients from API
   */
  loadClients(): void {
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

    this.clientService.listClients(criteria).subscribe({
      next: (response) => {
        this.clients.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar clientes', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        console.error('Error loading clients:', error);
      },
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadClients();
  }

  /**
   * Navigate to create client page
   */
  createClient(): void {
    this.router.navigate(['/clients/new']);
  }

  /**
   * Navigate to edit client page
   */
  editClient(client: Client): void {
    this.router.navigate(['/clients', client.id, 'edit']);
  }
}
