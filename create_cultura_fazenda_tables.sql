-- Cria tabela de Culturas
CREATE TABLE IF NOT EXISTS cultura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    variedade_cultivar TEXT,
    ciclo INTEGER, -- Ciclo em dias
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria tabela de Fazendas
CREATE TABLE IF NOT EXISTS fazenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    localizacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS (Row Level Security) para as tabelas
ALTER TABLE cultura ENABLE ROW LEVEL SECURITY;
ALTER TABLE fazenda ENABLE ROW LEVEL SECURITY;

-- Cria políticas de acesso (permite leitura e escrita para usuários autenticados)
CREATE POLICY "Permitir acesso total a cultura" ON cultura
    FOR ALL USING (true);

CREATE POLICY "Permitir acesso total a fazenda" ON fazenda
    FOR ALL USING (true);

-- Comentários nas tabelas
COMMENT ON TABLE cultura IS 'Tabela para armazenar informações sobre culturas plantadas';
COMMENT ON TABLE fazenda IS 'Tabela para armazenar informações sobre fazendas';
