import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

// Protected layout component that wraps all authenticated pages with a Navbar
@Component({
  selector: 'app-protected-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="p-6">
      <router-outlet />
    </main>
  `,
})
export class ProtectedLayoutComponent {}
