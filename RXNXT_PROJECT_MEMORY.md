# RxNXT Project Memory

**Paste This at the Start of Any New Session with an AI Agent or Developer**

## 🏥 What is RxNXT?
A **clinic workflow, drug management, and patient communication application** built to reduce clinical friction and prevent prescription errors.
Fully migrated to a modern, scalable cloud architecture on Supabase Mumbai Cloud PostgreSQL + Vercel.

---

## 🏗️ Architecture & Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Radix UI components (lucide-react for icons)
- **Database:** PostgreSQL (Supabase Mumbai Cloud - ap-south-1) via Prisma ORM
- **Authentication:** NextAuth.js (Credentials Provider + bcrypt hashing + JWT strategy)
- **Search Engine:** Fuse.js (Fuzzy matching, typo-tolerance, and custom additive clinical scoring)
- **WhatsApp:** Custom WhatsApp microservice hosted on Render (`rxnxt-whatsapp-service.onrender.com`). Configured via `WHATSAPP_MICROSERVICE_URL` env var. **No Twilio.**
- **PDF Generation:** jsPDF (client-side, instant, no server lag)
- **Hosting:** Vercel (Frontend + Serverless API + Vercel Cron Jobs)
- **PWA:** Full Progressive Web App support (manifest.json, Apple iOS standalone metadata)

---

## 🗄️ Database Schema Overview (PostgreSQL via Prisma)
- **Clinic:** The top-level tenant. Has `name`, `address`, `phone`, `email`, `logoUrl`, `inviteCode`.
- **User (Doctor/Admin/Receptionist/Nurse):** Uses NextAuth. Tied to a Clinic. Has `role`, `status`, `specialization`, `registrationNumber`, `signatureUrl`.
- **Patient:** Belongs to a Clinic. Has `name`, `phone`, `age`, `gender`, `address`.
- **Encounter:** A clinical visit linking a Patient and a Doctor. Has `chiefComplaint`, `diagnosis`, `notes`, `followUpDate`.
- **Prescription:** Linked to an Encounter. Contains `PrescriptionMedicine` line items. Tracks `timeTakenSeconds` and `creationMethod`.
- **PrescriptionMedicine:** Line item — `drugId`, `customName`, `dosageForm`, `strength`, `route`, `frequency`, `duration`, `instructions`.
- **Drug:** Global + per-clinic medicine catalog. Has `genericName`, `brandName`, `aliases`, `dosageForm`, `strength`, `isRestricted`, `prescriptionCount`. `clinicId` is optional (null = global drug).
- **TreatmentGroup + TreatmentGroupItem:** Doctor-saved prescription templates (e.g., "Viral Fever Protocol").
- **DoctorDrugPreference:** Tracks per-doctor prescription frequency per drug (used in search scoring).
- **ClinicDrugPreference:** Tracks per-clinic prescription frequency per drug (used in search scoring).
- **Reminder:** WhatsApp reminder queue. Fields: `scheduledFor`, `sentAt`, `status` (PENDING/SENT/FAILED), `messageType` (PDF/MEDICINE).
- **QueueItem:** Patient waiting queue. Fields: `status` (WAITING/AWAY/SKIPPED/COMPLETED), `tokenNumber`, linked to Clinic + Doctor + Patient.

---

## 🔑 Authentication (NextAuth)
- **Frontend:** `app/(auth)/login/page.tsx`
- **Backend Setup:** `app/api/auth/[...nextauth]/route.ts` & `lib/auth.ts`
- **Security:** Passwords hashed via `bcryptjs`. JWT strategy — session stores `clinicId`, `role`, `id` for strict multi-tenant isolation. All API routes use `await getAuthenticatedUser()`.

---

## 👥 User Roles (All Implemented)
| Role | Dashboard Route | Access |
|------|----------------|--------|
| `doctor` | `/doctor/dashboard` | Prescription workspace, patients, analytics, settings |
| `admin` | `/admin/settings` | Clinic profile, staff, drugs, superadmin tools |
| `receptionist` | `/receptionist/dashboard` | Patient queue, patient registration |
| `nurse` | `/nurse/` | Clinical support view |
| `superadmin` | `/superadmin/` | Platform-wide administration |

---

## 🔍 Intelligent Medicine Search Engine
The search API (`app/api/drugs/search/route.ts`) uses an **Additive Scoring Algorithm**:
1. Exact Alias Matches (short-circuits for max speed, e.g., "PCM" → Paracetamol) — **+100 pts**
2. Fuse.js fuzzy matching across Generic Names, Brand Names, Aliases
3. Doctor frequently prescribes it — **+50 pts**
4. Clinic standardizes it — **+20 pts**
5. Low Confidence detection (score < 15) triggers "Did you mean?" warning in UI

---

## 📱 WhatsApp Microservice Integration
- **Provider:** Custom microservice at `https://rxnxt-whatsapp-service.onrender.com` (Render hosting)
- **Service file:** `services/whatsappService.ts`
- **Warm-up:** `ensureMicroserviceAwake()` pings `/api/whatsapp/status` before sending to wake Render from sleep
- **Sending endpoint:** `POST /api/whatsapp/send` on the microservice — accepts `{ phone, message, pdfBase64, clinicId }`
- **Phone sanitization:** Strips formatting, removes leading zeros, prepends `+91` if no country code

### Three send functions:
| Function | Trigger | What it sends |
|----------|---------|---------------|
| `sendPrescriptionPDF()` | Doctor clicks "Send via WhatsApp" | PDF as base64 + view URL to patient |
| `sendMedicineReminder()` | Vercel Cron (hourly) | Medicine intake reminder message |
| `sendFollowUpReminder()` | Vercel Cron (hourly) | Follow-up visit reminder from clinic/doctor |

---

## 🕐 Patient Queue System
- **Model:** `QueueItem` — status: WAITING / AWAY / SKIPPED / COMPLETED
- **API:** `app/api/queue/route.ts` and `app/api/queue/[id]/route.ts`
- **Receptionist Dashboard:** `/receptionist/dashboard` — registers patients, adds to queue, auto-resets form after each registration
- **Doctor Dashboard:** Shows live queue with waiting time timers, "NEXT UP" badges, 1-click consultation launch

---

## ⚙️ Admin Settings Module (`/admin/settings`)
- **Clinic Profile Tab:** Clinic name, phone, email, address, drag-and-drop logo upload (`logoUrl`)
- **Doctor Profile Tab:** Doctor's registration number (MCI), drag-and-drop digital signature upload (`signatureUrl`)
- **Staff Management Tab:** View all staff, "Add Staff Member" modal → creates Users via `/api/users`
- **Drugs Management:** Custom per-clinic drug catalog (`/admin/drugs`)

---

## 📊 Doctor Analytics
- Route: `/doctor/analytics`
- API: `app/api/analytics/`
- Shows patient volume, prescription counts, most prescribed medicines

---

## 🚀 Cloud Deployment Checklist (Vercel)
Required environment variables:
1. `DATABASE_URL` — Supabase Mumbai PostgreSQL connection string
2. `NEXTAUTH_SECRET` — JWT encryption secret
3. `NEXTAUTH_URL` — Live domain (e.g., `https://rxnxt-app.vercel.app`)
4. `WHATSAPP_MICROSERVICE_URL` — URL of the WhatsApp microservice on Render
5. `CRON_SECRET` — Secures `/api/cron/reminders` from unauthorized pings
6. `NEXT_PUBLIC_APP_URL` — Used to generate prescription PDF view links

After setting env vars: `npx prisma db push` to initialize PostgreSQL tables.

---

## 💬 How to Use This File
**At the start of a new session, provide this file and say:**
> *"I'm working on the RxNXT clinic application. Here is my project memory: [paste this file]. Please continue from where we left off. Next, I want to build [your task]."*
