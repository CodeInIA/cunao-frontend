import { useEffect } from 'react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import type { Product } from '../types';
import { config } from '../config';

/**
 * Hook para precarga ultra-rápida de imágenes críticas
 * Se ejecuta inmediatamente al cargar la aplicación
 */
export function useCriticalImagePreloader() {
  useEffect(() => {
    const preloadCriticalImages = async () => {
      try {
        console.log('🚀 Iniciando precarga crítica de imágenes...');
        // Evitar precarga global en rutas donde la imagen crítica debe venir de la página
        // (p.ej. /review para reseñas, /producto para detalle) — así no pisamos las imágenes
        // específicas que muestran la variante seleccionada por el usuario.
        if (typeof window !== 'undefined') {
          const path = window.location.pathname || '';
          if (path.startsWith('/review') || path.startsWith('/producto')) {
            console.log(`⏭️ Omitiendo precarga global en ruta específica: ${path}`);
            return;
          }
        }
        
        // Precargar logo inmediatamente
        const logoImg = new Image();
        logoImg.src = '/logo-sin-letras.webp';
        
        // Obtener productos destacados del API
  const response = await fetch(`${config.API_URL}/products/featured`);
        if (!response.ok) {
          console.warn('⚠️ No se pudieron cargar productos destacados');
          return;
        }
        
        const featuredRaw = await response.json();
        // El API devuelve { success: true, data: [...] } — extraer data si existe
        const featuredProducts: Product[] = Array.isArray(featuredRaw)
          ? featuredRaw
          : Array.isArray((featuredRaw && (featuredRaw as any).data) ? (featuredRaw as any).data : null)
            ? (featuredRaw as any).data
            : [];

        // Precargar imágenes críticas: limitar a los 2 primeros productos
        // y elegir la imagen que corresponda con la variante por defecto (si existe).
        // Si no hay imagen para la variante, caer a la imagen marcada como `is_default`
        // o a la primera disponible.
        const criticalProducts = featuredProducts.slice(0, 2);

  const criticalImagesRaw = criticalProducts.map((product) => {
          // Intentar obtener la variante por defecto del producto
          const defaultVariant = Array.isArray(product?.variants)
            ? product.variants.find((v: any) => v.is_default) || product.variants[0]
            : undefined;

          const defaultVariantId = defaultVariant?.id;

          // Buscar una imagen que contenga el variant id en su variant_ids
          const imageForVariant = Array.isArray(product?.images)
            ? product.images.find((img: any) => Array.isArray(img.variant_ids) && defaultVariantId && img.variant_ids.includes(defaultVariantId))
            : undefined;

          const defaultImage = Array.isArray(product?.images)
            ? product.images.find((img: any) => img.is_default) || product.images[0]
            : undefined;

          const chosen = imageForVariant || defaultImage;
          // Log para debugging: qué imagen hemos elegido y por qué
          try {
            const productId = (product as any)?._id || (product as any)?.id || 'unknown';
            const productTitle = (product as any)?.title || 'untitled';
            const chosenKey = chosen?.cdnUrl || chosen?.src || 'no-url';
            const chosenVariantIds = Array.isArray(chosen?.variant_ids) ? chosen.variant_ids.join(',') : '[]';
            console.log(`🔎 Producto ${productId} (${productTitle}) - defaultVariantId=${defaultVariantId} -> imagen elegida=${chosenKey} (variant_ids=[${chosenVariantIds}])`);
          } catch (e) {
            // no bloquear por logs
          }

          return chosen;
        }).filter(Boolean);

        // Desduplicar por URL (cdnUrl o src) para evitar múltiples peticiones iguales
        const uniqueByUrl = new Map<string, any>();
        criticalImagesRaw.forEach((img) => {
          const key = img?.cdnUrl || img?.src || '';
          if (key && !uniqueByUrl.has(key)) uniqueByUrl.set(key, img);
        });

        const criticalImages = Array.from(uniqueByUrl.values());

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
