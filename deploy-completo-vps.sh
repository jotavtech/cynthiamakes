#!/bin/bash

echo "🚀 DEPLOY AUTOMÁTICO - CYNTHIAMAKES VPS HOSTINGER"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    error "Execute como root: sudo bash deploy-completo-vps.sh"
    exit 1
fi

log "Iniciando deploy automático..."

# Passo 1: Atualizar sistema
log "Passo 1/10: Atualizando sistema Ubuntu..."
apt update -y
apt upgrade -y

# Passo 2: Instalar Node.js
log "Passo 2/10: Instalando Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Verificar instalação Node.js
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log "Node.js instalado: $NODE_VERSION"
log "NPM instalado: $NPM_VERSION"

# Passo 3: Instalar PM2
log "Passo 3/10: Instalando PM2..."
npm install -g pm2

# Passo 4: Instalar Nginx
log "Passo 4/10: Instalando Nginx..."
apt install nginx rsync -y
systemctl start nginx
systemctl enable nginx

# Passo 5: Configurar firewall
log "Passo 5/10: Configurando firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Passo 6: Criar diretório do projeto
log "Passo 6/10: Preparando diretório do projeto..."
mkdir -p /var/www/cynthiamakes
cd /var/www/cynthiamakes

# Passo 7: Buscar arquivo do projeto
log "Passo 7/10: Procurando arquivo do projeto..."
PROJECT_FILE=""

# Procurar em várias localizações possíveis
LOCATIONS=("/tmp/projeto-vps.tar.gz" "/home/root/projeto-vps.tar.gz" "/root/projeto-vps.tar.gz" "/var/www/projeto-vps.tar.gz")

for location in "${LOCATIONS[@]}"; do
    if [ -f "$location" ]; then
        PROJECT_FILE="$location"
        log "Arquivo encontrado em: $PROJECT_FILE"
        break
    fi
done

if [ -z "$PROJECT_FILE" ]; then
    error "Arquivo projeto-vps.tar.gz não encontrado!"
    warning "Faça upload do arquivo para uma dessas localizações:"
    for location in "${LOCATIONS[@]}"; do
        echo "  - $location"
    done
    exit 1
fi

# Passo 8: Extrair projeto
log "Passo 8/10: Extraindo projeto..."
cp "$PROJECT_FILE" /var/www/cynthiamakes/
cd /var/www/cynthiamakes
tar -xzf projeto-vps.tar.gz

# Passo 9: Configurar ambiente
log "Passo 9/10: Configurando ambiente..."
cp .env.example .env

# Criar arquivo .env automaticamente
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://cynthiamakes_db_owner:npg_VgFRy2l9WfML@ep-fragrant-mouse-a80l7k9h-pooler.eastus2.azure.neon.tech/cynthiamakes_db?sslmode=require
SESSION_SECRET=cynthiamakes-production-secret-key-2024-hostinger-vps
EOF

log "Arquivo .env criado automaticamente"

# Passo 10: Deploy da aplicação
log "Passo 10/10: Fazendo deploy da aplicação..."
chmod +x deploy-server.sh
./deploy-server.sh

# Configurar Nginx
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/cynthiamakes << 'EOF'
server {
    listen 80;
    server_name 31.97.160.140 srv860654.hstgr.cloud;

    # Frontend (arquivos estáticos)
    location / {
        root /var/www/cynthiamakes/dist/public;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Assets estáticos
    location /assets/ {
        root /var/www/cynthiamakes/dist/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/cynthiamakes /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
nginx -t
if [ $? -eq 0 ]; then
    systemctl restart nginx
    log "Nginx configurado e reiniciado com sucesso"
else
    error "Erro na configuração do Nginx"
    exit 1
fi

# Status final
echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================="
echo ""
info "Status dos serviços:"
echo ""

# Status PM2
log "Backend (PM2):"
pm2 status

echo ""

# Status Nginx
log "Frontend (Nginx):"
systemctl status nginx --no-pager -l

echo ""

# URLs de acesso
log "🌐 Aplicação disponível em:"
echo "  • http://31.97.160.140"
echo "  • http://srv860654.hstgr.cloud"
echo ""

# Comandos úteis
info "📋 Comandos úteis:"
echo "  • Ver logs backend: pm2 logs cynthiamakes-backend"
echo "  • Restart backend: pm2 restart cynthiamakes-backend"
echo "  • Status serviços: pm2 status && systemctl status nginx"
echo "  • Logs Nginx: tail -f /var/log/nginx/error.log"
echo ""

log "Deploy automático finalizado! 🚀" 