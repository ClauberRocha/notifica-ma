
CREATE TABLE public.meningite_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_ficha text,
  tipo_notificacao text DEFAULT 'individual',
  agravo text NOT NULL,
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
  codigo_ibge_residencia text,
  distrito text,
  bairro text,
  logradouro text,
  numero_endereco text,
  complemento text,
  cep text,
  ponto_referencia text,
  telefone text,
  zona text,
  pais text,
  data_investigacao date,
  ocupacao text,
  vacinacao jsonb DEFAULT '{}'::jsonb,
  doencas_preexistentes jsonb DEFAULT '{}'::jsonb,
  contato_caso_suspeito text,
  nome_contato text,
  telefone_contato text,
  endereco_contato text,
  caso_secundario text,
  sinais_sintomas jsonb DEFAULT '{}'::jsonb,
  ocorreu_hospitalizacao text,
  data_internacao date,
  uf_hospital text,
  municipio_hospital text,
  nome_hospital text,
  codigo_hospital text,
  puncao_lombar text,
  data_puncao date,
  aspecto_liquor text,
  resultados_laboratoriais jsonb DEFAULT '{}'::jsonb,
  exame_quimiocitologico jsonb DEFAULT '{}'::jsonb,
  classificacao_caso text,
  especificacao_confirmado text,
  criterio_confirmacao text,
  sorogrupo_meningitidis text,
  numero_comunicantes numeric,
  quimioprofilaxia_comunicantes text,
  data_quimioprofilaxia date,
  doenca_relacionada_trabalho text,
  evolucao_caso text,
  data_evolucao date,
  data_encerramento date,
  observacoes_adicionais text,
  municipio_unidade_investigador text,
  codigo_unidade_investigador text,
  nome_investigador text,
  funcao_investigador text,
  status text NOT NULL DEFAULT 'em_investigacao',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meningite_cases TO authenticated;
GRANT ALL ON public.meningite_cases TO service_role;

ALTER TABLE public.meningite_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own meningite cases"
ON public.meningite_cases FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX meningite_cases_user_id_idx ON public.meningite_cases(user_id);
CREATE INDEX meningite_cases_agravo_idx ON public.meningite_cases(agravo);
CREATE INDEX meningite_cases_created_at_idx ON public.meningite_cases(created_at DESC);

CREATE TRIGGER update_meningite_cases_updated_at
BEFORE UPDATE ON public.meningite_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
