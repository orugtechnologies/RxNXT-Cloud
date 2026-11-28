# RxNXT Cloud - Comprehensive Security Architecture Bundle

> This document contains the core authentication, multi-tenancy, authorization, and clinical data protection files of RxNXT Cloud for external AI security evaluation.

================================================================================
FILE: prisma/schema.prisma
================================================================================

\	s
// This is your Prisma schema file for RxNXT (SQLite — fully local)
// Learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// CLINIC
// ─────────────────────────────────────────────
model Clinic {
  id        String   @id @default(cuid())
  name      String
  address   String?
  phone     String?
  email     String?
  logoUrl   String?
  prescriptionPadUrl          String?
  prescriptionHeaderHeight    Float?    @default(48)
  prescriptionFooterHeight    Float?    @default(30)
  inviteCode String? @unique
  
  // Subscription & Commercial Tier Management
  subscriptionStatus      String    @default("TRIAL") // TRIAL, ACTIVE, EXPIRED, CANCELLED
  subscriptionPlan        String    @default("TRIAL_14_DAYS") // TRIAL_14_DAYS, STARTER_MONTHLY, PRO_ANNUAL, ENTERPRISE
  subscriptionTier        String    @default("TRIAL") // TRIAL, SOLO_GP, SPECIALIST, POLYCLINIC_HUB
  prescriptionsCount      Int       @default(0)       // Incremented on every completed prescription
  trialPrescriptionCap    Int       @default(150)     // First 150 trial cap
  baseSeats               Int       @default(1)
  additionalSeats         Int       @default(0)

  // Prepaid WhatsApp Adherence Wallet
  whatsappCreditBalance       Int       @default(0)   // Decrements per adherence message
  whatsappLowBalanceAlertSent Boolean   @default(false)

  subscriptionStartedAt   DateTime  @default(now())
  trialEndsAt             DateTime?
  subscriptionEndsAt      DateTime?
  renewalReminderSentAt   DateTime?
  lastPaymentAmount       Float?
  lastPaymentRef          String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users                 User[]
  patients              Patient[]
  encounters            Encounter[]
  prescriptions         Prescription[]
  treatmentGroups       TreatmentGroup[]
  clinicDrugPreferences ClinicDrugPreference[]
  customDrugs           Drug[]
  queueItems            QueueItem[]
  subscriptionPayments  SubscriptionPayment[]
  pharmacyItems         PharmacyItem[]
  dispenseLogs          DispenseLog[]
  bills                 Bill[]
  walletTransactions    WhatsAppCreditTransaction[]
  labOrders             LabOrder[]
}

// ─────────────────────────────────────────────
// USER (Doctor / Admin)
// ─────────────────────────────────────────────
model User {
  id                 String   @id @default(cuid())
  email              String   @unique
  password           String
  fullName           String
  role               String   @default("doctor")
  status             String   @default("ACTIVE")
  specialization     String?
  registrationNumber String?
  medicalCouncil     String?
  registrationYear   Int?
  qualification      String?
  verificationStatus String   @default("UNVERIFIED")
  verifiedAt         DateTime?
  verificationSource String?
  verificationDetails String?
  signatureUrl       String?
  phone              String?
  clinicId           String
  clinic             Clinic   @relation(fields: [clinicId], references: [id])
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  encounters      Encounter[]
  prescriptions   Prescription[]
  treatmentGroups TreatmentGroup[]
  doctorDrugPreferences DoctorDrugPreference[]
  queueItems      QueueItem[]
  labOrders       LabOrder[]

  @@index([clinicId, role])
}

// ─────────────────────────────────────────────
// PATIENT
// ─────────────────────────────────────────────
model Patient {
  id        String   @id @default(cuid())
  clinicId  String
  clinic    Clinic   @relation(fields: [clinicId], references: [id])
  name      String
  phone     String?
  age       Int?
  gender    String?
  address   String?
  allergies String?
  bloodGroup String?
  whatsappConsent Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  encounters    Encounter[]
  prescriptions Prescription[]
  reminders     Reminder[]
  queueItems    QueueItem[]
  bills         Bill[]
  labOrders     LabOrder[]

  @@index([clinicId, phone])
  @@index([clinicId, name])
}

// ─────────────────────────────────────────────
// ENCOUNTER (Clinical Visit)
// ─────────────────────────────────────────────
model Encounter {
  id             String   @id @default(cuid())
  clinicId       String
  clinic         Clinic   @relation(fields: [clinicId], references: [id])
  doctorId       String
  doctor         User     @relation(fields: [doctorId], references: [id])
  patientId      String
  patient        Patient  @relation(fields: [patientId], references: [id])
  chiefComplaint String?
  diagnosis      String?
  notes          String?
  followUpDate   String?
  createdAt      DateTime @default(now())

  prescription Prescription?

  @@index([clinicId, doctorId])
  @@index([patientId])
}

// ─────────────────────────────────────────────
// PRESCRIPTION
// ─────────────────────────────────────────────
model Prescription {
  id          String   @id @default(cuid())
  clinicId    String
  clinic      Clinic   @relation(fields: [clinicId], references: [id])
  encounterId String   @unique
  encounter   Encounter @relation(fields: [encounterId], references: [id])
  doctorId    String
  doctor      User     @relation(fields: [doctorId], references: [id])
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  createdAt   DateTime @default(now())
  timeTakenSeconds Int?
  creationMethod   String?
  dispenseStatus   String   @default("PENDING") // PENDING, DISPENSED, PARTIAL

  medicines    PrescriptionMedicine[]
  reminders    Reminder[]
  dispenseLogs DispenseLog[]

  @@index([clinicId, doctorId])
  @@index([patientId])
}

// ─────────────────────────────────────────────
// PRESCRIPTION MEDICINE (Line Item)
// ─────────────────────────────────────────────
model PrescriptionMedicine {
  id             String       @id @default(cuid())
  prescriptionId String
  prescription   Prescription @relation(fields: [prescriptionId], references: [id], onDelete: Cascade)
  drugId         String?
  drug           Drug?        @relation(fields: [drugId], references: [id])
  customName     String?
  dosageForm     String?
  strength       String?
  route          String?
  frequency      String?
  duration       String?
  instructions   String?
  createdAt      DateTime     @default(now())

  @@index([prescriptionId])
  @@index([drugId])
}

// ─────────────────────────────────────────────
// DRUG (Medicine Database)
// ─────────────────────────────────────────────
model Drug {
  id                String   @id @default(cuid())
  genericName       String
  brandName         String?
  aliases           String?  // Comma-separated aliases like "PCM, P-Mol"
  dosageForm        String?
  strength          String?
  route             String?
  isActive          Boolean  @default(true)
  isRestricted      Boolean  @default(false)
  prescriptionCount Int      @default(0)
  createdAt         DateTime @default(now())

  prescriptionMedicines PrescriptionMedicine[]
  treatmentGroupItems   TreatmentGroupItem[]
  doctorDrugPreferences DoctorDrugPreference[]
  clinicDrugPreferences ClinicDrugPreference[]
  pharmacyItems         PharmacyItem[]

  clinicId              String?
  clinic                Clinic?  @relation(fields: [clinicId], references: [id], onDelete: Cascade)

  @@index([genericName])
  @@index([brandName])
}

// ─────────────────────────────────────────────
// TREATMENT GROUP (Prescription Templates)
// ─────────────────────────────────────────────
model TreatmentGroup {
  id        String   @id @default(cuid())
  name      String
  doctorId  String
  doctor    User     @relation(fields: [doctorId], references: [id])
  clinicId  String
  clinic    Clinic   @relation(fields: [clinicId], references: [id])
  createdAt DateTime @default(now())

  items TreatmentGroupItem[]
}

model TreatmentGroupItem {
  id           String         @id @default(cuid())
  groupId      String
  group        TreatmentGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  drugId       String?
  drug         Drug?          @relation(fields: [drugId], references: [id])
  customName   String?
  dosageForm   String?
  strength     String?
  route        String?
  frequency    String?
  duration     String?
  instructions String?
  sortOrder    Int            @default(0)
}

// ─────────────────────────────────────────────
// PREFERENCES (Habit Tracking)
// ─────────────────────────────────────────────
model DoctorDrugPreference {
  id        String   @id @default(cuid())
  doctorId  String
  drugId    String
  count     Int      @default(0)
  updatedAt DateTime @updatedAt

  doctor    User     @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  drug      Drug     @relation(fields: [drugId], references: [id], onDelete: Cascade)

  @@unique([doctorId, drugId])
}

model ClinicDrugPreference {
  id        String   @id @default(cuid())
  clinicId  String
  drugId    String
  count     Int      @default(0)
  updatedAt DateTime @updatedAt

  clinic    Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  drug      Drug     @relation(fields: [drugId], references: [id], onDelete: Cascade)

  @@unique([clinicId, drugId])
}

// ─────────────────────────────────────────────
// REMINDERS (Automated WhatsApp Scheduling)
// ─────────────────────────────────────────────
model Reminder {
  id                String       @id @default(cuid())
  prescriptionId    String
  prescription      Prescription @relation(fields: [prescriptionId], references: [id], onDelete: Cascade)
  patientId         String
  patient           Patient      @relation(fields: [patientId], references: [id], onDelete: Cascade)
  scheduledFor      DateTime
  sentAt            DateTime?
  status            String       @default("PENDING") // PENDING, PROCESSING, SENT, FAILED, SUPERSEDED
  messageType       String       @default("MEDICINE") // PDF, MEDICINE, FOLLOW_UP, REFILL
  attempts          Int          @default(0)
  lastAttemptAt     DateTime?
  providerMessageId String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @default(now()) @updatedAt

  @@index([status, scheduledFor])
  @@index([prescriptionId])
  @@index([patientId])
}

// ─────────────────────────────────────────────
// QUEUE ITEM (Patient waiting for Doctor)
// ─────────────────────────────────────────────
model QueueItem {
  id          String   @id @default(cuid())
  clinicId    String
  clinic      Clinic   @relation(fields: [clinicId], references: [id])
  doctorId    String
  doctor      User     @relation(fields: [doctorId], references: [id])
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  status      String   @default("WAITING") // WAITING, AWAY, SKIPPED, COMPLETED, IN_PROCEDURE, RETURNED_READY
  tokenNumber Int?

  // Vitals recorded at Reception / Triage
  bp          String?
  pulse       String?
  temperature String?
  weight      String?
  height      String?
  spo2        String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([clinicId, doctorId, status, createdAt])
  @@index([patientId])
}

// ─────────────────────────────────────────────
// SUBSCRIPTION PAYMENT (Audit Log & Billing)
// ─────────────────────────────────────────────
model SubscriptionPayment {
  id           String   @id @default(cuid())
  clinicId     String
  clinic       Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  plan         String
  amount       Float
  billingCycle String   // MONTHLY, ANNUAL
  status       String   @default("COMPLETED") // COMPLETED, PENDING, FAILED
  paymentRef   String?
  validFrom    DateTime
  validUntil   DateTime
  createdAt    DateTime @default(now())

  @@index([clinicId])
}

// ─────────────────────────────────────────────
// PHARMACY INVENTORY (Stock & Batch Management)
// ─────────────────────────────────────────────
model PharmacyItem {
  id              String   @id @default(cuid())
  clinicId        String
  clinic          Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  drugId          String?
  drug            Drug?    @relation(fields: [drugId], references: [id])
  medicineName    String
  genericName     String?
  dosageForm      String   @default("Tablet")
  strength        String?
  batchNumber     String?
  expiryDate      DateTime?
  quantityInStock Int      @default(0)
  minReorderLevel Int      @default(10)
  unitPrice       Float    @default(0.0) // Selling price (MRP)
  costPrice       Float?
  rackLocation    String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  dispensedItems  DispensedItem[]

  @@index([clinicId, medicineName])
  @@index([clinicId, expiryDate])
}

// ─────────────────────────────────────────────
// DISPENSE LOG (Pharmacy Dispensing & Billing)
// ─────────────────────────────────────────────
model DispenseLog {
  id              String       @id @default(cuid())
  clinicId        String
  clinic          Clinic       @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  prescriptionId  String
  prescription    Prescription @relation(fields: [prescriptionId], references: [id], onDelete: Cascade)
  pharmacistId    String?
  pharmacistName  String?
  patientId       String
  patientName     String?
  totalAmount     Float        @default(0.0)
  paymentMode     String       @default("CASH") // CASH, UPI, CARD, CREDIT
  notes           String?
  createdAt       DateTime     @default(now())

  items           DispensedItem[]

  @@index([clinicId, createdAt])
  @@index([prescriptionId])
}

model DispensedItem {
  id             String        @id @default(cuid())
  dispenseLogId  String
  dispenseLog    DispenseLog   @relation(fields: [dispenseLogId], references: [id], onDelete: Cascade)
  pharmacyItemId String?
  pharmacyItem   PharmacyItem? @relation(fields: [pharmacyItemId], references: [id])
  medicineName   String
  quantity       Int           @default(1)
  unitPrice      Float         @default(0.0)
  totalPrice     Float         @default(0.0)
  dosageForm     String?
  batchNumber    String?

  @@index([dispenseLogId])
}



// ─────────────────────────────────────────────
// BILL (Patient Consultation Invoice)
// ─────────────────────────────────────────────
model Bill {
  id              String    @id @default(cuid())
  billNumber      String    // e.g. RX-BILL-0001
  clinicId        String
  clinic          Clinic    @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  patientId       String
  patient         Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  encounterId     String?   @unique
  prescriptionId  String?

  // Billing amounts
  consultationFee Float     @default(0)
  medicineFee     Float     @default(0)
  otherFee        Float     @default(0)
  discount        Float     @default(0)
  totalAmount     Float     @default(0)

  // Payment
  paymentStatus   String    @default("PENDING") // PENDING, PAID, PARTIAL, CANCELLED
  paymentMode     String?   // CASH, UPI, CARD
  paymentRef      String?   // UPI txn ID, card ref, receipt no, etc.
  paidAt          DateTime?

  // Meta
  createdById     String?   // receptionist user ID
  createdByName   String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  items           BillItem[]

  @@index([clinicId, createdAt])
  @@index([patientId])
  @@index([clinicId, paymentStatus])
}

model BillItem {
  id          String   @id @default(cuid())
  billId      String
  bill        Bill     @relation(fields: [billId], references: [id], onDelete: Cascade)
  description String
  quantity    Int      @default(1)
  unitPrice   Float    @default(0)
  totalPrice  Float    @default(0)
  itemType    String   @default("CONSULTATION") // CONSULTATION, MEDICINE, OTHER

  @@index([billId])
}

// ─────────────────────────────────────────────
// PREPAID WALLET AUDIT LEDGER
// ─────────────────────────────────────────────
model WhatsAppCreditTransaction {
  id           String   @id @default(cuid())
  clinicId     String
  clinic       Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  type         String   // RECHARGE, ADHERENCE_DOSE, REFILL_ALERT, REFUND, PROMOTIONAL
  amount       Int      // e.g. +2000 for recharge, -1 for sent reminder
  balanceAfter Int
  referenceId  String?  // reminderId, paymentId, or razorpayPaymentId
  description  String?
  createdAt    DateTime @default(now())

  @@index([clinicId, createdAt])
  @@index([referenceId])
}

// ─────────────────────────────────────────────
// LAB ORDERS & TEST RESULTS
// ─────────────────────────────────────────────
model LabOrder {
  id              String          @id @default(cuid())
  orderNumber     String          // e.g. LAB-202611-0001
  clinicId        String
  clinic          Clinic          @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  patientId       String
  patient         Patient         @relation(fields: [patientId], references: [id], onDelete: Cascade)
  doctorId        String?
  doctor          User?           @relation(fields: [doctorId], references: [id])
  encounterId     String?
  queueItemId     String?
  status          String          @default("ORDERED") // ORDERED, SAMPLE_COLLECTED, PROCESSING, COMPLETED, CANCELLED
  priority        String          @default("NORMAL")  // NORMAL, URGENT
  notes           String?
  totalAmount     Float           @default(0)
  paymentStatus   String          @default("PENDING") // PENDING, PAID
  paymentMethod   String?         // UPI, CASH, CARD
  paidAt          DateTime?
  releasedToDoctor Boolean         @default(false)
  releasedAt      DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  tests           LabTestResult[]

  @@index([clinicId, createdAt])
  @@index([patientId])
  @@index([clinicId, status])
  @@index([clinicId, paymentStatus])
}

model LabTestResult {
  id              String       @id @default(cuid())
  labOrderId      String
  labOrder        LabOrder     @relation(fields: [labOrderId], references: [id], onDelete: Cascade)
  testName        String       // e.g. Complete Blood Count (CBC)
  category        String       @default("BLOOD") // BLOOD, URINE, IMAGING, OTHER
  templateType    String       @default("CUSTOM") // CBC, WIDAL, DENGUE, RBS, LFT, KFT, CRP, URINE_RE, CHEST_XRAY, ECG, CUSTOM
  price           Float        @default(0)
  status          String       @default("PENDING") // PENDING, PROCESSING, COMPLETED
  results         String?      // JSON string of parameter rows: [{ id, name, value, unit, referenceRange, isAbnormal, flag }]
  impression      String?      // Overall impression / summary / clinical interpretation
  isAbnormal      Boolean      @default(false)
  technicianId    String?
  technicianName  String?
  completedAt     DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([labOrderId])
}


\\n
================================================================================
FILE: middleware.ts
================================================================================

\	s
import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect superadmin routes: strictly require superadmin role
  if (pathname.startsWith('/superadmin/dashboard')) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET || 'rxnxt-local-dev-secret-key-2024' 
    });
    const role = (token?.role as string)?.toLowerCase().replace('_', '');
    if (!token || role !== 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin/login', req.url));
    }
  }

  // Only apply redirect to dashboard routes
  if (
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/receptionist') ||
    pathname.startsWith('/pharmacist') ||
    pathname.startsWith('/nurse') ||
    pathname.startsWith('/lab') ||
    pathname.startsWith('/admin')
  ) {
    const token = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

\\n
================================================================================
FILE: lib/auth.ts
================================================================================

\	s
// lib/auth.ts
// NextAuth configuration for RxNXT — credentials-based authentication.

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const cleanEmail = credentials.email.toLowerCase().trim();

        // Look up user in database
        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
          include: { clinic: true },
        });

        if (!user || !user.password) return null;

        // Block suspended or inactive accounts
        if (user.status && user.status !== 'ACTIVE') {
          return null;
        }

        // Verify password with bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          status: user.status,
          clinicId: user.clinicId,
          clinicName: user.clinic?.name || 'RxNXT Platform',
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      // On login, copy user fields into the JWT token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
        token.clinicId = (user as any).clinicId;
        token.clinicName = (user as any).clinicName;
      }
      return token;
    },
    async session({ session, token }) {
      // Make user data available in useSession() on the client
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).status = token.status as string;
        (session.user as any).clinicId = token.clinicId as string;
        (session.user as any).clinicName = token.clinicName as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'rxnxt-local-dev-secret-key-2024'),
};

\\n
================================================================================
FILE: lib/auth-server.ts
================================================================================

\	s
// lib/auth-server.ts
// Server-side helper — call this in API routes to get the authenticated user.
// Replaces the old getAuthenticatedUser() from lib/supabase/server.ts

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

import { prisma } from './prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  clinicId: string;
  fullName: string | null;
  clinicName: string | null;
}

/**
 * Returns the authenticated user from the NextAuth JWT session.
 * Returns null if no valid session exists (triggers 401 in API routes).
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = session.user as any;
  let clinicId = user.clinicId ?? '';
  let clinicName = user.clinicName ?? null;
  const email = user.email?.toLowerCase().trim() ?? '';

  // Auto-heal clinicId if missing from session
  if (!clinicId && email) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email },
        include: { clinic: true },
      });
      if (dbUser?.clinicId) {
        clinicId = dbUser.clinicId;
        clinicName = dbUser.clinic?.name || clinicName;
      }
    } catch (e) {
      console.error('Failed to resolve clinicId from DB:', e);
    }
  }

  // Strict Multi-Tenancy Guard: If clinicId is still missing and user is not superadmin, deny access
  if (!clinicId && user.role !== 'superadmin') {
    console.warn(`[Multi-Tenancy Guard] User ${email} has no clinicId assigned. Access denied.`);
    return null;
  }

  return {
    id: user.id,
    email,
    role: user.role ?? 'doctor',
    clinicId,
    fullName: user.name ?? null,
    clinicName,
  };
}

\\n
================================================================================
FILE: lib/prescriptionToken.ts
================================================================================

\	s
import crypto from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || 'rxnxt-pdf-signature-salt-2026';

/**
 * Generates an HMAC-SHA256 signature token for public patient access to prescription PDFs.
 */
export function generatePrescriptionPdfToken(prescriptionId: string): string {
  if (!prescriptionId) return '';
  return crypto
    .createHmac('sha256', SECRET)
    .update(`rx_pdf:${prescriptionId}`)
    .digest('hex')
    .substring(0, 32);
}

/**
 * Verifies that the provided token matches the expected signature for this prescription.
 */
export function verifyPrescriptionPdfToken(prescriptionId: string, token?: string | null): boolean {
  if (!prescriptionId || !token) return false;
  const expected = generatePrescriptionPdfToken(prescriptionId);
  try {
    const tokenBuf = Buffer.from(token);
    const expectedBuf = Buffer.from(expected);
    if (tokenBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}

\\n
================================================================================
FILE: app/api/prescriptions/save/route.ts
================================================================================

\	s
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { isDrugNameRestricted } from '@/lib/restrictedDrugs';
import { getClinicSubscription } from '@/lib/subscription';
import { formatUnifiedRxId } from '@/lib/prescription-id';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only doctors or clinic admins can create & sign prescriptions
  if (user.role !== 'doctor' && user.role !== 'clinic_admin' && user.role !== 'admin' && user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Permission denied. Only licensed doctors or clinic administrators can issue prescriptions.' }, { status: 403 });
  }

  try {
    // 0. Enforce Subscription / 150-Rx Usage-Based Free Trial Guard
    const sub = await getClinicSubscription(user.clinicId);
    if (!sub.allowed) {
      return NextResponse.json({
        error: sub.isUsageLocked ? 'TRIAL_USAGE_LIMIT_REACHED' : 'SUBSCRIPTION_EXPIRED',
        message: sub.isUsageLocked
          ? `You have reached your 150 free prescription trial limit. Please select a subscription tier to continue creating prescriptions.`
          : 'Your subscription has expired. Please renew your subscription to continue creating prescriptions.',
        subscription: sub,
      }, { status: 403 });
    }

    const { patientId, chiefComplaint, diagnosis, notes, followUpDate, medicines, timeTakenSeconds, creationMethod, enableDailyReminders } = await request.json();

    if (!patientId || !medicines || medicines.length === 0) {
      return NextResponse.json({ error: 'Patient and at least 1 medicine are required' }, { status: 400 });
    }

    // Strict Clinical Validation: Frequency, Duration, and Instructions are mandatory for every prescribed medicine
    for (let i = 0; i < medicines.length; i++) {
      const m = medicines[i];
      const medName = m.name || m.customName || `Medicine #${i + 1}`;
      if (!m.frequency || !m.frequency.trim()) {
        return NextResponse.json({ error: `Frequency is mandatory for "${medName}".` }, { status: 400 });
      }
      if (!m.duration || !m.duration.trim()) {
        return NextResponse.json({ error: `Duration is mandatory for "${medName}".` }, { status: 400 });
      }
      if (!m.instructions || !m.instructions.trim()) {
        return NextResponse.json({ error: `Instructions are mandatory for "${medName}".` }, { status: 400 });
      }
    }

    // 1. Strict Validation: Check for Restricted Drugs (Schedule X / Narcotics)
    // Custom names via keyword match
    const hasRestrictedCustom = medicines.some((m: any) => isDrugNameRestricted(m.name));
    if (hasRestrictedCustom) {
      return NextResponse.json({ error: 'Cannot prescribe highly restricted drugs or narcotics via telemedicine.' }, { status: 400 });
    }

    // Predefined drugs via database check
    const drugIds = medicines.map((m: any) => m.drugId).filter(Boolean);
    if (drugIds.length > 0) {
      const restrictedDrugs = await prisma.drug.findMany({
        where: { id: { in: drugIds }, isRestricted: true }
      });
      if (restrictedDrugs.length > 0) {
        return NextResponse.json({ error: 'Cannot prescribe highly restricted drugs or narcotics via telemedicine.' }, { status: 400 });
      }
    }

    // Verify patient belongs to the clinic
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId: user.clinicId },
    });
    if (!patient) return NextResponse.json({ error: 'Patient not found or access denied' }, { status: 403 });

    // Create Encounter → Prescription → Medicines atomically
    const result = await prisma.$transaction(async (tx) => {
      const encounter = await tx.encounter.create({
        data: {
          clinicId: user.clinicId,
          doctorId: user.id,
          patientId,
          chiefComplaint: chiefComplaint || null,
          diagnosis: diagnosis || null,
          notes: notes || null,
          followUpDate: followUpDate || null,
        },
      });

      // ── Determine Daily Token & Unified Rx ID (RX-YYMMDD-###) ────────────
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const queueItem = tx.queueItem?.findFirst ? await tx.queueItem.findFirst({
        where: {
          clinicId: user.clinicId,
          patientId,
          createdAt: { gte: todayStart },
        },
        orderBy: { createdAt: 'desc' },
      }) : null;

      let tokenNumber = queueItem?.tokenNumber;
      if (!tokenNumber) {
        const todayCount = tx.prescription?.count ? await tx.prescription.count({
          where: {
            clinicId: user.clinicId,
            createdAt: { gte: todayStart },
          },
        }) : 0;
        tokenNumber = todayCount + 1;
      }

      const unifiedRxId = formatUnifiedRxId(new Date(), tokenNumber);

      // Ensure unique ID in case of token overlap
      let finalRxId = unifiedRxId;
      const existing = tx.prescription?.findUnique ? await tx.prescription.findUnique({ where: { id: finalRxId } }) : null;
      if (existing) {
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        finalRxId = `${unifiedRxId}-${randomSuffix}`;
      }

      const prescription = await tx.prescription.create({
        data: {
          id: finalRxId,
          clinicId: user.clinicId,
          encounterId: encounter.id,
          doctorId: user.id,
          patientId,
          timeTakenSeconds: timeTakenSeconds || null,
          creationMethod: creationMethod || 'MANUAL',
        },
      });

      // Mark queue item as COMPLETED if patient was waiting in queue
      if (queueItem && queueItem.status !== 'COMPLETED' && tx.queueItem?.update) {
        await tx.queueItem.update({
          where: { id: queueItem.id },
          data: { status: 'COMPLETED' },
        });
      }

      // Create medicine line items
      await tx.prescriptionMedicine.createMany({
        data: medicines.map((m: any) => ({
          prescriptionId: prescription.id,
          drugId: m.drugId || null,
          customName: m.name || null,
          dosageForm: m.dosage_form || null,
          strength: m.strength || null,
          route: m.route || null,
          frequency: m.frequency || null,
          duration: m.duration || null,
          instructions: m.instructions || null,
        })),
      });

      // ── Doctor-Scoped & Type-Aware Smart Superseding ──────────────────────────
      // Look up previous prescriptions by the SAME DOCTOR for this patient
      const prevDocPrescriptions = await tx.prescription.findMany({
        where: {
          patientId: patientId,
          doctorId: user.id,
        },
        select: { id: true },
      });
      const prevPrescriptionIds = prevDocPrescriptions.map((p) => p.id);

      if (prevPrescriptionIds.length > 0) {
        // Only supersede acute dose reminders and follow-ups belonging to THIS DOCTOR.
        // Standing chronic care monthly refills (REFILL) and other specialists' care plans remain protected.
        await tx.reminder.updateMany({
          where: {
            patientId: patientId,
            prescriptionId: { in: prevPrescriptionIds },
            status: 'PENDING',
            messageType: {
              in: ['MEDICINE', 'MEDICINE_MORNING', 'MEDICINE_AFTERNOON', 'MEDICINE_NIGHT', 'FOLLOW_UP'],
            },
          },
          data: {
            status: 'SUPERSEDED',
          },
        });
      }

      // Collect all reminders for high-performance bulk creation
      const remindersToCreate: Array<{
        prescriptionId: string;
        patientId: string;
        scheduledFor: Date;
        status: 'PENDING';
        messageType: 'FOLLOW_UP' | 'REFILL' | 'MEDICINE' | 'MEDICINE_MORNING' | 'MEDICINE_AFTERNOON' | 'MEDICINE_NIGHT';
      }> = [];

      // Create Follow-up Reminder if followUpDate exists
      if (followUpDate) {
        remindersToCreate.push({
          prescriptionId: prescription.id,
          patientId: patientId,
          scheduledFor: new Date(followUpDate),
          status: 'PENDING',
          messageType: 'FOLLOW_UP',
        });
      }

      // Determine medication course duration (e.g. 3 days, 5 days, 7 days vs 30 days / chronic)
      const detectedDurations: number[] = [];
      let isChronic = false;

      medicines.forEach((m: any) => {
        const durStr = (m.duration || '').toLowerCase();
        if (durStr.includes('month') || durStr.includes('30') || durStr.includes('continuous')) {
          isChronic = true;
        }
        if (m.duration) {
          const match = m.duration.match(/\d+/);
          if (match) {
            const parsed = parseInt(match[0], 10);
            if (parsed > 0) {
              detectedDurations.push(parsed);
            }
          }
        }
      });

      const maxDurationDays = detectedDurations.length > 0 ? Math.max(...detectedDurations) : 5;
      if (maxDurationDays > 14) isChronic = true;

      const now = new Date();

      // Reminders are ACTIVE BY DEFAULT (Opt-out policy).
      // Unless the doctor explicitly unchecks the toggle (enableDailyReminders === false),
      // adherence dose reminders are always scheduled automatically.
      if (enableDailyReminders !== false) {
        if (isChronic) {
          // CHRONIC CARE: Daily morning briefings for 14 days + Refill Reminder on Day 25
          for (let day = 1; day <= 14; day++) {
            const reminderDate = new Date(Date.UTC(
              now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + day,
              2, 30, 0, 0
            ));

            remindersToCreate.push({
              prescriptionId: prescription.id,
              patientId: patientId,
              scheduledFor: reminderDate,
              status: 'PENDING',
              messageType: 'MEDICINE',
            });
          }

          // Schedule Monthly Refill Alert on Day 25
          const refillDate = new Date(Date.UTC(
            now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 25,
            2, 30, 0, 0
          ));

          remindersToCreate.push({
            prescriptionId: prescription.id,
            patientId: patientId,
            scheduledFor: refillDate,
            status: 'PENDING',
            messageType: 'REFILL',
          });
        } else {
          // ACUTE ILLNESS: Streamlined 1-Morning Daily Briefing (8:00 AM IST) for the prescribed course
          const durationDays = Math.min(maxDurationDays, 14);
          for (let day = 1; day <= durationDays; day++) {
            const morningDate = new Date(Date.UTC(
              now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + day,
              2, 30, 0, 0
            ));

            remindersToCreate.push({
              prescriptionId: prescription.id,
              patientId: patientId,
              scheduledFor: morningDate,
              status: 'PENDING',
              messageType: 'MEDICINE_MORNING',
            });
          }
        }
      }

      // Fast single-query batch insert for all scheduled reminders
      if (remindersToCreate.length > 0) {
        await tx.reminder.createMany({
          data: remindersToCreate,
        });
      }

      // Mark any active queue items (WAITING, RETURNED_READY, IN_PROCEDURE) for this patient and doctor as COMPLETED
      await tx.queueItem.updateMany({
        where: {
          clinicId: user.clinicId,
          doctorId: user.id,
          patientId,
          status: { in: ['WAITING', 'RETURNED_READY', 'IN_PROCEDURE'] },
        },
        data: { status: 'COMPLETED' },
      });

      // Epic 1: Atomically increment clinic prescription ledger counter
      if (tx.clinic?.update) {
        try {
          await tx.clinic.update({
            where: { id: user.clinicId },
            data: { prescriptionsCount: { increment: 1 } },
          });
        } catch (e) {
          console.warn('Non-blocking clinic prescription count update warning:', e);
        }
      }

      return { encounter, prescription };
    }, {
      maxWait: 5000,
      timeout: 10000,
    });

    // Performance Optimization: Update drug & preference counters non-blocking outside the critical ACID transaction
    if (drugIds.length > 0) {
      Promise.allSettled(
        drugIds.map(async (id: string) => {
          try {
            await Promise.all([
              prisma.drug.update({
                where: { id },
                data: { prescriptionCount: { increment: 1 } },
              }),
              prisma.doctorDrugPreference.upsert({
                where: { doctorId_drugId: { doctorId: user.id, drugId: id } },
                update: { count: { increment: 1 } },
                create: { doctorId: user.id, drugId: id, count: 1 },
              }),
              prisma.clinicDrugPreference.upsert({
                where: { clinicId_drugId: { clinicId: user.clinicId, drugId: id } },
                update: { count: { increment: 1 } },
                create: { clinicId: user.clinicId, drugId: id, count: 1 },
              }),
            ]);
          } catch (e) {
            console.warn('Non-blocking drug preference increment warning:', e);
          }
        })
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      encounterId: result.encounter.id,
      prescriptionId: result.prescription.id,
    }, { status: 201 });

  } catch (err: any) {
    console.error('Save prescription error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


\\n
================================================================================
FILE: app/api/prescriptions/[id]/pdf/route.ts
================================================================================

\	s
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePrescriptionBuffer } from '@/lib/prescriptionPdfGenerator';
import { getCompletedLabReportsForPatient } from '@/lib/prescriptionLabHelper';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { verifyPrescriptionPdfToken } from '@/lib/prescriptionToken';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prescriptionId = params.id;
    if (!prescriptionId) {
      return new NextResponse('Prescription ID is required', { status: 400 });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: true,
        clinic: true,
        medicines: {
          include: {
            drug: true,
          },
        },
        encounter: true,
      },
    });

    if (!prescription) {
      return new NextResponse('Prescription not found', { status: 404 });
    }

    // Authorization check: Either active clinic user session OR valid HMAC signature token
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    const isClinicUser = user && (user.clinicId === prescription.clinicId || user.role === 'superadmin');
    const hasValidToken = verifyPrescriptionPdfToken(prescriptionId, token);

    if (!isClinicUser && !hasValidToken) {
      return new NextResponse('Unauthorized: Access denied. Valid login or signed link required.', { status: 403 });
    }

    let doctor: any = null;
    if (prescription.doctorId) {
      doctor = await prisma.user.findUnique({
        where: { id: prescription.doctorId },
      });
    }

    const labReports = await getCompletedLabReportsForPatient({
      patientId: prescription.patientId,
      clinicId: prescription.clinicId,
      referenceDate: prescription.createdAt,
      fallbackDoctorName: doctor?.fullName,
      fallbackClinic: prescription.clinic ? {
        name: prescription.clinic.name,
        address: prescription.clinic.address,
        phone: prescription.clinic.phone,
      } : undefined,
      patient: prescription.patient ? {
        name: prescription.patient.name,
        age: prescription.patient.age,
        gender: prescription.patient.gender,
        phone: prescription.patient.phone,
      } : undefined,
    });

    const pdfBuffer = generatePrescriptionBuffer({
      rxId: prescription.id,
      prescriptionId: prescription.id,
      patient: prescription.patient,
      medicines: (prescription.medicines || []).map((m) => ({
        id: m.id,
        name: m.customName || m.drug?.brandName || m.drug?.genericName || 'Medicine',
        dosage_form: m.dosageForm || undefined,
        strength: m.strength || undefined,
        route: m.route || undefined,
        frequency: m.frequency || '',
        duration: m.duration || '',
        instructions: m.instructions || '',
      })),
      chiefComplaint: prescription.encounter?.chiefComplaint || undefined,
      diagnosis: prescription.encounter?.diagnosis || undefined,
      notes: prescription.encounter?.notes || undefined,
      followUpDate: prescription.encounter?.followUpDate || undefined,
      doctorName: doctor?.fullName || undefined,
      clinicName: prescription.clinic?.name || undefined,
      clinicAddress: prescription.clinic?.address || undefined,
      clinicPhone: prescription.clinic?.phone || undefined,
      doctorRegNo: doctor?.registrationNumber || undefined,
      doctorSpecialization: doctor?.specialization || undefined,
      verificationStatus: doctor?.verificationStatus || undefined,
      medicalCouncil: doctor?.medicalCouncil || undefined,
      logoUrl: prescription.clinic?.logoUrl || undefined,
      signatureUrl: doctor?.signatureUrl || undefined,
      prescriptionPadUrl: (prescription.clinic as any)?.prescriptionPadUrl || undefined,
      prescriptionHeaderHeight: (prescription.clinic as any)?.prescriptionHeaderHeight ?? 48,
      prescriptionFooterHeight: (prescription.clinic as any)?.prescriptionFooterHeight ?? 30,
      labReports,
    });

    const safePatientName = (prescription.patient?.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `RxNXT_Prescription_${safePatientName}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Error generating prescription PDF route:', error);
    return new NextResponse(`Error generating PDF: ${error.message}`, { status: 500 });
  }
}

\\n
================================================================================
FILE: next.config.mjs
================================================================================

\	s
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

\\n
