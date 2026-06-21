
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'coqueluche_cases','dengue_chikungunya_cases','difteria_cases','epizootia_cases',
    'exantematica_cases','febre_amarela_cases','hanseniase_cases','meningite_cases',
    'raiva_humana_cases','srag_cases','surto_dta_cases','tetano_acidental_cases',
    'tetano_neonatal_cases','tuberculose_cases'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I
      ADD COLUMN IF NOT EXISTS dc_sintomas TEXT,
      ADD COLUMN IF NOT EXISTS dc_sintomas_outros TEXT,
      ADD COLUMN IF NOT EXISTS dc_data_primeiros_sintomas DATE,
      ADD COLUMN IF NOT EXISTS dc_houve_hospitalizacao TEXT,
      ADD COLUMN IF NOT EXISTS dc_data_internacao DATE,
      ADD COLUMN IF NOT EXISTS dc_evolucao_clinica TEXT', t);
  END LOOP;
END $$;
