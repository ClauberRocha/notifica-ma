
DO $$
DECLARE t text;
DECLARE tables text[] := ARRAY[
  'coqueluche_cases','dengue_chikungunya_cases','difteria_cases','epizootia_cases',
  'exantematica_cases','febre_amarela_cases','hanseniase_cases','meningite_cases',
  'raiva_humana_cases','srag_cases','surto_dta_cases','tetano_acidental_cases',
  'tetano_neonatal_cases','tuberculose_cases'
];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated can view all %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Authenticated can view all %I" ON public.%I FOR SELECT TO authenticated USING (true)', t, t);
  END LOOP;
END $$;
