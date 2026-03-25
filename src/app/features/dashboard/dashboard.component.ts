import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  quickLinks = [
    { title: 'Productos', icon: 'inventory_2', route: '/products', color: '#4caf50' },
    { title: 'Clientes', icon: 'people', route: '/clients', color: '#2196f3' },
    { title: 'Pedidos', icon: 'shopping_cart', route: '/orders', color: '#ff9800' },
    { title: 'Entregas', icon: 'local_shipping', route: '/deliveries', color: '#9c27b0' },
    { title: 'Stock', icon: 'warehouse', route: '/stock', color: '#009688' },
    { title: 'Merma', icon: 'report_problem', route: '/shrinkage', color: '#f44336' },
  ];
}
