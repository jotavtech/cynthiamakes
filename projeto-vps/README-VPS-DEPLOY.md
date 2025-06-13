# 🚀 Deploy Rápido VPS Hostinger

## ⚡ Resumo Executivo

Você tem **3 arquivos principais** criados:

1. **`DEPLOY-BACKEND-VPS-HOSTINGER.md`** - Guia completo detalhado
2. **`deploy-vps.sh`** - Script automatizado
3. **`ecosystem.config.js`** - Configuração PM2

## 🏃‍♂️ Deploy em 5 Passos Rápidos

### 1. Preparar arquivos localmente
```bash
npm run deploy:vps
```

### 2. Enviar para VPS
```bash
scp projeto-vps.tar.gz root@SEU_IP_VPS:/var/www/cynthiamakes/
```

### 3. Conectar na VPS e configurar
```bash
ssh root@SEU_IP_VPS
cd /var/www/cynthiamakes
tar -xzf projeto-vps.tar.gz
cp .env.example .env
nano .env  # Configure DATABASE_URL e SESSION_SECRET
```

### 4. Instalar Node.js na VPS (primeira vez)
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Instalar PM2
npm install -g pm2

# Instalar Nginx
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

### 5. Deploy da aplicação
```bash
./deploy-server.sh
```

## 🌐 Configurar Nginx (Só uma vez)

```bash
nano /etc/nginx/sites-available/cynthiamakes
```

Copie esta configuração:
```nginx
server {
    listen 80;
    server_name SEU_DOMINIO.com www.SEU_DOMINIO.com;

    location / {
        root /var/www/cynthiamakes/dist/public;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
ln -s /etc/nginx/sites-available/cynthiamakes /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## ✅ Verificar se funcionou

1. **Backend**: `pm2 status` - deve mostrar "online"
2. **Frontend**: Acesse seu domínio - deve carregar
3. **API**: Teste uma rota da API

## 🔄 Para futuras atualizações

```bash
# No seu computador
npm run deploy:vps
scp projeto-vps.tar.gz root@SEU_IP_VPS:/var/www/cynthiamakes/

# Na VPS
ssh root@SEU_IP_VPS
cd /var/www/cynthiamakes
tar -xzf projeto-vps.tar.gz
./deploy-server.sh
```

---

**🎯 Com isso seu backend Node.js + frontend estará 100% funcional na VPS!** 