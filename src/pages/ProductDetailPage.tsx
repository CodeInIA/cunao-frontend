import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { formatPrice, slugify } from '../utils/formatters';
import type { ProductVariant, ProductImage } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProduct, fetchProduct, loadingState, error, currentGPSR, fetchProductGPSR } = useProductStore();
  const { addItem } = useCartStore();

  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: number }>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState<ProductImage | null>(null);

  // Precarga de imágenes
  useEffect(() => {
    if (currentProduct && currentProduct.images) {
      currentProduct.images.forEach((image) => {
        const img = new Image();
        img.src = image.src;
      });
    }
  }, [currentProduct]);

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
    const variantsForColor = currentProduct.variants
      ? currentProduct.variants.filter(v => v.options.includes(selectedOptions.color))
      : [];
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
  
  useEffect(() => {
    if (currentProduct) {
        let initialOptions: { [key: string]: number } = {};
        if (queryParams.color) {
            const colorObj = allProductOptions.colors.find(c => c.title.toLowerCase() === queryParams.color.toLowerCase());
            if (colorObj) initialOptions.color = colorObj.id;
        }
        if (!initialOptions.color) {
            const defaultVariant = currentProduct.variants?.find(v => v.is_default && v.is_enabled);
            if (defaultVariant) {
                const colorOption = defaultVariant.options.find(optId => allProductOptions.colors.some(c => c.id === optId));
                if (colorOption) initialOptions.color = colorOption;
            }
        }
        if (!initialOptions.color && availableOptions.colors.length > 0) {
            initialOptions.color = availableOptions.colors[0].id;
        }
        if (availableOptions.sizes.length > 0) {
            initialOptions.size = availableOptions.sizes[0].id;
        }
        setSelectedOptions(initialOptions);
    }
  }, [currentProduct, allProductOptions, availableOptions, queryParams.color]);

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
    if (galleryImages.length > 0) {
      if (!galleryImages.some(img => img.src === currentImage?.src)) {
        setCurrentImage(galleryImages[0]);
      }
    }
  }, [galleryImages, currentImage]);

  const handleOptionChange = (optionType: 'color' | 'size', valueId: number) => {
    setSelectedOptions(prev => ({ ...prev, [optionType]: valueId }));
    if (optionType === 'color' && currentProduct) {
      const colorObj = availableOptions.colors.find((c: any) => c.id === valueId);
      if (colorObj) {
        navigate(`/producto/${slugify(currentProduct.title)}?color=${encodeURIComponent(colorObj.title)}`, { replace: true });
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !currentProduct) return;
    const sizeTitle = allProductOptions.sizes?.find(s => s.id === selectedOptions.size)?.title || '';
    const cartItem = {
      productId: currentProduct.id,
      variantId: selectedVariant.id,
      quantity: quantity,
      title: currentProduct.title,
      price: selectedVariant.price / 100,
      image: currentImage?.src || currentProduct.images[0]?.src || '',
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
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="md:sticky md:top-28 h-max">
          <div className="flex flex-row-reverse md:flex-row gap-4">
            <div className="flex-1">
              <img
                src={currentImage?.src}
                alt={currentProduct.title}
                className="w-full rounded-xl shadow-lg border-4 border-slate-800 aspect-square object-cover"
              />
            </div>
            {/* ▼▼▼ CAMBIO 2: AÑADIMOS LAS CLASES DE SCROLLBAR ▼▼▼ */}
            <div className="flex md:flex-col gap-2 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-spanish-yellow scrollbar-track-slate-700">
              {galleryImages.map((image) => (
                <button
                  key={image.src}
                  onClick={() => setCurrentImage(image)}
                  // ▼▼▼ CAMBIO 1: AJUSTE DE CLASES PARA EL BORDE ▼▼▼
                  className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200
                    ${
                      currentImage?.src === image.src
                        ? 'border-4 border-spanish-yellow' // Borde más grueso y amarillo
                        : 'border-2 border-slate-700 hover:border-spanish-yellow' // Borde normal
                    }`
                  }
                >
                  <img src={image.src} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
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
              <h3 className="text-sm font-bold text-slate-300 uppercase mb-2">Talla</h3>
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
            <div className="text-lg text-slate-300 mb-6 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: currentProduct.description }} />
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