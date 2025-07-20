import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';

interface CustomImageUploadProps {
  currentImage?: string;
  onImageSelect: (imageUrl: string) => void;
}

export const CustomImageUpload: React.FC<CustomImageUploadProps> = ({ 
  currentImage, 
  onImageSelect 
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelect(result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {currentImage && (
        <div className="flex items-center space-x-3">
          <img 
            src={currentImage} 
            alt="Avatar atual" 
            className="w-16 h-16 rounded-full object-cover"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onImageSelect('')}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Remover
          </Button>
        </div>
      )}
      
      <Card 
        className={`cursor-pointer transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <p className="text-sm font-medium">
                Arraste uma imagem aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF até 5MB
              </p>
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
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {uploading ? 'Carregando...' : 'Selecionar Arquivo'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};