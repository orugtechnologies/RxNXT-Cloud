# RxNXT: Path to Production & Future Roadmap

This document outlines the current state of the RxNXT platform and the roadmap for upcoming features to scale from a fully functional Cloud EMR to a comprehensive clinic ecosystem.

---

## Current State: Cloud-Deployed MVP

RxNXT has successfully transitioned from a local prototype to a **fully cloud-hosted, scalable multi-tenant architecture**.

**What is Live Today:**
- **Cloud Infrastructure:** Hosted on Vercel with Supabase Mumbai Cloud PostgreSQL as the database.
- **WhatsApp Gateway:** Official Meta WhatsApp Cloud API (v20.0) handles automated WhatsApp delivery of PDFs and cron-based Smart Slot reminders. **No reliance on Twilio or third-party scrapers.**
- **Role-Based Workflows:** Distinct, fully-functional dashboards for Doctors, Admins, Receptionists, and Nurses.
- **Queue Management:** Live patient queuing connecting the reception desk to the doctor's dashboard.
- **Intelligent Prescribing:** Sub-100ms drug search with additive scoring, one-click templates, and historical cloning.
- **PWA Ready:** Installable as a Progressive Web App for mobile usage with sticky action footers.

---

## Phase 1: Go-to-Market & Stabilization (Current Focus)

With the core architecture deployed, the immediate focus is on onboarding the first pilot clinics and ensuring stability.

### 1. WhatsApp Template Approval & Multi-Clinic Phone ID Mapping
- The official Meta WhatsApp Cloud API is connected and active.
- **Goal:** Support per-clinic dedicated WhatsApp Business Phone Number IDs (`META_WA_PHONE_NUMBER_ID`) in Clinic settings so larger polyclinics can send from their own clinic brand identity.

### 2. PDF Cloud Storage Integration
- Currently, prescriptions are converted to Base64 and uploaded to Meta Cloud Media API or sent as secure view links.
- **Goal:** Implement an AWS S3 or Supabase Storage bucket for permanent archival of generated prescription PDFs.

---

## Phase 2: Feature Roadmap (Scaling to a Complete EMR)

The current application excels at doctor workflow and front-desk queuing. To become an end-to-end hospital/clinic management system, the following modules are planned:

### 1. Pharmacy & Inventory Management
- **Goal:** Track medicine stock levels within the clinic's internal pharmacy.
- **Features:** 
  - Auto-deduct stock when a prescription is generated. 
  - Low-stock alerts for the clinic admin on the dashboard.
  - Digital routing of prescriptions directly to the pharmacist screen (bypassing the patient carrying a paper/PDF).

### 2. Billing & Invoicing Module
- **Goal:** Allow the receptionist to manage finances.
- **Features:** 
  - Generate invoices for consultations and medicines.
  - Integration with payment gateways (e.g., Razorpay / Stripe) to send payment links via WhatsApp.
  - Revenue tracking and daily cash register summaries.

### 3. Advanced Appointment Scheduling
- **Goal:** Move beyond the live walk-in queue.
- **Features:** 
  - Calendar integration for booking future appointments.
  - Automated WhatsApp reminders 24 hours before the scheduled appointment.

### 4. Patient Mobile Experience (Patient Portal)
- **Goal:** Increase patient retention and engagement.
- **Features:** 
  - A secure portal where patients can log in with their phone number (OTP).
  - View past prescriptions, track vital signs over time, and request appointment rescheduling directly from their phone.

### 5. AI-Assisted Clinical Decision Support
- **Goal:** Leverage the structured data for predictive healthcare.
- **Features:**
  - **Drug Interaction Engine:** Cross-referencing prescribed medicines to warn doctors of severe interactions or contraindications before saving.
  - **AI Prescription Suggestions:** Analyzing the chief complaint and diagnosis to suggest standard medicine protocols based on the clinic's historical data.
  - **Brand Recommendation Engine:** Suggesting lower-cost generic alternatives to branded medicines based on real-time clinic analytics.

---
**Summary:** The foundational architecture (Auth, DB, Queues, WhatsApp, PDF) is complete and live. Phase 2 focuses on horizontal expansion (Billing, Pharmacy) and vertical deepening (AI, Advanced Analytics) to scale the business.
