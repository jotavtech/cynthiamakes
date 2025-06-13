# 📤 GUIA SIMPLES: Upload quando /tmp/ não existe

## 🚨 **SE /tmp/ NÃO EXISTIR NA VPS:**

### **✅ SOLUÇÃO 1: Usar pasta /root/**
```
FileZilla ou painel:
Upload para: /root/projeto-vps.tar.gz
Upload para: /root/deploy-completo-vps-melhorado.sh
```

### **✅ SOLUÇÃO 2: Usar pasta /home/root/**
```
FileZilla ou painel:
Upload para: /home/root/projeto-vps.tar.gz
Upload para: /home/root/deploy-completo-vps-melhorado.sh
```

### **✅ SOLUÇÃO 3: Criar pasta personalizada**
```bash
# No terminal da VPS:
mkdir -p /home/uploads
chmod 755 /home/uploads

# Depois upload para: /home/uploads/
```

## 🎯 **ARQUIVOS PARA UPLOAD:**

1. **`projeto-vps.tar.gz`** (1.4MB) - Seu projeto
2. **`deploy-completo-vps-melhorado.sh`** - Script melhorado

## 🚀 **EXECUTAR NA VPS:**

### **Opção A: Se uploads foram para /root/**
```bash
cd /root
chmod +x deploy-completo-vps-melhorado.sh
./deploy-completo-vps-melhorado.sh
```

### **Opção B: Se uploads foram para /home/root/**
```bash
cd /home/root
chmod +x deploy-completo-vps-melhorado.sh
./deploy-completo-vps-melhorado.sh
```

### **Opção C: Se uploads foram para /home/uploads/**
```bash
cd /home/uploads
chmod +x deploy-completo-vps-melhorado.sh
./deploy-completo-vps-melhorado.sh
```

## 🔍 **O SCRIPT MELHORADO:**

✅ **Cria automaticamente** todas as pastas necessárias:
- `/tmp/` (se não existir)
- `/var/www/`
- `/home/uploads/`

✅ **Procura o arquivo em várias localizações:**
- `/tmp/projeto-vps.tar.gz`
- `/root/projeto-vps.tar.gz`
- `/home/root/projeto-vps.tar.gz`
- `/home/uploads/projeto-vps.tar.gz`
- `./projeto-vps.tar.gz` (pasta atual)

✅ **Mais resistente a erros**
✅ **Deploy manual** se algum arquivo estiver faltando

## 💡 **DICA RÁPIDA:**

**Se você não sabe onde fazer upload, use `/root/`:**
- É a pasta padrão do usuário root
- Sempre existe em sistemas Linux
- O script encontrará automaticamente

---

**🎯 Use o script melhorado que resolve tudo automaticamente!** 