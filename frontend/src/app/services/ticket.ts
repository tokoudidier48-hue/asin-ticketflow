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

export interface CreateTicketData {
  titre: string;
  description: string;
  statut?: string;
  priorite?: string;
}

export interface UpdateTicketData {
  titre?: string;
  description?: string;
  statut?: string;
  priorite?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private http = inject(HttpClient);

  private apiUrl = '/api/tickets';


  // =========================================
  // RÉCUPÉRER TOUS LES TICKETS
  // =========================================

  getTickets(): Observable<Ticket[]> {

    return this.http.get<Ticket[]>(
      this.apiUrl
    );

  }


  // =========================================
  // RÉCUPÉRER UN TICKET
  // =========================================

  getTicket(id: number): Observable<Ticket> {

    return this.http.get<Ticket>(
      `${this.apiUrl}/${id}`
    );

  }


  // =========================================
  // CRÉER UN TICKET
  // =========================================

  createTicket(
    data: CreateTicketData
  ): Observable<Ticket> {

    console.log(
      'POST /api/tickets',
      data
    );

    return this.http.post<Ticket>(
      this.apiUrl,
      data
    );

  }


  // =========================================
  // MODIFIER UN TICKET
  // =========================================

  updateTicket(
    id: number,
    data: UpdateTicketData
  ): Observable<Ticket> {

    console.log(
      `PUT /api/tickets/${id}`,
      data
    );

    return this.http.put<Ticket>(
      `${this.apiUrl}/${id}`,
      data
    );

  }


  // =========================================
  // SUPPRIMER UN TICKET
  // =========================================

  deleteTicket(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );

  }

}