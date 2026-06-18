import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { GithubService, GithubFile } from '../../core/services/github.service';
import { HttpClient } from '@angular/common/http';

interface SiteConfig {
  nom: string;
  titre: string;
  description: string;
  liens: { id: string; titre: string; url: string; description: string }[];
}

interface Sheet {
  id: string;
  nom: string;
  fichier: string;
  description: string;
  date: string;
}

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  auth = inject(AuthService);
  github = inject(GithubService);
  http = inject(HttpClient);

  tokenInput = signal('');
  loginError = signal('');
  loginLoading = signal(false);

  config = signal<SiteConfig | null>(null);
  configSha = signal('');
  sheets = signal<Sheet[]>([]);
  sheetsSha = signal('');
  repoSheets = signal<GithubFile[]>([]);

  saving = signal(false);
  saveMsg = signal('');
  uploading = signal(false);
  uploadMsg = signal('');

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) this.loadData();
  }

  login(): void {
    const token = this.tokenInput();
    if (!token) return;
    this.loginLoading.set(true);
    this.loginError.set('');
    this.github.verifiyToken(token).subscribe({
      next: () => {
        this.auth.setToken(token);
        this.loginLoading.set(false);
        this.loadData();
      },
      error: () => {
        this.loginLoading.set(false);
        this.loginError.set('Token invalide ou accès refusé.');
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.config.set(null);
  }

  private loadData(): void {
    this.github.getFile('public/data/site-config.json').subscribe(f => {
      this.configSha.set(f.sha);
      this.config.set(JSON.parse(atob(f.content.replace(/\n/g, ''))));
    });
    this.github.getFile('public/data/sheets.json').subscribe(f => {
      this.sheetsSha.set(f.sha);
      this.sheets.set(JSON.parse(atob(f.content.replace(/\n/g, ''))));
    });
    this.github.listDirectory('public/sheets').subscribe(files =>
      this.repoSheets.set(files.filter(f => f.name.endsWith('.pdf')))
    );
  }

  saveConfig(): void {
    const c = this.config();
    if (!c) return;
    this.saving.set(true);
    this.saveMsg.set('');
    this.github.updateFile(
      'public/data/site-config.json',
      JSON.stringify(c, null, 2),
      this.configSha(),
      'Update site config via admin'
    ).subscribe({
      next: (res: any) => {
        this.configSha.set(res.content.sha);
        this.saving.set(false);
        this.saveMsg.set('Sauvegardé avec succès.');
      },
      error: () => { this.saving.set(false); this.saveMsg.set('Erreur lors de la sauvegarde.'); },
    });
  }

  addLien(): void {
    const c = this.config();
    if (!c) return;
    this.config.set({
      ...c,
      liens: [...c.liens, { id: 'lien-' + Date.now(), titre: '', url: '', description: '' }],
    });
  }

  removeLien(index: number): void {
    const c = this.config();
    if (!c) return;
    this.config.set({ ...c, liens: c.liens.filter((_, i) => i !== index) });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.name.endsWith('.pdf')) return;

    this.uploading.set(true);
    this.uploadMsg.set('');
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const path = `public/sheets/${file.name}`;
      this.github.createFile(path, base64, `Add sheet: ${file.name}`).subscribe({
        next: () => {
          const newSheet: Sheet = {
            id: file.name.replace('.pdf', ''),
            nom: file.name.replace('.pdf', '').replace(/-/g, ' '),
            fichier: `sheets/${file.name}`,
            description: '',
            date: new Date().toISOString().split('T')[0],
          };
          const updated = [...this.sheets(), newSheet];
          this.sheets.set(updated);
          this.github.updateFile(
            'public/data/sheets.json',
            JSON.stringify(updated, null, 2),
            this.sheetsSha(),
            `Add sheet entry: ${file.name}`
          ).subscribe({
            next: (res: any) => {
              this.sheetsSha.set(res.content.sha);
              this.uploading.set(false);
              this.uploadMsg.set(`${file.name} uploadé.`);
              this.loadData();
            },
          });
        },
        error: () => { this.uploading.set(false); this.uploadMsg.set('Erreur upload.'); },
      });
    };
    reader.readAsDataURL(file);
  }

  deleteSheet(sheet: Sheet, repoFile: GithubFile): void {
    if (!confirm(`Supprimer "${sheet.nom}" ?`)) return;
    this.github.deleteFile(repoFile.path, repoFile.sha, `Delete sheet: ${sheet.fichier}`).subscribe({
      next: () => {
        const updated = this.sheets().filter(s => s.id !== sheet.id);
        this.sheets.set(updated);
        this.github.updateFile(
          'public/data/sheets.json',
          JSON.stringify(updated, null, 2),
          this.sheetsSha(),
          `Remove sheet entry: ${sheet.nom}`
        ).subscribe((res: any) => this.sheetsSha.set(res.content.sha));
        this.loadData();
      },
    });
  }

  repoFileFor(sheet: Sheet): GithubFile | undefined {
    return this.repoSheets().find(f => sheet.fichier.endsWith(f.name));
  }

  trackLien(_: number, l: { id: string }) { return l.id; }
}
