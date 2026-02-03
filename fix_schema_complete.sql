-- =================================================================
-- SCRIPT DE CORREÇÃO TOTAL DO SCHEMA (RODE ESTE PARA CORRIGIR O ERRO 400)
-- =================================================================

-- 1. Garante que TODAS as colunas novas existam
ALTER TABLE ordens_servico 
ADD COLUMN IF NOT EXISTS data_inicio DATE,
ADD COLUMN IF NOT EXISTS hora_inicio TIME,
ADD COLUMN IF NOT EXISTS data_efetiva_inicio TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS movimentacao TEXT,
ADD COLUMN IF NOT EXISTS volume_tipo TEXT,
ADD COLUMN IF NOT EXISTS volume_valor DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sentido_rotacao TEXT,
ADD COLUMN IF NOT EXISTS aplicar_insumos BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS insumos_descricao TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS solicitante TEXT;

-- 2. Concede permissões novamente (por precaução)
GRANT ALL ON ordens_servico TO authenticated;
GRANT ALL ON ordens_servico TO service_role;

-- 3. FORÇA O RECARREGAMENTO DO CACHE DO SCHEMA (CRÍTICO PARA O ERRO 400)
NOTIFY pgrst, 'reload schema';
