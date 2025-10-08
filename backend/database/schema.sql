-- Criação das tabelas para o sistema Lucre Certo Hub

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pesquisas de mercado
CREATE TABLE IF NOT EXISTS market_research (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    search_data JSONB,
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conexões com lojas
CREATE TABLE IF NOT EXISTS store_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    store_type VARCHAR(50) NOT NULL CHECK (store_type IN ('shopee', 'mercadolivre', 'shein', 'amazon', 'aliexpress')),
    store_name VARCHAR(255),
    api_credentials JSONB,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos sincronizados
CREATE TABLE IF NOT EXISTS synced_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES store_connections(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2),
    stock_quantity INTEGER,
    category VARCHAR(100),
    product_data JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cálculos DRE
CREATE TABLE IF NOT EXISTS dre_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    revenue DECIMAL(12,2) DEFAULT 0,
    costs JSONB,
    expenses JSONB,
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cálculos de precificação
CREATE TABLE IF NOT EXISTS pricing_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    desired_margin DECIMAL(5,2),
    marketplace_fees JSONB,
    calculated_price DECIMAL(10,2),
    calculation_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de atividades
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_market_research_user_id ON market_research(user_id);
CREATE INDEX IF NOT EXISTS idx_store_connections_user_id ON store_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_synced_products_user_id ON synced_products(user_id);
CREATE INDEX IF NOT EXISTS idx_synced_products_connection_id ON synced_products(connection_id);
CREATE INDEX IF NOT EXISTS idx_dre_calculations_user_id ON dre_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_calculations_user_id ON pricing_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_research_updated_at BEFORE UPDATE ON market_research FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_connections_updated_at BEFORE UPDATE ON store_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dre_calculations_updated_at BEFORE UPDATE ON dre_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_calculations_updated_at BEFORE UPDATE ON pricing_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Usuários só podem acessar seus próprios dados
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE synced_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE dre_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own market research" ON market_research FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own store connections" ON store_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own synced products" ON synced_products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own DRE calculations" ON dre_calculations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own pricing calculations" ON pricing_calculations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own activity logs" ON activity_logs FOR SELECT USING (auth.uid() = user_id);
