import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AuthFormComponent } from './components/auth-form/auth-form.component';
import { ProtectedLayoutComponent } from './components/protected-layout/protected-layout.component';

export const routes: Routes = [
  { path: 'login', component: AuthFormComponent },

  // All routes wrapped inside this layout require authentication and show the navbar
  {
    path: '',
    component: ProtectedLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'contacts',
        loadComponent: () =>
          import('./components/contact-list/contact-list.component').then(
            (m) => m.ContactListComponent,
          ),
      },
      {
        path: 'contacts/:id',
        loadComponent: () =>
          import('./components/contact-details/contact-details.component').then(
            (m) => m.ContactDetailsComponent,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'contacts',
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'contacts',
  },
];
