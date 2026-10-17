import { Component, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['../register/register.css', './forgot-password.scss']
})
export class ForgotPassword implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // 1 = e-mail, 2 = code OTP, 3 = nouveau mot de passe
  step: 1 | 2 | 3 = 1;

  email = '';
  code = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  loading = false;
  errorMessage = '';
  successMessage = '';

  private resetToken = '';
  private redirectTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }

  // ---------- Étape 1 : envoi du code ----------

  sendCode(): void {
    this.clearMessages();

    const email = this.email.trim().toLowerCase();

    if (!email) {
      this.errorMessage = 'Veuillez saisir votre adresse email.';
      return;
    }

    this.loading = true;

    this.authService.forgotPassword(email)
      .pipe(finalize(() => this.done()))
      .subscribe({
        next: () => {
          this.email = email;
          this.code = '';
          this.step = 2;
          this.successMessage =
            'Si cette adresse correspond à un compte, un code à 6 chiffres vient d’être envoyé.';
        },
        error: (error) => {
          this.errorMessage = this.getMessage(
            error,
            'Impossible d’envoyer le code. Veuillez réessayer.'
          );
        }
      });
  }

  resendCode(): void {
    this.sendCode();
  }

  // ---------- Étape 2 : vérification du code ----------

  onCodeInput(): void {
    this.code = this.code.replace(/\D/g, '').slice(0, 6);
  }

  verifyCode(): void {
    this.clearMessages();

    if (this.code.length !== 6) {
      this.errorMessage = 'Le code doit contenir 6 chiffres.';
      return;
    }

    this.loading = true;

    this.authService.verifyOtp(this.email, this.code)
      .pipe(finalize(() => this.done()))
      .subscribe({
        next: (response) => {
          this.resetToken = response.reset_token;
          this.step = 3;
        },
        error: (error) => {
          this.errorMessage = this.getMessage(
            error,
            'Code invalide ou expiré.'
          );
        }
      });
  }

  backToEmail(): void {
    this.clearMessages();
    this.code = '';
    this.step = 1;
  }

  // ---------- Étape 3 : nouveau mot de passe ----------

  submitNewPassword(): void {
    this.clearMessages();

    if (this.password.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;

    this.authService.resetPassword(
      this.email,
      this.resetToken,
      this.password,
      this.confirmPassword
    )
      .pipe(finalize(() => this.done()))
      .subscribe({
        next: () => {
          this.successMessage =
            'Mot de passe modifié avec succès ! Redirection vers la connexion...';

          this.redirectTimer = setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = this.getMessage(
            error,
            'Impossible de modifier le mot de passe.'
          );

          // Jeton expiré : on recommence depuis le début
          if (error.status === 422 && !error.error?.errors) {
            this.step = 1;
          }
        }
      });
  }

  // ---------- Utilitaires ----------

  private done(): void {
    this.loading = false;
    this.cdr.markForCheck();
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private getMessage(error: any, fallback: string): string {
    if (error.status === 0) {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    }

    if (error.status === 429) {
      return 'Trop de tentatives. Patientez une minute puis réessayez.';
    }

    const errors = error.error?.errors;
    if (errors) {
      const first = Object.values(errors)[0] as string[] | undefined;
      if (first && first.length > 0) {
        return first[0];
      }
    }

    return error.error?.message || fallback;
  }
}