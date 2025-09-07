import { useState, useEffect } from 'react';
import { ProductImage } from '../types/index.js';
import { getOptimizedImageUrl, getResponsiveImageSrcSet, getResponsiveImageSizes } from '../utils/imageUtils.js';

interface OptimizedImageProps {
  image: ProductImage;
  size?: 'thumbnail' | 'medium' | 'large' | 'original';
  className?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  responsive?: boolean;
  fallbackClassName?: string;
  onLoad?: () => void;
}

export function OptimizedImage({ 
  image, 
  size = 'original', // Usar por defecto máxima calidad
  className = '', 
  alt, 
  loading = 'lazy',
  responsive = true,
  fallbackClassName = 'bg-gray-200',
  onLoad
}: OptimizedImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const url = getOptimizedImageUrl(image, size);
    
    // Precargar la imagen
    const img = new Image();
    
    img.onload = () => {
      setImageUrl(url);
      setIsLoading(false);
      setHasError(false);
      onLoad?.(); // Llamar callback si existe
    };
    
    img.onerror = () => {
      // Si falla la imagen de CDN, intentar con la original
      if (url !== image.src) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setImageUrl(image.src);
          setIsLoading(false);
          setHasError(false);
          onLoad?.(); // Llamar callback si existe
        };
        fallbackImg.onerror = () => {
          setIsLoading(false);
          setHasError(true);
        };
        fallbackImg.src = image.src;
      } else {
        setIsLoading(false);
        setHasError(true);
      }
    };
    
    img.src = url;
  }, [image, size]);

  if (isLoading) {
    return (
      <div className={`${fallbackClassName} animate-pulse ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  
  const imageProps = {
    src: imageUrl,
    alt: alt || image.alt || 'Producto',
    className,
    loading,
    ...(responsive && {
      srcSet: getResponsiveImageSrcSet(image),
      sizes: getResponsiveImageSizes()
    })
  };
  
  return <img {...imageProps} />;
}
