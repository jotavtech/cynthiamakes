# 🚀 Deploy Completo via FileZilla

## ⚠️ **ATENÇÃO IMPORTANTE**

A maioria das hospedagens acessadas via FileZilla **NÃO SUPORTAM Node.js**.
Se sua hospedagem não suporta Node.js, apenas o frontend funcionará.

## 🧪 **TESTE PRIMEIRO**

1. Faça upload apenas do arquivo `test_nodejs.php`
2. Acesse: `https://cynthiamakes1.com.br/test_nodejs.php`
3. Veja se Node.js está disponível

## 📁 **Arquivos para Upload Completo**

Se sua hospedagem suporta Node.js, faça upload de todos estes arquivos:

```
📁 public_html/
├── 📁 dist/ (pasta completa)
├── 📁 server/ (pasta completa)
├── 📁 shared/ (pasta completa)
├── 📄 package.json
├── 📄 .env (configure as variáveis!)
├── 📄 drizzle.config.ts
├── 📄 components.json
├── 📄 postcss.config.js
├── 📄 tailwind.config.ts
├── 📄 tsconfig.json
├── 📄 vite.config.ts
├── 📄 startup.sh
└── 📄 test_nodejs.php
```

## 🔧 **Configuração Obrigatória**

### **1. Arquivo .env**
Configure estas variáveis no arquivo `.env`:

```
DATABASE_URL="postgresql://user:pass@host:5432/database"
JWT_SECRET="sua_chave_secreta_aqui"
NODE_ENV="production"
PORT="5000"
VITE_CLOUDINARY_CLOUD_NAME="demo"
VITE_CLOUDINARY_UPLOAD_PRESET="ml_default"
```

### **2. Banco PostgreSQL**
Você precisa de um banco PostgreSQL. Opções:
- **Neon.tech** (grátis)
- **Railway** (grátis)
- **Supabase** (grátis)

## 🚀 **Inicialização no Servidor**

Via SSH (se disponível):
```bash
cd /caminho/para/site
chmod +x startup.sh
./startup.sh
```

Via painel de controle:
```bash
node dist/index.js
```

## ❌ **Se Não Funcionar**

**Problema comum:** Hospedagem compartilhada não suporta Node.js

**Soluções:**
1. **Vercel** (recomendado - grátis)
2. **Railway** (grátis)
3. **Render** (grátis)
4. **VPS** (DigitalOcean, Contabo)

## 🆘 **Opção Temporária - Apenas Frontend**

Se sua hospedagem não suporta Node.js, use apenas os arquivos da pasta `upload_filezilla/`:
- Site funciona
- Sem dados do backend
- Sem admin panel
- Sem carrinho persistente

## 🎯 **Resultado Esperado**

**Se funcionar:**
- ✅ Frontend + Backend funcionando
- ✅ API com dados reais
- ✅ Admin panel
- ✅ Carrinho funcionando
- ✅ Todas as funcionalidades

**Se não funcionar:**
- ❌ Hospedagem não suporta Node.js
- 💡 Migre para Vercel (grátis)

## 📞 **Suporte**

Se der erro, verifique:
1. `test_nodejs.php` - mostra se Node.js está disponível
2. Logs do servidor
3. Configuração `.env`
4. Permissões dos arquivos (755 para pastas, 644 para arquivos) 