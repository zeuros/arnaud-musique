import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
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
    this.http.get<{ goatcounterSite?: string }>(`https://raw.githubusercontent.com/zeuros/arnaud-musique/main/public/data/site-config.json?t=${Date.now()}`).subscribe(c => {
      if (c.goatcounterSite) {
        this.gc.init(c.goatcounterSite);
        this.router.events
          .pipe(filter(e => e instanceof NavigationEnd))
          .subscribe(e => this.gc.trackPage((e as NavigationEnd).urlAfterRedirects));
      }
    });
  }
}
