#!/bin/bash

echo "🚀 Iniciando Cynthia Makeup - Full Stack"
echo "========================================"

# Verificar se Node.js está disponível
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado! Esta hospedagem não suporta Node.js"
    echo "💡 Use Vercel, Railway ou Render para hospedagem full-stack"
    exit 1
fi

# Mostrar versões
echo "✅ Node.js: $(node --version)"
echo "✅ NPM: $(npm --version)"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar banco de dados
echo "🗄️ Verificando configuração do banco..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL não configurada"
    echo "📋 Configure as variáveis de ambiente:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - NODE_ENV=production"
fi

# Iniciar aplicação
echo "🚀 Iniciando servidor..."
npm start 