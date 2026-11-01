# FINORA — Personal Finance Tracker

A full-stack personal finance application with a stunning "Dark Teal Data Dashboard" aesthetic.

Two folders: `finora-backend` (Express + Prisma + SQLite) and `finora-frontend` (Vite + React).

## 1. Backend

```bash
cd finora-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed        # Creates a clean slate demo user account
npm run dev         # Starts API on http://localhost:4000
```

Demo login after seeding: **demo@finora.app / demo1234**

`.env` is already configured for local development using an SQLite database and a local JWT secret. Change `JWT_SECRET` before deploying to production.

## 2. Frontend

```bash
cd finora-frontend
npm install
npm run dev         # Starts UI on http://localhost:5173
```

The login page is pre-filled with the demo credentials — just hit "Sign in".

## Features & Implementation

**Core Functionality:**
- JWT authentication (register, login, logout).
- Complete CRUD capabilities for transactions, budgets, investments, goals, and subscriptions.
- Live calculation of critical financial metrics (Net Worth, Cash Flow, Spending breakdown, Budget utilization %, Financial Health Score, Portfolio P/L).
- Custom interactive charts powered by Recharts (Area, Bar, Donut).
- Beautiful empty states to guide users when no data is present.
- A fully responsive design with a mobile nav drawer, optimized for both desktop and mobile screens.

**Recent Updates:**
- **Aesthetic Overhaul**: Transitioned from a "Glassmorphism" theme to a solid "Dark Teal Data Dashboard" with deep `#12131e` surfaces and sharp teal (`#00d4b4`) accents.
- **Ambient Gradients**: Added subtle, dynamic CSS radial gradients in the background to create a premium feel without the heavy performance cost of 3D rendering.
- **Functional Settings**: The settings page now features working toggles for Currency, Notifications, Security (2FA), and a Data Export feature to download transactions as CSV.
- **Clean Slate**: The database seeding script now provisions a fresh account *without* mock data, allowing users to build their own financial profile from scratch.

## Development Notes

- **Database**: Currently using SQLite for zero-config local development. Swapping to Postgres is a one-line change in `prisma/schema.prisma` (`provider = "postgresql"`) along with a real `DATABASE_URL`.
- **Bundle Size**: The frontend bundle includes large dependencies like Recharts. Future optimization could involve code splitting or lazy-loading these charting components.
- **Liability/Debt Modeling**: The "debt ratio" factor in the Financial Health score currently uses a placeholder constant. Full liability and loan tracking will be added in a future update.
