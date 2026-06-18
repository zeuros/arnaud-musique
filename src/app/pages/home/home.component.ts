import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface SiteConfig {
  nom: string;
  titre: string;
  description: string;
  liens: { id: string; titre: string; url: string; description: string }[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  config = signal<SiteConfig | null>(null);

  readonly notes = [
    { char: '♩', left: 4,  delay: 0,  duration: 16, size: 1.4 },
    { char: '♪', left: 12, delay: 3,  duration: 12, size: 2.0 },
    { char: '♫', left: 22, delay: 7,  duration: 19, size: 1.1 },
    { char: '♬', left: 33, delay: 1,  duration: 14, size: 1.8 },
    { char: '♩', left: 44, delay: 5,  duration: 21, size: 1.5 },
    { char: '♪', left: 55, delay: 9,  duration: 11, size: 1.3 },
    { char: '♫', left: 65, delay: 2,  duration: 17, size: 2.1 },
    { char: '♬', left: 75, delay: 6,  duration: 13, size: 1.2 },
    { char: '♩', left: 85, delay: 4,  duration: 18, size: 1.7 },
    { char: '♪', left: 93, delay: 11, duration: 15, size: 1.0 },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<SiteConfig>('https://raw.githubusercontent.com/zeuros/arnaud-musique/main/public/data/site-config.json').subscribe(c => this.config.set(c));
  }
}
