import { Component, inject } from '@angular/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Logout } from '../../store/auth.actions';
import { AuthState } from '../../store/auth.state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <header
      class="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center shadow-sm"
    >
      @if (user(); as currentUser) {
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-gray-700">Welcome, {{ currentUser.email }}</span>

          <a
            pButton
            type="button"
            [outlined]="true"
            severity="danger"
            styleClass="p-button-sm"
            (click)="onLogout()"
          >
            <span>Logout</span>
          </a>
        </div>
      }
    </header>
  `,
})
export class NavbarComponent {
  private store = inject(Store);
  private actions$ = inject(Actions);
  private router = inject(Router);

  user = this.store.selectSignal(AuthState.user);

  constructor() {
    this.actions$.pipe(ofActionSuccessful(Logout), takeUntilDestroyed()).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  onLogout() {
    this.store.dispatch(new Logout());
  }
}
