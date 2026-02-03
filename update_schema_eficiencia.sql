-- Adicionar coluna para a data/hora efetiva de início (quando o botão Iniciar é clicado)
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS data_efetiva_inicio TIMESTAMP WITH TIME ZONE;

-- Recarregar cache do schema
NOTIFY pgrst, 'reload schema';
