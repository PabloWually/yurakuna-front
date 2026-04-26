import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { AuthService } from '../../core/auth/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[]; // If specified, only these roles can see this item
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);

  currentUser = this.authService.currentUser;
  
  // Persist sidenav state in sessionStorage to survive token refresh
  private getSidenavState(): boolean {
    const stored = sessionStorage.getItem('sidenav_opened');
    return stored !== null ? stored === 'true' : true; // default true
  }

  private saveSidenavState(opened: boolean): void {
    sessionStorage.setItem('sidenav_opened', String(opened));
  }

  sidenavOpened = signal(this.getSidenavState());

  // Navigation items
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Productos', route: '/products', icon: 'inventory_2' },
    { label: 'Clientes', route: '/clients', icon: 'people' },
    { label: 'Pedidos', route: '/orders', icon: 'shopping_cart' },
    { label: 'Entregas', route: '/deliveries', icon: 'local_shipping' },
    { label: 'Stock', route: '/stock', icon: 'warehouse' },
    { label: 'Merma', route: '/shrinkage', icon: 'report_problem' },
    { label: 'Proveedores', route: '/providers', icon: 'business' },
    { label: 'Compras', route: '/purchases', icon: 'shopping_bag' },
    { label: 'Usuarios', route: '/users', icon: 'manage_accounts', roles: ['admin'] },
  ];

  // Filter nav items based on user role
  filteredNavItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(user.role);
    });
  });

  // Check if screen is mobile
  isMobile = signal(false);

  constructor() {
    // Observe breakpoints for responsive behavior
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile.set(result.matches);
      if (result.matches) {
        this.sidenavOpened.set(false);
        this.saveSidenavState(false);
      } else {
        // Restore previous state from sessionStorage on desktop
        const previousState = this.getSidenavState();
        this.sidenavOpened.set(previousState);
      }
    });
  }

  toggleSidenav(): void {
    const newState = !this.sidenavOpened();
    this.sidenavOpened.set(newState);
    this.saveSidenavState(newState);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Logout successful, navigate to login
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Even if logout fails on API side, clear local tokens and redirect
        this.router.navigate(['/auth/login']);
      },
    });
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '';

    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }

  getRoleBadgeColor(): string {
    const user = this.currentUser();
    if (!user) return '';

    switch (user.role) {
      case 'admin':
        return 'accent';
      case 'client':
        return 'primary';
      default:
        return '';
    }
  }
}
