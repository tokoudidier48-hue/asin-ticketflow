
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  nom = '';
  prenom = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const nom = this.nom.trim();
    const prenom = this.prenom.trim();
    const email = this.email.trim().toLowerCase();

    if (!nom || !prenom || !email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;

    this.http.post(`${environment.apiUrl}/register`, {
      name: `${prenom} ${nom}`,
      email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection vers la connexion...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 422) {
          this.errorMessage =
            error.error?.message ||
            'Vérifiez les informations saisies. Cette adresse email est peut-être déjà utilisée.';
        } else if (error.status === 0) {
          this.errorMessage =
            'Impossible de contacter le serveur. Vérifiez votre connexion.';
        } else {
          this.errorMessage =
            error.error?.message || 'Une erreur est survenue lors de la création du compte.';
        }
      }
    });
  }
}
