import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import type { ProductVariant } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentProduct, fetchProduct, loadingState, error, currentGPSR, fetchProductGPSR } = useProductStore();
  const { addItem } = useCartStore();

  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: number }>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      fetchProductGPSR(id);
    }
  }, [id, fetchProduct, fetchProductGPSR]);

  // Extraer y organizar las opciones del producto (tallas, colores)
  const productOptions = useMemo(() => {
    if (!currentProduct?.options) return {};
    const optionsMap: { [key: string]: any[] } = {};
    currentProduct.options.forEach(option => {
      optionsMap[option.name.toLowerCase()] = option.values;
    });
    return optionsMap;
  }, [currentProduct]);

  // Establecer la variante por defecto al cargar el producto
  useEffect(() => {
    if (currentProduct?.variants) {
      const defaultVariant = currentProduct.variants.find(v => v.is_default) || currentProduct.variants[0];
      if (defaultVariant) {
        setSelectedVariant(defaultVariant);
        const initialOptions: { [key: string]: number } = {};
        defaultVariant.options.forEach(optId => {
          for (const optionType in productOptions) {
            if (productOptions[optionType].some(val => val.id === optId)) {
              const key = optionType === 'colors' ? 'color' : 'size';
              initialOptions[key] = optId;
            }
          }
        });
        setSelectedOptions(initialOptions);
      }
    }
  }, [currentProduct, productOptions]);

  // Actualizar la variante seleccionada cuando cambian las opciones
  useEffect(() => {
    if (currentProduct?.variants && Object.keys(selectedOptions).length > 0) {
      const variant = currentProduct.variants.find(v => 
        v.is_enabled && v.options.every(optId => Object.values(selectedOptions).includes(optId))
      );
      setSelectedVariant(variant || null);
    }
  }, [selectedOptions, currentProduct]);

  const handleOptionChange = (optionType: 'color' | 'size', valueId: number) => {
    setSelectedOptions(prev => ({ ...prev, [optionType]: valueId }));
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const colorTitle = productOptions.colors?.find(c => c.id === selectedOptions.color)?.title || '';
    const sizeTitle = productOptions.sizes?.find(s => s.id === selectedOptions.size)?.title || '';

    const cartItem = {
      productId: currentProduct!.id,
      variantId: selectedVariant.id,
      quantity: quantity,
      title: currentProduct!.title,
      price: selectedVariant.price / 100, // El precio de Printify viene en céntimos
      image: currentProduct!.images[0]?.src || '',
      size: sizeTitle,
      color: colorTitle,
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
        {/* Imagen */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={currentProduct.images[0]?.src}
            alt={currentProduct.title}
            className="max-w-md w-full rounded-xl shadow-lg border-4 border-slate-800"
          />
        </div>
        {/* Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            {currentProduct.title}
          </h1>
          
          {/* Precio */}
          <div className="mb-6">
            <span className="text-3xl font-bold text-spanish-yellow">
              {selectedVariant ? formatPrice(selectedVariant.price / 100) : 'Selecciona una opción'}
            </span>
          </div>

          {/* Selector de Color */}
          {productOptions.colors && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase mb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {productOptions.colors.map((color: any) => (
                  <button
                    key={color.id}
                    onClick={() => handleOptionChange('color', color.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedOptions.color === color.id
                        ? 'border-spanish-yellow ring-2 ring-spanish-yellow'
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {color.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de Talla */}
          {productOptions.sizes && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase mb-2">Talla</h3>
              <div className="flex flex-wrap gap-2">
                {productOptions.sizes.map((size: any) => (
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

          {/* Selector de Cantidad */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-300 uppercase mb-2">Cantidad</h3>
            <div className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg p-2 max-w-xs">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 text-spanish-yellow hover:bg-slate-700 rounded-md">
                <Minus size={16} />
              </button>
              <span className="text-lg font-bold text-white w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="p-2 text-spanish-yellow hover:bg-slate-700 rounded-md">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Botón Añadir al Carrito */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant}
            className="w-full md:w-auto bg-spanish-yellow text-slate-900 font-bold px-8 py-4 rounded-lg shadow hover:bg-spanish-red hover:text-white transition-colors border-2 border-spanish-yellow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
            {selectedVariant ? 'Añadir al carrito' : 'Opción no disponible'}
          </button>
          
          {/* Descripción y Tags */}
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
