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
  resetIdentifiant = '';
  resetNouveauMotDePasse = '';
  resetConfirmationMotDePasse = '';
  resetErrorMessage = '';
  resetSuccessMessage = '';
  isResetSubmitting = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const current = this.authService.currentUserValue;
      if (current) {
        this.authService.redirectUserByRole(current.role);
      }
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const id = this.identifiant.trim();
    const pw = this.motDePasse;

    if (!id) {
      this.errorMessage = 'Veuillez saisir votre adresse e-mail institutionnelle ou votre matricule.';
      return;
    }

    if (!pw) {
      this.errorMessage = 'Veuillez saisir votre mot de passe.';
      return;
    }

    this.isSubmitting = true;

    this.authService.login({ identifiant: id, motDePasse: pw }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (!res.success) {
          this.errorMessage = res.message || 'Identifiant ou mot de passe incorrect.';
        } else {
          this.successMessage = '✓ Authentification réussie. Acheminement vers votre tableau de bord.';
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Une erreur est survenue lors de la tentative de connexion.';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  ouvrirModaleReset(): void {
    this.resetIdentifiant = this.identifiant.trim();
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

    const identifiant = this.resetIdentifiant.trim();
    const nouveau = this.resetNouveauMotDePasse;
    const confirm = this.resetConfirmationMotDePasse;

    if (!identifiant) {
      this.resetErrorMessage = 'Veuillez saisir votre adresse e-mail institutionnelle ou votre matricule.';
      return;
    }

    if (nouveau.length < 8) {
      this.resetErrorMessage = 'Le mot de passe doit comporter au moins 8 caractères.';
      return;
    }

    if (nouveau !== confirm) {
      this.resetErrorMessage = 'Les deux mots de passe saisis ne sont pas identiques.';
      return;
    }

    this.isResetSubmitting = true;

    this.authService.changerMotDePasse(identifiant, nouveau).subscribe({
      next: (res) => {
        this.isResetSubmitting = false;
        if (!res.success) {
          this.resetErrorMessage = res.message;
        } else {
          this.resetSuccessMessage = res.message;
          this.identifiant = identifiant;
          this.motDePasse = nouveau;
          setTimeout(() => {
            this.showResetModal = false;
            this.successMessage = '✓ Mot de passe enregistré. Vous pouvez maintenant vous connecter.';
          }, 1200);
        }
      },
      error: () => {
        this.isResetSubmitting = false;
        this.resetErrorMessage = 'Erreur lors de la mise à jour du mot de passe.';
      }
    });
  }
}
