# 🚀 Deploy Rápido para Hostinger

## Comandos para Preparar Deploy

```bash
# Instalar dependências (se ainda não fez)
npm install

# Preparar arquivos para deploy
npm run deploy:prepare
```

## ✅ Estrutura Organizada

Seu projeto agora está pronto para a Hostinger com:

### 📁 Arquivos Criados:
- `.htaccess` - Configuração do Apache para React Router
- `public_html/index.php` - Arquivo PHP de fallback
- `build-for-hostinger.mjs` - Script automatizado de build
- `hostinger-deploy/` - Pasta com arquivos prontos para upload

### 🔧 Scripts Disponíveis:
- `npm run deploy:prepare` - Gera build e prepara arquivos para upload
- `npm run build:frontend` - Build apenas do frontend
- `npm run deploy:hostinger` - Executa apenas o script de preparação

## 📤 Como Fazer Upload

### Método 1: File Manager da Hostinger
1. Acesse o painel da Hostinger
2. File Manager → `public_html`
3. **Delete todos os arquivos existentes** (faça backup!)
4. Upload **todos os arquivos** da pasta `hostinger-deploy/`

### Método 2: FTP
1. Use FileZilla ou outro cliente FTP
2. Conecte com credenciais da Hostinger
3. Vá para `/public_html`
4. Upload todos os arquivos da pasta `hostinger-deploy/`

## ⚡ Arquivos que vão para o servidor:

```
public_html/
├── index.html          # Aplicação React principal
├── .htaccess          # Configuração do servidor
├── index.php          # Fallback PHP
├── assets/            # CSS, JS, imagens
├── favicon.ico        # Ícone do site
└── outros arquivos... # Assets estáticos
```

## ✅ Verificações Pós-Deploy

1. **Acesse seu domínio** - Deve carregar a aplicação
2. **Teste navegação** - Verifique se as rotas funcionam
3. **Verifique console** - Sem erros de JavaScript
4. **Assets carregando** - CSS e imagens funcionando

## 🔧 Solução de Problemas

| Problema | Solução |
|----------|---------|
| Página 404 nas rotas | Verifique se `.htaccess` foi enviado |
| Página em branco | Veja erros no console do navegador |
| Assets não carregam | Confirme upload da pasta `assets/` |
| Site não atualiza | Limpe cache do navegador |

## 🎯 Estrutura Final do Projeto

```
projeto/
├── client/             # Código fonte React
├── server/            # Backend (não usado na Hostinger)
├── .htaccess          # Config Apache
├── public_html/       # Arquivos PHP auxiliares
├── hostinger-deploy/  # 📦 ARQUIVOS PARA UPLOAD
└── build-for-hostinger.mjs # Script de build
```

## 💡 Dicas Importantes

- ✅ **Sempre faça backup** antes de deletar arquivos existentes
- ✅ **Aguarde alguns minutos** para propagação DNS
- ✅ **Configure SSL** no painel da Hostinger se necessário
- ✅ **Re-execute o build** sempre que fizer mudanças no código

---

**✨ Pronto! Seu projeto React está otimizado para a Hostinger!** 