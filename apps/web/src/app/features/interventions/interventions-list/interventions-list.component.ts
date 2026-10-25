import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterventionService } from '../../../core/services/intervention.service';

@Component({
  selector: 'app-interventions-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interventions-list.component.html',
  styleUrls: ['./interventions-list.component.scss']
})
export class InterventionsListComponent implements OnInit {
  interventions: any[] = [];
  isLoading = true;

  constructor(private service: InterventionService) {}

  ngOnInit() {
    this.service.getInterventions().subscribe({
      next: (data) => {
        this.interventions = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}