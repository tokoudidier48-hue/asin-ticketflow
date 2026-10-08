import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ticket {
  id: number;
  titre: string;
  description: string;
  statut: string;
  priorite: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/api/tickets';

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }
}