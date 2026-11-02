-- Enable Row Level Security (RLS) on WhatsAppCreditTransaction
-- Resolves Supabase Linter 0013 (rls_disabled_in_public) for project ztcbzxgczfahqexaqlxs

ALTER TABLE "WhatsAppCreditTransaction" ENABLE ROW LEVEL SECURITY;
