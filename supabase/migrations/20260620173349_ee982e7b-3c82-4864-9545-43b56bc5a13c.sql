
CREATE TABLE public.difteria_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_ficha text,
  tipo_notificacao text DEFAULT 'individual',
  agravo text NOT NULL DEFAULT 'difteria',
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
  contato_caso_suspeito text,
  nome_contato text,
  endereco_contato text,
  doses_vacina text,
  data_ultima_dose date,
  sinais_sintomas jsonb DEFAULT '{}'::jsonb,
  temperatura_corporal numeric,
  localizacao_pseudomembrana jsonb DEFAULT '{}'::jsonb,
  complicacoes jsonb DEFAULT '{}'::jsonb,
  ocorreu_hospitalizacao text,
  data_internacao date,
  uf_hospital text,
  municipio_hospital text,
  nome_hospital text,
  codigo_hospital text,
  material_coletado text,
  data_coleta date,
  resultado_cultura text,
  provas_toxigenicidade text,
  data_aplicacao_soro date,
  utilizou_antibiotico text,
  data_adm_antibiotico date,
  identificacao_comunicantes text,
  numero_comunicantes numeric,
  casos_secundarios_confirmados text,
  coleta_material_comunicantes text,
  quantidade_comunicantes_coleta numeric,
  portadores_identificados numeric,
  medidas_prevencao text,
  classificacao_final text,
  criterio_confirmacao text,
  doenca_relacionada_trabalho text,
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.difteria_cases TO authenticated;
GRANT ALL ON public.difteria_cases TO service_role;

ALTER TABLE public.difteria_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own difteria cases"
ON public.difteria_cases FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX difteria_cases_user_id_idx ON public.difteria_cases(user_id);
CREATE INDEX difteria_cases_created_at_idx ON public.difteria_cases(created_at DESC);

CREATE TRIGGER update_difteria_cases_updated_at
BEFORE UPDATE ON public.difteria_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
