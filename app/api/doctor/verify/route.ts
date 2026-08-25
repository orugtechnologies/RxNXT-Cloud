import { NextResponse } from 'next/server';
import { verifyDoctorCredentials, DoctorVerificationInput } from '@/services/doctorVerificationService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, medicalCouncil, registrationNumber, registrationYear, qualification } = body;

    if (!fullName || !medicalCouncil || !registrationNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, medicalCouncil, registrationNumber' },
        { status: 400 }
      );
    }

    const input: DoctorVerificationInput = {
      fullName,
      medicalCouncil,
      registrationNumber,
      registrationYear,
      qualification,
    };

    const result = await verifyDoctorCredentials(input);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error('Doctor verification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during verification' },
      { status: 500 }
    );
  }
}
