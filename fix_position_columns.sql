-- ===============================================
-- SCRIPT DE CORREÇÃO - COLUNAS DE POSIÇÃO E PROGRESSO
-- ===============================================

-- Adiciona colunas para armazenar o estado atual do pivô e o progresso na parcela
ALTER TABLE ordens_servico 
ADD COLUMN IF NOT EXISTS posicao_atual INTEGER, -- Armazena o ângulo em graus (0-360)
ADD COLUMN IF NOT EXISTS progresso_parcela TEXT; -- Armazena 'Início', 'Meio', 'Fim'

-- Força atualização do cache da API novamente
NOTIFY pgrst, 'reload schema';
