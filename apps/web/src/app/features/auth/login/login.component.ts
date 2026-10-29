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
  // Champs de connexion manuelle stricte
  identifiant = '';
  motDePasse = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  showPassword = false;

  // Modale de changement / réinitialisation de mot de passe
  showResetModal = false;
  resetIdentifiant = '';
  resetNouveauMotDePasse = '';
  resetConfirmationMotDePasse = '';
  resetErrorMessage = '';
  resetSuccessMessage = '';
  isResetSubmitting = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Si l'utilisateur a déjà une session valide, l'acheminer directement vers son dashboard
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
    const pw = this.motDePasse.trim();

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
          this.successMessage = '✓ Authentification réussie. Acheminement vers votre Dashboard officiel...';
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

    const email = this.resetIdentifiant.trim();
    const nouveau = this.resetNouveauMotDePasse.trim();
    const confirm = this.resetConfirmationMotDePasse.trim();

    if (!email) {
      this.resetErrorMessage = 'Veuillez saisir votre adresse e-mail institutionnelle (@edunet.tn).';
      return;
    }

    if (!nouveau || nouveau.length < 6) {
      this.resetErrorMessage = 'Le mot de passe doit comporter au moins 6 caractères.';
      return;
    }

    if (nouveau !== confirm) {
      this.resetErrorMessage = 'Les deux mots de passe saisis ne sont pas identiques.';
      return;
    }

    this.isResetSubmitting = true;

    this.authService.changerMotDePasse(email, nouveau).subscribe({
      next: (res) => {
        this.isResetSubmitting = false;
        if (!res.success) {
          this.resetErrorMessage = res.message;
        } else {
          this.resetSuccessMessage = res.message;
          // Pré-remplit le formulaire principal avec les nouveaux identifiants
          this.identifiant = email;
          this.motDePasse = nouveau;
          setTimeout(() => {
            this.showResetModal = false;
            this.successMessage = '✓ Nouveau mot de passe enregistré et transmis à votre boîte e-mail. Vous pouvez maintenant cliquer sur « Se connecter ».';
          }, 2000);
        }
      },
      error: () => {
        this.isResetSubmitting = false;
        this.resetErrorMessage = 'Erreur lors de la mise à jour du mot de passe.';
      }
    });
  }
}