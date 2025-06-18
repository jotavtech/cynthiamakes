# Guia de Deploy para Hostinger

## Pré-requisitos
1. Conta na Hostinger com hospedagem ativa
2. Node.js instalado localmente
3. Acesso ao painel de controle da Hostinger

## Passos para Deploy

### 1. Build do Projeto
Execute os seguintes comandos na pasta raiz do projeto:

```bash
# Instalar dependências
npm install

# Fazer o build do frontend e backend
npm run build
```

### 2. Estrutura de Arquivos para Upload

Após o build, você terá a seguinte estrutura na pasta `dist/`:
- `dist/public/` - Arquivos do frontend (React)
- `dist/index.js` - Servidor backend compilado

### 3. Preparar Arquivos para Upload

**Arquivos que devem ir para a pasta `public_html` da Hostinger:**

1. **Todo o conteúdo da pasta `dist/public/`**:
   - index.html
   - assets/ (CSS, JS compilados)
   - Todos os outros arquivos estáticos

2. **Arquivos de configuração criados:**
   - `.htaccess` (já criado na raiz do projeto)
   - `index.php` (já criado em `public_html/`)

3. **Arquivo de ambiente (se necessário):**
   - `.env` com suas variáveis de produção

### 4. Upload via File Manager ou FTP

**Opção 1: File Manager da Hostinger**
1. Acesse o painel da Hostinger
2. Vá em "File Manager"
3. Entre na pasta `public_html`
4. Delete todos os arquivos existentes (exceto .htaccess se já existir)
5. Faça upload de todos os arquivos da pasta `dist/public/`
6. Faça upload do `.htaccess` e `index.php` criados

**Opção 2: FTP**
1. Use um cliente FTP (FileZilla, WinSCP, etc.)
2. Conecte com as credenciais FTP da Hostinger
3. Navegue até a pasta `public_html`
4. Faça upload dos arquivos

### 5. Configurações Especiais

**Para o Backend (se estiver usando):**
- Na Hostinger compartilhada, você pode não conseguir rodar o Node.js server
- Considere usar apenas o frontend ou migrar para um VPS se precisar do backend
- Para API, você pode usar PHP ou outras tecnologias suportadas

**Variáveis de Ambiente:**
Se sua aplicação usa variáveis de ambiente, crie um arquivo `.env` na pasta `public_html` com:
```
# Suas variáveis de produção aqui
DATABASE_URL=sua_url_do_banco
API_KEY=sua_chave_api
```

### 6. Verificação

1. Acesse seu domínio
2. Verifique se a aplicação carrega corretamente
3. Teste as rotas do React Router
4. Verifique se os assets (CSS, JS, imagens) carregam

### 7. Solução de Problemas Comuns

**Erro 404 nas rotas:**
- Verifique se o `.htaccess` foi enviado corretamente
- Certifique-se de que o mod_rewrite está ativo (normalmente está na Hostinger)

**Assets não carregam:**
- Verifique se os caminhos estão corretos
- Confirme se todos os arquivos da pasta `assets/` foram enviados

**Página em branco:**
- Verifique o console do navegador para erros JavaScript
- Confirme se o `index.html` está na raiz do `public_html`

### 8. Comandos Úteis

```bash
# Build completo
npm run build

# Verificar arquivos gerados
ls -la dist/

# Se precisar limpar e rebuildar
rm -rf dist/ && npm run build
```

## Notas Importantes

1. **Backup**: Sempre faça backup dos arquivos existentes antes de fazer upload
2. **Cache**: Pode levar alguns minutos para as mudanças aparecerem devido ao cache
3. **SSL**: Configure SSL no painel da Hostinger se ainda não tiver
4. **Domínio**: Certifique-se de que o domínio está apontando corretamente

## Estrutura Final no public_html

```
public_html/
├── index.html (do build do React)
├── index.php (arquivo de fallback criado)
├── .htaccess (configurações do servidor)
├── assets/ (CSS, JS compilados)
├── favicon.ico
└── outros arquivos estáticos...
``` 