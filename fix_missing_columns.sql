-- ============================================
-- SCRIPT DE CORREÇÃO FINAL - COLUNAS DE FLUXO
-- ============================================

-- Adiciona colunas que faltavam para o fluxo de Iniciar/Parar/Concluir
ALTER TABLE ordens_servico 
ADD COLUMN IF NOT EXISTS data_conclusao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_retomada TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS motivo_parada TEXT,
ADD COLUMN IF NOT EXISTS motivo_parada_detalhe TEXT,
ADD COLUMN IF NOT EXISTS data_interrupcao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS historico_interrupcoes JSONB DEFAULT '[]'::jsonb;

-- Força atualização do cache da API
NOTIFY pgrst, 'reload schema';
