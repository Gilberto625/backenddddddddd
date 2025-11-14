import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CsrfService } from '../services/csrf.service';
import { switchMap, take } from 'rxjs/operators';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfService = inject(CsrfService);

  // Skip CSRF for GET requests and the CSRF endpoint itself
  if (req.method === 'GET' || req.url.includes('/csrf/')) {
    return next(req);
  }

  const storedToken = csrfService.getStoredToken();

  if (storedToken) {
    const clonedReq = req.clone({
      setHeaders: {
        'X-CSRFToken': storedToken
      }
    });
    return next(clonedReq);
  }

  // If no token, fetch it first
  return csrfService.getCsrfToken().pipe(
    take(1),
    switchMap(response => {
      const clonedReq = req.clone({
        setHeaders: {
          'X-CSRFToken': response.csrfToken
        }
      });
      return next(clonedReq);
    })
  );
};
