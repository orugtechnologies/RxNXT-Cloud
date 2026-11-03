export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { optimizeBase64Png } from '@/lib/imageOptimizer';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId }
    });
    const doctor = await prisma.user.findUnique({
      where: { id: user.id },
      select: { registrationNumber: true, signatureUrl: true }
    });
    return NextResponse.json({ 
      data: {
        ...clinic,
        registrationNumber: doctor?.registrationNumber || '',
        signatureUrl: doctor?.signatureUrl || '',
      } 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const updatedClinic = await prisma.clinic.update({
      where: { id: user.clinicId },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
        logoUrl: optimizeBase64Png(body.logoUrl, 400),
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        registrationNumber: body.registrationNumber,
        signatureUrl: optimizeBase64Png(body.signatureUrl, 500),
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        ...updatedClinic,
        registrationNumber: updatedUser.registrationNumber,
        signatureUrl: updatedUser.signatureUrl,
      } 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

