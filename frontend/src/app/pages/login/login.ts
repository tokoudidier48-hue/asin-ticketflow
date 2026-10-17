import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  error = '';
  loading = false;

  login(): void {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('LOGIN SUCCESS:', response);

        this.loading = false;
        this.cdr.markForCheck();

        this.router.navigate(['/tickets']).then((success) => {
          console.log('NAVIGATION RESULT:', success);

          if (!success) {
            this.error = 'Impossible d’ouvrir la page des tickets.';
            this.cdr.markForCheck();
          }
        });
      },

      error: (error) => {
        console.error('LOGIN ERROR:', error);

        this.loading = false;

        if (error.status === 401) {
          this.error = 'Email ou mot de passe incorrect.';
        } else if (error.status === 422) {
          this.error = 'Les informations saisies sont invalides.';
        } else if (error.status === 0) {
          this.error = 'Impossible de contacter le serveur Laravel.';
        } else if (error.status === 500) {
          this.error = 'Erreur interne du serveur Laravel.';
        } else {
          this.error = 'Une erreur est survenue pendant la connexion.';
        }

        this.cdr.markForCheck();
      }
    });
  }
}