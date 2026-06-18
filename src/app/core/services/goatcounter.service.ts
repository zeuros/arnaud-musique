import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const TOKEN_KEY = 'gc_token';

export interface GcHit {
  path: string;
  title: string;
  count: number;
  count_unique: number;
}

export interface GcHitsResponse {
  hits: GcHit[];
  total: number;
  total_unique: number;
}

export interface GcTotals {
  total: number;
  total_unique: number;
}

declare global {
  interface Window {
    goatcounter?: { count: (opts?: { path?: string; title?: string }) => void };
  }
}

@Injectable({ providedIn: 'root' })
export class GoatCounterService {
  private siteCode = '';

  constructor(private http: HttpClient) {}

  init(siteCode: string): void {
    if (!siteCode || this.siteCode === siteCode) return;
    this.siteCode = siteCode;
    const script = document.createElement('script');
    script.dataset['goatcounter'] = `https://${siteCode}.goatcounter.com/count`;
    script.async = true;
    script.src = '//gc.zgo.at/count.js';
    document.head.appendChild(script);
  }

  trackPage(path: string): void {
    if (window.goatcounter?.count) {
      window.goatcounter.count({ path });
    }
  }

  // Admin API calls
  private apiBase(): string {
    return `https://${this.siteCode}.goatcounter.com/api/v0`;
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.getApiToken()}` });
  }

  getHits(start: string, end: string): Observable<GcHitsResponse> {
    return this.http.get<GcHitsResponse>(
      `${this.apiBase()}/stats/hits?start=${start}&end=${end}&limit=10`,
      { headers: this.headers() }
    );
  }

  getTotals(start: string, end: string): Observable<GcTotals> {
    return this.http.get<GcTotals>(
      `${this.apiBase()}/stats/totals?start=${start}&end=${end}`,
      { headers: this.headers() }
    );
  }

  saveApiToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getApiToken(): string {
    return localStorage.getItem(TOKEN_KEY) ?? '';
  }

  hasApiToken(): boolean {
    return !!this.getApiToken();
  }

  getSiteCode(): string {
    return this.siteCode;
  }
}
