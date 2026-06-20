
CREATE TABLE public.tuberculose_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  numero_ficha text,
  numero_prontuario text,
  agravo text NOT NULL DEFAULT 'tuberculose',
  data_notificacao date NOT NULL,
  data_diagnostico date,
  uf_notificacao text,
  municipio_notificacao text,
  codigo_ibge_notificacao text,
  unidade_saude text,
  codigo_unidade_saude text,
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
  ocupacao text,
  tipo_entrada text,
  populacoes_especiais jsonb DEFAULT '{}'::jsonb,
  forma text,
  se_extrapulmonar text,
  doencas_agravos_associados jsonb DEFAULT '{}'::jsonb,
  baciloscopia_escarro text,
  radiografia_torax text,
  hiv text,
  terapia_antirretroviral text,
  histopatologia text,
  cultura text,
  tmr_tb text,
  teste_sensibilidade text,
  data_inicio_tratamento date,
  total_contatos_identificados numeric,
  observacoes_adicionais text,
  nome_investigador text,
  funcao_investigador text,
  municipio_unidade_investigador text,
  codigo_unidade_investigador text,
  status text NOT NULL DEFAULT 'em_investigacao',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tuberculose_cases TO authenticated;
GRANT ALL ON public.tuberculose_cases TO service_role;

ALTER TABLE public.tuberculose_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tuberculose cases"
  ON public.tuberculose_cases
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_tuberculose_cases_updated_at
  BEFORE UPDATE ON public.tuberculose_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
