import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DeviceTypeStat {
  type: string;
  total: number;
  enService: number;
  enPanne: number;
  enAttente: number;
  icon: string;
}

export interface EtablissementStat {
  id: string;
  nom: string;
  delegation: string;
  total: number;
  enService: number;
  enPanne: number;
  enAttente: number;
  bacPratiquePret: boolean;
}

export interface PanneRecente {
  id: string;
  type: string;
  marque: string;
  etablissement: string;
  labo: string;
  panne: string;
  date: string;
  priorite: string;
  statut: string;
}

export interface ActionATraiter {
  titre: string;
  count: number;
  type: string;
  urgence: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  isLoading = true;
  errorMessage = '';

  // Filtres
  selectedDelegation = 'TOUTES';
  selectedType = 'TOUS';
  searchTerm = '';
  activeTab: 'vue-ensemble' | 'etablissements' | 'pannes' = 'vue-ensemble';

  // Modal de détail de statut
  selectedStatFilter: string | null = null;
  currentDate = new Date();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.http.get<any>('http://localhost:3000/dashboard/stats').subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement des statistiques:', err);
        this.errorMessage = 'Impossible de charger les statistiques du parc.';
        this.isLoading = false;
      }
    });
  }

  get tauxDisponibilite(): number {
    if (!this.stats?.equipements?.total) return 0;
    const dispo = (this.stats.equipements.enService / this.stats.equipements.total) * 100;
    return Math.round(dispo * 10) / 10;
  }

  get tauxPanne(): number {
    if (!this.stats?.equipements?.total) return 0;
    const pannes = (this.stats.equipements.enPanne / this.stats.equipements.total) * 100;
    return Math.round(pannes * 10) / 10;
  }

  get filteredEtablissements(): EtablissementStat[] {
    if (!this.stats?.etablissements) return [];
    return this.stats.etablissements.filter((e: EtablissementStat) => {
      const matchDelegation = this.selectedDelegation === 'TOUTES' || e.delegation === this.selectedDelegation;
      const matchSearch = !this.searchTerm || e.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchDelegation && matchSearch;
    });
  }

  get filteredTypes(): DeviceTypeStat[] {
    if (!this.stats?.parType) return [];
    if (this.selectedType === 'TOUS') return this.stats.parType;
    return this.stats.parType.filter((t: DeviceTypeStat) => t.type === this.selectedType);
  }

  get filteredPannes(): PanneRecente[] {
    if (!this.stats?.pannesRecentes) return [];
    return this.stats.pannesRecentes.filter((p: PanneRecente) => {
      const matchSearch = !this.searchTerm ||
        p.etablissement.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchSearch;
    });
  }

  filterByStatus(status: string | null): void {
    this.selectedStatFilter = this.selectedStatFilter === status ? null : status;
  }

  imprimerRapport(): void {
    window.print();
  }
}