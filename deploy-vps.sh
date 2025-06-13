#!/bin/bash

echo "🚀 Iniciando deploy para VPS Hostinger..."

# Verificar se estamos na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto!"
    exit 1
fi

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Preparando arquivos para VPS...${NC}"

# Criar diretório temporário para deploy
DEPLOY_DIR="vps-deploy"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

# Copiar arquivos necessários (excluindo node_modules, .git, etc)
echo -e "${YELLOW}📦 Copiando arquivos do projeto...${NC}"
rsync -av \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=hostinger-deploy \
  --exclude=$DEPLOY_DIR \
  --exclude=.env \
  . $DEPLOY_DIR/

# Copiar configurações específicas da VPS
cp ecosystem.config.js $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/

# Criar arquivo .env.example para VPS
cat > $DEPLOY_DIR/.env.example << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://cynthiamakes_db_owner:npg_VgFRy2l9WfML@ep-fragrant-mouse-a80l7k9h-pooler.eastus2.azure.neon.tech/cynthiamakes_db?sslmode=require
SESSION_SECRET=sua-chave-secreta-super-segura-aqui-production
EOF

# Criar script de deploy para usar na VPS
cat > $DEPLOY_DIR/deploy-server.sh << 'EOF'
#!/bin/bash
echo "🚀 Executando deploy na VPS..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🔨 Fazendo build..."
npm run build

# Configurar PM2 se ainda não estiver rodando
if ! pm2 describe cynthiamakes-backend > /dev/null 2>&1; then
    echo "🚀 Iniciando aplicação com PM2..."
    pm2 start ecosystem.config.js --env production
    pm2 save
else
    echo "🔄 Reiniciando aplicação..."
    pm2 restart cynthiamakes-backend
fi

echo "✅ Deploy concluído!"
echo "📊 Status da aplicação:"
pm2 status
EOF

chmod +x $DEPLOY_DIR/deploy-server.sh

# Comprimir arquivos
echo -e "${YELLOW}📦 Comprimindo arquivos...${NC}"
cd $DEPLOY_DIR
tar -czf ../projeto-vps.tar.gz .
cd ..

echo -e "${GREEN}✅ Arquivos preparados com sucesso!${NC}"
echo ""
echo -e "${YELLOW}📤 Agora execute os seguintes comandos:${NC}"
echo ""
echo "1. Enviar arquivos para VPS:"
echo -e "${GREEN}   scp projeto-vps.tar.gz usuario@SEU_IP_VPS:/var/www/cynthiamakes/${NC}"
echo ""
echo "2. Na VPS, executar:"
echo -e "${GREEN}   ssh usuario@SEU_IP_VPS${NC}"
echo -e "${GREEN}   cd /var/www/cynthiamakes${NC}"
echo -e "${GREEN}   tar -xzf projeto-vps.tar.gz${NC}"
echo -e "${GREEN}   cp .env.example .env${NC}"
echo -e "${GREEN}   nano .env  # Configure as variáveis${NC}"
echo -e "${GREEN}   ./deploy-server.sh${NC}"
echo ""
echo -e "${YELLOW}📋 Depois configure o Nginx conforme o guia!${NC}"

# Limpar diretório temporário
rm -rf $DEPLOY_DIR

echo -e "${GREEN}🎯 Preparação concluída!${NC}" 