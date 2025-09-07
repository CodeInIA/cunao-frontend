import { useEffect, useState } from 'react';
import { ProductImage } from '../types';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface ProductPagePreloadStatus {
  variantImagesLoaded: boolean;
  allImagesLoaded: boolean;
  variantLoadedCount: number;
  totalLoadedCount: number;
  variantTotalCount: number;
  totalImageCount: number;
  errors: string[];
}

/**
 * Hook especializado para precarga inteligente en la página de producto
 * Carga primero las imágenes de la variante seleccionada, luego el resto
 */
export function useProductPagePreloader(
  allImages: ProductImage[],
  selectedVariantId?: number
): ProductPagePreloadStatus {
  const [status, setStatus] = useState<ProductPagePreloadStatus>({
    variantImagesLoaded: false,
    allImagesLoaded: false,
    variantLoadedCount: 0,
    totalLoadedCount: 0,
    variantTotalCount: 0,
    totalImageCount: 0,
    errors: []
  });

  useEffect(() => {
    if (!allImages || allImages.length === 0) {
      setStatus({
        variantImagesLoaded: true,
        allImagesLoaded: true,
        variantLoadedCount: 0,
        totalLoadedCount: 0,
        variantTotalCount: 0,
        totalImageCount: 0,
        errors: []
      });
      return;
    }

    // Separar imágenes de la variante seleccionada vs todas las demás
    const variantImages = selectedVariantId 
      ? allImages.filter(img => img.variant_ids.includes(selectedVariantId))
      : [allImages[0]]; // Si no hay variante, usar la primera imagen

    const otherImages = selectedVariantId
      ? allImages.filter(img => !img.variant_ids.includes(selectedVariantId))
      : allImages.slice(1); // Excluir la primera imagen si no hay variante

    console.log(`🎯 Iniciando precarga inteligente: ${variantImages.length} imágenes de variante, ${otherImages.length} adicionales`);

    let variantLoadedCount = 0;
    let totalLoadedCount = 0;
    const errors: string[] = [];

    const updateStatus = () => {
      const variantImagesLoaded = variantLoadedCount >= variantImages.length;
      const allImagesLoaded = totalLoadedCount >= allImages.length;
      
      setStatus({
        variantImagesLoaded,
        allImagesLoaded,
        variantLoadedCount,
        totalLoadedCount,
        variantTotalCount: variantImages.length,
        totalImageCount: allImages.length,
        errors: [...errors]
      });
    };

    // Función para precargar una imagen individual
    const preloadImage = (image: ProductImage, isVariantImage: boolean): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        const url = getOptimizedImageUrl(image, 'original'); // Usar siempre resolución original
        
        img.onload = () => {
          if (isVariantImage) {
            variantLoadedCount++;
            console.log(`✅ Imagen de variante ${variantLoadedCount}/${variantImages.length} cargada`);
          }
          totalLoadedCount++;
          updateStatus();
          resolve();
        };
        
        img.onerror = () => {
          const error = `Error cargando imagen: ${url.substring(0, 100)}...`;
          errors.push(error);
          console.warn(`⚠️ ${error}`);
          
          if (isVariantImage) {
            variantLoadedCount++;
          }
          totalLoadedCount++;
          updateStatus();
          resolve();
        };
        
        img.src = url;
      });
    };

    // Fase 1: Cargar imágenes de la variante seleccionada
    const loadVariantImages = async () => {
      console.log(`📸 Fase 1: Cargando ${variantImages.length} imágenes de la variante seleccionada`);
      const variantPromises = variantImages.map(img => preloadImage(img, true));
      await Promise.all(variantPromises);
      
      console.log(`🎉 Fase 1 completada: Todas las imágenes de la variante están cargadas`);
      
      // Fase 2: Cargar el resto de imágenes (solo si hay más)
      if (otherImages.length > 0) {
        console.log(`📸 Fase 2: Cargando ${otherImages.length} imágenes adicionales en segundo plano`);
        const otherPromises = otherImages.map(img => preloadImage(img, false));
        await Promise.all(otherPromises);
        
        console.log(`🎉 Fase 2 completada: Todas las imágenes del producto están cargadas`);
      }
    };

    // Inicializar estado
    setStatus({
      variantImagesLoaded: false,
      allImagesLoaded: false,
      variantLoadedCount: 0,
      totalLoadedCount: 0,
      variantTotalCount: variantImages.length,
      totalImageCount: allImages.length,
      errors: []
    });

    // Ejecutar precarga
    loadVariantImages();

  }, [allImages, selectedVariantId]);

  return status;
}

/**
 * Hook simplificado que solo informa si las imágenes de la variante están listas
 */
export function useVariantImagesReady(
  allImages: ProductImage[],
  selectedVariantId?: number
): boolean {
  const status = useProductPagePreloader(allImages, selectedVariantId);
  return status.variantImagesLoaded;
}
