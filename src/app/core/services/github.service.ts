import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

const OWNER = 'zeuros';
const REPO = 'arnaud-musique';
const BRANCH = 'main';
const API = 'https://api.github.com';

export interface GithubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  download_url: string;
}

@Injectable({ providedIn: 'root' })
export class GithubService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.token()}`,
      Accept: 'application/vnd.github+json',
    });
  }

  getFile(path: string): Observable<{ content: string; sha: string }> {
    return this.http.get<{ content: string; sha: string }>(
      `${API}/repos/${OWNER}/${REPO}/contents/${path}`,
      { headers: this.headers() }
    );
  }

  updateFile(path: string, content: string, sha: string, message: string): Observable<unknown> {
    return this.http.put(
      `${API}/repos/${OWNER}/${REPO}/contents/${path}`,
      { message, content: btoa(unescape(encodeURIComponent(content))), sha, branch: BRANCH },
      { headers: this.headers() }
    );
  }

  createFile(path: string, content: string, message: string, sha?: string): Observable<unknown> {
    const body: Record<string, string> = { message, content, branch: BRANCH };
    if (sha) body['sha'] = sha;
    return this.http.put(
      `${API}/repos/${OWNER}/${REPO}/contents/${path}`,
      body,
      { headers: this.headers() }
    );
  }

  deleteFile(path: string, sha: string, message: string): Observable<unknown> {
    return this.http.delete(
      `${API}/repos/${OWNER}/${REPO}/contents/${path}`,
      { headers: this.headers(), body: { message, sha, branch: BRANCH } }
    );
  }

  listDirectory(path: string): Observable<GithubFile[]> {
    return this.http.get<GithubFile[]>(
      `${API}/repos/${OWNER}/${REPO}/contents/${path}`,
      { headers: this.headers() }
    );
  }

  verifiyToken(token: string): Observable<unknown> {
    return this.http.get(`${API}/repos/${OWNER}/${REPO}`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }
}
