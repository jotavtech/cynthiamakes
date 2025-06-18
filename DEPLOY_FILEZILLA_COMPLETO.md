# 🚀 GUIA COMPLETO: Deploy via FileZilla - Cynthiamakes

## ⚠️ IMPORTANTE: Limitações do Deploy Atual

**Este deploy será APENAS do frontend (React). O backend (Node.js) NÃO funcionará porque:**
- Seu hosting atual não suporta Node.js
- As APIs não funcionarão (produtos, categorias, etc.)
- O site mostrará apenas a interface, mas sem dados dinâmicos

Para ter o backend funcionando, você precisará:
1. **Vercel** (recomendado) - Deploy completo automático
2. **Railway** - Suporte a Node.js + PostgreSQL
3. **Render** - Alternativa gratuita
4. **VPS com Node.js** - Seu VPS atual precisa ter Node.js instalado

---

## 📋 PRÉ-REQUISITOS

1. **FileZilla** instalado no seu computador
2. **Credenciais FTP** do seu hosting:
   - Host/Servidor FTP
   - Usuário
   - Senha
   - Porta (geralmente 21)

---

## 🔧 PASSO 1: Preparar os Arquivos

### 1.1 Verificar se o build está atualizado
```bash
# No terminal, na pasta do projeto
npm run build
```

### 1.2 Verificar se os arquivos foram gerados
A pasta `dist/public/` deve conter:
- `index.html`
- `assets/` (com arquivos .js e .css)

---

## 📁 PASSO 2: Estrutura de Pastas no Hosting

### 2.1 Conectar no FileZilla
1. Abra o **FileZilla**
2. Preencha as credenciais:
   - **Host:** Seu servidor FTP
   - **Usuário:** Seu usuário FTP
   - **Senha:** Sua senha FTP
   - **Porta:** 21
3. Clique em **"Conectar"**

### 2.2 Navegar para a pasta correta
- No painel **direito** (servidor), navegue para:
  - `public_html/` (ou `www/` ou `htdocs/`)
  - Esta é a pasta raiz do seu site

---

## 📤 PASSO 3: Upload dos Arquivos

### 3.1 Upload do arquivo `.htaccess`
**Localização no servidor:** `public_html/.htaccess`

**Arquivo local:** `.htaccess` (na raiz do projeto)

**Como fazer:**
1. No painel **esquerdo** (local), navegue até a pasta do projeto
2. Encontre o arquivo `.htaccess`
3. **Arraste** o arquivo para o painel direito (servidor)
4. Confirme o upload

### 3.2 Upload do arquivo `index.php`
**Localização no servidor:** `public_html/index.php`

**Arquivo local:** `index.php` (na raiz do projeto)

**Como fazer:**
1. No painel esquerdo, encontre o arquivo `index.php`
2. **Arraste** para o painel direito
3. Confirme o upload

### 3.3 Upload dos arquivos do React (pasta `dist/public/`)

#### 3.3.1 Upload do `index.html`
**Localização no servidor:** `public_html/index.html`

**Arquivo local:** `dist/public/index.html`

**Como fazer:**
1. No painel esquerdo, navegue até `dist/public/`
2. Encontre o arquivo `index.html`
3. **Arraste** para o painel direito
4. Confirme o upload

#### 3.3.2 Upload da pasta `assets/`
**Localização no servidor:** `public_html/assets/`

**Pasta local:** `dist/public/assets/`

**Como fazer:**
1. No painel esquerdo, navegue até `dist/public/assets/`
2. **Selecione TODOS os arquivos** dentro da pasta `assets/`
3. **Arraste** para o painel direito
4. Confirme o upload

**Arquivos que devem ser enviados:**
- `index-BJuYSg7Y.js` (ou similar)
- `index-CwY4ThVm.css` (ou similar)
- Qualquer outro arquivo .js ou .css na pasta

---

## 🔍 PASSO 4: Verificar Permissões

### 4.1 Verificar permissões dos arquivos
1. **Clique com botão direito** em cada arquivo no painel direito
2. Selecione **"Permissões de arquivo"**
3. Configure:
   - **Arquivos:** 644
   - **Pastas:** 755

### 4.2 Verificar permissões das pastas
1. **Clique com botão direito** na pasta `assets/`
2. Selecione **"Permissões de arquivo"**
3. Configure: **755**

---

## 🌐 PASSO 5: Testar o Site

### 5.1 Acessar o site
1. Abra seu navegador
2. Acesse: `https://cynthiamakes1.com.br`
3. Verifique se o site carrega

### 5.2 Testar navegação
1. Teste navegar entre as páginas
2. Verifique se não há erros 404
3. Teste em diferentes dispositivos

---

## ⚠️ PASSO 6: Problemas Comuns e Soluções

### 6.1 Site não carrega
**Possíveis causas:**
- Arquivo `.htaccess` não foi enviado
- Permissões incorretas
- Arquivo `index.html` não está na raiz

**Solução:**
1. Verifique se todos os arquivos foram enviados
2. Confirme as permissões (644 para arquivos, 755 para pastas)
3. Verifique se o `.htaccess` está na raiz

### 6.2 Erro 404 ao navegar
**Causa:** Configuração SPA não funcionando

**Solução:**
1. Verifique se o `.htaccess` foi enviado corretamente
2. Confirme se o `index.php` está na raiz
3. Teste acessar diretamente: `cynthiamakes1.com.br/index.html`

### 6.3 CSS/JS não carregam
**Causa:** Caminhos incorretos ou permissões

**Solução:**
1. Verifique se a pasta `assets/` foi enviada completamente
2. Confirme as permissões dos arquivos .js e .css
3. Verifique se os nomes dos arquivos estão corretos

---

## 📝 PASSO 7: Estrutura Final no Servidor

Após o upload, sua estrutura no servidor deve ficar assim:

```
public_html/
├── .htaccess
├── index.php
├── index.html
└── assets/
    ├── index-BJuYSg7Y.js
    └── index-CwY4ThVm.css
```

---

## 🔄 PASSO 8: Atualizações Futuras

Para atualizar o site:

1. **Faça as alterações** no código
2. **Execute o build:** `npm run build`
3. **Substitua os arquivos** no FileZilla:
   - `index.html` (substitua o antigo)
   - Arquivos da pasta `assets/` (substitua os antigos)

---

## 🚨 IMPORTANTE: Limitações

### O que NÃO funcionará:
- ❌ Lista de produtos
- ❌ Categorias
- ❌ Login/Registro
- ❌ Carrinho de compras
- ❌ Qualquer funcionalidade que dependa do backend

### O que funcionará:
- ✅ Interface do site
- ✅ Navegação entre páginas
- ✅ Design responsivo
- ✅ Páginas estáticas

---

## 💡 PRÓXIMOS PASSOS RECOMENDADOS

Para ter o site completo funcionando:

1. **Deploy no Vercel** (mais fácil):
   - Conecte seu GitHub
   - Deploy automático
   - Backend + Frontend funcionando

2. **Instalar Node.js no VPS**:
   - Configure o servidor
   - Instale Node.js
   - Configure PM2 para manter o servidor rodando

3. **Usar Railway/Render**:
   - Alternativas gratuitas
   - Suporte completo a Node.js

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todos os arquivos foram enviados
2. Confirme as permissões
3. Teste acessando diretamente `index.html`
4. Verifique os logs de erro do hosting

**Lembre-se:** Este é um deploy apenas do frontend. Para funcionalidades completas, considere as alternativas mencionadas acima. 