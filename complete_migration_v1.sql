-- =================================================================
-- SCRIPT DE MIGRAÇÂO COMPLETA (ORDEM CORRETA DE DEPENDÊNCIAS)
-- Rode este script no Editor SQL do Supabase para criar/atualizar tudo
-- =================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELAS BASE (do supabase-schema.sql)
CREATE TABLE IF NOT EXISTS operadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pivos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT NOT NULL UNIQUE,
  nome TEXT,
  localizacao TEXT,
  status TEXT DEFAULT 'Inativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ordens_servico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_os TEXT UNIQUE,
  pivo_id UUID REFERENCES pivos(id),
  operador_id UUID REFERENCES operadores(id),
  pivo_numero TEXT,
  operador_nome TEXT,
  parcela TEXT CHECK (parcela IN ('TOTAL', 'ALTA', 'BAIXA')),
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Andamento', 'Interrompida', 'Concluída')),
  angulo_atual DECIMAL(5,2) DEFAULT 0,
  progresso_percentual DECIMAL(5,2) DEFAULT 0,
  tempo_irrigando INTEGER DEFAULT 0,
  tempo_parado INTEGER DEFAULT 0,
  eficiencia DECIMAL(5,2),
  created_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS historico_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ordem_id UUID REFERENCES ordens_servico(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  motivo_parada TEXT,
  usuario TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. TABELAS ADICIONAIS (Cultura e Fazenda)
CREATE TABLE IF NOT EXISTS cultura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    variedade_cultivar TEXT,
    ciclo INTEGER, -- Ciclo em dias
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fazenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    localizacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA TALHÃO (Depende de fazenda, cultura e pivos)
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

-- 5. ATUALIZAÇÕES DE SCHEMA (Colunas faltantes em Pivos)
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS pressao_servico DECIMAL(10,2);
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS raio_ultima_torre DECIMAL(10,2);
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS vao_apos_ultima_torre DECIMAL(10,2);
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS tempo_maximo_diario DECIMAL(10,2);
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS coef_uniformidade DECIMAL(10,2);
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS diametro_maior_bocal DECIMAL(10,2);
ALTER TABLE pivos ADD COLUMN IF NOT EXISTS diametro_menor_bocal DECIMAL(10,2);

-- 6. ATUALIZAÇÕES DE SCHEMA (Colunas faltantes em Ordens de Serviço - CRÍTICO)
ALTER TABLE ordens_servico 
ADD COLUMN IF NOT EXISTS data_inicio DATE,
ADD COLUMN IF NOT EXISTS hora_inicio TIME,
ADD COLUMN IF NOT EXISTS data_efetiva_inicio TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS movimentacao TEXT,
ADD COLUMN IF NOT EXISTS volume_tipo TEXT,
ADD COLUMN IF NOT EXISTS volume_valor DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sentido_rotacao TEXT,
ADD COLUMN IF NOT EXISTS aplicar_insumos BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS insumos_descricao TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS solicitante TEXT;

-- 7. POLÍTICAS RLS (Segurança)

-- Habilitar RLS
ALTER TABLE operadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultura ENABLE ROW LEVEL SECURITY;
ALTER TABLE fazenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE talhao ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (AJUSTE CONFORME NECESSIDADE DE PRODUÇÃO)
CREATE POLICY "Acesso total operadores" ON operadores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total pivos" ON pivos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total ordens" ON ordens_servico FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total historico" ON historico_status FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total cultura" ON cultura FOR ALL USING (true);
CREATE POLICY "Acesso total fazenda" ON fazenda FOR ALL USING (true);
DROP POLICY IF EXISTS "Permitir acesso total a talhao" ON talhao;
CREATE POLICY "Acesso total talhao" ON talhao FOR ALL USING (true);

-- 8. INDEXES & TRIGGERS
CREATE INDEX IF NOT EXISTS idx_ordens_status ON ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_ordens_pivo ON ordens_servico(pivo_id);
CREATE INDEX IF NOT EXISTS idx_talhao_fazenda ON talhao(fazenda_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_operadores_updated_at ON operadores;
CREATE TRIGGER update_operadores_updated_at BEFORE UPDATE ON operadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. RECARREGAR SCHEMA (Previne erros de cache)
NOTIFY pgrst, 'reload schema';
