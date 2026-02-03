-- Cria tabela de Parcelas
CREATE TABLE IF NOT EXISTS parcela (
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
ALTER TABLE parcela ENABLE ROW LEVEL SECURITY;

-- Remove política antiga (se existir) e recria
DROP POLICY IF EXISTS "Permitir acesso total a parcela" ON parcela;
CREATE POLICY "Permitir acesso total a parcela" ON parcela
    FOR ALL USING (true);

-- Comentário na tabela
COMMENT ON TABLE parcela IS 'Tabela para armazenar informações sobre parcelas de cultivo';

-- Índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_parcela_fazenda ON parcela(fazenda_id);
CREATE INDEX IF NOT EXISTS idx_parcela_cultura ON parcela(cultura_id);
CREATE INDEX IF NOT EXISTS idx_parcela_pivo ON parcela(pivo_id);
