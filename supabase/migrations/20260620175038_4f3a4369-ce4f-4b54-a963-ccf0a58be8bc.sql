
CREATE TABLE public.srag_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  numero_ficha TEXT,
  agravo TEXT NOT NULL DEFAULT 'srag_influenza',
  data_preenchimento DATE NOT NULL,
  uf_notificacao TEXT,
  municipio_notificacao TEXT,
  codigo_ibge_notificacao TEXT,
  unidade_saude TEXT,
  codigo_cnes TEXT,
  data_primeiros_sintomas DATE,
  nome_paciente TEXT NOT NULL,
  numero_cartao_sus TEXT,
  data_nascimento DATE,
  idade NUMERIC,
  tipo_idade TEXT,
  sexo TEXT,
  gestante TEXT,
  raca_cor TEXT,
  escolaridade TEXT,
  nome_mae TEXT,
  uf_residencia TEXT,
  municipio_residencia TEXT,
  bairro TEXT,
  logradouro TEXT,
  numero_endereco TEXT,
  cep TEXT,
  telefone TEXT,
  zona TEXT,
  recebeu_vacina_gripe TEXT,
  data_ultima_dose_vacina DATE,
  sinais_sintomas JSONB DEFAULT '{}'::jsonb,
  fatores_risco JSONB DEFAULT '{}'::jsonb,
  uso_antiviral TEXT,
  data_inicio_tratamento DATE,
  ocorreu_internacao TEXT,
  data_internacao DATE,
  uf_hospital TEXT,
  municipio_hospital TEXT,
  nome_hospital TEXT,
  raio_x_torax TEXT,
  data_raio_x DATE,
  suporte_ventilatorio TEXT,
  internado_uti TEXT,
  data_entrada_uti DATE,
  data_saida_uti DATE,
  tipo_amostra TEXT,
  data_coleta DATE,
  diagnostico_etiologico JSONB DEFAULT '{}'::jsonb,
  classificacao_final TEXT,
  criterio_confirmacao TEXT,
  evolucao TEXT,
  data_alta_obito DATE,
  data_encerramento DATE,
  observacoes_adicionais TEXT,
  nome_investigador TEXT,
  funcao_investigador TEXT,
  municipio_unidade_investigador TEXT,
  codigo_unidade_investigador TEXT,
  status TEXT NOT NULL DEFAULT 'em_investigacao',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.srag_cases TO authenticated;
GRANT ALL ON public.srag_cases TO service_role;

ALTER TABLE public.srag_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own srag cases"
  ON public.srag_cases FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_srag_cases_updated_at
  BEFORE UPDATE ON public.srag_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
