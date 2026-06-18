import { Injectable, signal } from '@angular/core';

const TOKEN_KEY = 'gh_pat';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }
}
