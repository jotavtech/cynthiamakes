#!/bin/bash

echo "📤 UPLOAD AUTOMÁTICO PARA VPS HOSTINGER"
echo "======================================="
echo ""

# Verificar se arquivo existe
if [ ! -f "projeto-vps.tar.gz" ]; then
    echo "❌ Erro: arquivo projeto-vps.tar.gz não encontrado!"
    echo "Execute primeiro: npm run deploy:vps"
    exit 1
fi

echo "✅ Arquivo projeto-vps.tar.gz encontrado"
echo ""

# Informações da VPS
VPS_IP="31.97.160.140"
VPS_HOST="srv860654.hstgr.cloud"
VPS_USER="root"

echo "🎯 Dados da VPS:"
echo "  IP: $VPS_IP"
echo "  Host: $VPS_HOST"
echo "  Usuário: $VPS_USER"
echo ""

echo "🚀 Escolha o método de upload:"
echo "1) Via IP ($VPS_IP)"
echo "2) Via hostname ($VPS_HOST)"
echo "3) Mostrar comandos manuais"
echo ""

read -p "Digite sua opção (1-3): " opcao

case $opcao in
    1)
        echo "📤 Enviando via IP..."
        scp projeto-vps.tar.gz deploy-completo-vps.sh $VPS_USER@$VPS_IP:/tmp/
        ;;
    2)
        echo "📤 Enviando via hostname..."
        scp projeto-vps.tar.gz deploy-completo-vps.sh $VPS_USER@$VPS_HOST:/tmp/
        ;;
    3)
        echo ""
        echo "📋 COMANDOS MANUAIS:"
        echo "==================="
        echo ""
        echo "1. Upload via SCP:"
        echo "   scp projeto-vps.tar.gz deploy-completo-vps.sh root@$VPS_IP:/tmp/"
        echo "   OU"
        echo "   scp projeto-vps.tar.gz deploy-completo-vps.sh root@$VPS_HOST:/tmp/"
        echo ""
        echo "2. Conectar na VPS:"
        echo "   ssh root@$VPS_IP"
        echo "   OU"
        echo "   ssh root@$VPS_HOST"
        echo ""
        echo "3. Executar deploy:"
        echo "   cd /tmp"
        echo "   chmod +x deploy-completo-vps.sh"
        echo "   ./deploy-completo-vps.sh"
        echo ""
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Upload concluído com sucesso!"
    echo ""
    echo "🔗 Agora execute na VPS:"
    echo "1. ssh $VPS_USER@$VPS_IP"
    echo "2. cd /tmp"
    echo "3. chmod +x deploy-completo-vps.sh"
    echo "4. ./deploy-completo-vps.sh"
    echo ""
    echo "🎉 O script fará todo o deploy automaticamente!"
else
    echo ""
    echo "❌ Erro no upload. Verifique:"
    echo "  • Credenciais SSH corretas"
    echo "  • VPS ligada e acessível"
    echo "  • Conexão de internet"
    echo ""
    echo "💡 Alternativa: Use FileZilla ou painel da Hostinger"
fi 