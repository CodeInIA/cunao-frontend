import { ProductImage } from '../types/index.js';

/**
 * Obtiene la URL optimizada de una imagen según el tamaño deseado
 * IMPORTANTE: 'original' devuelve la máxima calidad disponible en WebP
 */
export function getOptimizedImageUrl(
  image: ProductImage, 
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'
): string {
  // Para tamaño original, usar la URL de máxima calidad del CDN si está disponible
  if (size === 'original') {
    if (image.cdnUrls && image.cdnUrls.original) {
      return image.cdnUrls.original;
    }
    // Si no hay URL original en CDN, usar la principal del CDN (que ya es WebP optimizada)
    if (image.cdnUrl) {
      return image.cdnUrl;
    }
    // Último fallback a URL original de Printify
    return image.src;
  }
  
  // Para otros tamaños, usar las URLs específicas del CDN
  if (image.cdnUrls && image.cdnUrls[size]) {
    return image.cdnUrls[size];
  }
  
  // Fallback a URL principal de CDN (que ya es WebP optimizada)
  if (image.cdnUrl) {
    return image.cdnUrl;
  }
  
  // Último fallback a URL original de Printify
  return image.src;
}

/**
 * Obtiene múltiples tamaños de una imagen para srcSet responsive
 */
export function getResponsiveImageSrcSet(image: ProductImage): string {
  const urls: string[] = [];
  
  if (image.cdnUrls) {
    if (image.cdnUrls.thumbnail) urls.push(`${image.cdnUrls.thumbnail} 400w`);
    if (image.cdnUrls.medium) urls.push(`${image.cdnUrls.medium} 800w`);
    if (image.cdnUrls.large) urls.push(`${image.cdnUrls.large} 1200w`);
  }
  
  // Si no hay URLs de CDN, usar la URL original
  if (urls.length === 0) {
    urls.push(`${image.src} 800w`);
  }
  
  return urls.join(', ');
}

/**
 * Obtiene el tamaño apropiado según el ancho del viewport o contenedor
 */
export function getResponsiveImageSizes(maxWidth?: number): string {
  if (maxWidth) {
    return `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`;
  }
  
  return '(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px';
}

/**
 * Utilidad para obtener la imagen principal de un producto
 */
export function getMainProductImage(images: ProductImage[]): ProductImage | null {
  if (!images || images.length === 0) return null;
  
  // Buscar imagen marcada como default
  const defaultImage = images.find(img => img.is_default);
  if (defaultImage) return defaultImage;
  
  // Si no hay default, usar la primera imagen
  return images[0];
}

/**
 * Utilidad para obtener imágenes de una variante específica
 */
export function getVariantImages(images: ProductImage[], variantId: number): ProductImage[] {
  return images.filter(img => 
    img.variant_ids && img.variant_ids.includes(variantId)
  );
}

/**
 * Verifica si una imagen tiene URLs de CDN disponibles
 */
export function hasOptimizedImages(image: ProductImage): boolean {
  return !!(image.cdnUrl || image.cdnUrls);
}

/**
 * Obtiene la mejor URL disponible para una imagen
 * Prioriza CDN sobre URL original
 */
export function getBestImageUrl(image: ProductImage, preferredSize: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
  return getOptimizedImageUrl(image, preferredSize);
}
