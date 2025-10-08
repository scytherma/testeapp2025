-- Criar tabela para anúncios salvos
CREATE TABLE IF NOT EXISTS saved_ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo_calculadora VARCHAR(50) NOT NULL CHECK (tipo_calculadora IN ('shopee', 'mercado_livre')),
    dados_calculo JSONB NOT NULL,
    foto_url TEXT,
    comentario TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_saved_ads_user_id ON saved_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_ads_tipo_calculadora ON saved_ads(tipo_calculadora);
CREATE INDEX IF NOT EXISTS idx_saved_ads_created_at ON saved_ads(created_at);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_ads_updated_at 
    BEFORE UPDATE ON saved_ads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE saved_ads ENABLE ROW LEVEL SECURITY;

-- Política para que usuários só vejam seus próprios anúncios
CREATE POLICY "Users can view their own saved ads" ON saved_ads
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que usuários só possam inserir anúncios para si mesmos
CREATE POLICY "Users can insert their own saved ads" ON saved_ads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que usuários só possam atualizar seus próprios anúncios
CREATE POLICY "Users can update their own saved ads" ON saved_ads
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para que usuários só possam deletar seus próprios anúncios
CREATE POLICY "Users can delete their own saved ads" ON saved_ads
    FOR DELETE USING (auth.uid() = user_id);
