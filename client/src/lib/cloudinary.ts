export const CLOUDINARY_CONFIG = {
  cloudName: 'dzwfuzxxw',
  uploadPreset: 'cynthiamakes',
};

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  // Verificar se as configurações estão disponíveis
  if (!CLOUDINARY_CONFIG.cloudName) {
    throw new Error('Configuração do Cloudinary não encontrada');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'products'); // Organizar imagens em uma pasta

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na resposta do Cloudinary:', errorData);
      
      if (response.status === 400) {
        if (errorData.error?.message?.includes('upload_preset')) {
          throw new Error('Upload preset inválido. Verifique a configuração do Cloudinary.');
        }
        throw new Error('Configuração inválida do Cloudinary. Verifique suas credenciais.');
      }
      
      throw new Error(`Erro no servidor do Cloudinary (${response.status}): ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    
    if (!data.secure_url) {
      throw new Error('URL da imagem não retornada pelo Cloudinary');
    }
    
    return data.secure_url; // Retorna a URL segura da imagem
  } catch (error) {
    console.error('Erro no upload:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Falha no upload da imagem. Tente novamente.');
  }
};

// Função para validar tipos de arquivo permitidos
export const isValidImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.');
  }

  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
  }

  return true;
};

// Função para verificar se o Cloudinary está configurado
export const isCloudinaryConfigured = (): boolean => {
  return !!(
    CLOUDINARY_CONFIG.cloudName && 
    CLOUDINARY_CONFIG.cloudName !== 'demo'
  );
}; 