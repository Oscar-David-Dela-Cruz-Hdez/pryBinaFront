import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 400) {
        // Redirigir a página de Error 400 en caso de Bad Request
        router.navigate(['/error-400']);
      } else if (error.status === 500) {
        // Redirigir a página de Error 500 en caso de Fallo del Servidor
        router.navigate(['/error-500']);
      }
      // Propagar el error por si algún componente necesita manejarlo específicamente
      return throwError(() => error);
    })
  );
};
