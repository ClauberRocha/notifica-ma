
CREATE TABLE public.hanseniase_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_ficha text,
  numero_prontuario text,
  agravo text NOT NULL DEFAULT 'hanseniase',
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
  numero_lesoes_cutaneas numeric,
  forma_clinica text,
  classificacao_operacional text,
  numero_nervos_afetados numeric,
  grau_incapacidade_fisica text,
  modo_entrada text,
  modo_deteccao text,
  baciloscopia text,
  data_inicio_tratamento date,
  esquema_terapeutico text,
  numero_contatos_registrados numeric,
  observacoes_adicionais text,
  nome_investigador text,
  funcao_investigador text,
  municipio_unidade_investigador text,
  codigo_unidade_investigador text,
  status text NOT NULL DEFAULT 'em_investigacao',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hanseniase_cases TO authenticated;
GRANT ALL ON public.hanseniase_cases TO service_role;

ALTER TABLE public.hanseniase_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own hanseniase cases"
ON public.hanseniase_cases FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX hanseniase_cases_user_id_idx ON public.hanseniase_cases(user_id);
CREATE INDEX hanseniase_cases_created_at_idx ON public.hanseniase_cases(created_at DESC);

CREATE TRIGGER update_hanseniase_cases_updated_at
BEFORE UPDATE ON public.hanseniase_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
