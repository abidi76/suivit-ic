import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('http://localhost:3000/dashboard/stats').subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error(err)
    });
  }
}