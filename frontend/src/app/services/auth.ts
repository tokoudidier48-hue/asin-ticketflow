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
  // Le nettoyage local a lieu même si l'appel API échoue.
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
}