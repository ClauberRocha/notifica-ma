CREATE TABLE public.coqueluche_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notificação
  numero_ficha TEXT,
  tipo_notificacao TEXT NOT NULL DEFAULT 'individual',
  agravo TEXT NOT NULL DEFAULT 'coqueluche',
  data_notificacao DATE NOT NULL,
  uf_notificacao TEXT,
  municipio_notificacao TEXT,
  codigo_ibge_notificacao TEXT,
  unidade_saude TEXT,
  codigo_unidade_saude TEXT,
  data_primeiros_sintomas DATE,

  -- Paciente
  nome_paciente TEXT NOT NULL,
  data_nascimento DATE,
  idade NUMERIC,
  tipo_idade TEXT,
  sexo TEXT,
  gestante TEXT,
  raca_cor TEXT,
  escolaridade TEXT,
  numero_cartao_sus TEXT,
  nome_mae TEXT,

  -- Residência
  uf_residencia TEXT,
  municipio_residencia TEXT,
  codigo_ibge_residencia TEXT,
  distrito TEXT,
  bairro TEXT,
  logradouro TEXT,
  numero_endereco TEXT,
  complemento TEXT,
  cep TEXT,
  ponto_referencia TEXT,
  telefone TEXT,
  zona TEXT,
  pais TEXT,

  -- Investigação
  data_investigacao DATE,
  ocupacao TEXT,
  unidade_sentinela TEXT,
  contato_caso_suspeito TEXT,
  nome_contato TEXT,
  endereco_contato TEXT,

  -- Antecedentes
  doses_vacina_triplice TEXT,
  data_ultima_dose DATE,
  data_inicio_tosse DATE,

  -- Sinais/sintomas e complicações (estruturados)
  sinais_sintomas JSONB NOT NULL DEFAULT '{}'::jsonb,
  complicacoes JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Hospitalização
  ocorreu_hospitalizacao TEXT,
  data_internacao DATE,
  uf_hospital TEXT,
  municipio_hospital TEXT,
  nome_hospital TEXT,
  utilizou_antibiotico TEXT,
  data_adm_antibiotico DATE,

  -- Laboratório
  coleta_nasofaringe TEXT,
  data_coleta_material DATE,
  resultado_cultura TEXT,

  -- Comunicantes
  identificacao_comunicantes TEXT,
  numero_comunicantes NUMERIC,
  casos_secundarios_confirmados TEXT,
  coleta_nasofaringe_comunicantes TEXT,
  quantidade_comunicantes_coleta NUMERIC,
  comunicantes_cultura_positivo NUMERIC,
  medidas_prevencao TEXT,

  -- Conclusão
  classificacao_final TEXT,
  criterio_confirmacao TEXT,
  doenca_relacionada_trabalho TEXT,
  evolucao TEXT,
  data_obito DATE,
  data_encerramento DATE,
  observacoes_adicionais TEXT,

  -- Investigador
  municipio_unidade_investigador TEXT,
  codigo_unidade_investigador TEXT,
  nome_investigador TEXT,
  funcao_investigador TEXT,

  status TEXT NOT NULL DEFAULT 'em_investigacao',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coqueluche_cases TO authenticated;
GRANT ALL ON public.coqueluche_cases TO service_role;

ALTER TABLE public.coqueluche_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cases"
  ON public.coqueluche_cases
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX coqueluche_cases_user_id_idx ON public.coqueluche_cases (user_id);
CREATE INDEX coqueluche_cases_created_at_idx ON public.coqueluche_cases (created_at DESC);

CREATE TRIGGER update_coqueluche_cases_updated_at
  BEFORE UPDATE ON public.coqueluche_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();