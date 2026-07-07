# RxNXT: Path to Production & Future Roadmap

This document outlines exactly what needs to be done to take the RxNXT codebase from its current state (**Cloud-Ready MVP**) to the **Expected Production Level** (a fully hosted, scalable, and feature-rich EMR platform).

---

## Phase 1: Immediate Deployment (Developer Tasks)
Your developer has the `RxNXT_Cloud_Ready_Handoff` folder. Their immediate goal is to get the application live on the internet so you can test it on your phone or tablet.

### 1. Provision a Cloud Database
- The app requires a live **PostgreSQL** database. 
- **Action:** The developer should create a free tier database on **Supabase** or **Neon.tech**.
- They will receive a `DATABASE_URL` which must be saved.

### 2. Configure Environment Variables
- **Action:** Before hosting, the developer must configure the following in the `.env` file (or the hosting provider's dashboard):
  - `DATABASE_URL`: The PostgreSQL link from step 1.
  - `NEXTAUTH_SECRET`: A secure random string (can be generated using `openssl rand -base64 32`).
  - `NEXTAUTH_URL`: The final domain name (e.g., `https://rxnxt-app.vercel.app`).
  - `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN`: From your Twilio account.

### 3. Deploy to Vercel (Recommended for MVP)
Because this application is built on Next.js, it is highly portable. For the fastest time-to-market and zero DevOps overhead, Vercel is the recommended hosting platform right now. 
- **Action:** The developer should push the code to a private GitHub repository and connect it to **Vercel**.
- Vercel will automatically configure the build settings and serverless functions (including the Vercel Cron jobs for medicine reminders).
- **Database Initialization:** Once deployed, the developer must run `npx prisma db push` to construct the PostgreSQL tables in the cloud database.

*(Note: When you are ready to scale to enterprise hospitals requiring strict HIPAA compliance, this exact same codebase can be containerized via Docker and moved to AWS or Google Cloud without rewriting the application.)*

---

## Phase 2: Post-Launch Technical Refinements
Once the app is live, a few backend services need to be transitioned from "Development Mode" to "Production Mode".

### 1. WhatsApp Verification
- Currently, the app is built to use Twilio. To send automated PDFs to actual patients without getting blocked as spam, you will need to register your clinic's business number with the **Meta WhatsApp Business API** or verify the Twilio sender.

### 2. PDF Generation Storage
- Currently, the WhatsApp message sends a secure link to view the prescription. 
- **Expected Level:** To send the physical `.pdf` file directly into the WhatsApp chat, the developer must implement a Cloud Storage bucket (like AWS S3 or Supabase Storage) where the generated PDF is temporarily saved so WhatsApp can download and forward it to the patient.

---

## Phase 3: The Feature Roadmap (Reaching the "Expected Level")
The current app focuses heavily on Doctor Workflow (Prescriptions, Templates, and Search). To become a complete EMR (Electronic Medical Record) system, the following features should be planned for development next:

### 1. Pharmacy & Inventory Management
- **Goal:** Track medicine stock levels within the clinic.
- **Features:** Auto-deduct stock when a prescription is generated. Low-stock alerts for the clinic admin.

### 2. Receptionist & Billing Portal
- **Goal:** Allow front-desk staff to manage the clinic without giving them access to clinical records.
- **Features:** Appointment scheduling, patient queuing system, and invoice/billing generation for consultations and medicines.

### 3. Clinic Admin Dashboard & Analytics
- **Goal:** Give the clinic owner insights into revenue and performance.
- **Features:** Graphs showing patient volume over time, most prescribed medicines (to negotiate bulk rates with suppliers), and doctor performance metrics.

### 4. Patient Mobile Experience
- **Goal:** Patient retention.
- **Features:** A progressive web app (PWA) where patients can log in with their phone number (OTP) to view their past prescriptions, upcoming follow-ups, and active treatment groups.

---
**Summary:** The foundation is perfectly built. By completing Phase 1, you will have a live, usable product. Phase 2 and 3 are where you will invest your future development efforts to scale the business!
