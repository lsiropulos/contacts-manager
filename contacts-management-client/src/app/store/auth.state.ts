import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService, UserInfo } from '../services/auth.service';
import { Login, Register, Logout, CheckAuth, ClearError } from './auth.actions';
import { ResetContactsState } from './contacts.actions';

export interface AuthStateModel {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
})
@Injectable()
export class AuthState {
  private authService = inject(AuthService);

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state?.isAuthenticated ?? false;
  }

  @Selector()
  static user(state: AuthStateModel): UserInfo | null {
    return state.user;
  }

  @Selector()
  static loading(state: AuthStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: AuthStateModel): string | null {
    return state.error;
  }

  @Action(CheckAuth)
  checkAuth(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.getUserInfo().pipe(
      tap({
        next: (user) => {
          ctx.patchState({ user, isAuthenticated: true, loading: false, error: null });
        },
        error: () => {
          ctx.patchState({ user: null, isAuthenticated: false, loading: false, error: null });
        },
      }),
    );
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.login(action.payload).pipe(
      tap({
        next: () => {
          ctx.patchState({ loading: false }); // <-- Reset loading on success
        },
      }),
      switchMap(() => ctx.dispatch(new CheckAuth())),
      catchError((err) => {
        ctx.patchState({ error: err.error?.title || 'Login failed', loading: false });
        return throwError(() => err);
      }),
    );
  }

  @Action(Register)
  register(ctx: StateContext<AuthStateModel>, action: Register) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.register(action.payload).pipe(
      tap({
        next: () => {
          ctx.patchState({ loading: false }); // <-- Reset loading on success
        },
      }),
      switchMap(() =>
        ctx.dispatch(new Login({ email: action.payload.email, password: action.payload.password })),
      ),
      catchError((err) => {
        let errorMessage = 'Registration failed';
        if (err.error?.errors) {
          const errorList = Object.values(err.error.errors).flat();
          errorMessage = errorList.join(' ');
        } else if (err.error?.title) {
          errorMessage = err.error.title;
        }
        ctx.patchState({ error: errorMessage, loading: false });
        return throwError(() => err);
      }),
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.logout().pipe(
      tap({
        next: () => {
          ctx.patchState({ user: null, isAuthenticated: false, loading: false, error: null });
        },
        error: () => {
          ctx.patchState({ user: null, isAuthenticated: false, loading: false, error: null });
        },
      }),
      switchMap(() => ctx.dispatch(new ResetContactsState())),
      catchError(() => ctx.dispatch(new ResetContactsState())),
    );
  }

  @Action(ClearError)
  clearError(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ error: null });
  }
}
