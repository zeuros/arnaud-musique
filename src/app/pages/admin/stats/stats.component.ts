import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoatCounterService, GcHit, GcTotals } from '../../../core/services/goatcounter.service';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

@Component({
  selector: 'app-stats',
  imports: [FormsModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements OnInit {
  @Input() siteCode = '';

  apiTokenInput = signal('');
  saved = signal(false);
  loading = signal(false);
  error = signal('');

  totals7 = signal<GcTotals | null>(null);
  totals30 = signal<GcTotals | null>(null);
  hits = signal<GcHit[]>([]);

  maxCount = computed(() => Math.max(...this.hits().map(h => h.count), 1));

  constructor(private gc: GoatCounterService) {}

  ngOnInit(): void {
    this.apiTokenInput.set(this.gc.getApiToken());
    if (this.gc.hasApiToken() && this.siteCode) {
      this.gc.init(this.siteCode);
      this.load();
    }
  }

  saveToken(): void {
    this.gc.saveApiToken(this.apiTokenInput());
    this.gc.init(this.siteCode);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const today = new Date().toISOString().split('T')[0];

    this.gc.getTotals(daysAgo(7), today).subscribe({
      next: t => this.totals7.set(t),
      error: () => this.error.set('Impossible de charger les stats. Vérifiez le site code et le token API.'),
    });

    this.gc.getTotals(daysAgo(30), today).subscribe({
      next: t => this.totals30.set(t),
    });

    this.gc.getHits(daysAgo(30), today).subscribe({
      next: r => { this.hits.set(r.hits ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  barWidth(count: number): string {
    return Math.round((count / this.maxCount()) * 100) + '%';
  }
}
