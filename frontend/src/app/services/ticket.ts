import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

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
  private auth = inject(AuthService);

  // environment.apiUrl contient déjà "/api"
  private apiUrl = `${environment.apiUrl}/tickets`;


  // =========================================
  // RÉCUPÉRER TOUS LES TICKETS
  // =========================================

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(
      this.apiUrl,
      { headers: this.auth.getAuthHeaders() }
    );
  }


  // =========================================
  // RÉCUPÉRER UN TICKET
  // =========================================

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(
      `${this.apiUrl}/${id}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }


  // =========================================
  // CRÉER UN TICKET
  // =========================================

  createTicket(data: CreateTicketData): Observable<Ticket> {
    console.log('POST', this.apiUrl, data);

    return this.http.post<Ticket>(
      this.apiUrl,
      data,
      { headers: this.auth.getAuthHeaders() }
    );
  }


  // =========================================
  // MODIFIER UN TICKET
  // =========================================

  updateTicket(
    id: number,
    data: UpdateTicketData
  ): Observable<Ticket> {
    console.log(`PUT ${this.apiUrl}/${id}`, data);

    return this.http.put<Ticket>(
      `${this.apiUrl}/${id}`,
      data,
      { headers: this.auth.getAuthHeaders() }
    );
  }


  // =========================================
  // SUPPRIMER UN TICKET
  // =========================================

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

}