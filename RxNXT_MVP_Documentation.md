# RxNXT MVP Documentation Pack
**Confidential - For Incubator & Investor Review**

---

## 1. Product Overview
**RxNXT** is a modern, blazing-fast Digital Prescription and Clinical Workspace engineered specifically for clinics and doctors. Designed to replace slow, error-prone paper prescriptions, RxNXT provides an intuitive digital workspace that drastically reduces prescription generation time while ensuring clinical accuracy and patient engagement.

## 2. Problem Statement
- **Time Inefficiency:** Doctors spend excessive time handwriting routine prescriptions or fighting with clunky, outdated Electronic Medical Records (EMRs).
- **Clinical Errors:** Handwritten prescriptions suffer from poor legibility, leading to dispensing errors at the pharmacy.
- **Patient Follow-up:** Patients frequently forget to take their medicines on time or miss follow-up visits, reducing care quality.
- **Data Fragmentation:** Patient histories, preferred clinic medicines, and doctor-specific favorites are disconnected.
- **High EMR Overhead:** Traditional EMRs are bloated with billing and inventory modules that solo practitioners and small clinics do not need or want.

## 3. Solution Overview
RxNXT solves this by stripping away EMR bloat and focusing exclusively on a frictionless prescription workflow and automated patient communication. 
By leveraging a massive, normalized Drug Master database and a sub-100ms typo-tolerant search engine, doctors can instantly find medicines, auto-populate exact dosage forms and strengths, generate professional PDFs, and automatically deliver them to patients via WhatsApp.

## 4. System Architecture
The platform operates on a heavily optimized, multi-tenant Serverless cloud architecture:
- **Frontend / API:** Next.js 14 (App Router) executing on Vercel's Edge Network.
- **Backend / Database:** PostgreSQL hosted on Supabase Mumbai (`ap-south-1`), accessed via Prisma ORM.
- **Authentication:** NextAuth.js providing secure, multi-tenant RBAC.
- **WhatsApp Integration:** Custom microservice hosted on Render for delivering PDFs and cron-scheduled reminders.
- **Search Engine:** Fuse.js with custom additive clinical scoring (prioritizing doctor/clinic favorites and handling typos).

## 5. User Roles
The system is built on a strict Multi-Tenant Role-Based Access Control (RBAC) foundation:
- **Clinic Admin (`admin`):** Manages clinic profile, uploads logos/signatures, manages staff accounts, and oversees custom clinic drugs.
- **Doctor (`doctor`):** Has isolated access to their specific patients, personal favorite medicines, prescription generation tools, and live patient queue.
- **Receptionist (`receptionist`):** Manages patient registration and the live clinic waiting queue.
- **Nurse (`nurse`):** Clinical support view.
- **Superadmin (`superadmin`):** Platform-wide administration.

## 6. Key Feature List
- **Intelligent Drug Search:** Ranks results by Doctor Favorites, Clinic Preferences, and exact aliases. Tolerates typos (e.g., "parctml" finds "Paracetamol").
- **Clinical Level Drug Database (Custom Drugs):** Allows clinic admins to manage a custom preferred medicine catalog. Custom drugs are prioritized in search results.
- **Smart Auto-population:** Automatically resolves generic-to-brand relationships and intelligently binds the correct Dosage Form and Strength.
- **Patient Queue Management:** Receptionists register patients to a live queue, instantly visible on the Doctor's dashboard with waiting times.
- **Treatment Templates:** One-click application of complex, multi-drug protocols (e.g., "Viral Fever").
- **WhatsApp PDF Delivery:** Instantly sends the generated A4 prescription PDF directly to the patient's WhatsApp.
- **Automated Reminders:** Vercel Cron triggers the WhatsApp microservice to send automated medicine intake and follow-up visit reminders.
- **Progressive Web App (PWA):** Installable on mobile devices with sticky action footers for easy mobile prescribing.

## 7. Workflow Diagrams

```mermaid
graph TD
    A[Receptionist Registers Patient] --> B(Patient Added to Live Queue)
    B --> C[Doctor Selects Patient from Queue]
    C --> D{Patient History Exists?}
    D -->|Yes| E[Review Timeline / Clone Previous Rx]
    D -->|No| F[New Prescription]
    E --> G[Search Medicines / Use Template]
    F --> G
    G --> H[Select Dosage/Freq/Dur via Quick-Chips]
    H --> I[Save to Database]
    I --> J[Generate PDF Prescription]
    J --> K[1-Click Send via WhatsApp Microservice]
