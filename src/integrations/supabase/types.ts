export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      coqueluche_cases: {
        Row: {
          agravo: string
          bairro: string | null
          casos_secundarios_confirmados: string | null
          cep: string | null
          classificacao_final: string | null
          codigo_ibge_notificacao: string | null
          codigo_ibge_residencia: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          coleta_nasofaringe: string | null
          coleta_nasofaringe_comunicantes: string | null
          complemento: string | null
          complicacoes: Json
          comunicantes_cultura_positivo: number | null
          contato_caso_suspeito: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_adm_antibiotico: string | null
          data_coleta_material: string | null
          data_encerramento: string | null
          data_inicio_tosse: string | null
          data_internacao: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_obito: string | null
          data_primeiros_sintomas: string | null
          data_ultima_dose: string | null
          distrito: string | null
          doenca_relacionada_trabalho: string | null
          doses_vacina_triplice: string | null
          endereco_contato: string | null
          escolaridade: string | null
          evolucao: string | null
          funcao_investigador: string | null
          gestante: string | null
          id: string
          idade: number | null
          identificacao_comunicantes: string | null
          logradouro: string | null
          medidas_prevencao: string | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_contato: string | null
          nome_hospital: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_comunicantes: number | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorreu_hospitalizacao: string | null
          ocupacao: string | null
          pais: string | null
          ponto_referencia: string | null
          quantidade_comunicantes_coleta: number | null
          raca_cor: string | null
          resultado_cultura: string | null
          sexo: string | null
          sinais_sintomas: Json
          status: string
          telefone: string | null
          tipo_idade: string | null
          tipo_notificacao: string
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          unidade_sentinela: string | null
          updated_at: string
          user_id: string
          utilizou_antibiotico: string | null
          zona: string | null
        }
        Insert: {
          agravo?: string
          bairro?: string | null
          casos_secundarios_confirmados?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_residencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          coleta_nasofaringe?: string | null
          coleta_nasofaringe_comunicantes?: string | null
          complemento?: string | null
          complicacoes?: Json
          comunicantes_cultura_positivo?: number | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_adm_antibiotico?: string | null
          data_coleta_material?: string | null
          data_encerramento?: string | null
          data_inicio_tosse?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          distrito?: string | null
          doenca_relacionada_trabalho?: string | null
          doses_vacina_triplice?: string | null
          endereco_contato?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          identificacao_comunicantes?: string | null
          logradouro?: string | null
          medidas_prevencao?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_comunicantes?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          pais?: string | null
          ponto_referencia?: string | null
          quantidade_comunicantes_coleta?: number | null
          raca_cor?: string | null
          resultado_cultura?: string | null
          sexo?: string | null
          sinais_sintomas?: Json
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          tipo_notificacao?: string
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          unidade_sentinela?: string | null
          updated_at?: string
          user_id: string
          utilizou_antibiotico?: string | null
          zona?: string | null
        }
        Update: {
          agravo?: string
          bairro?: string | null
          casos_secundarios_confirmados?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_residencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          coleta_nasofaringe?: string | null
          coleta_nasofaringe_comunicantes?: string | null
          complemento?: string | null
          complicacoes?: Json
          comunicantes_cultura_positivo?: number | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_adm_antibiotico?: string | null
          data_coleta_material?: string | null
          data_encerramento?: string | null
          data_inicio_tosse?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          distrito?: string | null
          doenca_relacionada_trabalho?: string | null
          doses_vacina_triplice?: string | null
          endereco_contato?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          identificacao_comunicantes?: string | null
          logradouro?: string | null
          medidas_prevencao?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_comunicantes?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          pais?: string | null
          ponto_referencia?: string | null
          quantidade_comunicantes_coleta?: number | null
          raca_cor?: string | null
          resultado_cultura?: string | null
          sexo?: string | null
          sinais_sintomas?: Json
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          tipo_notificacao?: string
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          unidade_sentinela?: string | null
          updated_at?: string
          user_id?: string
          utilizou_antibiotico?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      dengue_chikungunya_cases: {
        Row: {
          agravo: string
          bairro: string | null
          caso_autoctone: string | null
          cep: string | null
          classificacao: string | null
          codigo_ibge_notificacao: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_encerramento: string | null
          data_internacao: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_obito: string | null
          data_primeiros_sintomas: string | null
          dengue_grave: string | null
          dengue_sinais_alarme: string | null
          doencas_preexistentes: Json | null
          escolaridade: string | null
          evolucao: string | null
          funcao_investigador: string | null
          gestante: string | null
          id: string
          idade: number | null
          logradouro: string | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_hospital: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          ns1_data: string | null
          ns1_resultado: string | null
          numero_cartao_sus: string | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorreu_hospitalizacao: string | null
          ocupacao: string | null
          raca_cor: string | null
          rt_pcr_data: string | null
          rt_pcr_resultado: string | null
          sexo: string | null
          sinais_clinicos: Json | null
          sorologia_chikungunya_resultado_s1: string | null
          sorologia_chikungunya_resultado_s2: string | null
          sorologia_chikungunya_s1_data: string | null
          sorologia_chikungunya_s2_data: string | null
          sorologia_dengue_data: string | null
          sorologia_dengue_resultado: string | null
          sorotipo: string | null
          status: string
          telefone: string | null
          tipo_idade: string | null
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          zona: string | null
        }
        Insert: {
          agravo?: string
          bairro?: string | null
          caso_autoctone?: string | null
          cep?: string | null
          classificacao?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          dengue_grave?: string | null
          dengue_sinais_alarme?: string | null
          doencas_preexistentes?: Json | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          ns1_data?: string | null
          ns1_resultado?: string | null
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          raca_cor?: string | null
          rt_pcr_data?: string | null
          rt_pcr_resultado?: string | null
          sexo?: string | null
          sinais_clinicos?: Json | null
          sorologia_chikungunya_resultado_s1?: string | null
          sorologia_chikungunya_resultado_s2?: string | null
          sorologia_chikungunya_s1_data?: string | null
          sorologia_chikungunya_s2_data?: string | null
          sorologia_dengue_data?: string | null
          sorologia_dengue_resultado?: string | null
          sorotipo?: string | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          zona?: string | null
        }
        Update: {
          agravo?: string
          bairro?: string | null
          caso_autoctone?: string | null
          cep?: string | null
          classificacao?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          dengue_grave?: string | null
          dengue_sinais_alarme?: string | null
          doencas_preexistentes?: Json | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          logradouro?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          ns1_data?: string | null
          ns1_resultado?: string | null
          numero_cartao_sus?: string | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          raca_cor?: string | null
          rt_pcr_data?: string | null
          rt_pcr_resultado?: string | null
          sexo?: string | null
          sinais_clinicos?: Json | null
          sorologia_chikungunya_resultado_s1?: string | null
          sorologia_chikungunya_resultado_s2?: string | null
          sorologia_chikungunya_s1_data?: string | null
          sorologia_chikungunya_s2_data?: string | null
          sorologia_dengue_data?: string | null
          sorologia_dengue_resultado?: string | null
          sorotipo?: string | null
          status?: string
          telefone?: string | null
          tipo_idade?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          zona?: string | null
        }
        Relationships: []
      }
      difteria_cases: {
        Row: {
          agravo: string
          bairro: string | null
          casos_secundarios_confirmados: string | null
          cep: string | null
          classificacao_final: string | null
          codigo_hospital: string | null
          codigo_ibge_notificacao: string | null
          codigo_ibge_residencia: string | null
          codigo_unidade_investigador: string | null
          codigo_unidade_saude: string | null
          coleta_material_comunicantes: string | null
          complemento: string | null
          complicacoes: Json | null
          contato_caso_suspeito: string | null
          created_at: string
          criterio_confirmacao: string | null
          data_adm_antibiotico: string | null
          data_aplicacao_soro: string | null
          data_coleta: string | null
          data_encerramento: string | null
          data_internacao: string | null
          data_investigacao: string | null
          data_nascimento: string | null
          data_notificacao: string
          data_obito: string | null
          data_primeiros_sintomas: string | null
          data_ultima_dose: string | null
          distrito: string | null
          doenca_relacionada_trabalho: string | null
          doses_vacina: string | null
          endereco_contato: string | null
          escolaridade: string | null
          evolucao: string | null
          funcao_investigador: string | null
          gestante: string | null
          id: string
          idade: number | null
          identificacao_comunicantes: string | null
          localizacao_pseudomembrana: Json | null
          logradouro: string | null
          material_coletado: string | null
          medidas_prevencao: string | null
          municipio_hospital: string | null
          municipio_notificacao: string | null
          municipio_residencia: string | null
          municipio_unidade_investigador: string | null
          nome_contato: string | null
          nome_hospital: string | null
          nome_investigador: string | null
          nome_mae: string | null
          nome_paciente: string
          numero_cartao_sus: string | null
          numero_comunicantes: number | null
          numero_endereco: string | null
          numero_ficha: string | null
          observacoes_adicionais: string | null
          ocorreu_hospitalizacao: string | null
          ocupacao: string | null
          pais: string | null
          ponto_referencia: string | null
          portadores_identificados: number | null
          provas_toxigenicidade: string | null
          quantidade_comunicantes_coleta: number | null
          raca_cor: string | null
          resultado_cultura: string | null
          sexo: string | null
          sinais_sintomas: Json | null
          status: string
          telefone: string | null
          temperatura_corporal: number | null
          tipo_idade: string | null
          tipo_notificacao: string | null
          uf_hospital: string | null
          uf_notificacao: string | null
          uf_residencia: string | null
          unidade_saude: string | null
          updated_at: string
          user_id: string
          utilizou_antibiotico: string | null
          zona: string | null
        }
        Insert: {
          agravo?: string
          bairro?: string | null
          casos_secundarios_confirmados?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_hospital?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_residencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          coleta_material_comunicantes?: string | null
          complemento?: string | null
          complicacoes?: Json | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_adm_antibiotico?: string | null
          data_aplicacao_soro?: string | null
          data_coleta?: string | null
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          distrito?: string | null
          doenca_relacionada_trabalho?: string | null
          doses_vacina?: string | null
          endereco_contato?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          identificacao_comunicantes?: string | null
          localizacao_pseudomembrana?: Json | null
          logradouro?: string | null
          material_coletado?: string | null
          medidas_prevencao?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente: string
          numero_cartao_sus?: string | null
          numero_comunicantes?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          pais?: string | null
          ponto_referencia?: string | null
          portadores_identificados?: number | null
          provas_toxigenicidade?: string | null
          quantidade_comunicantes_coleta?: number | null
          raca_cor?: string | null
          resultado_cultura?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          temperatura_corporal?: number | null
          tipo_idade?: string | null
          tipo_notificacao?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id: string
          utilizou_antibiotico?: string | null
          zona?: string | null
        }
        Update: {
          agravo?: string
          bairro?: string | null
          casos_secundarios_confirmados?: string | null
          cep?: string | null
          classificacao_final?: string | null
          codigo_hospital?: string | null
          codigo_ibge_notificacao?: string | null
          codigo_ibge_residencia?: string | null
          codigo_unidade_investigador?: string | null
          codigo_unidade_saude?: string | null
          coleta_material_comunicantes?: string | null
          complemento?: string | null
          complicacoes?: Json | null
          contato_caso_suspeito?: string | null
          created_at?: string
          criterio_confirmacao?: string | null
          data_adm_antibiotico?: string | null
          data_aplicacao_soro?: string | null
          data_coleta?: string | null
          data_encerramento?: string | null
          data_internacao?: string | null
          data_investigacao?: string | null
          data_nascimento?: string | null
          data_notificacao?: string
          data_obito?: string | null
          data_primeiros_sintomas?: string | null
          data_ultima_dose?: string | null
          distrito?: string | null
          doenca_relacionada_trabalho?: string | null
          doses_vacina?: string | null
          endereco_contato?: string | null
          escolaridade?: string | null
          evolucao?: string | null
          funcao_investigador?: string | null
          gestante?: string | null
          id?: string
          idade?: number | null
          identificacao_comunicantes?: string | null
          localizacao_pseudomembrana?: Json | null
          logradouro?: string | null
          material_coletado?: string | null
          medidas_prevencao?: string | null
          municipio_hospital?: string | null
          municipio_notificacao?: string | null
          municipio_residencia?: string | null
          municipio_unidade_investigador?: string | null
          nome_contato?: string | null
          nome_hospital?: string | null
          nome_investigador?: string | null
          nome_mae?: string | null
          nome_paciente?: string
          numero_cartao_sus?: string | null
          numero_comunicantes?: number | null
          numero_endereco?: string | null
          numero_ficha?: string | null
          observacoes_adicionais?: string | null
          ocorreu_hospitalizacao?: string | null
          ocupacao?: string | null
          pais?: string | null
          ponto_referencia?: string | null
          portadores_identificados?: number | null
          provas_toxigenicidade?: string | null
          quantidade_comunicantes_coleta?: number | null
          raca_cor?: string | null
          resultado_cultura?: string | null
          sexo?: string | null
          sinais_sintomas?: Json | null
          status?: string
          telefone?: string | null
          temperatura_corporal?: number | null
          tipo_idade?: string | null
          tipo_notificacao?: string | null
          uf_hospital?: string | null
          uf_notificacao?: string | null
          uf_residencia?: string | null
          unidade_saude?: string | null
          updated_at?: string
          user_id?: string
          utilizou_antibiotico?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
