DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'coqueluche_cases','dengue_chikungunya_cases','difteria_cases','epizootia_cases',
    'exantematica_cases','febre_amarela_cases','hanseniase_cases','meningite_cases',
    'raiva_humana_cases','srag_cases','surto_dta_cases','tetano_acidental_cases',
    'tetano_neonatal_cases','tuberculose_cases'
  ]) LOOP
    EXECUTE format(
      'CREATE UNIQUE INDEX IF NOT EXISTS %I ON public.%I (numero_ficha) WHERE numero_ficha IS NOT NULL AND numero_ficha <> %L',
      t || '_numero_ficha_unique', t, ''
    );
  END LOOP;
END $$;