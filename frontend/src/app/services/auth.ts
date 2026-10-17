import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, finalize, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface MessageResponse {
  message: string;
}

export interface VerifyOtpResponse {
  message: string;
  reset_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem('user');

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      Accept: 'application/json'
    });

    const token = this.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Déconnexion locale (supprime le jeton du navigateur)
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Révoque le jeton côté Laravel, puis déconnecte localement.
  logoutFromServer(): Observable<unknown> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(() => of(null)),
      finalize(() => this.logout())
    );
  }

  // =========================================
  // MOT DE PASSE OUBLIÉ
  // =========================================

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/forgot-password`,
      { email },
      { headers: { Accept: 'application/json' } }
    );
  }

  verifyOtp(email: string, code: string): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(
      `${this.apiUrl}/verify-otp`,
      { email, code },
      { headers: { Accept: 'application/json' } }
    );
  }

  resetPassword(
    email: string,
    resetToken: string,
    password: string,
    passwordConfirmation: string
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/reset-password`,
      {
        email,
        reset_token: resetToken,
        password,
        password_confirmation: passwordConfirmation
      },
      { headers: { Accept: 'application/json' } }
    );
  }
}