-- ====================================================================
-- BANCO DE DADOS CYNTHIAMAKES - ESTRUTURA COMPLETA
-- ====================================================================
-- Arquivo: database-complete.sql
-- Descrição: Estrutura completa do banco de dados para loja de cosméticos
-- Data: $(date)
-- Versão: 1.0
-- ====================================================================

-- Limpar banco (CUIDADO: Remove todas as tabelas)
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS inventory_transactions CASCADE;
-- DROP TABLE IF EXISTS cart_items CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS brands CASCADE;
-- DROP TABLE IF EXISTS product_categories CASCADE;
-- DROP TABLE IF EXISTS session CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ====================================================================
-- 1. TABELA DE USUÁRIOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS "users" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"username" TEXT NOT NULL UNIQUE,
	"password" TEXT NOT NULL,
	"is_admin" BOOLEAN DEFAULT false NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

-- ====================================================================
-- 2. TABELA DE SESSÕES (express-session)
-- ====================================================================
CREATE TABLE IF NOT EXISTS "session" (
	"sid" TEXT PRIMARY KEY NOT NULL,
	"sess" TEXT NOT NULL,
	"expire" TIMESTAMP NOT NULL
);

-- ====================================================================
-- 3. TABELA DE CATEGORIAS DE PRODUTOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS "product_categories" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"name" TEXT NOT NULL,
	"description" TEXT NOT NULL,
	"image_url" TEXT NOT NULL,
	"slug" TEXT NOT NULL UNIQUE,
	"is_active" BOOLEAN DEFAULT true NOT NULL,
	"created_at" TIMESTAMP DEFAULT now() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT now() NOT NULL,
	CONSTRAINT "product_categories_slug_unique" UNIQUE("slug")
);

-- ====================================================================
-- 4. TABELA DE MARCAS
-- ====================================================================
CREATE TABLE IF NOT EXISTS "brands" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"name" TEXT NOT NULL UNIQUE,
	"description" TEXT DEFAULT '' NOT NULL,
	"image_url" TEXT DEFAULT '',
	"is_active" BOOLEAN DEFAULT true NOT NULL,
	"created_at" TIMESTAMP DEFAULT now() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT now() NOT NULL,
	CONSTRAINT "brands_name_unique" UNIQUE("name")
);

-- ====================================================================
-- 5. TABELA DE PRODUTOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS "products" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"name" TEXT NOT NULL,
	"description" TEXT NOT NULL,
	"price" INTEGER NOT NULL,
	"category" TEXT NOT NULL,
	"brand" TEXT NOT NULL,
	"image_url" TEXT DEFAULT 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Produto' NOT NULL,
	"video_url" TEXT DEFAULT '' NOT NULL,
	"is_new" BOOLEAN DEFAULT false NOT NULL,
	"is_featured" BOOLEAN DEFAULT false NOT NULL,
	"stock" INTEGER DEFAULT 0 NOT NULL,
	"low_stock_threshold" INTEGER DEFAULT 5 NOT NULL,
	"sku" TEXT DEFAULT '' NOT NULL,
	"created_at" TIMESTAMP DEFAULT now() NOT NULL
);

-- ====================================================================
-- 6. TABELA DE ITENS DO CARRINHO
-- ====================================================================
CREATE TABLE IF NOT EXISTS "cart_items" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"product_id" INTEGER NOT NULL,
	"quantity" INTEGER NOT NULL,
	"session_id" TEXT NOT NULL
);

-- ====================================================================
-- 7. TABELA DE TRANSAÇÕES DE INVENTÁRIO
-- ====================================================================
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"product_id" INTEGER NOT NULL,
	"quantity" INTEGER NOT NULL,
	"type" TEXT NOT NULL,
	"notes" TEXT DEFAULT '',
	"created_by" INTEGER NOT NULL,
	"created_at" TIMESTAMP DEFAULT now() NOT NULL
);

-- ====================================================================
-- 8. TABELA DE LOGS DE AUDITORIA
-- ====================================================================
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"table_name" TEXT NOT NULL,
	"record_id" INTEGER NOT NULL,
	"action" TEXT NOT NULL,
	"old_data" JSONB,
	"new_data" JSONB,
	"user_id" INTEGER NOT NULL,
	"description" TEXT DEFAULT '',
	"created_at" TIMESTAMP DEFAULT now() NOT NULL
);

-- ====================================================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);

-- ====================================================================
-- DADOS INICIAIS
-- ====================================================================

-- Inserir usuário administrador
-- Senha: @admincynthiaemaik (será hasheada pela aplicação)
INSERT INTO "users" ("username", "password", "is_admin") 
VALUES ('admincynthia', '$2b$10$hashedpasswordhere', true)
ON CONFLICT (username) DO NOTHING;

-- Inserir categorias padrão
INSERT INTO "product_categories" ("name", "description", "image_url", "slug", "is_active") VALUES
('Rosto', 'Bases, corretivos e mais', 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80', 'face', true),
('Olhos', 'Sombras, delineadores e máscaras', 'https://pixabay.com/get/g9161a855dd5bbc4d37d4bef8d8a233cf29275ef3fd43a5e9404df7fa5be341196aa9600f3ab509dd6750af15ebcbc3b3_1280.jpg', 'eyes', true),
('Lábios', 'Batons, glosses e lápis', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80', 'lips', true),
('Perfumaria', 'Perfumes, colônias e fragrâncias', 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80', 'perfumery', true),
('Acessórios', 'Pincéis, esponjas e mais', 'https://images.unsplash.com/photo-1567721913486-6585f069b332?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80', 'accessories', true)
ON CONFLICT (slug) DO NOTHING;

-- Inserir marcas padrão
INSERT INTO "brands" ("name", "description", "is_active") VALUES
('Marca Premium', 'Cosméticos de alta qualidade', true),
('Natura', 'Beleza natural brasileira', true),
('O Boticário', 'Fragrâncias e cosméticos', true),
('Avon', 'Beleza que faz sentido', true),
('Maybelline', 'Make it happen', true),
('L''Oréal', 'Porque você vale muito', true),
('Revlon', 'Live boldly', true),
('MAC', 'All ages, all races, all genders', true)
ON CONFLICT (name) DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO "products" (
    "name", "description", "price", "category", "brand", 
    "image_url", "is_new", "is_featured", "stock", "sku"
) VALUES
('Base Líquida Hidratante', 'Base de cobertura natural com proteção solar, ideal para uso diário.', 4500, 'face', 'Marca Premium', 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80', false, true, 25, 'BASE-001'),

('Batom Cremoso Rosa', 'Batom cremoso de longa duração com acabamento acetinado.', 2800, 'lips', 'Maybelline', 'https://pixabay.com/get/gaf98a7f448dc320934892b79c7238885f0a1289f295b5a29ec26c6563e5d403dd2f8ea00be4927a4034d22c34941048fb9c5f62ee56ae9a4b99aadd1c7eb7129_1280.jpg', true, true, 15, 'BATOM-001'),

('Paleta de Sombras Nude', 'Paleta com 12 tons neutros para looks do dia a dia.', 6900, 'eyes', 'L''Oréal', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80', true, false, 18, 'SOMBRA-001'),

('Perfume Floral Feminino', 'Fragrância delicada com notas florais e frutais.', 12900, 'perfumery', 'Natura', 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80', false, true, 8, 'PERFUME-001'),

('Kit de Pincéis Profissionais', 'Conjunto com 10 pincéis para maquiagem completa.', 8500, 'accessories', 'Marca Premium', 'https://images.unsplash.com/photo-1567721913486-6585f069b332?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80', false, false, 12, 'PINCEL-001'),

('Corretivo Líquido', 'Corretivo de alta cobertura para olheiras e imperfeições.', 3200, 'face', 'MAC', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80', false, false, 20, 'CORRETIVO-001'),

('Máscara para Cílios Volume', 'Máscara que proporciona volume e definição aos cílios.', 3500, 'eyes', 'Maybelline', 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80', true, false, 22, 'MASCARA-001'),

('Gloss Labial Hidratante', 'Gloss com brilho intenso e hidratação prolongada.', 1800, 'lips', 'Revlon', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80', false, false, 30, 'GLOSS-001'),

('Água Micelar', 'Demaquilante suave que remove toda maquiagem sem agredir a pele.', 2200, 'face', 'L''Oréal', 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80', false, true, 35, 'MICELAR-001'),

('Primer Facial', 'Primer que prepara a pele para uma maquiagem duradoura.', 3800, 'face', 'MAC', 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80', true, false, 16, 'PRIMER-001')

ON CONFLICT DO NOTHING;

-- ====================================================================
-- FUNCTIONS E TRIGGERS (OPCIONAL)
-- ====================================================================

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para product_categories
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
CREATE TRIGGER update_product_categories_updated_at
    BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para brands
DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at
    BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- VIEWS ÚTEIS
-- ====================================================================

-- View para produtos com informações formatadas
CREATE OR REPLACE VIEW products_formatted AS
SELECT 
    p.*,
    CONCAT('R$ ', ROUND(p.price / 100.0, 2)) as formatted_price,
    CASE 
        WHEN p.stock = 0 THEN 'out_of_stock'
        WHEN p.stock <= p.low_stock_threshold THEN 'low_stock'
        ELSE 'in_stock'
    END as stock_status,
    c.name as category_name,
    c.description as category_description
FROM products p
LEFT JOIN product_categories c ON p.category = c.slug;

-- View para estatísticas do inventário
CREATE OR REPLACE VIEW inventory_stats AS
SELECT 
    COUNT(*) as total_products,
    SUM(stock) as total_stock,
    COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock_count,
    COUNT(CASE WHEN stock <= low_stock_threshold THEN 1 END) as low_stock_count,
    ROUND(AVG(price / 100.0), 2) as avg_price,
    SUM(price * stock / 100.0) as total_inventory_value
FROM products;

-- ====================================================================
-- PERMISSÕES (OPCIONAL)
-- ====================================================================

-- Criar usuário da aplicação (substitua pela senha real)
-- CREATE USER cynthiamakes_app WITH PASSWORD 'sua_senha_segura_aqui';

-- Conceder permissões
-- GRANT CONNECT ON DATABASE cynthiamakes_db TO cynthiamakes_app;
-- GRANT USAGE ON SCHEMA public TO cynthiamakes_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cynthiamakes_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cynthiamakes_app;

-- ====================================================================
-- INFORMAÇÕES DO BANCO
-- ====================================================================

-- Verificar estrutura criada
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar índices criados
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ====================================================================
-- FIM DO SCRIPT
-- ====================================================================

-- Exibir mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados Cynthiamakes criado com sucesso!';
    RAISE NOTICE 'Tabelas: users, session, product_categories, brands, products, cart_items, inventory_transactions, audit_logs';
    RAISE NOTICE 'Views: products_formatted, inventory_stats';
    RAISE NOTICE 'Total de registros inseridos:';
    RAISE NOTICE '- Categorias: 5';
    RAISE NOTICE '- Marcas: 8';
    RAISE NOTICE '- Produtos: 10';
END $$; 