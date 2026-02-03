-- Cria tabela de talhaos
CREATE TABLE IF NOT EXISTS talhao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    fazenda_id UUID REFERENCES fazenda(id) ON DELETE CASCADE,
    cultura_id UUID REFERENCES cultura(id) ON DELETE SET NULL,
    pivo_id UUID REFERENCES pivos(id) ON DELETE SET NULL,
    data_plantio DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS (Row Level Security) para a tabela
ALTER TABLE talhao ENABLE ROW LEVEL SECURITY;

-- Remove política antiga (se existir) e recria
DROP POLICY IF EXISTS "Permitir acesso total a talhao" ON talhao;
CREATE POLICY "Permitir acesso total a talhao" ON talhao
    FOR ALL USING (true);

-- Comentário na tabela
COMMENT ON TABLE talhao IS 'Tabela para armazenar informações sobre talhaos de cultivo';

-- Índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_talhao_fazenda ON talhao(fazenda_id);
CREATE INDEX IF NOT EXISTS idx_talhao_cultura ON talhao(cultura_id);
CREATE INDEX IF NOT EXISTS idx_talhao_pivo ON talhao(pivo_id);

