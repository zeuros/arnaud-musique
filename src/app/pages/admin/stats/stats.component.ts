import { Component, Input, OnChanges, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const TOKEN_KEY = 'gc_token';

interface GcHit { path: string; title: string; count: number; count_unique: number; }
interface GcHitsResponse { hits: GcHit[]; total: number; total_unique: number; }

@Component({
  selector: 'app-stats',
  imports: [FormsModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements OnChanges {
  @Input() siteCode = '';

  apiTokenInput = signal(localStorage.getItem(TOKEN_KEY) ?? '');
  saved = signal(false);
  loading = signal(false);
  error = signal('');

  hits = signal<GcHit[]>([]);
  total = signal(0);
  totalUnique = signal(0);

  maxCount = computed(() => Math.max(...this.hits().map(h => h.count), 1));

  dashboardUrl = computed(() =>
    this.siteCode ? `https://${this.siteCode}.goatcounter.com` : '#'
  );

  constructor(private http: HttpClient) {}

  ngOnChanges(): void {
    if (this.siteCode && this.getToken()) this.load();
  }

  saveToken(): void {
    localStorage.setItem(TOKEN_KEY, this.apiTokenInput());
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
    if (this.siteCode) this.load();
  }

  load(): void {
    const token = this.getToken();
    if (!token || !this.siteCode) return;
    this.loading.set(true);
    this.error.set('');

    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    this.http.get<GcHitsResponse>(
      `https://${this.siteCode}.goatcounter.com/api/v0/stats/hits?start=${start}&end=${end}&limit=10`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: r => {
        this.hits.set(r.hits ?? []);
        this.total.set(r.total ?? 0);
        this.totalUnique.set(r.total_unique ?? 0);
        this.loading.set(false);
      },
      error: e => {
        this.loading.set(false);
        if (e.status === 429) this.error.set('Trop de requêtes — réessayez dans quelques secondes.');
        else if (e.status === 401) this.error.set('Token invalide.');
        else this.error.set(`Erreur ${e.status} — vérifiez le site code et le token.`);
      },
    });
  }

  barWidth(count: number): string {
    return Math.round((count / this.maxCount()) * 100) + '%';
  }

  private getToken(): string {
    return localStorage.getItem(TOKEN_KEY) ?? '';
  }
}
