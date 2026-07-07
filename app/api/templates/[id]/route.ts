import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const templateId = params.id;

    // Verify ownership
    const template = await prisma.treatmentGroup.findFirst({
      where: {
        id: templateId,
        doctorId: user.id,
        clinicId: user.clinicId,
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found or access denied' }, { status: 404 });
    }

    // Delete template (Cascade delete will handle items)
    await prisma.treatmentGroup.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ success: true, message: 'Template deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting template:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
