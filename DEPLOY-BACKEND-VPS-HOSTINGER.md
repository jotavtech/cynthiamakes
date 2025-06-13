# 🚀 Deploy Backend Node.js na VPS Hostinger

## 📋 Pré-requisitos
- ✅ VPS Hostinger ativa
- ✅ Acesso SSH à VPS
- ✅ Seu projeto Node.js local

## 🔧 Passo 1: Conectar à VPS via SSH

```bash
# Conectar via SSH (substitua pelos seus dados)
ssh root@SEU_IP_DA_VPS
# ou
ssh usuario@SEU_IP_DA_VPS
```

## 🛠️ Passo 2: Instalar Node.js na VPS

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (versão LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

## 📦 Passo 3: Instalar PM2 (Gerenciador de Processos)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalação
pm2 --version
```

## 🌐 Passo 4: Instalar e Configurar Nginx

```bash
# Instalar Nginx
sudo apt install nginx -y

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

## 📁 Passo 5: Preparar Diretório do Projeto

```bash
# Criar diretório para aplicação
sudo mkdir -p /var/www/cynthiamakes
sudo chown -R $USER:$USER /var/www/cynthiamakes
cd /var/www/cynthiamakes
```

## 📤 Passo 6: Enviar Projeto para VPS

### Opção A: Via Git (Recomendado)
```bash
# Na VPS, clonar repositório
git clone https://github.com/SEU_USUARIO/SEU_REPO.git .

# Ou se já tem o projeto localmente, use rsync:
# No seu computador local:
rsync -avz --exclude node_modules --exclude .git . usuario@SEU_IP:/var/www/cynthiamakes/
```

### Opção B: Via SCP (do seu computador local)
```bash
# Comprimir projeto (sem node_modules)
tar --exclude=node_modules --exclude=.git -czf projeto.tar.gz .

# Enviar para VPS
scp projeto.tar.gz usuario@SEU_IP:/var/www/cynthiamakes/

# Na VPS, extrair
cd /var/www/cynthiamakes
tar -xzf projeto.tar.gz
rm projeto.tar.gz
```

## ⚙️ Passo 7: Configurar Projeto na VPS

```bash
# Ir para diretório do projeto
cd /var/www/cynthiamakes

# Instalar dependências
npm install

# Criar arquivo .env na VPS
nano .env
```

### Conteúdo do .env na VPS:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://cynthiamakes_db_owner:npg_VgFRy2l9WfML@ep-fragrant-mouse-a80l7k9h-pooler.eastus2.azure.neon.tech/cynthiamakes_db?sslmode=require
SESSION_SECRET=sua-chave-secreta-super-segura-aqui-production
```

## 🔨 Passo 8: Build do Projeto

```bash
# Fazer build do projeto
npm run build

# Testar se roda
npm run start
# Ctrl+C para parar
```

## 🚀 Passo 9: Configurar PM2

```bash
# Criar arquivo de configuração PM2
nano ecosystem.config.js
```

### Conteúdo do ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'cynthiamakes-backend',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

```bash
# Iniciar aplicação com PM2
pm2 start ecosystem.config.js --env production

# Verificar status
pm2 status
pm2 logs

# Salvar configuração PM2
pm2 save
pm2 startup
```

## 🌐 Passo 10: Configurar Nginx como Proxy Reverso

```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/cynthiamakes
```

### Conteúdo da configuração Nginx:
```nginx
server {
    listen 80;
    server_name SEU_DOMINIO.com www.SEU_DOMINIO.com;

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
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/cynthiamakes /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔒 Passo 11: Configurar SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Criar link simbólico
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Obter certificado SSL
sudo certbot --nginx -d SEU_DOMINIO.com -d www.SEU_DOMINIO.com
```

## 🔄 Passo 12: Script de Atualização

Crie um script para facilitar atualizações:

```bash
# Criar script de deploy
nano deploy.sh
```

### Conteúdo do deploy.sh:
```bash
#!/bin/bash
echo "🚀 Iniciando deploy..."

# Pull das mudanças
git pull origin main

# Instalar dependências
npm install

# Build do projeto
npm run build

# Reiniciar PM2
pm2 restart cynthiamakes-backend

echo "✅ Deploy concluído!"
```

```bash
# Tornar executável
chmod +x deploy.sh
```

## 📊 Passo 13: Comandos Úteis

```bash
# Ver logs do backend
pm2 logs cynthiamakes-backend

# Restart da aplicação
pm2 restart cynthiamakes-backend

# Status dos processos
pm2 status

# Monitorar recursos
pm2 monit

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔥 Passo 14: Firewall (Segurança)

```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Verificar status
sudo ufw status
```

## ✅ Resultado Final

Após seguir todos os passos:
- ✅ **Frontend**: Servido pelo Nginx
- ✅ **Backend**: Rodando com PM2 (Node.js)
- ✅ **Banco**: PostgreSQL Neon (já configurado)
- ✅ **SSL**: Certificado automático
- ✅ **Domínio**: Apontado para sua VPS

## 🔧 Para Atualizações Futuras

```bash
# Conectar à VPS
ssh usuario@SEU_IP

# Ir para diretório
cd /var/www/cynthiamakes

# Executar script de deploy
./deploy.sh
```

---

**🎯 Com isso seu backend Node.js estará rodando perfeitamente na VPS Hostinger!** 