import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store, Actions, ofActionSuccessful } from '@ngxs/store';
import { Router } from '@angular/router';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { Login, Register } from '../../store/auth.actions';
import { AuthState } from '../../store/auth.state';

export function aspNetIdentityPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const hasMinLength = value.length >= 6;
    const hasDigit = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNonAlphanumeric = /[^a-zA-Z0-9]/.test(value);

    const passwordValid = hasMinLength && hasDigit && hasUpper && hasNonAlphanumeric;

    if (!passwordValid) {
      return {
        passwordRequirements: {
          minlength: !hasMinLength,
          digit: !hasDigit,
          upper: !hasUpper,
          nonAlphanumeric: !hasNonAlphanumeric,
        },
      };
    }
    return null;
  };
}

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
  templateUrl: './auth-form.component.html',
})
export class AuthFormComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private actions$ = inject(Actions);
  private router = inject(Router);

  isRegisterMode = signal<boolean>(false);
  loading = this.store.selectSignal(AuthState.loading);
  errorMessage = this.store.selectSignal(AuthState.error);

  constructor() {
    // Automatically cleans up the subscription when the component is destroyed
    this.actions$.pipe(ofActionSuccessful(Login, Register), takeUntilDestroyed()).subscribe(() => {
      this.router.navigate(['/contacts']);
    });
  }

  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, aspNetIdentityPasswordValidator()]],
  });

  toggleMode() {
    this.isRegisterMode.update((mode) => !mode);
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const credentials = this.authForm.value as { email: string; password: string };
    const action = this.isRegisterMode() ? new Register(credentials) : new Login(credentials);

    this.store.dispatch(action);
  }
}
