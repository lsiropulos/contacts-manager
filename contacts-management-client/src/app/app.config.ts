import { ApplicationConfig, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideStore } from '@ngxs/store';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { ContactsState } from './store/contacts.state';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { withCredentialsInterceptor } from './interceptors/with-credentials.interceptor';
import { AuthState } from './store/auth.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([withCredentialsInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
        },
      },
    }),
    ConfirmationService,
    MessageService,
    provideRouter(routes),
    provideStore(
      [ContactsState, AuthState],
      withNgxsReduxDevtoolsPlugin({
        disabled: !isDevMode(),
      }), // Enables Redux DevTools extension only in development mode
    ),
  ],
};
