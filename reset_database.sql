-- ============================================
-- SCRIPT DE LIMPEZA DE DADOS (RESET)
-- ============================================
-- CUIDADO: Este script apaga TODOS os dados das ordens de serviço e histórico!
-- Use apenas durante o desenvolvimento/testes.

-- Limpar histórico primeiro (por causa da chave estrangeira) ou usar CASCADE
TRUNCATE TABLE historico_status, ordens_servico RESTART IDENTITY CASCADE;

-- Opcional: Se quiser resetar os pivôs e operadores para o estado inicial, 
-- descomente as linhas abaixo (CUIDADO):
-- TRUNCATE TABLE pivos, operadores RESTART IDENTITY CASCADE;
