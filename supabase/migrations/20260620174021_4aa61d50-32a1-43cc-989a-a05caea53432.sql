
CREATE TABLE public.febre_amarela_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_ficha text,
  agravo text NOT NULL DEFAULT 'febre_amarela',
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
  complemento text,
  cep text,
  telefone text,
  zona text,
  data_investigacao date,
  ocupacao text,
  presenca_mosquito_aedes text,
  ocorrencia_epizootias text,
  isolamento_virus_mosquitos text,
  vacinado_febre_amarela text,
  data_vacinacao date,
  uf_vacinacao text,
  municipio_vacinacao text,
  unidade_saude_vacinacao text,
  sinais_sintomas jsonb DEFAULT '{}'::jsonb,
  ocorreu_hospitalizacao text,
  data_internacao date,
  uf_hospital text,
  municipio_hospital text,
  nome_hospital text,
  bilirrubina_total numeric,
  bilirrubina_direta numeric,
  ast_tgo numeric,
  alt_tgp numeric,
  data_coleta_s1 date,
  resultado_s1 text,
  data_coleta_s2 date,
  resultado_s2 text,
  material_coletado_isolamento text,
  data_coleta_isolamento date,
  resultado_isolamento text,
  histopatologia text,
  imunohistoquimica text,
  rt_pcr_data date,
  rt_pcr_resultado text,
  classificacao_final text,
  criterio_confirmacao text,
  caso_autoctone text,
  doenca_relacionada_trabalho text,
  atividade_local_infeccao text,
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.febre_amarela_cases TO authenticated;
GRANT ALL ON public.febre_amarela_cases TO service_role;

ALTER TABLE public.febre_amarela_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own febre amarela cases"
ON public.febre_amarela_cases FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX febre_amarela_cases_user_id_idx ON public.febre_amarela_cases(user_id);
CREATE INDEX febre_amarela_cases_created_at_idx ON public.febre_amarela_cases(created_at DESC);

CREATE TRIGGER update_febre_amarela_cases_updated_at
BEFORE UPDATE ON public.febre_amarela_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
