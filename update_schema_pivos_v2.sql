-- Adiciona colunas para detalhes técnicos do pivô
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS area_ha DECIMAL(10,2);
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS velocidade_100 DECIMAL(10,2);
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS vazao_m3h DECIMAL(10,2);
