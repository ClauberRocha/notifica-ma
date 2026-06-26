
-- 1) Restrict SELECT on 14 disease case tables to owner OR admin/gestor
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'coqueluche_cases','dengue_chikungunya_cases','difteria_cases','epizootia_cases',
    'exantematica_cases','febre_amarela_cases','hanseniase_cases','meningite_cases',
    'raiva_humana_cases','srag_cases','surto_dta_cases','tetano_acidental_cases',
    'tetano_neonatal_cases','tuberculose_cases'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_authenticated', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_owner_or_staff', t);
    EXECUTE format($f$
      CREATE POLICY %I ON public.%I
      FOR SELECT TO authenticated
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role])
        )
      )
    $f$, t || '_select_owner_or_staff', t);
  END LOOP;
END $$;

-- 2) Tighten system_logs INSERT: user_id MUST equal auth.uid()
DROP POLICY IF EXISTS "Users insert own logs" ON public.system_logs;
CREATE POLICY "Users insert own logs"
ON public.system_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
