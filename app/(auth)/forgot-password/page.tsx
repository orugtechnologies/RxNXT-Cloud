'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Info } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <Card className="glass border-0 shadow-2xl bg-white/95 backdrop-blur-md">
      <CardContent className="pt-8 px-8 pb-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Reset Password</h3>
        </div>

        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start space-x-3">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Local Environment Notice</p>
            <p>
              RxNXT is currently running in local offline MVP mode. Email-based password resets are not configured.
            </p>
            <p className="mt-2">
              If you forgot your password, please contact your system administrator or reset it directly in the local SQLite database.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
