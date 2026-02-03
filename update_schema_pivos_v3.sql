-- Adiciona colunas para detalhes técnicos avançados do pivô
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS pressao_servico DECIMAL(10,2);         -- mca
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS raio_ultima_torre DECIMAL(10,2);       -- m
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS vao_apos_ultima_torre DECIMAL(10,2);   -- m
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS tempo_maximo_diario DECIMAL(10,2);     -- h
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS coef_uniformidade DECIMAL(10,2);       -- %
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS diametro_maior_bocal DECIMAL(10,2);    -- mm
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS diametro_menor_bocal DECIMAL(10,2);    -- mm
