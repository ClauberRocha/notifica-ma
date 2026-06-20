
CREATE TABLE public.surto_dta_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  numero_ficha TEXT,
  agravo TEXT NOT NULL DEFAULT 'surto_dta',
  data_notificacao DATE NOT NULL,
  uf_notificacao TEXT,
  municipio_notificacao TEXT NOT NULL,
  codigo_ibge_notificacao TEXT,
  unidade_saude TEXT,
  codigo_unidade_saude TEXT,
  data_1os_sintomas_1o_caso DATE,
  numero_casos_suspeitos NUMERIC,
  local_inicial_ocorrencia TEXT,
  uf_ocorrencia TEXT,
  municipio_ocorrencia TEXT,
  bairro TEXT,
  logradouro TEXT,
  numero_endereco TEXT,
  complemento TEXT,
  cep TEXT,
  telefone TEXT,
  zona TEXT,
  data_investigacao DATE,
  modo_transmissao TEXT,
  veiculo_transmissao TEXT,
  numero_entrevistados NUMERIC,
  numero_doentes_entrevistados NUMERIC,
  numero_total_doentes NUMERIC,
  numero_total_hospitalizados NUMERIC,
  numero_obitos NUMERIC,
  sinais_sintomas JSONB DEFAULT '{}'::jsonb,
  periodo_incubacao_minimo NUMERIC,
  periodo_incubacao_maximo NUMERIC,
  mediana_periodo_incubacao NUMERIC,
  local_producao_preparacao TEXT,
  local_ingestao TEXT,
  fatores_causais JSONB DEFAULT '{}'::jsonb,
  coletadas_amostras_clinicas TEXT,
  numero_amostras_clinicas NUMERIC,
  resultado_clinico_1 TEXT,
  resultado_clinico_2 TEXT,
  coletadas_amostras_alimentos TEXT,
  numero_amostras_alimentos NUMERIC,
  resultado_bromatologico_1 TEXT,
  agente_etiologico TEXT,
  alimento_causador TEXT,
  criterio_confirmacao TEXT,
  medidas_adotadas TEXT,
  data_encerramento DATE,
  observacoes TEXT,
  nome_investigador TEXT,
  funcao_investigador TEXT,
  municipio_unidade_investigador TEXT,
  codigo_unidade_investigador TEXT,
  status TEXT NOT NULL DEFAULT 'em_investigacao',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.surto_dta_cases TO authenticated;
GRANT ALL ON public.surto_dta_cases TO service_role;

ALTER TABLE public.surto_dta_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own surto dta cases"
  ON public.surto_dta_cases FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_surto_dta_cases_updated_at
  BEFORE UPDATE ON public.surto_dta_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
