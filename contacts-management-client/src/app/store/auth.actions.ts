import { LoginRequest, RegisterRequest } from '../services/auth.service';

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: LoginRequest) {}
}

export class Register {
  static readonly type = '[Auth] Register';
  constructor(public payload: RegisterRequest) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class CheckAuth {
  static readonly type = '[Auth] Check Auth Status';
}

export class ClearError {
  static readonly type = '[Auth] Clear Error';
}
