
CREATE TABLE public.raiva_humana_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_ficha text,
  agravo text NOT NULL DEFAULT 'raiva_humana',
  data_notificacao date NOT NULL,
  uf_notificacao text,
  municipio_notificacao text,
  codigo_ibge_notificacao text,
  unidade_saude text,
  codigo_unidade_saude text,
  data_primeiros_sintomas date,
  nome_paciente text NOT NULL,
  data_nascimento date,
  idade numeric,
  tipo_idade text,
  sexo text,
  gestante text,
  raca_cor text,
  escolaridade text,
  numero_cartao_sus text,
  nome_mae text,
  uf_residencia text,
  municipio_residencia text,
  bairro text,
  logradouro text,
  numero_endereco text,
  cep text,
  telefone text,
  zona text,
  data_investigacao date,
  ocupacao text,
  tipo_exposicao jsonb DEFAULT '{}'::jsonb,
  localizacao_exposicao jsonb DEFAULT '{}'::jsonb,
  ferimento text,
  tipo_ferimento jsonb DEFAULT '{}'::jsonb,
  data_exposicao date,
  antecedentes_tratamento_antirabico text,
  tipo_tratamento_anterior text,
  numero_doses_anteriores numeric,
  data_ultima_dose_anterior date,
  especie_animal_agressor text,
  animal_vacinado text,
  ocorreu_hospitalizacao text,
  data_internacao date,
  uf_hospital text,
  municipio_hospital text,
  nome_hospital text,
  sinais_sintomas jsonb DEFAULT '{}'::jsonb,
  aplicacao_vacina_antirabica text,
  data_inicio_tratamento_atual date,
  numero_doses_atuais numeric,
  data_1a_dose date,
  data_ultima_dose date,
  foi_aplicado_soro text,
  data_aplicacao_soro date,
  quantidade_soro_ml numeric,
  infiltracao_soro_ferimento text,
  diagnostico_laboratorial jsonb DEFAULT '{}'::jsonb,
  classificacao_final text,
  criterio_confirmacao text,
  doenca_relacionada_trabalho text,
  evolucao text,
  data_obito date,
  data_encerramento date,
  observacoes_adicionais text,
  nome_investigador text,
  funcao_investigador text,
  municipio_unidade_investigador text,
  codigo_unidade_investigador text,
  status text NOT NULL DEFAULT 'em_investigacao',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.raiva_humana_cases TO authenticated;
GRANT ALL ON public.raiva_humana_cases TO service_role;

ALTER TABLE public.raiva_humana_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own raiva humana cases"
ON public.raiva_humana_cases FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX raiva_humana_cases_user_id_idx ON public.raiva_humana_cases(user_id);
CREATE INDEX raiva_humana_cases_created_at_idx ON public.raiva_humana_cases(created_at DESC);

CREATE TRIGGER update_raiva_humana_cases_updated_at
BEFORE UPDATE ON public.raiva_humana_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
