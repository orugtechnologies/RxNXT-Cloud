# RxNXT - Developer Handoff Document

This document is intended for incoming developers to quickly understand the current technical state, architecture, and codebase structure of the RxNXT application as of June 2026.

---

## 1. Executive Summary
**RxNXT** is a modern, offline-capable Digital Prescription and Clinical Workspace engineered to replace traditional paper prescriptions in high-volume clinics. The current prototype is highly functional, focusing exclusively on a frictionless prescription workflow for doctors.

## 2. Current Technology Stack
The application is currently configured for a **local-first, offline-capable prototype environment** to ensure zero latency and easy local testing.

*   **Frontend Framework:** [Next.js 14](https://nextjs.org/) (Using the App Router)
*   **UI / Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) Icons
*   **Database ORM:** [Prisma](https://www.prisma.io/)
*   **Database Engine:** SQLite (Local file-based database for zero-latency offline usage)
*   **Language:** TypeScript (Strictly typed)

> [!TIP]
> **Why SQLite?** We intentionally moved from Supabase/PostgreSQL to local SQLite for this prototype to guarantee it runs flawlessly on the user's local machine without internet connectivity or complex Docker setups. Because we are using **Prisma**, migrating this to a production PostgreSQL database in the future is as simple as changing one line in the `.env` file and running `npx prisma db push`.

---

## 3. Core Project Structure

The project follows a standard Next.js 14 App Router convention. Here is where you will find the critical components:

```text
/app
  ├── (dashboard)           # Protected routes (Dashboard, Patient Lists)
  ├── api/                  # Next.js Serverless API Routes (Backend)
  │   ├── patients/         # Patient creation & timeline history fetching
  │   ├── prescriptions/    # Saving, fetching, and cloning prescriptions
  │   └── templates/        # "Quick Treatment Group" template logic
  └── doctor/prescription/  # The core Prescription Workspace UI

/components
  ├── dashboard/            # Dashboard widgets and stats cards
  ├── drugs/                # Drug search and medicine selection UI
  ├── patients/             # Timeline History and Patient Search modals
  ├── prescriptions/        # The Prescription Cart, PDF Generator, and Templates UI
  └── ui/                   # Reusable base elements (Buttons, Inputs, Cards)

/prisma
  ├── schema.prisma         # The absolute source of truth for the database architecture
  ├── seed.ts               # Script to populate the DB with 150+ drugs and demo clinic
  └── rxnxt.db              # The actual local database file (Auto-generated)

### Database Models (Key Concepts)
*   **Encounters & Prescriptions:** Track the clinical history.
*   **DoctorDrugPreference & ClinicDrugPreference:** The foundational tables for the Machine Learning Recommendation Engine. These automatically track prescription frequencies natively per doctor and per clinic.

/data
  └── drugs.json            # The raw master list of 150+ medicines used for seeding
```

---

## 4. Current Feature Status (Completed Work)

The following features have been successfully built and are fully operational:

*   **The Intelligent Dashboard:** Displays live stats (total patients, Rx today) and a list of recent patient encounters.
*   **Patient Timeline Architecture:** The `/patients/[id]` route fetches a unified, chronological history of every visit, diagnosis, and prescribed medicine for a specific patient.
*   **Rapid Patient Onboarding:** A streamlined modal to add new patients to the database in seconds.
*   **The Predictive ML Search Engine (Prescription Workspace):** 
    *   Search and select from 150+ seeded medicines using `fuse.js`.
    *   **Additive Scoring Architecture:** The API (`/api/drugs/search/route.ts`) does not just return database results. It calculates a dynamic math score under 50ms based on:
        *   Exact Alias Matches (+100 pts) *(e.g., PCM → Paracetamol)*
        *   Personal Doctor Usage History (+0 to 50 pts)
        *   Clinic Shared Usage History (+0 to 20 pts)
        *   Brand, Generic, and Prefix Matching (+25 to 40 pts)
        *   Typo Tolerance (Fuzzy Match +0 to 20 pts)
    *   This makes the search completely database-agnostic. It will "learn" to rank custom 10,000+ drug catalogs automatically based on user behavior.
    *   **The "Did You Mean?" Strategy:** If confidence is critically low (score < 15), the UI gracefully displays a "Did you mean?" interactive suggestion block rather than a flat zero-results error.
    *   Specify dosages, frequency, and duration.
    *   **Treatment Templates:** Doctors can save complex drug combos as "Templates" (e.g., Viral Fever Protocol) and apply them with one click.
    *   **One-Click Clone:** From the patient timeline, doctors can "Clone" a past visit. This uses the `/api/prescriptions/[id]` endpoint to pre-fill the workspace with the historical data.
*   **Instant PDF Generation:** Utilizing `html2canvas` and `jspdf` on the client side to generate professional A4 prescriptions instantly without server lag.

---

## 5. Local Setup & Execution Guide

If you have just received the ZIP file containing the source code, follow these exact steps to spin up the entire application locally:

1.  **Install Node.js Dependencies**
    ```bash
    npm install
    ```
2.  **Generate the Database Architecture**
    This reads `prisma/schema.prisma` and creates the `rxnxt.db` file.
    ```bash
    npx prisma db push
    # or npx prisma migrate dev
    ```
3.  **Seed the Database**
    This executes `prisma/seed.ts` to populate the database with the Demo Clinic, Demo Doctor, and the 150+ medicines from `drugs.json`.
    ```bash
    npm run db:seed
    ```
4.  **Start the Development Server**
    ```bash
    npm run dev
    ```
5.  Open `http://localhost:3000` in your browser.

> [!NOTE]
> Since this is a prototype, the authentication layer (`/lib/auth-server.ts`) is currently "mocked" to automatically log the user in as the Demo Doctor created during the seed process.

---

## 6. Next Steps & Production Roadmap

If you are tasked with taking this prototype to a production deployment (e.g., Vercel, AWS), here are your immediate priorities:

1.  **Database Migration:** Change the `provider` in `schema.prisma` from `"sqlite"` to `"postgresql"`, and update the `DATABASE_URL` in `.env` to point to a managed database (like Supabase, AWS RDS, or Neon).
2.  **Authentication:** Replace the mocked `getAuthenticatedUser()` function with a real authentication provider (e.g., NextAuth.js, Clerk, or Supabase Auth).
3.  **Pharmacy Module:** Currently, the system prints PDFs. The next major architectural step is building a Pharmacy UI portal where saved prescriptions can be routed digitally for dispensing.
