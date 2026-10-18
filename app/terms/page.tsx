import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ShieldCheck, 
  Stethoscope, 
  Server, 
  ArrowLeft, 
  Building2, 
  Scale, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

export const metadata = {
  title: 'Terms of Service & Clinical SaaS Agreement | RxNXT™',
  description: 'Terms of service, B2B software agreement, and clinical responsibility terms for clinics, hospitals, and doctors using RxNXT™ Cloud.',
};

export default function TermsOfServicePage() {
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
              <span className="text-[10px] ml-1 bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Terms</span>
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
      <div className="bg-gradient-to-b from-teal-50/60 via-white to-slate-50 border-b border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">
            <FileText className="w-4 h-4 text-teal-700" />
            B2B Clinical SaaS & Service Level Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service & Clinic Agreement
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            These terms govern the use of the RxNXT™ platform by registered medical practitioners, outpatient clinics, healthcare institutions, and authorized staff.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-2">
            <span><strong>Effective Date:</strong> October 2026</span>
            <span>•</span>
            <span><strong>Version:</strong> 2.0 (B2B SaaS)</span>
            <span>•</span>
            <span><strong>Jurisdiction:</strong> Bengaluru, Karnataka, India</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Important Clinical Notice Box */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-3xl p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            Important Clinical Notice & Professional Autonomy
          </div>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
            RxNXT™ is an administrative and workflow optimization tool designed to assist registered medical practitioners with electronic prescription generation, token queuing, and patient communication. <strong>RxNXT™ does not practice medicine, provide medical diagnoses, or prescribe treatments.</strong> The treating doctor maintains sole, uncompromised professional responsibility and legal accountability for all clinical decisions, drug selections, and dosages.
          </p>
        </div>

        {/* Section 1: Acceptance & Parties */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            1. Acceptance of Terms & Account Formation
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            By creating a clinic workspace or signing into RxNXT™, you represent and warrant that you are a medical practitioner or an authorized administrative representative of an outpatient clinic, polyclinic, nursing home, or hospital.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            The subscribing clinic is responsible for managing staff credentials (doctors, receptionists, pharmacists, and nurses) and maintaining the confidentiality of administrative passwords.
          </p>
        </section>

        {/* Section 2: Clinic Data Ownership */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            2. Clinic Data Ownership & Data Sovereignty
          </h2>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>100% Clinic Ownership:</strong> The subscribing clinic retains full and exclusive ownership of all patient records, medical charts, prescriptions, and billing histories entered into the platform.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Zero Third-Party Exploitation:</strong> RxNXT™ will not sell, rent, license, or commercialize your clinical database to pharmaceutical companies, insurers, or advertising networks.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>On-Demand Exportability:</strong> Clinics have the right to export patient registries, prescription archives, and billing logs in standard formats (CSV, PDF, JSON) at any time.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 3: WhatsApp & Telemedicine Guidelines */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            3. Digital Prescriptions & WhatsApp Delivery Compliance
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            RxNXT™ generates digital prescriptions formatted in strict alignment with the <strong>Telemedicine Practice Guidelines (Appendix 5)</strong> notified in the Gazette of India:
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Transmission of PDF prescriptions via WhatsApp is conducted via the official <strong>Meta WhatsApp Cloud API</strong> (v20.0).</li>
            <li>• Clinics must ensure patient telephone numbers are accurately recorded and that patients agree to receive digital copies via WhatsApp during front-desk registration.</li>
            <li>• RxNXT™ is not responsible for delayed delivery resulting from telecommunication carrier outages, inactive patient WhatsApp accounts, or recipient network loss.</li>
          </ul>
        </section>

        {/* Section 4: Subscriptions, Trial & Billing */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            4. 14-Day Free Trial & Subscriptions
          </h2>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              Each newly registered clinic receives a <strong>14-day fully featured free trial</strong> without requiring payment information upfront.
            </p>
            <p>
              Following the trial period, clinics can activate an annual or monthly subscription plan to maintain uninterrupted cloud access, automatic reminder schedules, and inventory tracking.
            </p>
            <p>
              In the event of subscription lapse, patient records remain securely stored in read-only mode for a minimum grace period of <strong>60 days</strong>, allowing clinics to renew or export their archives.
            </p>
          </div>
        </section>

        {/* Section 5: Data Security & Indian Hosting */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            5. Security Safeguards & Service Availability
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            RxNXT™ implements reasonable security practices as prescribed under Section 8(5) of the DPDP Act 2023:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="block text-slate-900 mb-1">Mumbai Cloud Hosting</strong>
              Databases hosted within India (ap-south-1) under strict Indian legal data protection rules.
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="block text-slate-900 mb-1">Continuous Backups</strong>
              Point-in-time database backups and high availability architecture for zero OPD downtime.
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="block text-slate-900 mb-1">Audit Trails</strong>
              Role isolation ensuring staff members only access clinical modules permitted by the clinic admin.
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="block text-slate-900 mb-1">TLS End-to-End Encryption</strong>
              All data transmitted over the internet is encrypted using modern TLS cryptographic protocols.
            </div>
          </div>
        </section>

        {/* Section 6: Limitation of Liability */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            6. Limitation of Liability & Medical Indemnity
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            To the maximum extent permitted by applicable Indian law:
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• RxNXT™ shall not be liable for any medical malpractice, clinical negligence, adverse drug reactions, misdiagnoses, or patient treatment outcomes.</li>
            <li>• The clinic agrees to indemnify and hold harmless RxNXT™ from any claims arising out of unauthorized access resulting from clinic password sharing or clinical malpractice by attending practitioners.</li>
            <li>• RxNXT™&apos;s aggregate financial liability under this agreement is limited to the subscription fees paid by the clinic in the twelve (12) months preceding the incident.</li>
          </ul>
        </section>

        {/* Section 7: Governing Law & Jurisdiction */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            7. Governing Law & Dispute Resolution
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            These Terms of Service and any dispute arising from or related to the platform shall be governed by and construed in accordance with the laws of the Republic of India. The courts of competent jurisdiction in <strong>Bengaluru, Karnataka, India</strong> shall have exclusive jurisdiction over all disputes.
          </p>
        </section>

        {/* Section 8: Contact & Support */}
        <section className="bg-slate-100/80 border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-3">
          <h2 className="text-xl font-bold text-slate-900">8. Contact & Clinical Support</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            If you have questions regarding these terms, clinic onboarding, or data export requests, please contact our support desk:
          </p>
          <div className="text-xs text-slate-800 space-y-1 pt-1">
            <div><strong>Email:</strong> <a href="mailto:support@rxnxt.com" className="text-emerald-700 font-bold underline">support@rxnxt.com</a> / <a href="mailto:privacy@rxnxt.com" className="text-emerald-700 font-bold underline">privacy@rxnxt.com</a></div>
            <div><strong>Platform:</strong> RxNXT™ Cloud — Orug Technologies</div>
            <div><strong>Office:</strong> Bengaluru, Karnataka, India</div>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} RxNXT™ Cloud. All rights reserved. Indian Data Sovereignty Compliant.</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="text-emerald-600 hover:text-emerald-800 font-semibold underline">
              Privacy Policy & DPDP Notice
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
