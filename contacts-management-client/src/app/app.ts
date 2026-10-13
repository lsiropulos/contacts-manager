import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem, SharedModule } from 'primeng/api';

import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule, ConfirmDialog } from 'primeng/confirmdialog';
import { Store } from '@ngxs/store';
import { CheckAuth } from './store/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MenubarModule,
    SharedModule,
    ToastModule,
    ConfirmDialogModule,
    ConfirmDialog,
  ],
  template: `
    <div class="layout-wrapper">
      <p-toast position="top-right"></p-toast>
      <p-confirmdialog [style]="{ width: '450px' }"></p-confirmdialog>

      <p-menubar [model]="items">
        <ng-template #start>
          <div class="brand-title">
            <i class="pi pi-address-book brand-icon"></i>
            <span>Contacts App</span>
          </div>
        </ng-template>
      </p-menubar>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class App {
  items: MenuItem[] = [
    {
      label: 'Contacts',
      icon: 'pi pi-users',
      routerLink: '/contacts',
    },
  ];

  private store = inject(Store);

  ngOnInit() {
    this.store.dispatch(new CheckAuth());
  }
}
