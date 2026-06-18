import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
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
export class SheetsComponent implements OnInit, OnDestroy {
  sheets = signal<Sheet[]>([]);
  search = signal('');
  selected = signal<Sheet | null>(null);
  pdfUrl = signal<SafeResourceUrl | null>(null);
  pdfLoading = signal(false);

  private blobUrl: string | null = null;

  filtered = computed(() =>
    this.sheets().filter(s =>
      s.nom.toLowerCase().includes(this.search().toLowerCase()) ||
      s.description.toLowerCase().includes(this.search().toLowerCase())
    )
  );

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.http.get<Sheet[]>('data/sheets.json').subscribe(s => this.sheets.set(s));
  }

  ngOnDestroy(): void {
    this.revokeBlobUrl();
  }

  select(sheet: Sheet): void {
    this.selected.set(sheet);
    this.pdfUrl.set(null);
    this.pdfLoading.set(true);
    this.revokeBlobUrl();

    this.http.get(sheet.fichier, { responseType: 'blob' }).subscribe({
      next: blob => {
        const pdf = new Blob([blob], { type: 'application/pdf' });
        this.blobUrl = URL.createObjectURL(pdf);
        this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl));
        this.pdfLoading.set(false);
      },
      error: () => this.pdfLoading.set(false),
    });
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  private revokeBlobUrl(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }
}
