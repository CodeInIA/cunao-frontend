import { ProductImage } from '../types/index.js';

/**
 * Obtiene URL WebP optimizada tanto para ProductImage como para string
 */
export function getWebPImageUrl(image: ProductImage | string): string {
  if (typeof image === 'string') {
    // Si es un string, verificar si ya está optimizado (tiene cdnUrl o es de Cloudinary)
    if (image.includes('res.cloudinary.com') || image.includes('cloudinary')) {
      return image; // Ya está optimizado
    }
    // Si es URL de Printify, retornar tal como está (el backend se encargará de la optimización)
    return image;
  }
  
  return getOptimizedImageUrl(image);
}

/**
 * Obtiene la URL de máxima calidad WebP original
 * Simplificado: siempre devuelve la mejor calidad disponible
 */
export function getOptimizedImageUrl(
  image: ProductImage, 
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'original'
): string {
  // Siempre usar la máxima calidad disponible
  if (image.cdnUrl) {
    return image.cdnUrl;
  }
  
  // Fallback a URL original de Printify
  return image.src;
}

/**
 * Obtiene la URL para srcSet responsive (simplificado - solo una URL de máxima calidad)
 */
export function getResponsiveImageSrcSet(image: ProductImage): string {
  const url = getOptimizedImageUrl(image);
  return `${url} 1x`;
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
 * Verifica si una imagen tiene URL de CDN disponible
 */
export function hasOptimizedImages(image: ProductImage): boolean {
  return !!image.cdnUrl;
}

/**
 * Obtiene la mejor URL disponible para una imagen (simplificado)
 */
export function getBestImageUrl(image: ProductImage): string {
  return getOptimizedImageUrl(image);
}
