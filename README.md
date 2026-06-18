# arnaud-musique

Static website for Arnaud, music teacher based in Grenoble. Built with Angular 22, hosted on GitHub Pages, with a lightweight token-based admin for managing music sheets.

## Project goals

- Advertise Arnaud's music teaching services (bio, rates, contact, location)
- Publish and manage downloadable music sheets (PDF)
- Simple admin interface usable by a non-technical person
- Zero monthly cost

---

## Hosting

**GitHub Pages** — free static hosting directly from this repository.

Custom domain target: `arnaud-musique.ca` (or `.fr` / `.com` — `.ca` requires Canadian residency, verify eligibility with CIRA before registering).

### DNS setup (Cloudflare, free)

1. Register the domain at **Namecheap** or **Porkbun** (~$15 CAD/year)
2. Point nameservers to Cloudflare (free DNS tier)
3. In Cloudflare, add a CNAME record:
   ```
   arnaud-musique.ca  CNAME  your-username.github.io
   ```
   Set the record to **DNS only** (grey cloud) initially — required for GitHub's SSL cert provisioning.
4. In the repo Settings → Pages, set the custom domain to `arnaud-musique.ca`
5. GitHub automatically provisions a Let's Encrypt SSL certificate for the custom domain

> The browser always shows `arnaud-musique.ca` in the address bar — the `github.io` URL is transparent. HTTPS works because GitHub issues the cert for the custom domain, not for `github.io`.

---

## Admin — music sheet management

The admin lives at `/admin` and is fully static (no backend). Authentication is done via a **GitHub Personal Access Token (PAT)** provided to Arnaud.

### How it works

1. Arnaud visits `/admin`
2. Enters the PAT into a token input field
3. Token is stored in `localStorage` for the session
4. The admin UI calls the **GitHub Contents API** directly from the browser to:
   - List existing sheets in `public/sheets/`
   - Upload new PDFs (base64-encoded)
   - Delete sheets

### Generating the PAT (repo owner does this once)

1. GitHub → Settings → Developer Settings → Fine-grained tokens → Generate new token
2. Scope: this repository only
3. Permission: **Contents** → Read and Write
4. Send the token to Arnaud securely (one time)

If the token is ever compromised: revoke it on GitHub and generate a new one. The token only has access to this one repository.

> No OAuth, no backend, no Netlify required. Works 100% on GitHub Pages.

---

## Project structure

```
arnaud-musique/
├── public/
│   ├── sheets/          ← PDF music sheets served statically
│   └── CNAME            ← custom domain for GitHub Pages
├── src/
│   └── app/
│       ├── app.ts
│       ├── app.routes.ts
│       └── pages/
│           ├── home/    ← public site (bio, rates, contact)
│           └── admin/   ← token-gated admin UI
└── angular.json
```

---

## Deploy to GitHub Pages

```bash
npm install
ng build --base-href /
```

Push the `dist/arnaud-musique/browser` output to the `gh-pages` branch, or use `angular-cli-ghpages`:

```bash
npx angular-cli-ghpages --dir=dist/arnaud-musique/browser
```

Ensure a `CNAME` file containing `arnaud-musique.ca` is present in `public/` so GitHub Pages picks up the custom domain on every deploy.

---

## Local development

```bash
npm install
ng serve
```

Opens at `http://localhost:4200`.

---

## Tech choices considered

| Option | Decision | Reason |
|--------|----------|--------|
| GitHub Pages | Used | Free, no server, Git-backed |
| Netlify + Decap CMS | Skipped | Adds complexity; PAT approach is simpler for a single user |
| OAuth login | Skipped | Requires a serverless function for the token exchange step |
| PAT token auth | Used | Zero backend, single trusted user, revocable anytime |
| Cloudflare DNS | Used | Free, fast, handles CNAME + SSL correctly with GitHub Pages |
| `.ca` domain | TBD | Requires Canadian presence — verify eligibility before registering |
