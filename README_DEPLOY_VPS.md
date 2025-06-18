# 🚀 Deploy Backend Node.js na VPS Hostinger

Este guia ensina como subir seu backend Node.js (Express + PostgreSQL) em uma VPS da Hostinger, com dicas de segurança, automação e produção.

---

## 1️⃣ Pré-requisitos

- Acesso SSH à VPS (usuário, IP, senha ou chave)
- Node.js 18+ ou 20+ instalado na VPS
- Git instalado na VPS
- Banco de dados PostgreSQL (externo ou na VPS)
- Variáveis de ambiente do projeto

---

## 2️⃣ Acessar a VPS via SSH

```bash
ssh seu_usuario@SEU_IP_DA_VPS
# Exemplo:
# ssh root@123.123.123.123
```

---

## 3️⃣ Instalar Node.js, npm e Git

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "Node.js versão: $(node -v)"
echo "npm versão: $(npm -v)"
sudo apt install -y git
```

---

## 4️⃣ Clonar o Projeto na VPS

```bash
cd ~
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
```

---

## 5️⃣ Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=sua_url_postgresql
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
JWT_SECRET=seu_jwt_secret
NODE_ENV=production
```

---

## 6️⃣ Instalar Dependências e Buildar

```bash
npm install
npm run build
```

---

## 7️⃣ Rodar o Backend

### Teste manual:
```bash
node dist/index.js
```
Acesse: `http://SEU_IP_DA_VPS:5000/api/products`

---

## 8️⃣ Rodar em Produção com PM2

```bash
sudo npm install -g pm2
pm2 start dist/index.js --name cynthiamakes
pm2 startup
pm2 save
```

---

## 9️⃣ Liberar Porta no Firewall (UFW)

```bash
sudo ufw allow 5000
sudo ufw enable
```

---

## 🔒 10️⃣ Configurar NGINX como Proxy Reverso (recomendado)

1. Instale o NGINX:
   ```bash
   sudo apt install -y nginx
   ```
2. Configure o proxy:
   ```bash
   sudo nano /etc/nginx/sites-available/cynthiamakes
   ```
   Exemplo:
   ```nginx
   server {
       listen 80;
       server_name cynthiamakes1.com.br www.cynthiamakes1.com.br;

       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
3. Ative o site e reinicie o NGINX:
   ```bash
   sudo ln -s /etc/nginx/sites-available/cynthiamakes /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
4. (Opcional) Instale SSL grátis com Certbot:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d cynthiamakes1.com.br -d www.cynthiamakes1.com.br
   ```

---

## 1️⃣1️⃣ Acesso pelo Navegador

- `http://SEU_IP_DA_VPS:5000/api/products` (direto)
- `https://cynthiamakes1.com.br/api/products` (via domínio + NGINX + SSL)

---

## 1️⃣2️⃣ Atualizar o Projeto no Futuro

```bash
cd ~/SEU_REPOSITORIO
git pull
npm install
npm run build
pm2 restart cynthiamakes
```

---

## 1️⃣3️⃣ Monitorar Logs

```bash
pm2 logs cynthiamakes
```

---

# 🟢 Pronto! Seu backend estará rodando 24/7 na VPS Hostinger.

Se precisar de um passo a passo para o frontend, deploy automático ou dúvidas, é só pedir! 