import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
}

export interface AuthResponse {
  mensaje: string;
  tempToken?: string;
  token?: string;
  usuario?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private fireAuth = inject(Auth);

  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(email: string, password: string, firstName: string, lastName: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, {
      email,
      password,
      first_name: firstName,
      last_name: lastName
    }).pipe(
      tap(response => {
        if (response.tempToken) {
          sessionStorage.setItem('tempToken', response.tempToken);
        }
      })
    );
  }

  verifyRegister2FA(codigo: string): Observable<AuthResponse> {
    const tempToken = sessionStorage.getItem('tempToken');
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/2fa/verificar/`, {
      tempToken,
      codigo
    }).pipe(
      tap(response => {
        if (response.token && response.usuario) {
          this.setSession(response.token, response.usuario);
          sessionStorage.removeItem('tempToken');
        }
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.tempToken) {
          sessionStorage.setItem('tempToken', response.tempToken);
        }
      })
    );
  }

  verifyLogin2FA(codigo: string): Observable<AuthResponse> {
    const tempToken = sessionStorage.getItem('tempToken');
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/2fa/verificar/`, {
      tempToken,
      codigo
    }).pipe(
      tap(response => {
        if (response.token && response.usuario) {
          this.setSession(response.token, response.usuario);
          sessionStorage.removeItem('tempToken');
        }
      })
    );
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.fireAuth, provider);
      const idToken = await result.user.getIdToken();

      this.http.post<AuthResponse>(`${this.apiUrl}/login/google/`, {
        idToken
      }).subscribe({
        next: (response) => {
          if (response.token && response.usuario) {
            this.setSession(response.token, response.usuario);
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          console.error('Error en login con Google:', error);
          throw error;
        }
      });
    } catch (error) {
      console.error('Error en autenticación con Google:', error);
      throw error;
    }
  }

  recuperar(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/recuperar/`, {
      email
    }).pipe(
      tap(response => {
        if (response.tempToken) {
          sessionStorage.setItem('resetToken', response.tempToken);
        }
      })
    );
  }

  restablecer(newPassword: string, codigo: string): Observable<AuthResponse> {
    const tempToken = sessionStorage.getItem('resetToken');
    return this.http.post<AuthResponse>(`${this.apiUrl}/restablecer/`, {
      tempToken,
      newPassword,
      codigo
    }).pipe(
      tap(() => {
        sessionStorage.removeItem('resetToken');
      })
    );
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
