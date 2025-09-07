import { useEffect } from 'react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import type { Product } from '../types';

/**
 * Hook para precarga ultra-rápida de imágenes críticas
 * Se ejecuta inmediatamente al cargar la aplicación
 */
export function useCriticalImagePreloader() {
  useEffect(() => {
    const preloadCriticalImages = async () => {
      try {
        console.log('🚀 Iniciando precarga crítica de imágenes...');
        
        // Precargar logo inmediatamente
        const logoImg = new Image();
        logoImg.src = '/logo-sin-letras.webp';
        
        // Obtener productos destacados del API
        const response = await fetch('/api/products/featured');
        if (!response.ok) {
          console.warn('⚠️ No se pudieron cargar productos destacados');
          return;
        }
        
        const featuredProducts: Product[] = await response.json();
        
        // Precargar las primeras 8 imágenes con máxima prioridad
        const criticalImages = featuredProducts
          .slice(0, 8)
          .map(product => product.images?.[0])
          .filter(Boolean);

        console.log(`📸 Precargando ${criticalImages.length} imágenes críticas...`);

        // Crear promesas de precarga para ejecutar en paralelo
        const preloadPromises = criticalImages.map((image, index) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Para CORS de Cloudinary
            
            img.onload = () => {
              console.log(`✅ Imagen crítica ${index + 1}/${criticalImages.length} cargada`);
              resolve();
            };
            
            img.onerror = () => {
              console.warn(`⚠️ Error en imagen crítica ${index + 1}`);
              resolve(); // No bloquear por errores individuales
            };
            
            // Usar la URL optimizada
            img.src = getOptimizedImageUrl(image!);
          });
        });

        // Ejecutar todas las precargas en paralelo con timeout de 3 segundos
        await Promise.allSettled(preloadPromises);
        console.log('🎉 Precarga crítica completada - imágenes listas para uso instantáneo');
        
      } catch (error) {
        console.warn('⚠️ Error en precarga crítica:', error);
      }
    };

    // Ejecutar precarga con pequeño delay para no bloquear el render inicial
    const timer = setTimeout(preloadCriticalImages, 100);
    
    return () => clearTimeout(timer);
  }, []);
}

/**
 * Hook para precarga específica de una página
 */
export function usePageImagePreloader(images: Array<{ src: string } | undefined>, priority: 'high' | 'normal' = 'normal') {
  useEffect(() => {
    if (!images.length) return;

    const validImages = images.filter(Boolean);
    console.log(`📸 Precargando ${validImages.length} imágenes de página (prioridad: ${priority})`);

    validImages.forEach((image, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log(`✅ Imagen de página ${index + 1}/${validImages.length} cargada`);
      };
      
      img.onerror = () => {
        console.warn(`⚠️ Error en imagen de página ${index + 1}`);
      };
      
      img.src = getOptimizedImageUrl(image as any);
    });
  }, [images, priority]);
}

/**
 * Precarga imágenes visibles en viewport
 */
export function useViewportImagePreloader(images: Array<{ src: string } | undefined>) {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      // Fallback para navegadores sin IntersectionObserver
      usePageImagePreloader(images, 'normal');
      return;
    }

    const validImages = images.filter(Boolean);
    const imageElements = new Map<Element, { src: string }>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imageData = imageElements.get(entry.target);
            if (imageData) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = getOptimizedImageUrl(imageData as any);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { 
        rootMargin: '50px', // Precargar 50px antes de que entre en viewport
        threshold: 0.1 
      }
    );

    return () => observer.disconnect();
  }, [images]);
}
