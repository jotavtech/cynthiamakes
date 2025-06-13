# Configuração do Cloudinary para Upload de Imagens

## Passo 1: Criar conta no Cloudinary

1. Acesse [cloudinary.com](https://cloudinary.com) e crie uma conta gratuita
2. Após criar a conta, você terá acesso ao seu Dashboard

## Passo 2: Obter credenciais

No seu Dashboard do Cloudinary, você encontrará:
- **Cloud Name**: Nome único da sua instância
- **API Key**: Sua chave de API
- **API Secret**: Sua chave secreta (não use no frontend)

## Passo 3: Criar Upload Preset

1. No Dashboard, vá para "Settings" → "Upload"
2. Clique em "Add upload preset" 
3. Configure:
   - **Preset name**: Ex: `products_upload`
   - **Signing Mode**: `Unsigned` (permite upload do frontend)
   - **Folder**: `products` (opcional, organiza imagens)
   - **Transformation**: Configure conforme necessário
4. Salve o preset

## Passo 4: Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```bash
VITE_CLOUDINARY_CLOUD_NAME=seu-cloud-name-aqui
VITE_CLOUDINARY_UPLOAD_PRESET=seu-upload-preset-aqui
```

**Importante**: 
- Substitua `seu-cloud-name-aqui` pelo seu Cloud Name
- Substitua `seu-upload-preset-aqui` pelo nome do preset criado
- Use apenas o Cloud Name e Upload Preset no frontend (não a API Secret)

## Passo 5: Reiniciar o servidor

Depois de criar o arquivo `.env`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Funcionalidades Implementadas

- ✅ Upload de imagens via drag & drop ou clique
- ✅ Preview da imagem antes e depois do upload
- ✅ Validação de tipo de arquivo (JPEG, PNG, WebP)
- ✅ Validação de tamanho (máximo 5MB)
- ✅ Loading state durante upload
- ✅ Tratamento de erros
- ✅ Organização automática em pasta "products"
- ✅ Remoção de imagens

## Exemplo de Uso

O componente `ImageUpload` foi integrado ao `ProductForm` e substitui o campo manual de URL da imagem. Agora os usuários podem:

1. Clicar em "Selecionar Imagem" 
2. Escolher uma imagem da galeria
3. Ver o preview da imagem
4. O upload é feito automaticamente para o Cloudinary
5. A URL da imagem é preenchida automaticamente no formulário

## Troubleshooting

**Erro "Cloudinary cloud name not found":**
- Verifique se o `VITE_CLOUDINARY_CLOUD_NAME` está correto no `.env`

**Erro "Upload preset not found":**  
- Verifique se o `VITE_CLOUDINARY_UPLOAD_PRESET` está correto
- Confirme que o preset foi criado como "Unsigned"

**Erro de permissão:**
- Certifique-se que o upload preset tem `Signing Mode: Unsigned` 