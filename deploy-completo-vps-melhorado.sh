#!/bin/bash

echo "🚀 DEPLOY AUTOMÁTICO - CYNTHIAMAKES VPS HOSTINGER (VERSÃO MELHORADA)"
echo "======================================================================"
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
    error "Execute como root: sudo bash deploy-completo-vps-melhorado.sh"
    exit 1
fi

log "Iniciando deploy automático melhorado..."

# Criar pastas necessárias se não existirem
log "Verificando e criando pastas necessárias..."
mkdir -p /tmp
mkdir -p /var/www
mkdir -p /home/uploads
chmod 755 /tmp /var/www /home/uploads

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

# Passo 7: Buscar arquivo do projeto (localizações expandidas)
log "Passo 7/10: Procurando arquivo do projeto..."
PROJECT_FILE=""

# Procurar em várias localizações possíveis (incluindo pasta atual)
LOCATIONS=(
    "/tmp/projeto-vps.tar.gz"
    "/home/root/projeto-vps.tar.gz" 
    "/root/projeto-vps.tar.gz"
    "/var/www/projeto-vps.tar.gz"
    "/home/uploads/projeto-vps.tar.gz"
    "./projeto-vps.tar.gz"
    "$(pwd)/projeto-vps.tar.gz"
)

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
    echo ""
    warning "Ou coloque o arquivo na pasta atual: $(pwd)"
    echo ""
    info "ALTERNATIVAS para upload:"
    echo "1. Via FileZilla: Upload para /root/ ou /home/root/"
    echo "2. Via painel Hostinger: Upload para qualquer pasta acessível"
    echo "3. Via terminal: Use 'wget' ou 'curl' se tiver URL do arquivo"
    echo ""
    read -p "Pressione Enter para continuar procurando ou Ctrl+C para sair..."
    exit 1
fi

# Passo 8: Extrair projeto
log "Passo 8/10: Extraindo projeto..."
cp "$PROJECT_FILE" /var/www/cynthiamakes/
cd /var/www/cynthiamakes
tar -xzf projeto-vps.tar.gz

# Verificar se extração foi bem-sucedida
if [ ! -f "package.json" ]; then
    error "Erro na extração do arquivo. Verificando conteúdo..."
    ls -la
    exit 1
fi

log "Projeto extraído com sucesso!"

# Passo 9: Configurar ambiente
log "Passo 9/10: Configurando ambiente..."
if [ -f ".env.example" ]; then
    cp .env.example .env
fi

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

# Verificar se script de deploy existe
if [ -f "deploy-server.sh" ]; then
    chmod +x deploy-server.sh
    ./deploy-server.sh
else
    warning "Script deploy-server.sh não encontrado. Fazendo deploy manual..."
    
    # Deploy manual
    log "Instalando dependências..."
    npm install
    
    log "Fazendo build..."
    npm run build
    
    log "Configurando PM2..."
    if ! pm2 describe cynthiamakes-backend > /dev/null 2>&1; then
        log "Iniciando aplicação com PM2..."
        pm2 start ecosystem.config.js --env production
        pm2 save
        pm2 startup
    else
        log "Reiniciando aplicação..."
        pm2 restart cynthiamakes-backend
    fi
fi

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
    nginx -t
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

# Informações de localização dos arquivos
info "📁 Localizações importantes:"
echo "  • Projeto: /var/www/cynthiamakes/"
echo "  • Logs PM2: ~/.pm2/logs/"
echo "  • Config Nginx: /etc/nginx/sites-available/cynthiamakes"
echo "  • Arquivo original: $PROJECT_FILE"
echo ""

log "Deploy automático finalizado! 🚀" 