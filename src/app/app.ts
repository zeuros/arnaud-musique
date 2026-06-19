import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter, map } from 'rxjs/operators';
import { GoatCounterService } from './core/services/goatcounter.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private gc = inject(GoatCounterService);

  ngOnInit(): void {
    this.http.get<{ content: string }>(
      `https://api.github.com/repos/zeuros/arnaud-musique/contents/public/data/site-config.json?t=${Date.now()}`
    ).pipe(
      map(r => JSON.parse(decodeURIComponent(escape(atob(r.content.replace(/\n/g, ''))))) as { goatcounterSite?: string })
    ).subscribe(c => {
      if (c.goatcounterSite) {
        this.gc.init(c.goatcounterSite);
        this.router.events
          .pipe(filter(e => e instanceof NavigationEnd))
          .subscribe(e => this.gc.trackPage((e as NavigationEnd).urlAfterRedirects));
      }
    });
  }
}
