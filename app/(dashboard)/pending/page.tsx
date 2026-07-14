'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-4">
      <Card className="max-w-md w-full glass border-0 shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden">
        <div className="h-2 bg-orange-400 w-full" />
        <CardContent className="pt-10 px-8 pb-8 text-center flex flex-col items-center">
          
          <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <UserCheck className="h-8 w-8 text-orange-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">Pending Approval</h1>
          
          <p className="text-slate-500 mb-8">
            Your account has been successfully linked to the clinic, but it is currently pending approval by the Clinic Admin.
            <br/><br/>
            Please contact your administrator to approve your account. Once approved, you can log in to access the dashboard.
          </p>

          <Button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            variant="outline" 
            className="w-full text-slate-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
