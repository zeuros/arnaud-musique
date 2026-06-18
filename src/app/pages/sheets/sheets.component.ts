import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface Sheet {
  id: string;
  nom: string;
  fichier: string;
  description: string;
  date: string;
}

@Component({
  selector: 'app-sheets',
  imports: [],
  templateUrl: './sheets.component.html',
  styleUrl: './sheets.component.scss',
})
export class SheetsComponent implements OnInit {
  sheets = signal<Sheet[]>([]);
  search = signal('');
  selected = signal<Sheet | null>(null);
  pdfUrl = signal<SafeResourceUrl | null>(null);

  filtered = computed(() =>
    this.sheets().filter(s =>
      s.nom.toLowerCase().includes(this.search().toLowerCase()) ||
      s.description.toLowerCase().includes(this.search().toLowerCase())
    )
  );

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.http.get<Sheet[]>('/data/sheets.json').subscribe(s => this.sheets.set(s));
  }

  select(sheet: Sheet): void {
    this.selected.set(sheet);
    this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl('/' + sheet.fichier));
  }

  onSearch(value: string): void {
    this.search.set(value);
  }
}
