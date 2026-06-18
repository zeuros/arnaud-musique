# arnaud-musique

Site statique pour Arnaud, professeur de musique à Grenoble. Construit avec Angular 22, hébergé sur GitHub Pages, avec une interface d'administration légère basée sur un token pour gérer les partitions.

## Objectifs du projet

- Présenter les cours de musique d'Arnaud (bio, tarifs, contact, localisation)
- Publier et gérer des partitions téléchargeables (PDF)
- Interface d'administration utilisable par une personne non technique
- Coût mensuel zéro

---

## Hébergement

**GitHub Pages** — hébergement statique gratuit directement depuis ce dépôt.

Nom de domaine cible : `arnaud-musique.eu.org`

> Le navigateur affiche toujours `arnaud-musique.ca` dans la barre d'adresse — l'URL `github.io` est transparente. Le HTTPS fonctionne car GitHub émet le certificat pour le domaine personnalisé, pas pour `github.io`.

---

## Administration — gestion des partitions

L'admin se trouve à `/admin` et est entièrement statique (aucun backend). L'authentification se fait via un **Personal Access Token (PAT) GitHub** fourni à Arnaud.

### Fonctionnement

1. Arnaud se rend sur `/admin`
2. Saisit le PAT (appelé code d'authentification) dans un champ de saisie
3. Le token est stocké dans `localStorage` pour la session
4. L'interface admin appelle directement l'**API GitHub Contents** depuis le navigateur pour :
   - Lister les partitions existantes dans `public/sheets/`
   - Uploader de nouveaux PDF (encodés en base64)
   - Supprimer des partitions

### Générer le PAT (à faire une seule fois par le propriétaire du dépôt)

1. GitHub → Settings → Developer Settings → Fine-grained tokens → Generate new token
2. Portée : ce dépôt uniquement
3. Permission : **Contents** → Read and Write
4. Envoyer le token à Arnaud de manière sécurisée (une seule fois)

> Aucun OAuth, aucun backend, aucun Netlify requis. Fonctionne à 100% sur GitHub Pages.

---

## Structure du projet

```
arnaud-musique/
├── public/
│   ├── sheets/          ← partitions PDF servies statiquement
│   └── CNAME            ← domaine personnalisé pour GitHub Pages
├── src/
│   └── app/
│       ├── app.ts
│       ├── app.routes.ts
│       └── pages/
│           ├── home/    ← site public (bio, tarifs, contact)
│           └── admin/   ← interface admin protégée par token
└── angular.json
```

---

## Déploiement sur GitHub Pages

> La CI lance un script pour build le js à chaque commit:


S'assurer qu'un fichier `CNAME` contenant `arnaud-musique.ca` est présent dans `public/` afin que GitHub Pages reprenne le domaine personnalisé à chaque déploiement.

---

## Développement local

```bash
npm install
ng serve
```

Accessible sur `http://localhost:4200`.

---

## Choix techniques

| Option             | Décision    | Raison                                                                 |
|--------------------|-------------|------------------------------------------------------------------------|
| GitHub Pages       | Retenu      | Gratuit, sans serveur, versionné sous Git                              |
| Token PAT          | Retenu      | Zéro backend, utilisateur unique de confiance, révocable à tout moment |
| DNS Cloudflare     | à réfléchir | Gratuit, rapide, compatible CNAME + SSL avec GitHub Pages              |
| Domaine `.eu.org ` | Retenu      | Gratuit                                                                |
