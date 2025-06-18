# 🚀 DEPLOY BACKEND NO VERCEL - Cynthiamakes

## 🎯 OBJETIVO
Fazer deploy completo do backend (Node.js + Express) no Vercel para ter todas as funcionalidades funcionando.

## ✅ VANTAGENS DO VERCEL
- ✅ Suporte completo a Node.js
- ✅ PostgreSQL integrado
- ✅ Deploy automático via GitHub
- ✅ SSL gratuito
- ✅ CDN global
- ✅ Backend + Frontend no mesmo lugar

---

## 📋 PRÉ-REQUISITOS

1. **Conta no GitHub** (gratuita)
2. **Conta no Vercel** (gratuita)
3. **Projeto no GitHub** (já tem)
4. **Banco PostgreSQL** (Neon, Supabase, etc.)

---

## 🔧 PASSO 1: Preparar o Projeto

### 1.1 Verificar estrutura do projeto
Seu projeto já está configurado corretamente:
- ✅ `vercel.json` configurado
- ✅ `server/index.ts` como entry point
- ✅ Scripts de build configurados

### 1.2 Verificar variáveis de ambiente
Você precisará configurar estas variáveis no Vercel:

```env
# Banco de dados
DATABASE_URL=sua_url_do_postgresql

# Cloudinary (para upload de imagens)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret

# JWT Secret
JWT_SECRET=seu_jwt_secret_super_seguro

# Outras configurações
NODE_ENV=production
```

---

## 🌐 PASSO 2: Configurar Banco de Dados

### 2.1 Escolher provedor PostgreSQL

**Opção 1: Neon (Recomendado - Gratuito)**
1. Acesse: https://neon.tech
2. Crie conta gratuita
3. Crie novo projeto
4. Copie a URL de conexão

**Opção 2: Supabase (Alternativa)**
1. Acesse: https://supabase.com
2. Crie conta gratuita
3. Crie novo projeto
4. Vá em Settings > Database
5. Copie a connection string

### 2.2 Configurar banco
```bash
# No terminal, na pasta do projeto
npm run db:push
```

---

## 📤 PASSO 3: Deploy no Vercel

### 3.1 Conectar GitHub ao Vercel
1. Acesse: https://vercel.com
2. Clique em **"Sign Up"** (se não tiver conta)
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar seus repositórios

### 3.2 Importar projeto
1. No dashboard do Vercel, clique em **"New Project"**
2. Escolha **"Import Git Repository"**
3. Selecione seu repositório `cynthiamakes`
4. Clique em **"Import"**

### 3.3 Configurar projeto
Na tela de configuração:

**Framework Preset:** `Other`
**Root Directory:** `./` (deixe vazio)
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### 3.4 Configurar variáveis de ambiente
Na seção **"Environment Variables"**, adicione:

```
DATABASE_URL=sua_url_do_postgresql
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
JWT_SECRET=seu_jwt_secret_super_seguro
NODE_ENV=production
```

### 3.5 Fazer deploy
1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. Anote a URL gerada (ex: `https://cynthiamakes-abc123.vercel.app`)

---

## 🔧 PASSO 4: Configurar Domínio Personalizado

### 4.1 Adicionar domínio
1. No dashboard do Vercel, vá em **"Settings"**
2. Clique em **"Domains"**
3. Adicione: `cynthiamakes1.com.br`
4. Siga as instruções para configurar DNS

### 4.2 Configurar DNS
No seu provedor de domínio, adicione estes registros:

```
Tipo: CNAME
Nome: @
Valor: cname.vercel-dns.com

Tipo: CNAME  
Nome: www
Valor: cname.vercel-dns.com
```

---

## 🔄 PASSO 5: Configurar Deploy Automático

### 5.1 Configurar GitHub
O Vercel já está conectado ao GitHub e fará deploy automático quando você fizer push.

### 5.2 Testar deploy automático
```bash
# Faça uma pequena alteração no código
git add .
git commit -m "Teste deploy automático"
git push origin main
```

O Vercel detectará automaticamente e fará novo deploy.

---

## 🧪 PASSO 6: Testar Funcionalidades

### 6.1 Testar APIs
Acesse: `https://cynthiamakes1.com.br/api/`

Endpoints para testar:
- `GET /api/products` - Lista produtos
- `GET /api/categories` - Lista categorias
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro

### 6.2 Testar frontend
- Acesse: `https://cynthiamakes1.com.br`
- Teste navegação
- Teste funcionalidades que dependem do backend

---

## 🔧 PASSO 7: Configurar Frontend para Produção

### 7.1 Atualizar URLs da API
No frontend, certifique-se que as URLs da API apontam para o domínio correto:

```typescript
// Em client/src/lib/api.ts ou similar
const API_BASE_URL = 'https://cynthiamakes1.com.br/api';
```

### 7.2 Atualizar CORS no backend
No `server/index.ts`, verifique se o CORS está configurado:

```typescript
app.use(cors({
  origin: ['https://cynthiamakes1.com.br', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

---

## 📊 PASSO 8: Monitoramento

### 8.1 Logs do Vercel
1. No dashboard do Vercel, vá em **"Functions"**
2. Clique em uma função para ver logs
3. Monitore erros e performance

### 8.2 Analytics
1. Vá em **"Analytics"** no dashboard
2. Monitore tráfego e performance
3. Configure alertas se necessário

---

## 🔧 PASSO 9: Otimizações

### 9.1 Configurar cache
No `vercel.json`, adicione:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300"
        }
      ]
    }
  ]
}
```

### 9.2 Configurar rate limiting
Para APIs sensíveis, considere rate limiting:

```typescript
// No server/index.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite por IP
});

app.use('/api/', limiter);
```

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### Problema: Build falha
**Solução:**
1. Verifique logs no Vercel
2. Teste build local: `npm run build`
3. Verifique dependências no `package.json`

### Problema: APIs não funcionam
**Solução:**
1. Verifique variáveis de ambiente
2. Teste conexão com banco
3. Verifique logs das funções

### Problema: CORS errors
**Solução:**
1. Verifique configuração CORS no backend
2. Confirme domínio na lista de origins
3. Teste com Postman/Insomnia

### Problema: Banco não conecta
**Solução:**
1. Verifique `DATABASE_URL`
2. Teste conexão local
3. Verifique se banco está ativo

---

## 📈 PRÓXIMOS PASSOS

### 9.1 Configurar CI/CD
- GitHub Actions para testes
- Deploy automático em staging
- Deploy manual em produção

### 9.2 Backup automático
- Configurar backup do banco
- Backup de arquivos no Cloudinary
- Documentação de recuperação

### 9.3 Monitoramento avançado
- Sentry para erros
- Uptime monitoring
- Performance monitoring

---

## 🎉 RESULTADO FINAL

Após seguir todos os passos, você terá:

✅ **Backend funcionando** com todas as APIs
✅ **Frontend integrado** com backend
✅ **Banco PostgreSQL** configurado
✅ **Deploy automático** via GitHub
✅ **SSL gratuito** e CDN global
✅ **Domínio personalizado** funcionando
✅ **Monitoramento** e logs

**URL final:** `https://cynthiamakes1.com.br`

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique logs no Vercel
2. Teste APIs individualmente
3. Verifique configuração do banco
4. Consulte documentação do Vercel

**Lembre-se:** O Vercel oferece suporte gratuito e documentação extensa! 