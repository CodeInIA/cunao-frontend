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

    // Solo usar una imagen por producto (máxima calidad)
    const totalImages = images.length;
    
    setStatus(prev => ({
      ...prev,
      isLoading: true,
      totalCount: totalImages,
      loadedCount: 0,
      errors: []
    }));

    console.log(`🖼️ Iniciando precarga de ${totalImages} imágenes en máxima calidad`);

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

    // Precargar imagen en máxima calidad
    const preloadImage = (image: ProductImage, index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        const url = getOptimizedImageUrl(image); // Solo máxima calidad
        
        img.onload = () => {
          loadedCount++;
          console.log(`✅ Imagen ${index + 1}/${images.length} precargada exitosamente`);
          updateStatus();
          resolve();
        };
        
        img.onerror = () => {
          loadedCount++;
          const error = `Error precargando imagen ${index + 1}: ${url.substring(0, 100)}...`;
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
      preloadPromises.push(preloadImage(image, imageIndex));
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
 * Hook simplificado que precarga imágenes en máxima calidad
 * (Ahora es redundante ya que el hook principal solo usa máxima calidad)
 */
export function useOriginalImagePreloader(images: ProductImage[]): Pick<ImagePreloadStatus, 'isLoading' | 'loadedCount'> {
  const fullStatus = useImagePreloader(images);
  return {
    isLoading: fullStatus.isLoading,
    loadedCount: fullStatus.loadedCount
  };
}
