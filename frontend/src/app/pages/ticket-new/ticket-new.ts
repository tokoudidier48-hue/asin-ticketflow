import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketService, CreateTicketData } from '../../services/ticket';

@Component({
  selector: 'app-ticket-new',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './ticket-new.html',
  styleUrl: './ticket-new.scss'
})
export class TicketNew {

  private ticketService = inject(TicketService);
  private router = inject(Router);

  ticket: CreateTicketData = {
    titre: '',
    description: '',
    statut: 'open',
    priorite: 'medium'
  };

  isLoading = false;
  errorMessage = '';

  onSubmit(): void {

    console.log('BOUTON CRÉER CLIQUÉ');

    if (!this.ticket.titre.trim() || !this.ticket.description.trim()) {
      console.log('Titre ou description vide');
      return;
    }

    console.log('DONNÉES DU FORMULAIRE :', this.ticket);

    this.isLoading = true;
    this.errorMessage = '';

    console.log('ENVOI DU POST /api/tickets...');

    this.ticketService.createTicket(this.ticket).subscribe({

      next: (createdTicket) => {

        console.log('TICKET CRÉÉ AVEC SUCCÈS :', createdTicket);

        this.isLoading = false;

        this.router.navigate(['/tickets']);
      },

      error: (error) => {

        console.error('ERREUR LORS DE LA CRÉATION DU TICKET :', error);

        this.isLoading = false;

        this.errorMessage =
          'Impossible de créer le ticket. Veuillez réessayer.';
      }

    });

  }

}