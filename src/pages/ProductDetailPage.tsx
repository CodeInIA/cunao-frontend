import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { formatPrice, slugify } from '../utils/formatters';
import type { ProductVariant } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>(); // El 'id' ahora es un 'slug'
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProduct, fetchProduct, loadingState, error, currentGPSR, fetchProductGPSR } = useProductStore();
  const { addItem } = useCartStore();

  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: number }>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [variantImages, setVariantImages] = useState<any[]>([]);
  const [currentImage, setCurrentImage] = useState<any | null>(null);

  // Leer color del query param
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      color: params.get('color') || '',
    };
  }, [location.search]);

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
      fetchProductGPSR(slug);
    }
  }, [slug, fetchProduct, fetchProductGPSR]);

  const allProductOptions = useMemo(() => {
    if (!currentProduct?.options) return { colors: [], sizes: [] };
    const optionsMap: { [key: string]: any[] } = { colors: [], sizes: [] };
    currentProduct.options.forEach(option => {
      if (option.type === 'color') {
        optionsMap.colors = option.values;
      } else if (option.type === 'size') {
        optionsMap.sizes = option.values;
      }
    });
    return optionsMap;
  }, [currentProduct]);

  const availableOptions = useMemo(() => {
    if (!currentProduct?.variants) {
      return { colors: [], sizes: [] };
    }
    const enabledVariants = currentProduct.variants.filter(v => v.is_enabled);
    const availableOptionIds = new Set(enabledVariants.flatMap(v => v.options));

    const availableColors = allProductOptions.colors.filter(color => availableOptionIds.has(color.id));
    const availableSizes = allProductOptions.sizes.filter(size => availableOptionIds.has(size.id));

    return { colors: availableColors, sizes: availableSizes };
  }, [currentProduct?.variants, allProductOptions]);

  const selectedColorName = useMemo(() => {
    return allProductOptions.colors?.find(c => c.id === selectedOptions.color)?.title;
  }, [selectedOptions.color, allProductOptions.colors]);

  useEffect(() => {
    if (currentProduct?.variants && allProductOptions.colors.length > 0) {
      let initialOptions: { [key: string]: number } = {};
      let variantToSelect: ProductVariant | null = null;

      // Si hay color en el query param, buscarlo y preseleccionarlo
      if (queryParams.color) {
        const colorObj = allProductOptions.colors.find(c => c.title.toLowerCase() === queryParams.color.toLowerCase());
        if (colorObj) {
          initialOptions.color = colorObj.id;
          // Buscar variante con ese color y habilitada
          const variant = currentProduct.variants.find(v => v.is_enabled && v.options.includes(colorObj.id));
          if (variant) {
            variantToSelect = variant;
            // Preseleccionar talla si solo hay una
            if (allProductOptions.sizes.length === 1) {
              initialOptions.size = allProductOptions.sizes[0].id;
            } else {
              // Si la variante tiene talla, preseleccionarla
              variant.options.forEach(optId => {
                if (allProductOptions.sizes.some(s => s.id === optId)) {
                  initialOptions.size = optId;
                }
              });
            }
          }
        }
      }

      // Si no hay color en query param, usar variante por defecto
      if (!variantToSelect) {
        const foundDefault = currentProduct.variants.find(v => v.is_default && v.is_enabled);
        const foundEnabled = currentProduct.variants.find(v => v.is_enabled);
        variantToSelect = foundDefault || foundEnabled || null;
        if (variantToSelect) {
          variantToSelect.options.forEach(optId => {
            if (allProductOptions.colors.some(c => c.id === optId)) {
              initialOptions.color = optId;
            }
            if (allProductOptions.sizes.some(s => s.id === optId)) {
              initialOptions.size = optId;
            }
          });
        }
      }

      if (variantToSelect) {
        setSelectedVariant(variantToSelect);
        setSelectedOptions(initialOptions);
      }
    }
  }, [currentProduct, allProductOptions, queryParams.color]);

  useEffect(() => {
    if (currentProduct?.variants && Object.keys(selectedOptions).length > 0) {
      const variant = currentProduct.variants.find(v => 
        v.is_enabled && v.options.every(optId => Object.values(selectedOptions).includes(optId))
      );
      setSelectedVariant(variant || null);
    }
  }, [selectedOptions, currentProduct]);

  useEffect(() => {
    if (currentProduct && selectedVariant) {
      const imagesForVariant = currentProduct.images.filter(img => 
        img.variant_ids.includes(selectedVariant.id)
      );
      setVariantImages(imagesForVariant);
      
      if (imagesForVariant.length > 0) {
        setCurrentImage(imagesForVariant[0]);
      } else {
        setCurrentImage(currentProduct.images[0] || null);
      }
    }
  }, [selectedVariant, currentProduct]);

  const handleOptionChange = (optionType: 'color' | 'size', valueId: number) => {
    setSelectedOptions(prev => ({ ...prev, [optionType]: valueId }));
    if (optionType === 'color' && currentProduct) {
      const colorObj = availableOptions.colors.find((c: any) => c.id === valueId);
      if (colorObj) {
        // Actualizar la URL con el slug correcto y el nuevo color
        navigate(`/producto/${slugify(currentProduct.title)}?color=${encodeURIComponent(colorObj.title)}`, { replace: true });
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !currentProduct) return;

    // CAMBIO CLAVE: Buscar la imagen principal de la variante para el carrito
    const imagesForVariant = currentProduct.images.filter(img => 
      img.variant_ids.includes(selectedVariant.id)
    );
    const cartImageSrc = (imagesForVariant.length > 0 ? imagesForVariant[0].src : currentProduct.images[0]?.src) || '';

    const sizeTitle = allProductOptions.sizes?.find(s => s.id === selectedOptions.size)?.title || '';
    const cartItem = {
      productId: currentProduct.id,
      variantId: selectedVariant.id,
      quantity: quantity,
      title: currentProduct.title,
      price: selectedVariant.price / 100,
      image: cartImageSrc, // Usar la imagen principal de la variante
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Producto no encontrado</h2>
          <p className="text-slate-400 mb-6">El producto que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-12">
        {/* Imagen y Galería */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-md mb-4">
            <img
              src={currentImage?.src}
              alt={currentProduct.title}
              className="w-full rounded-xl shadow-lg border-4 border-slate-800 aspect-square object-cover"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {variantImages.map((image) => (
              <button
                key={image.src}
                onClick={() => setCurrentImage(image)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  currentImage?.src === image.src
                    ? 'border-spanish-yellow ring-2 ring-spanish-yellow'
                    : 'border-slate-700 hover:border-spanish-yellow'
                }`}
              >
                <img src={image.src} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        {/* Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            {currentProduct.title}
          </h1>
          
          <div className="mb-6">
            <span className="text-3xl font-bold text-spanish-yellow">
              {selectedVariant ? formatPrice(selectedVariant.price / 100) : 'Selecciona una opción'}
            </span>
          </div>

          {/* Selector de Color con Muestras */}
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

          {/* Selector de Talla */}
          {availableOptions.sizes && availableOptions.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase mb-2">Talla</h3>
              <div className="flex flex-wrap gap-2">
                {availableOptions.sizes.map((size: any) => (
                  <button
                    key={size.id}
                    onClick={() => handleOptionChange('size', size.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedOptions.size === size.id
                        ? 'border-spanish-yellow ring-2 ring-spanish-yellow'
                        : 'border-slate-600 hover:border-slate-400'
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
            {selectedVariant ? 'Añadir al carrito' : 'Opción no disponible'}
          </button>
          
          <div className="mt-8">
            <div className="text-lg text-slate-300 mb-6" dangerouslySetInnerHTML={{ __html: currentProduct.description }} />
            {Array.isArray(currentGPSR) && currentGPSR.length > 0 && (
              <div className="space-y-4 mb-8">
                {currentGPSR.map((section, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-2">{section.title}</h3>
                    <p className="text-base text-slate-300 whitespace-pre-line">{section.text}</p>
                  </div>
                ))}
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
    </div>
  );
};