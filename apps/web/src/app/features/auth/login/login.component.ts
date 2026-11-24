import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  identifiant = '';
  motDePasse = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  showPassword = false;

  showResetModal = false;
  resetAncienMotDePasse = '';
  resetNouveauMotDePasse = '';
  resetConfirmationMotDePasse = '';
  resetErrorMessage = '';
  resetSuccessMessage = '';
  isResetSubmitting = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const current = this.authService.currentUserValue;
      if (current) this.authService.redirectUserByRole(current.role);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const identifiant = this.identifiant.trim();
    const motDePasse = this.motDePasse;

    if (!identifiant) {
      this.errorMessage = 'Veuillez saisir votre adresse e-mail institutionnelle ou votre matricule.';
      return;
    }
    if (!motDePasse) {
      this.errorMessage = 'Veuillez saisir votre mot de passe.';
      return;
    }

    this.isSubmitting = true;
    this.authService.login({ identifiant, motDePasse }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.errorMessage = res.success ? '' : (res.message || 'Identifiant ou mot de passe incorrect.');
        if (res.success) this.successMessage = 'Authentification réussie.';
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Impossible de contacter le serveur.';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  ouvrirModaleReset(): void {
    this.resetAncienMotDePasse = '';
    this.resetNouveauMotDePasse = '';
    this.resetConfirmationMotDePasse = '';
    this.resetErrorMessage = '';
    this.resetSuccessMessage = '';
    this.showResetModal = true;
  }

  fermerModaleReset(): void {
    this.showResetModal = false;
  }

  confirmerChangementMotDePasse(): void {
    this.resetErrorMessage = '';
    this.resetSuccessMessage = '';

    const ancien = this.resetAncienMotDePasse;
    const nouveau = this.resetNouveauMotDePasse;
    const confirmation = this.resetConfirmationMotDePasse;

    if (!ancien) {
      this.resetErrorMessage = 'Veuillez saisir votre mot de passe actuel.';
      return;
    }
    if (nouveau.length < 8) {
      this.resetErrorMessage = 'Le mot de passe doit comporter au moins 8 caractères.';
      return;
    }
    if (nouveau !== confirmation) {
      this.resetErrorMessage = 'Les deux mots de passe saisis ne sont pas identiques.';
      return;
    }

    this.isResetSubmitting = true;
    this.authService.changerMotDePasse(ancien, nouveau).subscribe({
      next: (res) => {
        this.isResetSubmitting = false;
        if (!res.success) {
          this.resetErrorMessage = res.message;
        } else {
          this.resetSuccessMessage = res.message;
          this.motDePasse = '';
        }
      },
      error: () => {
        this.isResetSubmitting = false;
        this.resetErrorMessage = 'Impossible de joindre le serveur.';
      }
    });
  }
}
