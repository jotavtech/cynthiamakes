#!/bin/bash
echo "🚀 Executando deploy na VPS..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🔨 Fazendo build..."
npm run build

# Configurar PM2 se ainda não estiver rodando
if ! pm2 describe cynthiamakes-backend > /dev/null 2>&1; then
    echo "🚀 Iniciando aplicação com PM2..."
    pm2 start ecosystem.config.js --env production
    pm2 save
else
    echo "🔄 Reiniciando aplicação..."
    pm2 restart cynthiamakes-backend
fi

echo "✅ Deploy concluído!"
echo "📊 Status da aplicação:"
pm2 status
