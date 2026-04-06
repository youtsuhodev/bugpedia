# Bugpedia

Base de données collaborative pour documenter, relier et résoudre des bugs logiciels.

- **Code** : [MIT](LICENSE)
- **Données** (instance publique de référence) : voir [DATA_LICENSE.md](DATA_LICENSE.md) (CC BY-SA 4.0)

## Architecture

| Module              | Stack                            | Rôle                                      |
| ------------------- | -------------------------------- | ----------------------------------------- |
| `backend/`          | **NestJS (TypeScript)**, **MySQL** (`mysql2`) | API REST, webhooks GitHub, auth GitHub    |
| `frontend/`         | **Next.js 14** (App Router)      | UI web thème sombre                       |
| `vscode-extension/` | TypeScript                       | Commande « Search for this error »        |
| `github-bot/`       | Python (optionnel / à venir)     | Commentaires automatiques sur les issues  |
| `backend/sql/schema.mysql.sql` | MySQL 8+              | Schéma officiel pour l’API                |
| `schema.sql`        | PostgreSQL                       | Référence alternative (non utilisée par l’API telle quelle) |

Ports par défaut : **API `4000`**, **Next.js `3000`**.

## Prérequis

- Node.js 20+
- **MySQL 8+** (serveur local ou Docker)
- npm (ou pnpm / yarn)

## Démarrage local

### 1. Base MySQL

Créer la base et les tables (au choix) :

```bash
# Avec le client mysql
mysql -u root -p < backend/sql/schema.mysql.sql

# Ou avec Node (lit backend/.env)
cd backend && npm run db:init
```

Réinitialiser complètement les tables en dev : `npm run db:init:force` (destructif).

(Le schéma crée la base `bugpedia`, ou celle définie par `MYSQL_DATABASE` dans `.env`.)

### 2. API (NestJS)

```bash
cd backend
cp .env.example .env
# Éditer .env : MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, etc.
npm install
npm run start:dev
```

- `DEV_SKIP_AUTH=true` dans `.env` : crée / réutilise un utilisateur fictif et accepte les `POST` sans token GitHub (pratique pour le MVP).
- Avec un vrai token : en-tête `Authorization: Bearer <github_oauth_token>` (API `GET https://api.github.com/user`).

### 3. Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). La variable `NEXT_PUBLIC_API_URL` doit pointer vers l’API (par défaut `http://localhost:4000`).

### 4. Extension VS Code

```bash
cd vscode-extension
npm install
npm run compile
```

Dans VS Code : **Run > Open Folder** sur `vscode-extension`, F5 pour lancer l’extension de développement. Réglage `bugpedia.apiUrl` si l’API n’est pas sur `localhost:4000`.

## API (extrait)

| Méthode | Endpoint                     | Description                                      |
| ------- | ---------------------------- | ------------------------------------------------ |
| GET     | `/bugs`                      | Liste (filtres `q`, `library`, `version`, …)    |
| GET     | `/bugs/:id`                  | Détail + solutions                               |
| GET     | `/bugs/:id/similar`          | Voisins dans le graphe « similaires »             |
| POST    | `/bugs`                      | Création (auth GitHub ou `DEV_SKIP_AUTH`)        |
| POST    | `/bugs/:id/solutions`        | Proposer une solution                            |
| POST    | `/solutions/:id/verify`      | Valider (+1 sur `verification_count`)            |
| GET     | `/users/:id`                 | Profil                                           |
| POST    | `/webhooks/github`           | Issues / PR (signature si `GITHUB_WEBHOOK_SECRET`) |

Règles métier : `is_verified` uniquement si `verification_count >= 3` ; une seule solution vérifiée par bug (gérée dans `SolutionsService.verify`).

## Tests

```bash
cd backend && npm test
cd frontend && npm run cypress:run   # nécessite `npm run dev` sur :3000
```

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Anticipations (doublons, modération, scale)

- **Doublons** : avant `POST /bugs`, comparer titre normalisé + (`library`, `version`) ; index unique ou file de modération.
- **Qualité des solutions** : votes, seuil de réputation pour vérifier, file « needs review ».
- **Scale** : index full-text MySQL (`FULLTEXT`), réplicas lecture, cache sur les listes populaires.
