
-- 1) Rebind ALL-command case-table policies to the `authenticated` role
DROP POLICY IF EXISTS "Users manage their own difteria cases" ON public.difteria_cases;
CREATE POLICY "Users manage their own difteria cases" ON public.difteria_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their own epizootia cases" ON public.epizootia_cases;
CREATE POLICY "Users manage their own epizootia cases" ON public.epizootia_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their own exantematica cases" ON public.exantematica_cases;
CREATE POLICY "Users manage their own exantematica cases" ON public.exantematica_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their own febre amarela cases" ON public.febre_amarela_cases;
CREATE POLICY "Users manage their own febre amarela cases" ON public.febre_amarela_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their own hanseniase cases" ON public.hanseniase_cases;
CREATE POLICY "Users manage their own hanseniase cases" ON public.hanseniase_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their own meningite cases" ON public.meningite_cases;
CREATE POLICY "Users manage their own meningite cases" ON public.meningite_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their own raiva humana cases" ON public.raiva_humana_cases;
CREATE POLICY "Users manage their own raiva humana cases" ON public.raiva_humana_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own srag cases" ON public.srag_cases;
CREATE POLICY "Users can manage their own srag cases" ON public.srag_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own surto dta cases" ON public.surto_dta_cases;
CREATE POLICY "Users can manage their own surto dta cases" ON public.surto_dta_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own tetano acidental cases" ON public.tetano_acidental_cases;
CREATE POLICY "Users can manage their own tetano acidental cases" ON public.tetano_acidental_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own tetano neonatal cases" ON public.tetano_neonatal_cases;
CREATE POLICY "Users can manage their own tetano neonatal cases" ON public.tetano_neonatal_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own tuberculose cases" ON public.tuberculose_cases;
CREATE POLICY "Users can manage their own tuberculose cases" ON public.tuberculose_cases
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2) Restrict system_logs SELECT to admins only
DROP POLICY IF EXISTS "Authenticated can read logs" ON public.system_logs;
CREATE POLICY "Admins can read logs" ON public.system_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Pin search_path on functions that lacked it
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pg_temp;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pg_temp;

-- 4) Revoke EXECUTE from API roles on SECURITY DEFINER functions that should not be callable via PostgREST.
--    has_role stays executable because it is referenced inside RLS policies.
--    handle_new_user runs only as an auth trigger.
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
