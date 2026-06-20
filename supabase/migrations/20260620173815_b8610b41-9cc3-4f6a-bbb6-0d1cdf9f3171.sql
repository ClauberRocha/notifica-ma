
CREATE TABLE public.exantematica_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_ficha text,
  agravo text NOT NULL DEFAULT 'sarampo',
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
  tomou_vacina_sarampo_rubeola text,
  data_ultima_dose_vacina date,
  contato_caso_suspeito text,
  nome_contato text,
  endereco_contato text,
  data_inicio_exantema date,
  data_inicio_febre date,
  sinais_sintomas jsonb DEFAULT '{}'::jsonb,
  ocorreu_hospitalizacao text,
  data_internacao date,
  uf_hospital text,
  municipio_hospital text,
  nome_hospital text,
  data_coleta_s1 date,
  data_coleta_s2 date,
  resultado_sorologia_sarampo_s1_igm text,
  resultado_sorologia_sarampo_s1_igg text,
  resultado_sorologia_rubeola_s1_igm text,
  resultado_sorologia_rubeola_s1_igg text,
  realizou_bloqueio_vacinal text,
  classificacao_final text,
  criterio_confirmacao text,
  evolucao text,
  data_obito date,
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exantematica_cases TO authenticated;
GRANT ALL ON public.exantematica_cases TO service_role;

ALTER TABLE public.exantematica_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own exantematica cases"
ON public.exantematica_cases FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX exantematica_cases_user_id_idx ON public.exantematica_cases(user_id);
CREATE INDEX exantematica_cases_agravo_idx ON public.exantematica_cases(agravo);
CREATE INDEX exantematica_cases_created_at_idx ON public.exantematica_cases(created_at DESC);

CREATE TRIGGER update_exantematica_cases_updated_at
BEFORE UPDATE ON public.exantematica_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
