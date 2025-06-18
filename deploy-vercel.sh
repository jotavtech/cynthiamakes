#!/bin/bash

echo "🚀 PREPARANDO DEPLOY NO VERCEL - Cynthiamakes"
echo "=============================================="

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar se está logado no Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Faça login no Vercel:"
    vercel login
fi

# Build do projeto
echo "📦 Fazendo build do projeto..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
    echo "❌ Erro: Build falhou. Verifique os erros acima."
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Deploy no Vercel
echo "🚀 Fazendo deploy no Vercel..."
vercel --prod

echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
echo "===================="
echo "📝 Próximos passos:"
echo "1. Configure as variáveis de ambiente no dashboard do Vercel"
echo "2. Configure o domínio personalizado"
echo "3. Teste as APIs e funcionalidades"
echo ""
echo "📖 Para mais detalhes, consulte: DEPLOY_BACKEND_VERCEL.md" 