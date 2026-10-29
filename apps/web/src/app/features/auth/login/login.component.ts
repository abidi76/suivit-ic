import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, PRESET_ACCOUNTS, UserAccount } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  identifiant = '';
  motDePasse = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  showPassword = false;
  showCredentialsDirectory = false;
  
  // Annuaire officiel des 9 profils d'acteurs
  officialAccounts: UserAccount[] = PRESET_ACCOUNTS;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.identifiant.trim()) {
      this.errorMessage = 'Veuillez saisir votre identifiant (adresse e-mail ou matricule officiel).';
      return;
    }

    if (!this.motDePasse.trim()) {
      this.errorMessage = 'Veuillez saisir votre mot de passe officiel.';
      return;
    }

    this.isSubmitting = true;

    this.authService.login({ identifiant: this.identifiant, motDePasse: this.motDePasse }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (!res.success) {
          this.errorMessage = res.message || 'Identifiant ou mot de passe incorrect.';
        } else {
          this.successMessage = 'Authentification réussie. Redirection vers votre Dashboard officiel...';
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

  toggleDirectory(): void {
    this.showCredentialsDirectory = !this.showCredentialsDirectory;
  }

  /**
   * Pré-remplit les champs du formulaire sans connecter automatiquement,
   * respectant la règle de saisie unique pour un compte.
   */
  preRemplir(acc: UserAccount): void {
    this.identifiant = acc.email;
    this.motDePasse = acc.motDePasse;
    this.errorMessage = '';
    this.successMessage = `Identifiants pré-renseignés pour : ${acc.prenom} ${acc.nom} (${acc.roleLabel}). Cliquez sur « Se connecter » pour valider.`;
  }
}