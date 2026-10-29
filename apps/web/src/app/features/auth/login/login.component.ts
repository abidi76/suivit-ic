import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {
  identifiant = '';
  motDePasse = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  showPassword = false;
  showCredentialsDirectory = true; // Ouvert par défaut pour faciliter l'accès immédiat aux mots de passe
  selectedAccountMatricule = '';
  
  // Annuaire officiel des 10 profils d'acteurs
  officialAccounts: UserAccount[] = PRESET_ACCOUNTS;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Si l'utilisateur est déjà connecté, le rediriger directement vers son dashboard
    if (this.authService.isLoggedIn()) {
      const current = this.authService.currentUserValue;
      if (current) {
        this.authService.redirectUserByRole(current.role);
      }
    }
  }

  /**
   * Sélection rapide depuis la liste déroulante
   */
  onAccountSelectChange(): void {
    if (!this.selectedAccountMatricule) return;
    const acc = this.officialAccounts.find(a => a.matricule === this.selectedAccountMatricule);
    if (acc) {
      this.preRemplir(acc);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.identifiant.trim()) {
      this.errorMessage = 'Veuillez saisir votre identifiant ou choisir un acteur dans la liste déroulante ci-dessus (ex: inspecteur.informatique@edunet.tn ou INSP-9001).';
      return;
    }

    if (!this.motDePasse.trim()) {
      this.errorMessage = 'Veuillez saisir le mot de passe attribué à ce compte.';
      return;
    }

    this.isSubmitting = true;

    this.authService.login({ identifiant: this.identifiant, motDePasse: this.motDePasse }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (!res.success) {
          this.errorMessage = res.message || 'Identifiant ou mot de passe incorrect.';
        } else {
          this.successMessage = '✓ Authentification réussie. Redirection vers votre Dashboard officiel...';
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
   * Pré-remplit les champs du formulaire avec les identifiants de l'acteur choisi
   */
  preRemplir(acc: UserAccount): void {
    this.selectedAccountMatricule = acc.matricule;
    this.identifiant = acc.email;
    this.motDePasse = acc.motDePasse;
    this.errorMessage = '';
    this.successMessage = `Compte sélectionné : ${acc.prenom} ${acc.nom} (${acc.roleLabel}). Cliquez sur « Se connecter » pour accéder au dashboard.`;
  }

  /**
   * Renseigne les identifiants et valide immédiatement la connexion
   */
  connecterDirect(acc: UserAccount): void {
    this.selectedAccountMatricule = acc.matricule;
    this.identifiant = acc.email;
    this.motDePasse = acc.motDePasse;
    this.onSubmit();
  }
}