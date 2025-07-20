
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Send, X, Camera } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  onImageSend: (imageUrl: string, description?: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelect, 
  onImageSend 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      onImageSelect(result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSendImage = () => {
    if (selectedImage) {
      onImageSend(selectedImage, description);
      setSelectedImage(null);
      setDescription('');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setDescription('');
  };

  // Banco de imagens gratuitas do Unsplash
  const freeImages = [
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop'
  ];

  return (
    <div className="space-y-4">
      {selectedImage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <img 
                src={selectedImage} 
                alt="Imagem selecionada" 
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Adicionar descrição (opcional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSendImage}>
                    <Send className="h-4 w-4 mr-1" />
                    Enviar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRemoveImage}>
                    <X className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="h-auto p-3 flex flex-col items-center space-y-1"
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={isUploading}
        >
          <Camera className="h-5 w-5" />
          <span className="text-xs">
            {isUploading ? 'Carregando...' : 'Upload'}
          </span>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-3 flex flex-col items-center space-y-1"
          onClick={() => {
            const randomImage = freeImages[Math.floor(Math.random() * freeImages.length)];
            setSelectedImage(randomImage);
            onImageSelect(randomImage);
          }}
        >
          <Image className="h-5 w-5" />
          <span className="text-xs">Galeria</span>
        </Button>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
        id="image-upload"
      />

      {/* Banco de imagens */}
      <div className="grid grid-cols-3 gap-2">
        {freeImages.map((imageUrl, index) => (
          <img
            key={index}
            src={imageUrl}
            alt={`Imagem ${index + 1}`}
            className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setSelectedImage(imageUrl);
              onImageSelect(imageUrl);
            }}
          />
        ))}
      </div>
    </div>
  );
};
