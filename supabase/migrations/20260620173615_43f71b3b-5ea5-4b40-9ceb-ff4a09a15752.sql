
CREATE TABLE public.epizootia_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_ficha text,
  tipo_notificacao text DEFAULT 'individual',
  agravo text NOT NULL DEFAULT 'epizootia',
  data_notificacao date NOT NULL,
  uf_notificacao text,
  municipio_notificacao text NOT NULL,
  codigo_ibge_notificacao text,
  unidade_saude text,
  codigo_unidade_saude text,
  data_inicio_epizootia date,
  fonte_informacao text,
  telefone_fonte text,
  uf_ocorrencia text,
  municipio_ocorrencia text,
  codigo_ibge_ocorrencia text,
  distrito text,
  bairro text,
  logradouro text,
  numero_endereco text,
  complemento text,
  geocampo1 text,
  geocampo2 text,
  ponto_referencia text,
  cep text,
  telefone text,
  zona text,
  ambiente text,
  houve_coleta text,
  data_coleta date,
  material_coletado jsonb DEFAULT '{}'::jsonb,
  animais_acometidos jsonb DEFAULT '{}'::jsonb,
  suspeita_diagnostica jsonb DEFAULT '{}'::jsonb,
  resultado_laboratorial jsonb DEFAULT '{}'::jsonb,
  observacoes_adicionais text,
  municipio_unidade_investigador text,
  codigo_unidade_investigador text,
  nome_investigador text,
  funcao_investigador text,
  status text NOT NULL DEFAULT 'em_investigacao',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.epizootia_cases TO authenticated;
GRANT ALL ON public.epizootia_cases TO service_role;

ALTER TABLE public.epizootia_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own epizootia cases"
ON public.epizootia_cases FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX epizootia_cases_user_id_idx ON public.epizootia_cases(user_id);
CREATE INDEX epizootia_cases_created_at_idx ON public.epizootia_cases(created_at DESC);

CREATE TRIGGER update_epizootia_cases_updated_at
BEFORE UPDATE ON public.epizootia_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
