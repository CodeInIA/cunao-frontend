import { useState } from 'react';
import { ProductImage } from '../types/index.js';
import { getOptimizedImageUrl } from '../utils/imageUtils.js';

interface OptimizedImageProps {
  image: ProductImage;
  size?: 'thumbnail' | 'medium' | 'large' | 'original';
  className?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  responsive?: boolean;
  fallbackClassName?: string;
  onLoad?: (width: number, height: number) => void;
}

function OptimizedImageComponent({ 
  image, 
  size = 'original',
  className = '', 
  alt, 
  loading = 'eager', // Cambio: eager por defecto para carga inmediata
  responsive = true,
  fallbackClassName = 'bg-slate-700',
  onLoad
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Obtener la URL optimizada directamente (sin precarga doble)
  const imageUrl = getOptimizedImageUrl(image, size);
  
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(false);
    try {
      const img = e.currentTarget;
      const w = img.naturalWidth || img.width || 1;
      const h = img.naturalHeight || img.height || 1;
      onLoad?.(w, h);
    } catch (err) {
      onLoad?.(0, 0);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Skeleton/loading state */}
      {isLoading && (
        <div className={`${fallbackClassName} animate-pulse flex items-center justify-center w-full h-full`}>
          <div className="w-8 h-8 bg-slate-600 rounded"></div>
        </div>
      )}

      {/* Error state */}
      {hasError && !isLoading && (
        <div className={`bg-slate-700 flex items-center justify-center w-full h-full`}>
          <span className="text-slate-400 text-2xl">👕</span>
        </div>
      )}

      {/* Imagen principal - sin precarga, carga directa */}
      <img
        src={imageUrl}
        alt={alt || image.alt || 'Producto'}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: hasError ? 'none' : 'block', maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
      />
    </div>
  );
}

// Export para compatibilidad con imports existentes
export { OptimizedImageComponent as OptimizedImage };
export default OptimizedImageComponent;
