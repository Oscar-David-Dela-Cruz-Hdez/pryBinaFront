
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



export const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  },

  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'password-recovery',
    component: RecupcontraComponent
  },

  {
    path: 'perfil',
    component: ProfileComponent,
    canActivate: [authGuard]
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
  },
  {
    path: 'password',
    component: PasswordComponent,
  },
  {
    path: 'pregunta',
    component: PreguntaComponent,
  }

];
