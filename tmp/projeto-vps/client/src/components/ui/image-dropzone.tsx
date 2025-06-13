import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ImageDropzoneProps {
  onImageUpload: (file: File) => Promise<string>;
  currentImage?: string;
  onImageRemove?: () => void;
  className?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageUpload,
  currentImage,
  onImageRemove,
  className,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Reset error state
    setUploadError(null);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setUploadError('Arquivo muito grande. Máximo 5MB.');
      } else if (error.code === 'file-invalid-type') {
        setUploadError('Tipo de arquivo não suportado. Use apenas imagens.');
      } else {
        setUploadError('Erro no arquivo selecionado.');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onImageUpload(file);
    } catch (error) {
      setUploadError('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: disabled || isUploading
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview da imagem atual */}
      {currentImage && (
        <div className="relative group">
          <img
            src={currentImage}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border"
          />
          {onImageRemove && !disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onImageRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      
      {/* Área de drag and drop */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          !isDragActive && "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          isUploading && "pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-600">Fazendo upload...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            {isDragActive ? (
              <>
                <Upload className="h-8 w-8 text-primary" />
                <p className="text-sm font-medium text-primary">Solte a imagem aqui...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF até 5MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {uploadError}
        </p>
      )}
    </div>
  );
}; 