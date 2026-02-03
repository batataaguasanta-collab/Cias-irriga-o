-- Script para renomear a tabela 'parcela' para 'talhao'
-- Execute este script no SQL Editor do Supabase

-- 1. Renomear a tabela
ALTER TABLE parcela RENAME TO talhao;

-- 2. Renomear as constraints de foreign key
ALTER TABLE talhao RENAME CONSTRAINT parcela_fazenda_id_fkey TO talhao_fazenda_id_fkey;
ALTER TABLE talhao RENAME CONSTRAINT parcela_cultura_id_fkey TO talhao_cultura_id_fkey;
ALTER TABLE talhao RENAME CONSTRAINT parcela_pivo_id_fkey TO talhao_pivo_id_fkey;

-- 3. Renomear os índices
ALTER INDEX idx_parcela_fazenda RENAME TO idx_talhao_fazenda;
ALTER INDEX idx_parcela_cultura RENAME TO idx_talhao_cultura;
ALTER INDEX idx_parcela_pivo RENAME TO idx_talhao_pivo;

-- 4. Verificar a estrutura da nova tabela
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'talhao'
ORDER BY ordinal_position;

-- 5. Verificar as constraints
SELECT
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'talhao'::regclass;

-- Resultado esperado: tabela 'talhao' com todas as colunas e constraints renomeadas
