# RxNXT Changelog

## [2026-08-31] - Direct NMC Medical Council License Verification & Mandatory Gating
- **Direct Official National Medical Commission (NMC) REST API Engine**: Integrated direct, zero-cost, high-speed (~0.4s) doctor license verification against the official NMC Indian Medical Register (`https://www.nmc.org.in/MCIRest/open/getDataFromService?service=searchDoctor`), covering the National Council + all 24+ State Medical Councils across India.
- **Mandatory UI Gating**: Registration workspace creation is strictly locked until the doctor completes Step 2 (Medical Council Verification).
- **Auto-Populate & Data Locking**: Doctor's official registered name, degrees (`MBBS`, `MD`, `MS`, `D.CH`), and state council details are fetched directly from government records and locked into the profile upon verification.
- **Server-Side Enforcement**: Server-side double-validation in `app/api/auth/register/route.ts` blocks any unverified or tampered registration attempts.
- **Test Suite Expansion**: Added comprehensive test coverage for doctor verification service (34/34 tests passing).

## [2026-08-16] - Supabase Mumbai Migration & Smart Slot Adherence Model
- **Supabase Mumbai Cloud PostgreSQL**: Fully migrated database infrastructure to Supabase Mumbai (`aws-0-ap-south-1.pooler.supabase.com`) via Prisma ORM for ultra-low latency across India.
- **Smart Slot Adherence Model**: Built a 3-window WhatsApp medication reminder engine operating at 8:00 AM IST (Morning), 1:30 PM IST (Afternoon), and 8:30 PM IST (Night) with food instruction rules ("Before breakfast", "After dinner").
- **Acute vs. Chronic Care Classifier**: Automated 2-phase lifecycle for prescriptions—Acute courses (<= 14 days) receive duration-limited Smart Slot nudges and stop automatically; Chronic courses (> 14 days) receive a 14-day morning briefing plus a Day 25 Monthly Prescription Refill & Care Alert.

## [2026-07-26] - Prescription Speed Optimization, Mobile PWA & WhatsApp BYOD
- **Prescription Workflow Acceleration**: Replaced rigid, long `<select>` dropdowns in `PrescriptionCart.tsx` with **1-Click Quick-Select Chips (Pills)** (`1-0-1`, `5 days`, `After meals`) and type-to-search datalist combo inputs. Added smart OPD default values when adding new medicines to eliminate mandatory field validation bottlenecks.
- **Receptionist Front Desk Auto-Reset**: Implemented automatic clearing and reset of patient registration forms and search queries in `/receptionist/dashboard` immediately after registering a patient, readying the desk for the next person in line.
- **Mobile PWA & Sticky Action Footer**: Added a complete Progressive Web App manifest (`public/manifest.json`), Apple iOS standalone metadata, and viewport scaling rules in `layout.tsx`. Pinned the prescription writer's action bar as a **sticky bottom footer** on smartphones so "Review & Print" / "WhatsApp" buttons are always accessible at the thumb without scrolling.
- **WhatsApp Single-Device BYOD Guide**: Added a **"📥 Save QR Code to Photo Gallery"** button and step-by-step single-phone instructions in `/doctor/settings/whatsapp` so doctors using RxNXT directly on their mobile browser can seamlessly link their WhatsApp from their photo gallery.

## [2026-07-25] - Doctor Dashboard Redesign & Brand Color Parity
- **Brand Theme & Color Parity**: Replaced legacy indigo and dull navy accents across the application with the vibrant **RxNXT Logo Palette** (`#2563eb` Royal Blue, `#0ea5e9` Sky Blue, `#10b981` Healthcare Emerald Green, and clean slate `#f8fafc`). Updated CSS variables in `globals.css` and extended theme colors in `tailwind.config.ts`.
- **Doctor Command Center Redesign**: Streamlined the doctor's dashboard (`/doctor/dashboard`) by removing clutter and focusing on 3 core actions: Start Consultation, Search Patient, and View History.
- **Integrated Patient Queue**: Added waiting time timers ("Waiting for Xm"), status badges ("NEXT UP"), and 1-click consultation launching or history viewing directly from queue cards.
- **Patient History Modal**: Created `PatientHistoryModal.tsx` for fast review of previous encounters, visit timelines, and 1-click prescription cloning without leaving the dashboard.

## [2026-07-05] - Security & UI Cleanup
- **UI Tweaks**: Removed the Welcome Splash component entirely for a faster, frictionless login experience.
- **Data Cleanup**: Updated registration placeholders and seed scripts to default to **Dr. Shanmukha Datta**.
- **Security & Repo Cleanliness**: Removed outdated local SQLite database (`rxnxt.db`) and manual `updateDB.js` scripts to enforce strict parity with the live Neon cloud environment.

## [2026-06-28] - Feature Updates

### 1. WhatsApp API Integration
- Added a "Send Rx via WhatsApp" button inside the `ReviewPrescriptionModal.tsx`.
- Implemented a success state view that appears after clicking the button, providing visual confirmation that the PDF link was sent.
- Handled the workspace cleanup gracefully by adding a "Start New Prescription" flow in `page.tsx` instead of abruptly closing the UI.

### 2. Clinic Settings Module (`/admin/settings`)
- Built a multi-tab Admin Control Center.
- **Clinic Profile Tab**: 
  - Added support for managing Clinic Name, Phone, Email, and Address.
  - Added new Database fields (`logoUrl` on Clinic model, `signatureUrl` on User model) and updated the Prisma Schema.
  - Built a Drag-and-Drop UI for uploading the Clinic Logo and the Doctor's Digital Signature.
  - Added a field for the Doctor's Registration Number (e.g. MCI number).
- **Staff Management Tab**: 
  - Created a dashboard table to view all staff members assigned to the clinic.
  - Built an "Add Staff Member" modal and linked it to a new `/api/users` endpoint to create Doctors, Receptionists, and Admins.
- **Integrations Tab**: 
  - Drafted the UI for Twilio/WhatsApp credential management.

### 3. UI/UX & Theming
- Completely redesigned the `AppSidebar.tsx` navigation.
- Switched from a dark navy theme to a distinct, premium **soft indigo gradient** (`indigo-50` to `white`).
- This custom gradient seamlessly separates the sidebar from the `slate-50` working area while keeping it bright enough to perfectly display the trademarked RxNXT logo in its original colors.
- Updated hover states, active tab UI, and user profile areas to match the new light theme.

### 4. Database Maintenance
- Updated the primary doctor's name in the SQLite database to **Dr. Paani Datta**.
