-- Enable Row Level Security (RLS) on all public tables in Supabase
-- This locks down PostgREST API access while allowing direct Prisma TCP connections to function uninterrupted.

ALTER TABLE "Clinic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Encounter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prescription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PrescriptionMedicine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Drug" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TreatmentGroup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TreatmentGroupItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DoctorDrugPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicDrugPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reminder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QueueItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SubscriptionPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PharmacyItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DispenseLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DispensedItem" ENABLE ROW LEVEL SECURITY;

-- Dynamic safety net: Automatically enable RLS on every current & future public table
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE 'ALTER TABLE public."' || r.tablename || '" ENABLE ROW LEVEL SECURITY;';
    END LOOP; 
END $$;
