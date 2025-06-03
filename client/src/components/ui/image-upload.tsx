import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "./button";
import { uploadImageToCloudinary, isValidImageFile, isCloudinaryConfigured } from "@/lib/cloudinary";
import { Alert, AlertDescription } from "./alert";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImageUrl?: string;
  className?: string;
}

const ImageUpload = ({ onImageUpload, currentImageUrl, className }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || "");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryConfigured = isCloudinaryConfigured();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleManualUrlInput = (url: string) => {
    setPreviewUrl(url);
    onImageUpload(url);
    setError("");
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    try {
      // Validar arquivo
      isValidImageFile(file);

      // Criar preview local
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      // Upload para Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);
      
      // Limpar preview local e usar URL do Cloudinary
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(imageUrl);
      onImageUpload(imageUrl);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro no upload");
      // Restaurar imagem anterior em caso de erro
      setPreviewUrl(currentImageUrl || "");
    } finally {
      setIsUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = () => {
    setPreviewUrl("");
    setError("");
    onImageUpload("");
  };

  // Se o Cloudinary não estiver configurado, mostrar apenas input de URL manual
  if (!cloudinaryConfigured) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Upload automático não configurado. Use uma URL de imagem ou configure o Cloudinary seguindo as instruções em CLOUDINARY_SETUP.md
          </AlertDescription>
        </Alert>
        
        <div>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={previewUrl}
            onChange={(e) => handleManualUrlInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md"
              onError={() => setError("URL de imagem inválida")}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                <div className="text-white text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Fazendo upload...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Clique para selecionar uma imagem da galeria
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleFileSelect}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Fazendo upload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Imagem
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        Formatos suportados: JPEG, PNG, WebP. Tamanho máximo: 5MB.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload; 