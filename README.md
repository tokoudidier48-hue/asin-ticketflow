# ASIN TicketFlow

Application web de gestion de tickets de maintenance, déployée en production.

- **Démo en ligne** : https://asin-ticketflow.vercel.app
- **API** : https://asin-ticketflow.onrender.com/api

> L'API est hébergée sur un plan gratuit : le premier chargement peut
> prendre jusqu'à 60 secondes (mise en veille du serveur).

## Fonctionnalités

- Inscription et connexion avec jetons Laravel Sanctum
- Gestion des tickets : création, consultation, modification, suppression
- Menu du compte avec déconnexion (révocation du jeton côté serveur)
- Mot de passe oublié en 3 étapes : e-mail, code OTP à 6 chiffres reçu par
  e-mail, nouveau mot de passe
- Sécurité : code OTP haché et expirant (10 min), 5 essais maximum, jeton de
  réinitialisation temporaire, réponse identique que le compte existe ou non,
  anciennes sessions révoquées après changement de mot de passe, limitation de
  débit des routes sensibles

## Stack technique

| Couche | Technologies |
|---|---|
| Frontend | Angular, TypeScript, SCSS |
| Backend | Laravel 13, PHP 8.3, Sanctum |
| Base de données | PostgreSQL (Supabase en production, PostgreSQL 16 en local) |
| E-mails | Resend (API HTTP) |
| Déploiement | Vercel (front), Render (API, Docker), Supabase (BDD) |
| Outils | Docker, Docker Compose, Git |

## Architecture

```
Angular (Vercel)  ->  API REST Laravel (Render)  ->  PostgreSQL (Supabase)
                                  |
                                  +-> Resend (e-mails OTP)
```

## Lancer le projet en local

Prérequis : Docker Desktop, Node.js et npm.

```bash
git clone https://github.com/tokoudidier48-hue/asin-ticketflow.git
cd asin-ticketflow

# Backend (Laravel + PostgreSQL)
cp backend/.env.example backend/.env
docker compose up -d
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate

# Frontend
cd frontend
npm install
npm start
```

- Frontend : http://localhost:4200
- API : http://localhost:8000/api

Dans `backend/.env`, renseignez la connexion à la base. Avec Docker Compose,
l'hôte PostgreSQL est le nom du service : `DB_HOST=postgres`.

## Points techniques notables

- Plan gratuit de Render sans SMTP : les e-mails sont envoyés par l'API HTTP
  de Resend.
- Application Angular sans zone.js : rafraîchissement explicite de l'affichage
  après les appels HTTP.
- Configuration par variables d'environnement pour chaque service (Vercel,
  Render, Supabase) : aucun secret dans le dépôt.

## Auteur

Didier TOKOU · [GitHub](https://github.com/tokoudidier48-hue)