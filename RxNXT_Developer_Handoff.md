# RxNXT - Developer Handoff Document

This document is intended for incoming developers to quickly understand the current technical state, architecture, and codebase structure of the RxNXT application as of August 2026.

---

## 1. Executive Summary
**RxNXT** is a modern, cloud-hosted Digital Prescription and Clinical Workspace engineered to replace traditional paper prescriptions in high-volume clinics. The platform is fully multi-tenant, role-based, and cloud-deployed on Vercel + Supabase Mumbai Cloud PostgreSQL. It covers the complete clinic workflow — from patient registration at the front desk, to prescription generation by the doctor, to automated WhatsApp delivery of the prescription PDF to the patient, and automated follow-up / medicine reminders.

---

## 2. Current Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + Radix UI + lucide-react |
| Database | PostgreSQL (Neon.tech) via Prisma ORM |
| Authentication | NextAuth.js — Credentials Provider + bcrypt + JWT |
| Search Engine | Fuse.js — additive clinical scoring algorithm |
| WhatsApp | Custom microservice on Render (`rxnxt-whatsapp-service.onrender.com`) |
| PDF Generation | jsPDF (client-side, instant) |
| Hosting | Vercel (Frontend + Serverless API + Vercel Cron) |
| PWA | Full PWA support — manifest.json + Apple iOS standalone metadata |
| CI/CD | GitHub Actions → auto-deploy to Vercel on `main` push |

> [!IMPORTANT]
> **There is NO Twilio and NO SQLite** in this codebase. The WhatsApp integration uses a **custom microservice** (`services/whatsappService.ts`). The database is **PostgreSQL on Neon**, not SQLite. Any legacy docs referencing these are outdated.

---

## 3. Core Project Structure

```
/app
  ├── (auth)/                   # Login page
  ├── (dashboard)/
  │   ├── layout.tsx            # Shared sidebar + auth guard
  │   ├── doctor/               # Doctor: dashboard, patients, analytics, settings
  │   ├── admin/                # Admin: settings, staff, drugs, superadmin
  │   ├── receptionist/         # Receptionist: patient queue dashboard
  │   ├── nurse/                # Nurse view
  │   └── pending/              # Pending approval screen
  ├── doctor/                   # Prescription workspace (core Rx writing UI)
  ├── superadmin/               # Platform-wide admin
  └── api/
      ├── auth/                 # NextAuth handler
      ├── drugs/                # Drug search + CRUD
      ├── patients/             # Patient CRUD + timeline
      ├── prescriptions/        # Save, fetch, clone, send via WhatsApp
      ├── queue/                # Patient queue management
      ├── templates/            # Treatment group templates
      ├── analytics/            # Doctor/clinic analytics
      ├── clinic/               # Clinic profile management
      ├── users/                # Staff management
      ├── receptionist/         # Receptionist-specific endpoints
      ├── cron/reminders/       # Vercel Cron — hourly WhatsApp reminders
      ├── cron/wakeup/          # Wakeup ping for Render microservice
      ├── whatsapp-status/      # WhatsApp microservice health check
      └── health/               # App health check endpoint

/components
  ├── dashboard/                # Dashboard widgets, stats cards, queue cards
  ├── drugs/                    # Drug search UI, medicine selection
  ├── patients/                 # Patient timeline, history modal, search
  ├── prescriptions/            # Prescription cart, PDF generator, templates UI
  └── ui/                       # Reusable base elements (Button, Input, Card, etc.)

/services
  ├── whatsappService.ts        # WhatsApp microservice client (send Rx PDF, reminders, follow-ups)
  └── drugService.ts            # Drug lookup utilities

/prisma
  ├── schema.prisma             # Source of truth for DB architecture
  └── seed.ts                   # Seeds Demo Clinic, Demo Doctor, 150+ drugs

/lib
  ├── auth.ts                   # NextAuth config
  ├── auth-server.ts            # getAuthenticatedUser() helper
  └── prisma.ts                 # Prisma client singleton

/types                          # Shared TypeScript interfaces
/hooks                          # Custom React hooks
/public
  └── manifest.json             # PWA manifest
```

---

## 4. Database Models

| Model | Purpose |
|---|---|
| `Clinic` | Top-level tenant — name, address, phone, email, logoUrl, inviteCode |
| `User` | Doctor/Admin/Receptionist/Nurse — role, status, specialization, registrationNumber, signatureUrl |
| `Patient` | Clinic-scoped patient — name, phone, age, gender, address |
| `Encounter` | Clinical visit — chiefComplaint, diagnosis, notes, followUpDate |
| `Prescription` | Linked to Encounter — timeTakenSeconds, creationMethod |
| `PrescriptionMedicine` | Line item — drugId, customName, dosageForm, strength, frequency, duration, instructions |
| `Drug` | Global + per-clinic medicine catalog — genericName, brandName, aliases, isRestricted |
| `TreatmentGroup` | Doctor-saved prescription template (e.g., "Viral Fever Protocol") |
| `TreatmentGroupItem` | Individual drug line within a template |
| `DoctorDrugPreference` | Per-doctor drug usage counter (powers search ranking) |
| `ClinicDrugPreference` | Per-clinic drug usage counter (powers search ranking) |
| `Reminder` | WhatsApp reminder queue — PENDING / SENT / FAILED, messageType: PDF / MEDICINE |
| `QueueItem` | Patient waiting queue — WAITING / AWAY / SKIPPED / COMPLETED, tokenNumber |

---

## 5. User Roles & Access

| Role | Route | Capabilities |
|---|---|---|
| `doctor` | `/doctor/dashboard` | Prescription workspace, patient history, analytics, personal settings |
| `admin` | `/admin/settings` | Clinic profile, logo/signature upload, staff management, custom drugs |
| `receptionist` | `/receptionist/dashboard` | Register patients, manage queue, auto-reset after registration |
| `nurse` | `/nurse/` | Clinical support view |
| `superadmin` | `/superadmin/` | Platform-wide administration |

---

## 6. Feature Status (All Completed)

### Core Prescription Workflow
- ✅ Intelligent drug search — Fuse.js + additive scoring (alias match, doctor preference, clinic preference, fuzzy match)
- ✅ "Did You Mean?" safety warning for low-confidence searches (score < 15)
- ✅ 1-Click Quick-Select Chips for dosage/frequency/duration (e.g., `1-0-1`, `5 days`, `After meals`)
- ✅ Treatment group templates — save and apply complex drug combos in one click
- ✅ One-click prescription cloning from patient timeline
- ✅ Client-side PDF generation (jsPDF) — instant, no server lag
- ✅ Prescription time tracking (`timeTakenSeconds`)

### WhatsApp Integration
- ✅ "Send Rx via WhatsApp" button in prescription review modal
- ✅ Sends prescription PDF (base64) + view URL to patient's WhatsApp via custom microservice
- ✅ Automated medicine reminders via Vercel Cron (hourly) — `messageType: MEDICINE`
- ✅ Automated follow-up visit reminders via Vercel Cron — `messageType: PDF`
- ✅ Microservice warm-up ping (`ensureMicroserviceAwake()`) before sending
- ✅ Phone sanitization — strips formatting, strips leading zeros, auto-prepends `+91`
- ✅ WhatsApp BYOD guide for single-device doctors (QR save to gallery flow)
- ✅ WhatsApp microservice health status endpoint (`/api/whatsapp-status`)

### Patient Queue System
- ✅ QueueItem model with token numbers and statuses (WAITING/AWAY/SKIPPED/COMPLETED)
- ✅ Receptionist dashboard — register patient → auto-add to queue → form auto-resets
- ✅ Doctor dashboard — live queue view with waiting time timers and "NEXT UP" badges
- ✅ 1-click launch consultation or view patient history directly from queue card

### Admin & Clinic Management
- ✅ Clinic profile management — name, phone, email, address, drag-and-drop logo upload
- ✅ Doctor profile — registration number (MCI), drag-and-drop digital signature upload
- ✅ Staff management — view all staff, add Doctors/Receptionists/Admins via modal
- ✅ Custom per-clinic drug catalog management

### Doctor Dashboard & Analytics
- ✅ Doctor Command Center redesign — 3 core actions: Start Consultation, Search Patient, View History
- ✅ Patient History Modal (`PatientHistoryModal.tsx`) — fast review of encounters + 1-click clone
- ✅ Analytics dashboard — patient volume, prescription counts, top medicines

### UI/UX & PWA
- ✅ RxNXT brand color palette — Royal Blue `#2563eb`, Sky Blue `#0ea5e9`, Emerald `#10b981`
- ✅ Mobile sticky action footer — "Review & Print" / "WhatsApp" always accessible at thumb
- ✅ Full PWA — manifest.json, Apple iOS standalone, viewport scaling
- ✅ Redesigned AppSidebar — soft indigo gradient theme

---

## 7. Environment Variables Required

```env
DATABASE_URL=                    # Neon PostgreSQL connection string
NEXTAUTH_SECRET=                 # JWT encryption secret (openssl rand -base64 32)
NEXTAUTH_URL=                    # Live domain e.g. https://rxnxt-app.vercel.app
WHATSAPP_MICROSERVICE_URL=       # https://rxnxt-whatsapp-service.onrender.com
CRON_SECRET=                     # Secures /api/cron/reminders endpoint
NEXT_PUBLIC_APP_URL=             # Used to build prescription PDF view links
```

---

## 8. Local Setup Guide

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill environment variables
cp .env.example .env.local

# 3. Push schema to database
npx prisma db push

# 4. Seed demo data (clinic, doctor, 150+ drugs)
npm run db:seed

# 5. Start dev server
npm run dev
```

Open `http://localhost:3000`

---

## 9. Next Steps & Roadmap

| Priority | Feature |
|---|---|
| High | Pharmacy & Inventory — stock tracking, auto-deduct on prescription |
| High | Billing & Invoice generation for consultations |
| Medium | Appointment scheduling with calendar |
| Medium | Patient Mobile PWA — OTP login, view past prescriptions |
| Low | Drug Interaction Engine — warn doctors of severe interactions |
| Low | AI Prescription Suggestions — analyze chief complaint → suggest protocol |
