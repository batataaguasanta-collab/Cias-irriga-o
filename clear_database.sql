-- Script para limpar todos os dados do banco de dados
-- Mantém a estrutura das tabelas, apenas remove os registros
-- Execute este script no SQL Editor do Supabase

-- ATENÇÃO: Este script irá deletar TODOS os dados!
-- Certifique-se de fazer backup se necessário antes de executar

-- Desabilitar verificações de chave estrangeira temporariamente
-- (não necessário no Supabase, mas útil em outros bancos)

-- Limpar tabelas na ordem correta (respeitando foreign keys)
-- Primeiro as tabelas que dependem de outras

-- 1. Limpar parcelas (depende de fazenda, cultura, pivos)
DELETE FROM parcela;

-- 2. Limpar ordens de serviço (depende de pivos e operadores)
DELETE FROM ordens_servico;

-- 3. Limpar tabelas independentes
DELETE FROM cultura;
DELETE FROM fazenda;
DELETE FROM operadores;
DELETE FROM pivos;

-- Resetar sequências (se houver auto-increment)
-- No Supabase com UUID isso não é necessário, mas incluído para referência
-- ALTER SEQUENCE parcela_id_seq RESTART WITH 1;
-- ALTER SEQUENCE cultura_id_seq RESTART WITH 1;
-- ALTER SEQUENCE fazenda_id_seq RESTART WITH 1;
-- ALTER SEQUENCE operadores_id_seq RESTART WITH 1;
-- ALTER SEQUENCE pivos_id_seq RESTART WITH 1;

-- Verificar se as tabelas foram limpas
SELECT 'parcela' as tabela, COUNT(*) as registros FROM parcela
UNION ALL
SELECT 'ordens_servico', COUNT(*) FROM ordens_servico
UNION ALL
SELECT 'cultura', COUNT(*) FROM cultura
UNION ALL
SELECT 'fazenda', COUNT(*) FROM fazenda
UNION ALL
SELECT 'operadores', COUNT(*) FROM operadores
UNION ALL
SELECT 'pivos', COUNT(*) FROM pivos;

-- Resultado esperado: todas as tabelas devem mostrar 0 registros
