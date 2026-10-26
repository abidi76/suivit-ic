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
  presetAccounts = PRESET_ACCOUNTS;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (!this.identifiant.trim()) {
      this.errorMessage = 'Veuillez saisir votre adresse e-mail institutionnelle ou matricule.';
      return;
    }

    this.authService.login({ identifiant: this.identifiant, motDePasse: this.motDePasse }).subscribe({
      next: (success) => {
        if (!success) {
          this.errorMessage = 'Identifiant ou mot de passe incorrect. Vous pouvez utiliser les profils préconfigurés ci-dessous.';
        }
      }
    });
  }

  selectPreset(acc: UserAccount): void {
    this.authService.loginAsPreset(acc);
  }
}