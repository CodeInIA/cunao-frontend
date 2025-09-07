import { useEffect, useState } from 'react';
import { ProductImage } from '../types';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface ImagePreloadStatus {
  isLoading: boolean;
  loadedCount: number;
  totalCount: number;
  errors: string[];
}

/**
 * Hook para precargar todas las imágenes de un producto de forma eficiente
 * Esto mejora la experiencia de usuario al cambiar entre variantes
 */
export function useImagePreloader(images: ProductImage[]): ImagePreloadStatus {
  const [status, setStatus] = useState<ImagePreloadStatus>({
    isLoading: true,
    loadedCount: 0,
    totalCount: 0,
    errors: []
  });

  useEffect(() => {
    if (!images || images.length === 0) {
      setStatus({
        isLoading: false,
        loadedCount: 0,
        totalCount: 0,
        errors: []
      });
      return;
    }

    const sizes = ['thumbnail', 'medium', 'large', 'original'] as const;
    const totalImages = images.length * sizes.length;
    
    setStatus(prev => ({
      ...prev,
      isLoading: true,
      totalCount: totalImages,
      loadedCount: 0,
      errors: []
    }));

    console.log(`🖼️ Iniciando precarga de ${totalImages} imágenes (${images.length} productos × ${sizes.length} tamaños)`);

    let loadedCount = 0;
    const errors: string[] = [];

    const updateStatus = () => {
      setStatus({
        isLoading: loadedCount < totalImages,
        loadedCount,
        totalCount: totalImages,
        errors: [...errors]
      });
    };

    // Precargar todas las imágenes en paralelo con límite de concurrencia
    const preloadImage = (image: ProductImage, size: typeof sizes[number], index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        const url = getOptimizedImageUrl(image, size);
        
        img.onload = () => {
          loadedCount++;
          console.log(`✅ Imagen ${index + 1}/${images.length} (${size}) precargada exitosamente`);
          updateStatus();
          resolve();
        };
        
        img.onerror = () => {
          loadedCount++;
          const error = `Error precargando imagen ${index + 1} (${size}): ${url.substring(0, 100)}...`;
          errors.push(error);
          console.warn(`⚠️ ${error}`);
          updateStatus();
          resolve();
        };
        
        img.src = url;
      });
    };

    // Precargar todas las imágenes
    const preloadPromises: Promise<void>[] = [];
    
    images.forEach((image, imageIndex) => {
      sizes.forEach((size) => {
        preloadPromises.push(preloadImage(image, size, imageIndex));
      });
    });

    // Esperar a que todas las imágenes se carguen (o fallen)
    Promise.all(preloadPromises).then(() => {
      console.log(`🎉 Precarga completada: ${loadedCount}/${totalImages} imágenes procesadas`);
      if (errors.length > 0) {
        console.warn(`⚠️ Se encontraron ${errors.length} errores durante la precarga`);
      }
    });

    // Cleanup no es necesario ya que las imágenes quedan en caché del navegador

  }, [images]);

  return status;
}

/**
 * Hook simplificado que solo precarga las imágenes originales (máxima calidad)
 * Útil cuando solo necesitas la imagen principal en alta calidad
 */
export function useOriginalImagePreloader(images: ProductImage[]): Pick<ImagePreloadStatus, 'isLoading' | 'loadedCount'> {
  const [status, setStatus] = useState({
    isLoading: true,
    loadedCount: 0
  });

  useEffect(() => {
    if (!images || images.length === 0) {
      setStatus({ isLoading: false, loadedCount: 0 });
      return;
    }

    console.log(`🖼️ Precargando ${images.length} imágenes originales de alta calidad`);

    let loadedCount = 0;

    const updateStatus = () => {
      setStatus({
        isLoading: loadedCount < images.length,
        loadedCount
      });
    };

    images.forEach((image, index) => {
      const img = new Image();
      const url = getOptimizedImageUrl(image, 'original');
      
      img.onload = () => {
        loadedCount++;
        console.log(`✅ Imagen original ${index + 1}/${images.length} precargada`);
        updateStatus();
      };
      
      img.onerror = () => {
        loadedCount++;
        console.warn(`⚠️ Error precargando imagen original ${index + 1}: ${url.substring(0, 100)}...`);
        updateStatus();
      };
      
      img.src = url;
    });

  }, [images]);

  return status;
}
