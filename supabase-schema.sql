-- ============================================
-- SCHEMA DO BANCO DE DADOS - SISTEMA DE IRRIGAÇÃO
-- ============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: operadores
-- ============================================
CREATE TABLE operadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- TABELA: pivos
-- ============================================
CREATE TABLE pivos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT NOT NULL UNIQUE,
  nome TEXT,
  localizacao TEXT,
  status TEXT DEFAULT 'Inativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- TABELA: ordens_servico
-- ============================================
CREATE TABLE ordens_servico (
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

-- ============================================
-- TABELA: historico_status
-- ============================================
CREATE TABLE historico_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ordem_id UUID REFERENCES ordens_servico(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  motivo_parada TEXT,
  usuario TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_ordens_status ON ordens_servico(status);
CREATE INDEX idx_ordens_pivo ON ordens_servico(pivo_id);
CREATE INDEX idx_ordens_created ON ordens_servico(created_date DESC);
CREATE INDEX idx_historico_ordem ON historico_status(ordem_id);
CREATE INDEX idx_historico_timestamp ON historico_status(timestamp DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE operadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_status ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: operadores
-- ============================================
CREATE POLICY "Usuários autenticados podem ler operadores"
  ON operadores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar operadores"
  ON operadores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar operadores"
  ON operadores FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar operadores"
  ON operadores FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- POLÍTICAS: pivos
-- ============================================
CREATE POLICY "Usuários autenticados podem ler pivos"
  ON pivos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar pivos"
  ON pivos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar pivos"
  ON pivos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar pivos"
  ON pivos FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- POLÍTICAS: ordens_servico
-- ============================================
CREATE POLICY "Usuários autenticados podem ler ordens"
  ON ordens_servico FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar ordens"
  ON ordens_servico FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar ordens"
  ON ordens_servico FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar ordens"
  ON ordens_servico FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- POLÍTICAS: historico_status
-- ============================================
CREATE POLICY "Usuários autenticados podem ler histórico"
  ON historico_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar histórico"
  ON historico_status FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- FUNÇÃO: Atualizar timestamp automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_operadores_updated_at BEFORE UPDATE ON operadores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pivos_updated_at BEFORE UPDATE ON pivos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordens_updated_at BEFORE UPDATE ON ordens_servico
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ============================================

-- Inserir alguns operadores de exemplo
INSERT INTO operadores (nome, telefone, ativo) VALUES
('João Silva', '(11) 98765-4321', true),
('Maria Santos', '(11) 97654-3210', true);

-- Inserir alguns pivôs de exemplo
INSERT INTO pivos (numero, nome, localizacao, status) VALUES
('P001', 'Pivô 1', 'Área Norte', 'Ativo'),
('P002', 'Pivô 2', 'Área Sul', 'Ativo'),
('P003', 'Pivô 3', 'Área Leste', 'Inativo');
