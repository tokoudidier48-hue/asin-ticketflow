
import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Tickets } from './pages/tickets/tickets';
import { TicketNew } from './pages/ticket-new/ticket-new';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'tickets',
    component: Tickets
  },
  {
    path: 'tickets/new',
    component: TicketNew
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
