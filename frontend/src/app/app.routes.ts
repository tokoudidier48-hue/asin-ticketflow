import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
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
    path: 'tickets',
    component: Tickets
  },
  {
    path: 'tickets/new',
    component: TicketNew
  }
];