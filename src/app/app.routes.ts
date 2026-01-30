
import { IndexComponent } from './pages/index/index.component';
import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { RecupcontraComponent } from './auth/recupcontra/recupcontra.component';
import { PrivacidadComponent } from './static/privacidad/privacidad.component';
import { TerminosComponent } from './static/terminos/terminos.component';
import {UserdataComponent} from "./usuario/userdata/userdata.component";
import {PasswordComponent} from "./usuario/password/password.component";
import {PreguntaComponent} from "./usuario/pregunta/pregunta.component";

import { ProfileComponent } from './pages/profile/profile.component';



import { Error400Component } from './pages/errores/error400/error400.component';
import { Error404Component } from './pages/errores/error404/error404.component';
import { UbicacionComponent } from './pages/ubicacion/ubicacion.component';

export const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    data: { breadcrumb: 'Inicio' }
  },

  {
    path: 'login',
    component: LoginComponent,
    data: { breadcrumb: 'Iniciar Sesión' }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { breadcrumb: 'Registro' }
  },
  {
    path: 'password-recovery',
    component: RecupcontraComponent,
    data: { breadcrumb: 'Recuperar Contraseña' }
  },

  {
    path: 'perfil',
    component: ProfileComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Mi Perfil' }
  },

  {
    path: 'privacidad',
    component: PrivacidadComponent
  },

  {
    path: 'terminos',
    component: TerminosComponent
  },

  {
    path: 'datos',
    component: UserdataComponent,
    data: { breadcrumb: 'Mis Datos' }
  },
  {
    path: 'password',
    component: PasswordComponent,
    data: { breadcrumb: 'Cambiar Contraseña' }
  },
  {
    path: 'pregunta',
    component: PreguntaComponent,
    data: { breadcrumb: 'Pregunta de Seguridad' }
  },

  {
    path: 'ubicacion',
    component: UbicacionComponent,
    data: { breadcrumb: 'Ubicación' }
  },

  // Ruta Wildcard para manejar 404 (Debe ir siempre al final)
  {
    path: 'error-400',
    component: Error400Component
  },
  {
    path: '**',
    component: Error404Component
  }
];
