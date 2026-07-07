# RxNXT Changelog

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
