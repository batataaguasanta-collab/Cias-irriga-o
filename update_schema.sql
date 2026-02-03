-- Adicionar colunas faltantes na tabela ordens_servico
ALTER TABLE ordens_servico
ADD COLUMN IF NOT EXISTS data_inicio DATE,
ADD COLUMN IF NOT EXISTS hora_inicio TIME,
ADD COLUMN IF NOT EXISTS movimentacao TEXT,
ADD COLUMN IF NOT EXISTS volume_tipo TEXT,
ADD COLUMN IF NOT EXISTS volume_valor DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sentido_rotacao TEXT,
ADD COLUMN IF NOT EXISTS aplicar_insumos BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS insumos_descricao TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS solicitante TEXT;

-- Recarregar cache do schema
NOTIFY pgrst, 'reload schema';
