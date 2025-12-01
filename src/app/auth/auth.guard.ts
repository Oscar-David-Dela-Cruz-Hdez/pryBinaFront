//codigo 1 funcional
/* import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1), 
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

 */

//codigo 2 experimental
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      if (isLoggedIn) {
        const token = localStorage.getItem('user_token');
        if (token) {
          try {
            const decodedToken = jwtDecode(token);
            if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
              authService.logout();
              router.navigate(['/login']);
              return false;
            }
          } catch (error) {
            authService.logout();
            router.navigate(['/login']);
            return false;
          }
        }
        return true;
      } else {
        console.log('Acceso denegado - Redirigiendo a /login');
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError((err) => {
      authService.logout();
      router.navigate(['/login']);
      return of(false);
    })
  );
};
