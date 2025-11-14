import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify-2fa',
    loadComponent: () => import('./components/verify-2fa/verify-2fa.component').then(m => m.Verify2faComponent)
  },
  {
    path: 'recuperar',
    loadComponent: () => import('./components/recuperar/recuperar.component').then(m => m.RecuperarComponent)
  },
  {
    path: 'restablecer',
    loadComponent: () => import('./components/restablecer/restablecer.component').then(m => m.RestablecerComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
