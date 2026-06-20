
CREATE TABLE public.tetano_neonatal_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  numero_ficha TEXT,
  agravo TEXT NOT NULL DEFAULT 'tetano_neonatal',
  data_notificacao DATE NOT NULL,
  uf_notificacao TEXT,
  municipio_notificacao TEXT,
  codigo_ibge_notificacao TEXT,
  unidade_saude TEXT,
  codigo_unidade_saude TEXT,
  data_primeiros_sintomas DATE,
  nome_paciente TEXT NOT NULL,
  data_nascimento DATE,
  idade NUMERIC,
  tipo_idade TEXT,
  sexo TEXT,
  raca_cor TEXT,
  numero_cartao_sus TEXT,
  nome_mae TEXT,
  uf_residencia TEXT,
  municipio_residencia TEXT,
  bairro TEXT,
  logradouro TEXT,
  numero_endereco TEXT,
  cep TEXT,
  telefone TEXT,
  zona TEXT,
  data_investigacao DATE,
  numero_consultas_pre_natal TEXT,
  antecedentes_vacinais_mae TEXT,
  data_1a_dose_mae DATE,
  data_2a_dose_mae DATE,
  data_3a_dose_mae DATE,
  data_ultimo_reforco_mae DATE,
  idade_mae NUMERIC,
  numero_gestacoes TEXT,
  escolaridade_mae TEXT,
  local_ocorrencia_parto TEXT,
  parto_atendido_por TEXT,
  sugou_normalmente TEXT,
  sinais_sintomas JSONB DEFAULT '{}'::jsonb,
  data_trismo DATE,
  origem_caso TEXT,
  ocorreu_hospitalizacao TEXT,
  local_residencia_coberta TEXT,
  medidas_adotadas JSONB DEFAULT '{}'::jsonb,
  classificacao_final TEXT,
  local_fonte_infeccao TEXT,
  caso_autoctone TEXT,
  evolucao TEXT,
  data_obito DATE,
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tetano_neonatal_cases TO authenticated;
GRANT ALL ON public.tetano_neonatal_cases TO service_role;

ALTER TABLE public.tetano_neonatal_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tetano neonatal cases"
  ON public.tetano_neonatal_cases FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_tetano_neonatal_cases_updated_at
  BEFORE UPDATE ON public.tetano_neonatal_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
