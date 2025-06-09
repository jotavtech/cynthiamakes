# 🚀 Instruções para Upload via FileZilla

## 📁 Arquivos para Upload (Hospedagem Compartilhada)

Você deve fazer upload dos seguintes arquivos para a pasta `public_html/` ou equivalente no seu servidor:

### ✅ Arquivos Obrigatórios:

```
📁 public_html/
├── 📄 index.html (de dist/public/)
├── 📄 .htaccess
├── 📄 test.html (para teste)
└── 📁 assets/
    ├── 📄 index-CwY4ThVm.css
    └── 📄 index-Dw0f9Apw.js
```

## 🎯 Passo a Passo:

### 1. **Teste Inicial**
- Faça upload apenas do `test.html`
- Acesse: `https://cynthiamakes1.com.br/test.html`
- Se aparecer a mensagem "Servidor Funcionando!", prossiga para o passo 2

### 2. **Upload dos Arquivos Principais**

**Na pasta raiz do site (geralmente `public_html/`):**
- `index.html` (copie de `dist/public/index.html`)
- `.htaccess`

**Crie a pasta `assets/` e faça upload de:**
- `index-CwY4ThVm.css` (de `dist/public/assets/`)
- `index-Dw0f9Apw.js` (de `dist/public/assets/`)

### 3. **Verificar Permissões**
- Arquivos: 644
- Pastas: 755

### 4. **Teste Final**
- Acesse: `https://cynthiamakes1.com.br`
- A aplicação deve carregar normalmente

## ⚠️ Problemas Comuns:

1. **Tela Branca**: Verifique se os arquivos estão na pasta correta
2. **Erro 404**: Verifique se o `.htaccess` foi enviado
3. **Arquivos não carregam**: Verifique as permissões

## 🔧 Estrutura Final no Servidor:

```
public_html/
├── index.html          (1.2KB)
├── .htaccess           (configuração)
├── test.html           (para teste)
└── assets/
    ├── index-CwY4ThVm.css (71KB)
    └── index-Dw0f9Apw.js  (635KB)
```

## 📞 Em caso de problemas:

1. Teste primeiro o `test.html`
2. Verifique se os caminhos estão corretos
3. Confirme as permissões dos arquivos
4. Verifique se o servidor suporta `.htaccess` 