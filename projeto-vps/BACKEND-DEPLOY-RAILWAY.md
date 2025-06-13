# 🚂 Deploy do Backend no Railway

## Por que Railway?
- ✅ **Gratuito** para projetos pequenos
- ✅ **Suporte nativo ao Node.js**
- ✅ **Deploy automático via GitHub**
- ✅ **Banco PostgreSQL incluído**
- ✅ **SSL automático**

## 🔧 Passos para Deploy

### 1. Prepare o Backend
```bash
# Na raiz do projeto, crie arquivo railway.json
echo '{"build": {"command": "npm install && npm run build"}, "start": {"command": "npm run start"}}' > railway.json
```

### 2. Configure Variáveis de Ambiente
O Railway vai precisar das seguintes variáveis:
- `DATABASE_URL` - String de conexão do PostgreSQL (que você já tem)
- `NODE_ENV=production`
- `PORT=3000` (Railway define automaticamente)

### 3. Subir para GitHub
```bash
# Se não tem git configurado ainda:
git init
git add .
git commit -m "Initial commit"

# Criar repositório no GitHub e conectar:
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git branch -M main
git push -u origin main
```

### 4. Deploy no Railway
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique "New Project" → "Deploy from GitHub repo"
4. Selecione seu repositório
5. Configure as variáveis de ambiente:
   - `DATABASE_URL`: postgresql://cynthiamakes_db_owner:npg_VgFRy2l9WfML@ep-fragrant-mouse-a80l7k9h-pooler.eastus2.azure.neon.tech/cynthiamakes_db?sslmode=require
   - `NODE_ENV`: production

### 5. Obter URL do Backend
Após deploy, você receberá uma URL tipo:
`https://seu-projeto-production.up.railway.app`

## 🔗 Conectar Frontend ao Backend

### Atualize o Frontend
No seu código React, mude as URLs da API de:
```javascript
// ❌ Antes (localhost)
fetch('/api/endpoint')

// ✅ Depois (Railway)
fetch('https://seu-projeto-production.up.railway.app/api/endpoint')
```

### Ou use variáveis de ambiente:
```javascript
// No frontend, crie VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
fetch(`${API_URL}/api/endpoint`)
```

## 📦 Atualizar Deploy da Hostinger

Depois de configurar o backend:
1. Atualize o código do frontend com as novas URLs
2. Execute: `npm run deploy:prepare`
3. Faça upload dos novos arquivos da pasta `hostinger-deploy/`

## ✅ Resultado Final
- **Frontend**: Hostinger (rápido e barato)
- **Backend**: Railway (gratuito e confiável)
- **Banco**: Neon PostgreSQL (que você já tem configurado)

## 🔧 Scripts Adicionais para Package.json
```json
{
  "scripts": {
    "railway:deploy": "railway up",
    "railway:logs": "railway logs",
    "railway:env": "railway variables"
  }
}
```

---
**🎯 Esta é a solução mais recomendada para seu caso!** 