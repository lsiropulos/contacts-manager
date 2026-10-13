import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserInfo {
  email: string;
  isEmailConfirmed: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/auth`;

  login(credentials: LoginRequest): Observable<void> {
    // MapIdentityApi provides POST /login?useCookies=true or /login
    return this.http.post<void>(`${this.apiUrl}/login?useCookies=true`, credentials, {
      withCredentials: true,
    });
  }

  register(credentials: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, credentials, {
      withCredentials: true,
    });
  }

  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/logout`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  getUserInfo(): Observable<UserInfo> {
    // MapIdentityApi provides GET /manage/info to get current user details
    return this.http.get<UserInfo>(`${this.apiUrl}/manage/info`, {
      withCredentials: true,
    });
  }
}
