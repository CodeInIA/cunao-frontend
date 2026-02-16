import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';
import { useProductStore } from './productStore'; // Importar productStore
import { trackEvent } from '../hooks/useGtag';
import { getConsent } from '../utils/consent';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  cartShake: boolean; // <-- AÑADIR ESTADO DE ANIMACIÓN
  
  // Acciones
  addItem: (item: CartItem) => void;
  triggerCartShake: () => void; // <-- AÑADIR ACCIÓN PARA ACTIVAR
  removeItem: (productId: string, variantId: number) => void;
  updateQuantity: (productId: string, variantId: number, quantity: number) => void;
  updateVariant: (productId: string, oldVariantId: number, newSize: string, newColor: string) => void; // Añadir la nueva acción
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: (productId: string, variantId: number) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      cartShake: false, // <-- INICIALIZAR ESTADO

      addItem: (newItem: CartItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
          );

          if (existingItemIndex >= 0) {
            // Si el item ya existe, actualizar cantidad
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          } else {
            // Si es un item nuevo, agregarlo
            return { items: [...state.items, newItem] };
          }
        });
        // Tracking add_to_cart si hay consentimiento
        try {
          const consent = getConsent();
          if (consent?.analytics) {
            trackEvent('add_to_cart', {
              currency: 'EUR',
              value: newItem.price * newItem.quantity,
              items: [{ id: newItem.productId, name: newItem.title || '', price: newItem.price, quantity: newItem.quantity }]
            });
          }
        } catch (e) {
          console.warn('add_to_cart tracking failed', e);
        }

        get().triggerCartShake(); // <-- LLAMAR A LA ANIMACIÓN
      },

      triggerCartShake: () => {
        set({ cartShake: true });
        setTimeout(() => {
          set({ cartShake: false });
        }, 600); // Duración de la animación
      },

      removeItem: (productId: string, variantId: number) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId: string, variantId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      // Implementación de updateVariant
      updateVariant: (productId, oldVariantId, newSize, newColor) => {
        const { products } = useProductStore.getState();
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const sizeOption = product.options.find(o => o.type === 'size')?.values.find(v => v.title === newSize);
        const colorOption = product.options.find(o => o.type === 'color')?.values.find(v => v.title === newColor);
        if (!sizeOption || !colorOption) return;

        const newVariant = product.variants?.find(v => 
          v.is_enabled && v.is_available && v.options.includes(sizeOption.id) && v.options.includes(colorOption.id)
        );

        if (!newVariant || newVariant.id === oldVariantId) return;

        const newImage = product.images?.find(img => img.variant_ids.includes(newVariant.id))?.src || product.images?.[0]?.src || '';

        set(state => {
          const existingItem = state.items.find(i => i.variantId === oldVariantId);
          if (!existingItem) return state;

          const itemWithNewVariant = state.items.find(i => i.variantId === newVariant.id);
          
          let newItems;
          if (itemWithNewVariant) {
            // Si la nueva variante ya existe, fusiona las cantidades y elimina la antigua
            newItems = state.items
              .map(item => 
                item.variantId === newVariant.id 
                  ? { ...item, quantity: item.quantity + existingItem.quantity } 
                  : item
              )
              .filter(item => item.variantId !== oldVariantId);
          } else {
            // Si no existe, simplemente actualiza el item actual
            newItems = state.items.map(item =>
              item.variantId === oldVariantId
                ? {
                    ...item,
                    variantId: newVariant.id,
                    price: newVariant.price / 100,
                    size: newSize,
                    color: newColor,
                    image: newImage,
                  }
                : item
            );
          }
          return { items: newItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: (productId: string, variantId: number) => {
        const item = get().items.find(
          (item) => item.productId === productId && item.variantId === variantId
        );
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'cunao-cart-storage', // nombre único para localStorage
      partialize: (state) => ({ items: state.items }), // solo persistir items, no isOpen
    }
  )
);

