# 📁 RESUMO: Arquivos para Upload via FileZilla

## 🎯 OBJETIVO
Fazer upload dos arquivos do frontend React para o hosting via FileZilla.

## ⚠️ LIMITAÇÃO
**APENAS FRONTEND** - Backend não funcionará (sem Node.js no hosting)

---

## 📤 ARQUIVOS PARA UPLOAD

### 1️⃣ **Arquivos da Raiz** → `public_html/`
```
📄 .htaccess          → public_html/.htaccess
📄 index.php          → public_html/index.php
```

### 2️⃣ **Arquivos do React** → `public_html/`
```
📄 dist/public/index.html  → public_html/index.html
📁 dist/public/assets/     → public_html/assets/
```

---

## 🚀 PASSO A PASSO RÁPIDO

### 1. **Conectar no FileZilla**
- Host: seu servidor FTP
- Usuário: seu usuário
- Senha: sua senha
- Porta: 21

### 2. **Navegar para pasta**
- Painel direito: `public_html/`

### 3. **Upload dos arquivos**
```
ESQUERDA (local)          DIREITA (servidor)
├── .htaccess        →    public_html/.htaccess
├── index.php        →    public_html/index.php
└── dist/public/
    ├── index.html   →    public_html/index.html
    └── assets/      →    public_html/assets/
```

### 4. **Configurar permissões**
- **Arquivos:** 644
- **Pastas:** 755

---

## ✅ ESTRUTURA FINAL NO SERVIDOR
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

## 🧪 TESTE
Acesse: `https://cynthiamakes1.com.br`

---

## 🔄 ATUALIZAÇÕES
Para atualizar:
1. `npm run build`
2. Substitua `index.html` e arquivos da pasta `assets/` 