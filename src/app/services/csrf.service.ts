import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private http = inject(HttpClient);
  private csrfToken: string | null = null;

  getCsrfToken(): Observable<{ csrfToken: string }> {
    return this.http.get<{ csrfToken: string }>(`${environment.apiUrl}/csrf/`).pipe(
      tap(response => {
        this.csrfToken = response.csrfToken;
      })
    );
  }

  getStoredToken(): string | null {
    return this.csrfToken;
  }
}
