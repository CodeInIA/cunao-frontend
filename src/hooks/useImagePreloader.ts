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
 * Hook simplificado para precarga de imágenes sin duplicar requests
 * Solo precarga si las imágenes no están ya en caché del navegador
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

    // Reducir la precarga agresiva - solo precargar las primeras 3 imágenes
    const imagesToPreload = images.slice(0, 3);
    const totalImages = imagesToPreload.length;
    
    setStatus(prev => ({
      ...prev,
      isLoading: true,
      totalCount: totalImages,
      loadedCount: 0,
      errors: []
    }));

    console.log(`🖼️ Precargando ${totalImages} imágenes principales`);

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

    // Precargar imagen con verificación de caché
    const preloadImage = (image: ProductImage, index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        const url = getOptimizedImageUrl(image);
        
        // Verificar si ya está en caché
        if (img.complete && img.naturalHeight !== 0) {
          loadedCount++;
          console.log(`✅ Imagen ${index + 1} ya en caché`);
          updateStatus();
          resolve();
          return;
        }
        
        img.onload = () => {
          loadedCount++;
          console.log(`✅ Imagen ${index + 1}/${totalImages} precargada`);
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

    // Precargar imágenes con delay para evitar saturar la red
    const preloadPromises: Promise<void>[] = [];
    
    imagesToPreload.forEach((image, imageIndex) => {
      const delayedPreload = new Promise<void>((resolve) => {
        setTimeout(() => {
          preloadImage(image, imageIndex).then(resolve);
        }, imageIndex * 100); // Delay de 100ms entre imágenes
      });
      preloadPromises.push(delayedPreload);
    });

    // Esperar a que todas se carguen
    Promise.all(preloadPromises).then(() => {
      console.log(`🎉 Precarga completada: ${loadedCount}/${totalImages} imágenes procesadas`);
      if (errors.length > 0) {
        console.warn(`⚠️ Se encontraron ${errors.length} errores durante la precarga`);
      }
    });

  }, [images]);

  return status;
}/**
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
