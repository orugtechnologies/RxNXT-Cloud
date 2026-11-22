// lib/prescriptionLabHelper.ts
// Helper to retrieve and format completed laboratory investigation reports for unified PDF dossier attachment

import { prisma } from './prisma';
import { LabReportPDFData } from './labReportPdfGenerator';
import { LabParameterResult } from './labTemplates';

export interface GetCompletedLabReportsParams {
  patientId: string;
  clinicId: string;
  referenceDate?: Date;
  fallbackDoctorName?: string | null;
  fallbackClinic?: {
    name?: string | null;
    address?: string | null;
    phone?: string | null;
  };
  patient?: {
    name: string;
    age?: number | string | null;
    gender?: string | null;
    phone?: string | null;
  };
}

/**
 * Queries completed laboratory tests for a patient within the consultation window (past 48 hours)
 * and formats them into standardized LabReportPDFData objects ready for multi-page PDF generation.
 */
export async function getCompletedLabReportsForPatient(
  params: GetCompletedLabReportsParams
): Promise<LabReportPDFData[]> {
  try {
    const refDate = params.referenceDate || new Date();
    // Look for completed lab orders placed within 30 days prior to or 24 hours after the reference date
    const windowStart = new Date(refDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(refDate.getTime() + 24 * 60 * 60 * 1000);

    const orders = await prisma.labOrder.findMany({
      where: {
        patientId: params.patientId,
        clinicId: params.clinicId,
        createdAt: {
          gte: windowStart,
          lte: windowEnd,
        },
        tests: {
          some: {
            status: 'COMPLETED',
          },
        },
      },
      include: {
        clinic: {
          select: {
            name: true,
            address: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            fullName: true,
          },
        },
        patient: {
          select: {
            name: true,
            age: true,
            gender: true,
            phone: true,
          },
        },
        tests: {
          where: {
            status: 'COMPLETED',
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 10,
    });

    const labReports: LabReportPDFData[] = [];

    for (const order of orders) {
      for (const test of order.tests) {
        let parsedResults: LabParameterResult[] = [];
        try {
          parsedResults = test.results ? JSON.parse(test.results) : [];
        } catch {
          parsedResults = [];
        }

        labReports.push({
          orderNumber: order.orderNumber,
          orderDate: order.createdAt.toISOString(),
          clinicName: order.clinic?.name || params.fallbackClinic?.name || undefined,
          clinicAddress: order.clinic?.address || params.fallbackClinic?.address || undefined,
          clinicPhone: order.clinic?.phone || params.fallbackClinic?.phone || undefined,
          patient: {
            name: params.patient?.name || order.patient?.name || 'Patient',
            age: params.patient?.age ?? order.patient?.age,
            gender: params.patient?.gender || order.patient?.gender,
            phone: params.patient?.phone || order.patient?.phone,
          },
          doctorName: order.doctor?.fullName || params.fallbackDoctorName || undefined,
          technicianName: test.technicianName || undefined,
          testName: test.testName,
          category: test.category,
          results: parsedResults,
          impression: test.impression || undefined,
        });
      }
    }

    return labReports;
  } catch (err) {
    console.warn('[LabReportHelper Warning] Failed to query completed lab reports:', err);
    return [];
  }
}
