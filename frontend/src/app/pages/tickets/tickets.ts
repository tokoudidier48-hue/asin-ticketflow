import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  Ticket,
  TicketService,
  CreateTicketData,
  UpdateTicketData
} from '../../services/ticket';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-tickets',
  imports: [DatePipe, FormsModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.scss'
})
export class Tickets implements OnInit {

  private ticketService = inject(TicketService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // =========================================
  // LISTE DES TICKETS
  // =========================================

  tickets: Ticket[] = [];

  loading = true;


  // =========================================
  // MESSAGES
  // =========================================

  error = '';

  success = '';


  // =========================================
  // FORMULAIRE
  // =========================================

  showForm = false;

  creating = false;

  updating = false;


  // =========================================
  // DÉTAILS
  // =========================================

  showDetails = false;

  selectedTicket: Ticket | null = null;


  // =========================================
  // MODIFICATION
  // =========================================

  editingTicket: Ticket | null = null;


  // =========================================
  // NOUVEAU TICKET
  // =========================================

  nouveauTicket: CreateTicketData = {
    titre: '',
    description: '',
    statut: 'Nouveau',
    priorite: 'Moyenne'
  };


  // =========================================
  // INITIALISATION
  // =========================================

  ngOnInit(): void {

    console.log('PAGE TICKETS INITIALISÉE');

    if (!this.authService.isAuthenticated()) {

      console.log('Utilisateur non authentifié');

      this.router.navigate(['/login']);

      return;
    }

    this.chargerTickets();
  }


  // =========================================
  // CHARGER LES TICKETS
  // =========================================

  chargerTickets(): void {

    console.log('CHARGEMENT DES TICKETS...');

    this.error = '';

    this.loading = true;

    this.ticketService.getTickets()
      .pipe(
        finalize(() => {
          this.loading = false;

          console.log(
            'FIN DU CHARGEMENT DES TICKETS'
          );
        })
      )
      .subscribe({

        next: (tickets) => {

          console.log(
            'TICKETS REÇUS PAR ANGULAR :',
            tickets
          );

          this.tickets = tickets;

          console.log(
            'NOMBRE DE TICKETS :',
            this.tickets.length
          );
        },

        error: (error) => {

          console.error(
            'ERREUR LORS DU CHARGEMENT DES TICKETS :',
            error
          );

          if (error.status === 401) {

            this.authService.logout();

            this.router.navigate(['/login']);

            return;
          }

          if (error.status === 0) {

            this.error =
              'Impossible de contacter le serveur Laravel.';

            return;
          }

          if (error.status === 404) {

            this.error =
              'Le service des tickets est introuvable.';

            return;
          }

          if (error.status === 500) {

            this.error =
              'Une erreur interne est survenue sur le serveur Laravel.';

            return;
          }

          this.error =
            'Impossible de récupérer les tickets.';
        }
      });
  }


  // =========================================
  // OUVRIR LE FORMULAIRE DE CRÉATION
  // =========================================

  ouvrirFormulaire(): void {

    this.showForm = true;

    this.showDetails = false;

    this.editingTicket = null;

    this.selectedTicket = null;

    this.error = '';

    this.success = '';

    this.creating = false;

    this.updating = false;

    this.nouveauTicket = {

      titre: '',

      description: '',

      statut: 'Nouveau',

      priorite: 'Moyenne'

    };
  }


  // =========================================
  // FERMER LE FORMULAIRE
  // =========================================

  fermerFormulaire(): void {

    this.showForm = false;

    this.editingTicket = null;

    this.creating = false;

    this.updating = false;

    this.error = '';

    this.success = '';

    this.nouveauTicket = {

      titre: '',

      description: '',

      statut: 'Nouveau',

      priorite: 'Moyenne'

    };
  }


  // =========================================
  // CRÉER UN TICKET
  // =========================================

  creerTicket(): void {

    if (this.creating) {
      return;
    }

    this.error = '';

    this.success = '';


    // Vérification du titre

    if (!this.nouveauTicket.titre.trim()) {

      this.error =
        'Veuillez saisir le titre du ticket.';

      return;
    }


    // Vérification de la description

    if (!this.nouveauTicket.description.trim()) {

      this.error =
        'Veuillez saisir la description du ticket.';

      return;
    }


    const data: CreateTicketData = {

      titre: this.nouveauTicket.titre.trim(),

      description: this.nouveauTicket.description.trim(),

      statut: this.nouveauTicket.statut,

      priorite: this.nouveauTicket.priorite

    };


    console.log(
      'CRÉATION DU TICKET :',
      data
    );


    this.creating = true;


    this.ticketService
      .createTicket(data)
      .pipe(

        finalize(() => {

          this.creating = false;

          console.log(
            'FIN DE LA REQUÊTE DE CRÉATION'
          );

        })

      )
      .subscribe({

        next: (ticket) => {

          console.log(
            'TICKET CRÉÉ AVEC SUCCÈS :',
            ticket
          );


          // Ajouter immédiatement le ticket
          // dans la liste

          this.tickets = [
            ticket,
            ...this.tickets
          ];


          // Fermer le formulaire

          this.showForm = false;


          // Réinitialiser le formulaire

          this.nouveauTicket = {

            titre: '',

            description: '',

            statut: 'Nouveau',

            priorite: 'Moyenne'

          };


          // Message de succès

          this.success =
            '✓ Ticket créé avec succès.';


          console.log(
            'INTERFACE MISE À JOUR APRÈS CRÉATION'
          );
        },


        error: (error) => {

          console.error(
            'ERREUR LORS DE LA CRÉATION DU TICKET :',
            error
          );


          if (error.status === 422) {

            this.error =
              'Les informations saisies sont invalides.';

            return;
          }


          if (error.status === 401) {

            this.authService.logout();

            this.router.navigate(['/login']);

            return;
          }


          if (error.status === 0) {

            this.error =
              'Impossible de contacter le serveur Laravel.';

            return;
          }


          if (error.status === 500) {

            this.error =
              'Une erreur interne est survenue sur le serveur Laravel.';

            return;
          }


          this.error =
            'Impossible de créer le ticket.';
        }
      });
  }


  // =========================================
  // VOIR LES DÉTAILS
  // =========================================

  voirDetails(ticket: Ticket): void {

    console.log(
      'AFFICHAGE DU TICKET :',
      ticket
    );

    this.selectedTicket = ticket;

    this.showDetails = true;

    this.showForm = false;

    this.editingTicket = null;

    this.error = '';

    this.success = '';
  }


  // =========================================
  // FERMER LES DÉTAILS
  // =========================================

  fermerDetails(): void {

    this.showDetails = false;

    this.selectedTicket = null;

    this.error = '';
  }


  // =========================================
  // OUVRIR LA MODIFICATION
  // =========================================

  modifierTicket(ticket: Ticket): void {

    console.log(
      'MODIFICATION DU TICKET :',
      ticket
    );


    this.editingTicket = ticket;

    this.selectedTicket = null;

    this.showDetails = false;

    this.showForm = true;

    this.error = '';

    this.success = '';

    this.creating = false;

    this.updating = false;


    this.nouveauTicket = {

      titre: ticket.titre,

      description: ticket.description,

      statut: ticket.statut,

      priorite: ticket.priorite

    };
  }


  // =========================================
  // ENREGISTRER LA MODIFICATION
  // =========================================

  enregistrerModification(): void {

    if (this.updating) {
      return;
    }

    this.error = '';

    this.success = '';


    // Vérifier qu'un ticket est sélectionné

    if (!this.editingTicket) {

      this.error =
        'Aucun ticket à modifier.';

      return;
    }


    // Vérification du titre

    if (!this.nouveauTicket.titre.trim()) {

      this.error =
        'Veuillez saisir le titre du ticket.';

      return;
    }


    // Vérification de la description

    if (!this.nouveauTicket.description.trim()) {

      this.error =
        'Veuillez saisir la description du ticket.';

      return;
    }


    const ticketId =
      this.editingTicket.id;


    const data: UpdateTicketData = {

      titre: this.nouveauTicket.titre.trim(),

      description: this.nouveauTicket.description.trim(),

      statut: this.nouveauTicket.statut,

      priorite: this.nouveauTicket.priorite

    };


    console.log(
      'MISE À JOUR DU TICKET :',
      ticketId,
      data
    );


    this.updating = true;


    this.ticketService
      .updateTicket(ticketId, data)
      .pipe(

        finalize(() => {

          this.updating = false;

          console.log(
            'FIN DE LA REQUÊTE DE MODIFICATION'
          );

        })

      )
      .subscribe({

        next: (ticketModifie) => {

          console.log(
            'TICKET MODIFIÉ AVEC SUCCÈS :',
            ticketModifie
          );


          // Remplacer le ticket dans la liste

          this.tickets = this.tickets.map(
            ticket =>
              ticket.id === ticketId
                ? ticketModifie
                : ticket
          );


          // Fermer le formulaire

          this.showForm = false;

          this.editingTicket = null;


          // Réinitialiser le formulaire

          this.nouveauTicket = {

            titre: '',

            description: '',

            statut: 'Nouveau',

            priorite: 'Moyenne'

          };


          // Message de succès

          this.success =
            '✓ Ticket modifié avec succès.';


          console.log(
            'INTERFACE MISE À JOUR APRÈS MODIFICATION'
          );
        },


        error: (error) => {

          console.error(
            'ERREUR LORS DE LA MODIFICATION DU TICKET :',
            error
          );


          if (error.status === 422) {

            this.error =
              'Les informations saisies sont invalides.';

            return;
          }


          if (error.status === 401) {

            this.authService.logout();

            this.router.navigate(['/login']);

            return;
          }


          if (error.status === 404) {

            this.error =
              'Le ticket demandé est introuvable.';

            return;
          }


          if (error.status === 0) {

            this.error =
              'Impossible de contacter le serveur Laravel.';

            return;
          }


          if (error.status === 500) {

            this.error =
              'Une erreur interne est survenue sur le serveur Laravel.';

            return;
          }


          this.error =
            'Impossible de modifier le ticket.';
        }
      });
  }


  // =========================================
  // SUPPRIMER UN TICKET
  // =========================================

  supprimerTicket(ticket: Ticket): void {

    console.log(
      'DEMANDE DE SUPPRESSION :',
      ticket
    );


    const confirmation =
      window.confirm(
        `Voulez-vous vraiment supprimer le ticket #${ticket.id} ?`
      );


    if (!confirmation) {

      return;
    }


    this.error = '';

    this.success = '';


    console.log(
      'SUPPRESSION DU TICKET :',
      ticket.id
    );


    this.ticketService
      .deleteTicket(ticket.id)
      .subscribe({

        next: () => {

          console.log(
            'TICKET SUPPRIMÉ AVEC SUCCÈS :',
            ticket.id
          );


          // Supprimer immédiatement de la liste

          this.tickets =
            this.tickets.filter(
              t => t.id !== ticket.id
            );


          this.success =
            '✓ Ticket supprimé avec succès.';


          // Fermer les détails si nécessaire

          if (
            this.selectedTicket &&
            this.selectedTicket.id === ticket.id
          ) {

            this.fermerDetails();
          }
        },


        error: (error) => {

          console.error(
            'ERREUR LORS DE LA SUPPRESSION DU TICKET :',
            error
          );


          if (error.status === 401) {

            this.authService.logout();

            this.router.navigate(['/login']);

            return;
          }


          if (error.status === 404) {

            this.error =
              'Le ticket demandé est introuvable.';

            return;
          }


          if (error.status === 0) {

            this.error =
              'Impossible de contacter le serveur Laravel.';

            return;
          }


          if (error.status === 500) {

            this.error =
              'Une erreur interne est survenue sur le serveur Laravel.';

            return;
          }


          this.error =
            'Impossible de supprimer le ticket.';
        }
      });
  }


  // =========================================
  // DÉCONNEXION
  // =========================================

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);

  }

}