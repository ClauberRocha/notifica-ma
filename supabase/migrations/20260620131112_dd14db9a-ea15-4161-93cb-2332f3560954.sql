CREATE TABLE public.dengue_chikungunya_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  numero_ficha text,
  agravo text NOT NULL DEFAULT 'dengue',
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
  cep text,
  telefone text,
  zona text,

  data_investigacao date,
  ocupacao text,

  sinais_clinicos jsonb DEFAULT '{}'::jsonb,
  doencas_preexistentes jsonb DEFAULT '{}'::jsonb,

  sorologia_chikungunya_s1_data date,
  sorologia_chikungunya_s2_data date,
  sorologia_chikungunya_resultado_s1 text,
  sorologia_chikungunya_resultado_s2 text,
  sorologia_dengue_data date,
  sorologia_dengue_resultado text,
  ns1_data date,
  ns1_resultado text,
  rt_pcr_data date,
  rt_pcr_resultado text,
  sorotipo text,

  ocorreu_hospitalizacao text,
  data_internacao date,
  uf_hospital text,
  municipio_hospital text,
  nome_hospital text,

  dengue_sinais_alarme text,
  dengue_grave text,
  classificacao text,
  criterio_confirmacao text,
  caso_autoctone text,
  evolucao text,
  data_obito date,
  data_encerramento date,

  observacoes_adicionais text,

  nome_investigador text,
  funcao_investigador text,
  municipio_unidade_investigador text,
  codigo_unidade_investigador text,

  status text NOT NULL DEFAULT 'em_investigacao'
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dengue_chikungunya_cases TO authenticated;
GRANT ALL ON public.dengue_chikungunya_cases TO service_role;

ALTER TABLE public.dengue_chikungunya_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own dengue/chik cases"
ON public.dengue_chikungunya_cases
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_dengue_chik_user ON public.dengue_chikungunya_cases(user_id);
CREATE INDEX idx_dengue_chik_created ON public.dengue_chikungunya_cases(created_at DESC);

CREATE TRIGGER dengue_chik_set_updated_at
BEFORE UPDATE ON public.dengue_chikungunya_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();