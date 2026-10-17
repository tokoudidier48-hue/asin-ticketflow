import { Component, HostListener, ElementRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../../services/auth';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss'
})
export class UserMenu {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  user: AuthUser | null = this.authService.getUser();

  open = signal(false);
  loggingOut = signal(false);

  get initial(): string {
    return this.user?.name?.trim().charAt(0).toUpperCase() || '?';
  }

  toggle(): void {
    this.open.update(value => !value);
  }

  // Ferme le menu si on clique en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }

  logout(): void {
    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);

    this.authService.logoutFromServer().subscribe({
      complete: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}