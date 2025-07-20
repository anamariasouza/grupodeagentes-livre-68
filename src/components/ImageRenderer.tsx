import React, { useState, useEffect } from 'react';

interface ImageRendererProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({ imageUrl, alt, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [processedUrl, setProcessedUrl] = useState(imageUrl);

  useEffect(() => {
    // Processa URLs de imagem base64 truncadas
    if (imageUrl?.startsWith('data:image/') && !imageUrl.includes(',')) {
      console.log('Imagem base64 sem dados, tentando reprocessar...');
      setImageError(true);
      return;
    }

    // Se a URL estiver truncada, tenta construir uma válida
    if (imageUrl?.startsWith('data:image/') && imageUrl.length < 100) {
      console.log('Imagem base64 suspeita de truncamento:', imageUrl.length);
      setImageError(true);
      return;
    }

    setProcessedUrl(imageUrl);
    setImageError(false);
    setImageLoaded(false);
  }, [imageUrl]);

  const handleLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    console.log('Imagem carregada com sucesso:', processedUrl.substring(0, 50) + '...');
  };

  const handleError = () => {
    console.error('Erro ao carregar imagem:', processedUrl);
    setImageError(true);
    setImageLoaded(false);
  };

  if (imageError) {
    return (
      <div className={`bg-gray-100 border rounded-lg p-4 text-center ${className}`}>
        <div className="text-2xl mb-2">🖼️</div>
        <div className="text-sm text-gray-600">
          Imagem gerada por IA
        </div>
        <div className="text-xs text-gray-400 mt-1">
          (Erro na renderização)
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!imageLoaded && (
        <div className={`bg-gray-100 border rounded-lg p-4 text-center animate-pulse ${className}`}>
          <div className="text-2xl mb-2">🔄</div>
          <div className="text-sm text-gray-600">
            Carregando imagem...
          </div>
        </div>
      )}
      <img
        src={processedUrl}
        alt={alt}
        className={`${className} ${imageLoaded ? 'block' : 'hidden'}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
};