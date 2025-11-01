import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.isLoggedIn$.pipe(
    take(1), // Tomamos solo el primer valor
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      } else {
        console.log('Acceso denegado - Redirigiendo a /login');
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

