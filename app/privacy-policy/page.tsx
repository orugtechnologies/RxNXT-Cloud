import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  FileText, 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  Mail, 
  MapPin, 
  Clock, 
  Scale, 
  UserCheck, 
  EyeOff, 
  Printer 
} from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy & DPDP Data Protection Notice | RxNXT™',
  description: 'DPDP Act 2023-compliant B2B privacy policy and data protection terms for healthcare providers, doctors, and clinics using RxNXT™ Cloud.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Back to Login</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-900">
              Rx<span className="text-emerald-600">NXT</span>
              <span className="text-[10px] ml-1 bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">DPDP 2023</span>
            </span>
          </div>
          <Link 
            href="/register" 
            className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            Create Clinic
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 border-b border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            DPDP Act 2023 & Indian Healthcare Data Sovereignty
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy & Data Processing Notice
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            How RxNXT™ safeguards healthcare providers, doctors, and patient clinical records with strict Indian data residency, zero commercialization, and statutory DPDP compliance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-2">
            <span><strong>Effective Date:</strong> October 2026</span>
            <span>•</span>
            <span><strong>Version:</strong> 2.0 (DPDP Aligned)</span>
            <span>•</span>
            <span><strong>Governing Jurisdiction:</strong> Warangal, Telangana, India</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Core Principles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">100% Indian Data Sovereignty</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All clinical databases, prescriptions, and backups are hosted in Mumbai, India (ap-south-1). No foreign cross-border health data routing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Zero Data Selling or Ads</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never sell, rent, monetize, or train third-party public AI on your clinic&apos;s patient data or doctor prescription patterns.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Doctor Owns 100% of Data</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The treating doctor and clinic maintain complete ownership over patient medical histories, billing ledgers, and visit notes at all times.
            </p>
          </div>
        </div>

        {/* Section 1: Legal Framework */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            1. Legal Roles & Regulatory Framework (DPDP Act, 2023)
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of the Republic of India:
          </p>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>The Clinic / Medical Practitioner is the &quot;Data Fiduciary&quot;:</strong> The registered doctor or clinic decides the purpose of collecting patient health information to provide medical consultations and diagnoses.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>RxNXT™ is the &quot;Data Processor&quot;:</strong> RxNXT™ provides the cloud software infrastructure and processes clinical documentation strictly according to the lawful directions of the clinic.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>The Patient is the &quot;Data Principal&quot;:</strong> The individual seeking medical consultation whose personal and health data is documented.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 2: Data Collected */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            2. Categories of Information Processed
          </h2>
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <h3 className="font-bold text-slate-900 mb-1">A. Healthcare Provider & Clinic Account Data:</h3>
              <p>Clinic name, registered address, telephone, email, doctor name, specialization, login password hash, digital signature, and subscription billing history.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">B. Patient Demographic & Clinical Data (Recorded by Clinic Staff):</h3>
              <p>Patient name, mobile number, age, gender, address, symptoms, clinical diagnoses, vitals (BP, pulse, SpO2, temperature, weight), prescription line items, and encounter follow-up dates.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">C. Technical & Communication Metadata:</h3>
              <p>WhatsApp message delivery statuses (dispatched via Meta Graph API v20.0), session authentication tokens, and time-stamped clinical activity logs.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Purpose of Processing */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            3. Purpose Limitation & Zero Commercialization
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Data entered into RxNXT™ is processed exclusively for specified clinical operations:
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Generating legitimate digital A4 prescriptions compliant with NMC Telemedicine Guidelines.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Transmitting encrypted prescription copies directly to the patient via official Meta WhatsApp API upon clinic authorization.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Delivering automated smart-slot dose reminders and follow-up appointment alerts.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Managing the clinic front-desk queue, pharmacy dispensing, and consultation billing.
            </li>
          </ul>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 font-medium">
            <strong>Explicit Guarantee:</strong> RxNXT™ does not share, broker, sell, or disclose clinic or patient data to pharmaceutical manufacturers, insurance aggregators, advertisers, or credit bureaus.
          </div>
        </section>

        {/* Section 4: Data Retention & NMC Regulations */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            4. Statutory Data Retention (NMC Regulations)
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Under National Medical Commission regulations and the Indian Medical Council (Professional Conduct, Etiquette and Ethics) Regulations, registered medical practitioners are legally required to maintain inpatient and outpatient clinical records for a minimum duration of <strong>3 (three) years</strong> from the date of commencement of treatment.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            RxNXT™ preserves clinical records throughout the clinic&apos;s active subscription and ensures compliance with statutory medical preservation periods. Upon clinic termination, clinics have a 60-day window to export complete historical records.
          </p>
        </section>

        {/* Section 5: Data Security & Multi-Tenancy */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            5. Security Safeguards & Tenant Isolation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="block text-slate-900 mb-1">Multi-Tenant Logical Isolation</strong>
              Every database query strictly enforces clinic-level tenant boundary isolation. Clinic A can never access or query Clinic B records.
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="block text-slate-900 mb-1">Role-Based Access Control</strong>
              Front desk receptionists and billing staff cannot alter doctor clinical prescriptions or diagnosis records.
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="block text-slate-900 mb-1">Encryption at Rest & In-Transit</strong>
              Industry-standard TLS 1.3 encryption across all network communications; passwords cryptographically hashed with bcrypt.
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="block text-slate-900 mb-1">Direct Meta Cloud API</strong>
              Zero unverified third-party scrapers. Direct server-to-server dispatch using official Meta WhatsApp Cloud API.
            </div>
          </div>
        </section>

        {/* Section 6: Data Principal Rights */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            6. Rights of Data Principals (Patients)
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            In compliance with Section 11, 12, and 13 of the DPDP Act 2023, patients have the right to:
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• <strong>Right to Access:</strong> Receive digital copies of their prescriptions and clinical visit history directly on WhatsApp.</li>
            <li>• <strong>Right to Correction:</strong> Request correction of inaccurate demographic records through the attending clinic.</li>
            <li>• <strong>Right to Opt-Out:</strong> Stop receiving automated WhatsApp dose reminders at any time by replying &quot;STOP&quot;.</li>
            <li>• <strong>Right to Grievance Redressal:</strong> Submit privacy concerns directly to our designated Grievance Officer.</li>
          </ul>
        </section>

        {/* Section 7: Grievance Redressal Officer */}
        <section className="bg-emerald-50/70 border border-emerald-200 p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-700" />
            7. Designated Grievance Officer & Contact
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            In accordance with Section 8(10) of the DPDP Act 2023, RxNXT™ has designated a Data Protection & Grievance Officer to resolve privacy questions, data requests, or complaints:
          </p>
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 text-xs text-slate-800 space-y-2 shadow-sm">
            <div><strong>Designation:</strong> Data Protection & Grievance Redressal Officer</div>
            <div><strong>Platform:</strong> RxNXT™ Cloud (Orug Technologies)</div>
            <div><strong>Registered Entity:</strong> Orug Technologies, Warangal, Telangana, India</div>
            <div><strong>Official Email:</strong> <a href="mailto:privacy@rxnxt.com" className="text-emerald-700 font-bold underline">privacy@rxnxt.com</a> / <a href="mailto:support@rxnxt.com" className="text-emerald-700 font-bold underline">support@rxnxt.com</a></div>
            <div><strong>Location:</strong> Warangal, Telangana, India</div>
            <div><strong>Statutory Response Timeline:</strong> Acknowledgment within 24 hours; resolution within 7 business days.</div>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} RxNXT™ Cloud. All rights reserved. Indian Data Sovereignty Compliant.</div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-emerald-600 hover:text-emerald-800 font-semibold underline">
              Terms of Service
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
