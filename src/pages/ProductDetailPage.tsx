import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { ShoppingCart, Plus, Minus, Check, Ruler, Home, ArrowLeft } from 'lucide-react';
import { formatPrice, slugify } from '../utils/formatters';
import type { ProductVariant, ProductImage } from '../types';
import { OptimizedImage } from '../components/OptimizedImage';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { useProductPagePreloader } from '../hooks/useProductPagePreloader';
import ReviewsCarousel from '../components/ReviewsCarousel';

export const ProductDetailPage: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProduct, fetchProduct, loadingState, error, currentGPSR, fetchProductGPSR, resetState } = useProductStore();
  const { addItem } = useCartStore();

  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: number }>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState<ProductImage | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [touchEndTime, setTouchEndTime] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(null);
  const [isCarouselActive, setIsCarouselActive] = useState(false);
  const [isSizeGuideModalOpen, setIsSizeGuideModalOpen] = useState(false);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isSizeGuideModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup al desmontar o cambiar estado
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSizeGuideModalOpen]);

  // Precarga inteligente: primero variante seleccionada, luego el resto
  const preloadStatus = useProductPagePreloader(
    currentProduct?.images || [], 
    selectedVariant?.id
  );

  // Log del progreso de precarga (solo para desarrollo)
  useEffect(() => {
    if (preloadStatus.variantTotalCount > 0) {
      console.log(`🎯 Variante: ${preloadStatus.variantLoadedCount}/${preloadStatus.variantTotalCount} | Total: ${preloadStatus.totalLoadedCount}/${preloadStatus.totalImageCount}`);
      
      if (preloadStatus.variantImagesLoaded && !preloadStatus.allImagesLoaded) {
        console.log('🚀 ¡Imágenes de variante listas! Cargando resto en segundo plano...');
      }
      
      if (preloadStatus.allImagesLoaded) {
        console.log('🎉 ¡Todas las imágenes están listas! Cambios instantáneos disponibles.');
      }
    }
  }, [preloadStatus]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return { color: params.get('color') || '' };
  }, [location.search]);

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
      fetchProductGPSR(slug);
    }
  }, [slug, fetchProduct, fetchProductGPSR]);

  // Track view_item when product and variant are ready
  useEffect(() => {
    try {
      const consent = (window.localStorage.getItem('cunao.consent') && JSON.parse(window.localStorage.getItem('cunao.consent') || '{}')) || null;
      if (consent?.analytics && currentProduct) {
        const item = {
          id: currentProduct.id,
          name: currentProduct.title,
          price: currentProduct.variants?.[0]?.price ?? 0
        };
        // Dynamically import trackEvent to avoid circular deps
        import('../hooks/useGtag').then(mod => mod.trackEvent('view_item', { items: [item] }));
      }
    } catch (e) {
      // ignore
    }
  }, [currentProduct, selectedVariant]);

  const allProductOptions = useMemo(() => {
    if (!currentProduct?.options) return { colors: [], sizes: [] };
    const optionsMap: { [key: string]: any[] } = { colors: [], sizes: [] };
    currentProduct.options.forEach(option => {
      if (option.type === 'color') optionsMap.colors = option.values;
      else if (option.type === 'size') optionsMap.sizes = option.values;
    });
    return optionsMap;
  }, [currentProduct]);

  const availableOptions = useMemo(() => {
    if (!currentProduct?.variants) return { colors: [], sizes: [] };
    const enabledVariants = currentProduct.variants.filter(v => v.is_enabled);
    const availableOptionIds = new Set(enabledVariants.flatMap(v => v.options));
    const availableColors = allProductOptions.colors.filter(color => availableOptionIds.has(color.id));
    const availableSizes = allProductOptions.sizes.filter(size => availableOptionIds.has(size.id));
    return { colors: availableColors, sizes: availableSizes };
  }, [currentProduct?.variants, allProductOptions]);

  const selectedColorName = useMemo(() => {
    return allProductOptions.colors?.find(c => c.id === selectedOptions.color)?.title;
  }, [selectedOptions.color, allProductOptions.colors]);

  const galleryImages = useMemo(() => {
    if (!currentProduct || !selectedOptions.color) {
      const defaultImg = currentProduct?.images.find(i => i.is_default) || currentProduct?.images[0];
      return defaultImg ? [defaultImg] : [];
    }
    const variantsForColor = currentProduct.variants?.filter(v => v.options.includes(selectedOptions.color)) || [];
    const variantIdsForColor = new Set(variantsForColor.map(v => v.id));
    const images = currentProduct.images.filter(img => 
      img.variant_ids.some(id => variantIdsForColor.has(id))
    );
    if (images.length === 0) {
      const defaultImg = currentProduct.images.find(i => i.is_default) || currentProduct.images[0];
      return defaultImg ? [defaultImg] : [];
    }
    return images;
  }, [currentProduct, selectedOptions.color]);
  
  // =================================================================
  // ▼▼▼ LÓGICA DE INICIALIZACIÓN CORREGIDA Y FINAL ▼▼▼
  // =================================================================
  useEffect(() => {
    // Solo inicializar si aún no hay opciones seleccionadas
    if (currentProduct && currentProduct.variants && currentProduct.variants.length > 0 && Object.keys(selectedOptions).length === 0) {
        let variantToSelect: ProductVariant | null = null;

        // Prioridad 1: Cargar variante según el color de la URL
        if (queryParams.color) {
            const colorObj = allProductOptions.colors.find(c => c.title.toLowerCase() === queryParams.color.toLowerCase());
            if (colorObj) {
                const variantForColor = currentProduct.variants.find(v => v.is_enabled && v.options.includes(colorObj.id));
                if (variantForColor) variantToSelect = variantForColor;
            }
        }

        // Prioridad 2: Cargar la variante marcada como "default" por Printify
        if (!variantToSelect) {
            const defaultVariant = currentProduct.variants.find(v => v.is_default && v.is_enabled);
            if (defaultVariant) variantToSelect = defaultVariant;
        }

        // Prioridad 3: Cargar la primera variante disponible como último recurso
        if (!variantToSelect) {
            const firstAvailableVariant = currentProduct.variants.find(v => v.is_enabled);
            if (firstAvailableVariant) variantToSelect = firstAvailableVariant;
        }
        
        // Si hemos encontrado una variante, establecemos su estado
        if (variantToSelect) {
            const initialOptions: { [key: string]: number } = {};
            variantToSelect.options.forEach(optId => {
                if (allProductOptions.colors.some(c => c.id === optId)) {
                    initialOptions.color = optId;
                }
                if (allProductOptions.sizes.some(s => s.id === optId)) {
                    initialOptions.size = optId;
                }
            });

            // Establecer el estado
            setSelectedOptions(initialOptions);
            setSelectedVariant(variantToSelect);

            // Establecer la imagen principal inicial
            const initialImage = currentProduct.images.find(img => img.variant_ids.includes(variantToSelect!.id)) 
                                || currentProduct.images.find(img => img.is_default) 
                                || currentProduct.images[0];
            setCurrentImage(initialImage || null);
        }
    }
  }, [currentProduct, allProductOptions, queryParams.color]);
  // =================================================================
  // ▲▲▲ FIN DE LA LÓGICA DE INICIALIZACIÓN ▲▲▲
  // =================================================================

  useEffect(() => {
    if (currentProduct?.variants && selectedOptions.color && selectedOptions.size) {
      const variant = currentProduct.variants.find(v => 
        v.is_enabled &&
        v.options.includes(selectedOptions.color) &&
        v.options.includes(selectedOptions.size)
      );
      setSelectedVariant(variant || null);
    }
  }, [selectedOptions, currentProduct]);

  useEffect(() => {
    // Solo actualizar imagen si no es la inicialización
    if (galleryImages.length > 0) {
      if (!galleryImages.some(img => img.src === currentImage?.src)) {
        setCurrentImage(galleryImages[0]);
      }
    }
  }, [galleryImages, currentImage]);

  // Funciones para el carrusel móvil
  const minSwipeDistance = 50;
  const directionThreshold = 20; // Umbral para detectar dirección
  const horizontalDominanceRatio = 0.7; // Debe ser 70% horizontal para considerarse swipe horizontal

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setTouchStartTime(Date.now());
    setIsDragging(false); // No iniciar como dragging hasta confirmar dirección
    setDragOffset(0);
    setIsHorizontalSwipe(null);
    setIsCarouselActive(false); // No activar hasta confirmar swipe horizontal
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !touchStartY) return;
    
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    const deltaX = Math.abs(touchStart - currentX);
    const deltaY = Math.abs(touchStartY - currentY);
    const totalMovement = deltaX + deltaY;
    
    // Solo determinar dirección después de movimiento significativo
    if (isHorizontalSwipe === null && totalMovement > directionThreshold) {
      const horizontalRatio = deltaX / totalMovement;
      const isHorizontal = horizontalRatio > horizontalDominanceRatio;
      
      setIsHorizontalSwipe(isHorizontal);
      
      if (isHorizontal) {
        setIsDragging(true);
        setIsCarouselActive(true);
      }
    }
    
    // Solo bloquear scroll Y prevenir eventos si se confirmó que es swipe horizontal
    if (isHorizontalSwipe === true) {
      e.preventDefault();
      e.stopPropagation();
      
      const diff = touchStart - currentX;
      setDragOffset(diff);
      setTouchEnd(currentX);
    }
    // Si no es horizontal o aún no se ha determinado, permitir scroll normal
  };

  const onTouchEnd = () => {
    // Siempre desactivar estados al terminar
    setIsCarouselActive(false);
    
    if (!touchStart || !touchEnd || isHorizontalSwipe !== true) {
      // Si no fue un swipe horizontal válido, reset sin navegar
      setIsDragging(false);
      setDragOffset(0);
      setIsHorizontalSwipe(null);
      return;
    }
    
    const endTime = Date.now();
    setTouchEndTime(endTime);
    
    const distance = touchStart - touchEnd;
    const swipeTime = touchStartTime ? endTime - touchStartTime : 1000;
    const velocity = Math.abs(distance) / swipeTime;
    
    // Calcular cuántas imágenes saltar basado en la velocidad
    const baseDistance = Math.abs(distance);
    let imagesToMove = 1;
    
    if (velocity > 1.5 && baseDistance > 100) {
      imagesToMove = Math.min(Math.floor(velocity * 0.8), 3);
    } else if (velocity > 0.8 && baseDistance > 80) {
      imagesToMove = 2;
    }
    
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      const newIndex = Math.min(currentImageIndex + imagesToMove, galleryImages.length - 1);
      navigateToImage(newIndex);
    }
    if (isRightSwipe) {
      const newIndex = Math.max(currentImageIndex - imagesToMove, 0);
      navigateToImage(newIndex);
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragOffset(0);
    setIsHorizontalSwipe(null);
  };

  const navigateToImage = (index: number) => {
    if (galleryImages[index]) {
      setCurrentImageIndex(index);
      setCurrentImage(galleryImages[index]);
    }
  };

  // Formatea descripción de Printify: si ya es HTML, úsalo; si es texto plano, preserva saltos de línea
  const formatDescription = (description: string): string => {
    if (!description) return '';
    if (description.includes('<') && description.includes('>')) return description;
    return description
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  // Extrae la tabla de tallas (id="size-guide") del HTML y la limpia de estilos inline
  const extractSizeGuide = React.useCallback((html: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Buscar tabla por id; si no, primera tabla del documento
      let table = doc.querySelector('table#size-guide') || doc.querySelector('table');
      if (!table) {
        return { contentHtml: html, sizeTableHtml: '', tolerance: '' };
      }

      // Clonar y limpiar estilos inline para que nuestros estilos apliquen bien
      const cleanTable = table.cloneNode(true) as HTMLElement;
      cleanTable.removeAttribute('style');
      cleanTable.id = 'size-guide';
      cleanTable.classList.add('size-guide-table');
      cleanTable.querySelectorAll('[style]').forEach((el) => (el as HTMLElement).removeAttribute('style'));

      // Buscar y extraer la fila de tolerancia (última fila)
      let tolerance = '';
      const lastRow = cleanTable.querySelector('tbody tr:last-child');
      if (lastRow) {
        const firstCell = lastRow.querySelector('td');
        if (firstCell && firstCell.textContent?.toLowerCase().includes('tolerancia')) {
          // Extraer el valor de tolerancia (segunda celda)
          const toleranceCell = lastRow.querySelector('td:nth-child(2)');
          if (toleranceCell) {
            tolerance = toleranceCell.textContent?.trim() || '';
            // Convertir a formato ±X cm
            if (tolerance) {
              tolerance = `±${tolerance} cm`;
            }
          }
          // Eliminar la fila de tolerancia
          lastRow.remove();
        }
      }

      // Añadir "Talla" en la primera celda del encabezado
      const firstTh = cleanTable.querySelector('thead tr th');
      if (firstTh) {
        firstTh.textContent = 'Talla';
      }

      // Eliminar la tabla del contenido
      table.parentElement?.removeChild(table);

      return {
        contentHtml: doc.body.innerHTML,
        sizeTableHtml: cleanTable.outerHTML,
        tolerance,
      };
    } catch (e) {
      return { contentHtml: html, sizeTableHtml: '', tolerance: '' };
    }
  }, []);

  // Extrae secciones específicas (por ejemplo: Características, Instrucciones de Cuidado)
  const extractCollapsibleSections = React.useCallback((html: string, titles: string[]) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const normalize = (s: string) =>
        s
          .replace(/:\s*$/g, '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();

      const titleMap = new Map<string, string>();
      titles.forEach(t => titleMap.set(normalize(t), t));

      const bodyNodes = Array.from(doc.body.childNodes);
      const removed = new Array(bodyNodes.length).fill(false);
      const sections: { [key: string]: string } = {};

      let i = 0;
      while (i < bodyNodes.length) {
        const node = bodyNodes[i];
        const text = node.textContent || '';
        const norm = normalize(text);

        if (titleMap.has(norm)) {
          const titleKey = titleMap.get(norm) || norm;
          const collected: string[] = [];

          // recolectar nodos a partir del siguiente hasta antes del siguiente título
          let j = i + 1;
          while (j < bodyNodes.length) {
            const nextText = bodyNodes[j].textContent || '';
            const nextNorm = normalize(nextText);
            if (titleMap.has(nextNorm)) break;
            const nextNode = bodyNodes[j] as HTMLElement;
            collected.push(nextNode.outerHTML || nextNode.textContent || '');
            removed[j] = true; // marcar para no reconstruir en cleanedHtml
            j++;
          }

          // marcar también el nodo del título para que no aparezca en cleanedHtml
          removed[i] = true;

          sections[titleKey] = collected.join('');

          i = j; // continuar desde el siguiente título
          continue;
        }

        i++;
      }

      // Reconstruir cleanedHtml con nodos no removidos
      const cleaned = bodyNodes
        .map((n, idx) => (removed[idx] ? '' : ((n as HTMLElement).outerHTML || n.textContent || '')))
        .join('');

      return { cleanedHtml: cleaned, sections };
    } catch (e) {
      return { cleanedHtml: html, sections: {} };
    }
  }, []);

  const { contentHtml, sizeTableHtml, tolerance } = React.useMemo(() => {
    const raw = currentProduct?.description || '';
    const html = formatDescription(raw);
    return extractSizeGuide(html);
  }, [currentProduct?.description, extractSizeGuide]);

  // Separar las secciones desplegables (Características e Instrucciones) de la descripción
  const { cleanedHtml: descriptionMainHtml, sections: collapsibleSections } = React.useMemo(() => {
    const titles = ['Características del Producto', 'Instrucciones de Cuidado'];
    return extractCollapsibleSections(contentHtml, titles);
  }, [contentHtml, extractCollapsibleSections]);

  // Actualizar índice cuando cambia la imagen actual
  React.useEffect(() => {
    if (currentImage && galleryImages.length > 0) {
      const index = galleryImages.findIndex(img => img.src === currentImage.src);
      if (index !== -1) {
        setCurrentImageIndex(index);
      }
    }
  }, [currentImage, galleryImages]);

  // Bloquear scroll del body solo cuando se confirme swipe horizontal
  React.useEffect(() => {
    if (isHorizontalSwipe === true && (isCarouselActive || isDragging)) {
      // Prevenir scroll del body solo si es swipe horizontal confirmado
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'pan-y'; // Permitir scroll vertical pero no horizontal
    } else {
      // Restaurar scroll normal del body
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isHorizontalSwipe, isCarouselActive, isDragging]);

  const handleOptionChange = (optionType: 'color' | 'size', valueId: number) => {
    setSelectedOptions(prev => ({ ...prev, [optionType]: valueId }));
    
    // Si es un cambio de color, actualizar inmediatamente la imagen
    if (optionType === 'color' && currentProduct) {
      const colorObj = availableOptions.colors.find((c: any) => c.id === valueId);
      if (colorObj) {
        // Obtener las imágenes para el nuevo color inmediatamente
        const variantsForNewColor = currentProduct.variants?.filter(v => v.options.includes(valueId)) || [];
        const variantIdsForNewColor = new Set(variantsForNewColor.map(v => v.id));
        const imagesForNewColor = currentProduct.images.filter(img => 
          img.variant_ids.some(id => variantIdsForNewColor.has(id))
        );
        
        // Actualizar imagen inmediatamente si hay imágenes para este color
        if (imagesForNewColor.length > 0) {
          setCurrentImage(imagesForNewColor[0]);
        }
        
        const newColorParam = encodeURIComponent(colorObj.title);
        const currentColorParam = queryParams.color;
        
        // Solo navegar si el color realmente cambió en la URL
        if (currentColorParam !== colorObj.title) {
          navigate(`/producto/${slugify(currentProduct.title)}?color=${newColorParam}`, { replace: true });
        }
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !currentProduct) return;
    const sizeTitle = allProductOptions.sizes?.find(s => s.id === selectedOptions.size)?.title || '';
    
    // Obtener imagen optimizada para el carrito
    const imageToUse = currentImage || currentProduct.images[0];
    const optimizedImageUrl = imageToUse ? getOptimizedImageUrl(imageToUse) : '';
    
    const cartItem = {
      productId: currentProduct.id,
      variantId: selectedVariant.id,
      quantity: quantity,
      title: currentProduct.title,
      price: selectedVariant.price / 100,
      image: optimizedImageUrl,
      size: sizeTitle,
      color: selectedColorName || '',
    };
    addItem(cartItem);
  };

  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spanish-red"></div>
        <span className="ml-4 text-white">Cargando producto...</span>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Producto no encontrado</h2>
            <p className="text-slate-400 mb-8">El producto que buscas no existe o ha sido eliminado.</p>
            
            {/* Botones de navegación */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <ArrowLeft size={20} />
                Volver atrás
              </button>
              
              <button
                onClick={() => {
                  console.log('🔄 Navegando a /productos con reload completo');
                  window.location.href = '/productos';
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-spanish-red text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ShoppingCart size={20} />
                Ver todos los productos
              </button>
              
              <button
                onClick={() => {
                  console.log('🏠 Navegando a / con reload completo');
                  window.location.href = '/';
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-spanish-yellow text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                <Home size={20} />
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        <div className="md:sticky md:top-28 h-max">
          {/* Carrusel móvil */}
          <div className="block md:hidden">
            <div 
              className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-800"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Contenedor deslizante */}
              <div 
                className={`flex h-full w-full ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
                style={{ 
                  transform: `translateX(calc(-${currentImageIndex * 100}% + ${isDragging ? -dragOffset : 0}px))`
                }}
              >
                {galleryImages.map((image, index) => (
                  <div 
                    key={image.src} 
                    className="w-full h-full flex-shrink-0"
                  >
                    <OptimizedImage
                      image={image}
                      alt={`${currentProduct.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                      responsive={true}
                    />
                  </div>
                ))}
              </div>
              
              {/* Indicadores de puntos */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToImage(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex
                          ? 'bg-spanish-yellow scale-125'
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Galería desktop (existente) */}
          <div className="hidden md:flex flex-row gap-4">
            <div className={`
              flex flex-col gap-2
              overflow-y-auto 
              max-h-[500px] pr-2 
              scrollbar-thin scrollbar-thumb-spanish-yellow scrollbar-track-slate-700
            `}>
              {galleryImages.map((image) => (
                <button
                  key={image.src}
                  onClick={() => setCurrentImage(image)}
                  className={`
                    w-20 h-20 flex-shrink-0
                    rounded-lg overflow-hidden transition-all duration-200
                    ${
                      currentImage?.src === image.src
                        ? 'border-4 border-spanish-yellow'
                        : 'border-2 border-slate-700 hover:border-spanish-yellow'
                    }`
                  }
                >
                  <OptimizedImage 
                    image={image} 
                    alt="thumbnail" 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>

            <div className="flex-1">
              {currentImage && (
                <OptimizedImage
                  image={currentImage}
                  alt={currentProduct.title}
                  className="w-full rounded-xl shadow-lg border-4 border-slate-800 aspect-square object-cover"
                  loading="eager"
                  responsive={true}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            {currentProduct.title}
          </h1>
          
          <div className="mb-6">
            <span className="text-3xl font-bold text-spanish-yellow">
              {selectedVariant ? formatPrice(selectedVariant.price / 100) : 'Selecciona una opción'}
            </span>
          </div>
          {availableOptions.colors && availableOptions.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase mb-2">
                Color: <span className="font-normal text-white capitalize">{selectedColorName}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {availableOptions.colors.map((color: any) => (
                  <button
                    key={color.id}
                    onClick={() => handleOptionChange('color', color.id)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedOptions.color === color.id
                        ? 'border-spanish-yellow ring-2 ring-spanish-yellow'
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
                    title={color.title}
                  >
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: color.colors[0] }}
                    />
                    {selectedOptions.color === color.id && (
                      <Check size={16} className="text-white absolute mix-blend-difference" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          {availableOptions.sizes && availableOptions.sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase">Talla</h3>
                {sizeTableHtml && (
                  <button
                    onClick={() => setIsSizeGuideModalOpen(true)}
                    className="text-xs text-slate-400 hover:text-spanish-yellow transition-colors underline decoration-dotted underline-offset-2 flex items-center gap-1"
                    title="Ver guía de tallas"
                  >
                    <Ruler className="w-3 h-3" />
                    Guía de tallas
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableOptions.sizes.map((size: any) => (
                  <button
                    key={size.id}
                    onClick={() => handleOptionChange('size', size.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors font-semibold ${
                      selectedOptions.size === size.id
                        ? 'bg-spanish-yellow text-slate-900 border-spanish-yellow'
                        : 'bg-slate-800 text-slate-300 border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {size.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mb-8">
            <h3 className="text-sm font-patriot font-bold text-slate-300 uppercase mb-2 tracking-wider">Cantidad</h3>
            <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg p-1 max-w-[140px]">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 text-spanish-yellow hover:bg-slate-700 rounded-md transition-colors">
                <Minus size={20} />
              </button>
              <span className="text-xl font-bold text-white px-2">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="p-2 text-spanish-yellow hover:bg-slate-700 rounded-md transition-colors">
                <Plus size={20} />
              </button>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant}
            className="w-full md:w-auto bg-spanish-yellow text-slate-900 font-bold px-8 py-4 rounded-lg shadow border-2 border-spanish-yellow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-yellow-400 hover:scale-105 hover:shadow-lg hover:text-slate-900"
          >
            <ShoppingCart size={20} />
            {selectedVariant ? 'Añadir al carrito' : 'Selecciona Talla y Color'}
          </button>
          <div className="mt-8">
            <div className="rich-text mb-6" dangerouslySetInnerHTML={{ __html: descriptionMainHtml }} />

            {/* Secciones colapsables extraídas: Características e Instrucciones de Cuidado */}
            {collapsibleSections && Object.keys(collapsibleSections).length > 0 && (
              <div className="mb-6">
                {Object.entries(collapsibleSections).map(([title, html], idx) => {
                  const isProduct = title === 'Características del Producto';
                  const isCare = title === 'Instrucciones de Cuidado';
                  return (
                    <details key={idx} className="collapsible-section mb-4">
                      <summary className={`collapsible-summary ${isProduct ? 'product-summary' : isCare ? 'care-summary' : ''}`}>
                        <div className="collapsible-title flex items-center gap-3">
                          {isProduct ? (
                            // Icono representativo para Características: estrella/quality
                            <svg className="w-5 h-5 text-spanish-yellow" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.6 5.46L19.335 24 12 20.011 4.665 24l1.535-8.79L.6 9.75l7.732-1.732L12 .587z" />
                            </svg>
                          ) : isCare ? (
                            // Icono representativo para Instrucciones: gota de agua
                            <svg className="w-5 h-5 text-spanish-yellow" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2.69l-.61.72C9.8 5.23 6 9.78 6 13.5A6 6 0 0012 19a6 6 0 006-5.5c0-3.72-3.8-8.27-5.39-10.09L12 2.69z" />
                            </svg>
                          ) : (
                            <svg className="collapsible-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                          <span>{title}</span>
                        </div>
                        <svg className="chevron" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                        </svg>
                      </summary>
                      <div className="collapsible-content">
                        <div dangerouslySetInnerHTML={{ __html: html }} />
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
            {/* GPSR */}
            {Array.isArray(currentGPSR) && currentGPSR.length > 0 && (
              <div className="mb-6">
                <details className="collapsible-section">
                  <summary className="collapsible-summary">
                    <div className="collapsible-title">
                      <svg className="collapsible-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Información de seguridad del producto (GPSR)
                    </div>
                    <svg className="chevron" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </summary>
                  <div className="collapsible-content">
                    <div className="gpsr-content">
                      {currentGPSR.map((section, idx) => (
                        <div key={idx} className="gpsr-item">
                          <h4 className="gpsr-item-title">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {section.title}
                          </h4>
                          <p className="gpsr-item-text">{section.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mb-6">
              {currentProduct.tags.map((tag, idx) => (
                <span key={idx} className="bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de guía de tallas */}
      {isSizeGuideModalOpen && sizeTableHtml && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsSizeGuideModalOpen(false)}
        >
          <div 
            className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Ruler className="w-4 h-4 md:w-5 md:h-5 text-spanish-yellow" />
                  Guía de tallas
                </h2>
                {tolerance && (
                  <p className="text-sm text-slate-400 mt-1">Tolerancia {tolerance}</p>
                )}
              </div>
              <button
                onClick={() => setIsSizeGuideModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Cerrar"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-auto max-h-[calc(90vh-120px)]">
              <div className="size-guide-container size-guide-modal">
                <div dangerouslySetInnerHTML={{ __html: sizeTableHtml }} />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Reviews carousel for this product */}
      <div className="w-full py-20">
        <ReviewsCarousel productId={currentProduct.id} arrowEdgeExtra={20} />
      </div>
  </div>  
  );
};