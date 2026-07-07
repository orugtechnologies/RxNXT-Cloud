# RxNXT Project Memory

**Paste This at the Start of Any New Session with an AI Agent or Developer**

## 🏥 What is RxNXT?
A **clinic workflow and drug management application** built to reduce clinical friction and prevent prescription errors. 
Recently upgraded from a pure Node.js/HTML MVP to a modern, scalable cloud architecture.

---

## 🏗️ Architecture & Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Radix UI components (lucide-react for icons)
- **Database:** PostgreSQL (Schema defined via Prisma ORM)
- **Authentication:** NextAuth.js (Credentials Provider + bcrypt hashing)
- **Search Engine:** Fuse.js (Fuzzy matching, typo-tolerance, and custom additive clinical scoring)

---

## 🗄️ Database Schema Overview (PostgreSQL via Prisma)
- **Clinic:** The top-level tenant.
- **User (Doctor):** Uses NextAuth. Tied to a Clinic. Has personalized `DoctorDrugPreference` and `TreatmentGroup`.
- **Patient:** Belongs to a Clinic.
- **Encounter:** A clinical visit linking a Patient and a Doctor.
- **Prescription:** Linked to an Encounter. Contains `PrescriptionMedicine` line items.
- **Drug:** The global medicine catalog (thousands of generic/brand medicines).
- **Reminder:** A queue table for tracking pending/sent WhatsApp medicine reminders.

---

## 🔑 Authentication (NextAuth)
- **Frontend:** `app/login/page.tsx`
- **Backend Setup:** `app/api/auth/[...nextauth]/route.ts` & `lib/auth.ts`
- **Security:** Passwords are hashed using `bcryptjs`. The JWT strategy is used, and the session strictly stores the `clinicId`, `role`, and `id` to enforce multi-tenant data isolation. API routes use `await getAuthenticatedUser()` to secure endpoints.

---

## 🔍 Intelligent Medicine Search Engine
The search API (`app/api/drugs/search/route.ts`) does not just use `LIKE %query%`. It uses an **Additive Scoring Algorithm**:
1. Checks for Exact Alias Matches (Short-circuits for maximum speed, e.g., "PCM" -> Paracetamol).
2. Uses `Fuse.js` for typo-tolerant fuzzy matching across Generic Names, Brand Names, and Aliases.
3. Adds points if the Doctor frequently prescribes it (+50 pts).
4. Adds points if the Clinic standardizes it (+20 pts).
5. Detects "Low Confidence" searches (score < 15) to trigger a "Did you mean?" safety warning in the UI.

---

## 📱 WhatsApp & Cron Integrations (Cloud Ready)
- **WhatsApp Provider:** Twilio (`services/whatsappService.ts`). (Supports fallback mocking during local dev if `.env` vars are missing).
- **Prescription PDFs:** `POST /api/prescriptions/send` triggers a WhatsApp message containing a secure link to the prescription PDF for the patient.
- **Medicine Reminders (Cron):** `GET /api/cron/reminders/route.ts` is designed to be pinged hourly by Vercel Cron. It queries the `Reminder` table for `PENDING` reminders, dispatches them via WhatsApp, and updates the status to `SENT` or `FAILED`.

---

## 🚀 Cloud Deployment Checklist (Vercel / AWS)
Before deploying to production, the developer MUST configure the following in the cloud environment variables:
1. `DATABASE_URL`: Must point to your live Neon PostgreSQL database. *Note: The local `rxnxt.db` SQLite file and `updateDB.js` have been removed to enforce strict cloud parity.*
2. `NEXTAUTH_SECRET`: A secure random string for JWT encryption.
3. `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN`: For WhatsApp messaging.
4. `TWILIO_WHATSAPP_NUMBER`: The sender phone number.
5. `CRON_SECRET`: To secure the `/api/cron/reminders` endpoint from unauthorized pings.

After setting environment variables, run `npx prisma db push` or `npx prisma migrate deploy` on the cloud provider to build the Postgres tables.

---

## 💬 How to Use This File
**At the start of a new session, provide this file and say:**
> *"I'm working on the RxNXT clinic application. Here is my project memory: [paste this file]. Please continue from where we left off. Next, I want to build [your task]."*
