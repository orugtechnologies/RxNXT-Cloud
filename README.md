# RxNXT Drug Management Module

RxNXT MVP for Incubator Demonstrations and Pilot Doctor Usage.

## Overview
This Next.js App Router project serves as the Drug Management Module, backed by Neon PostgreSQL. 
It supports advanced Type-Tolerant Search, Auto-population of dosage forms, and strict Multi-Tenant RLS for Clinic Preferences and Doctor Favorites.

## Quick Start
1. `npm install`
2. Apply migrations: `npx prisma db push` (or `npm run db:migrate`)
3. Run locally: `npm run dev`

## Environment Variables
Copy `.env.example` to `.env.local` and fill in your Neon database URL and other details.

## Deployment
This project is configured for seamless deployment to Vercel via GitHub Actions.
Pushing to the `main` branch will automatically trigger the `.github/workflows/production.yml` workflow.
