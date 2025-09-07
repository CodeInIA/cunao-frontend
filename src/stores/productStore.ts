import { create } from 'zustand';
import apiService from '../services/api';
import type { Product, ProductVariant, LoadingState } from '../types';

interface ProductStore {
  products: Product[];
  featuredProducts: Product[];
  currentProduct: Product | null;
  currentVariants: ProductVariant[];
  currentGPSR: Array<{title: string, text: string}>;
  loadingState: LoadingState;
  error: string | null;
  // Acciones
  fetchProducts: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  fetchProductGPSR: (id: string) => Promise<void>;
  fetchProductVariants: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  featuredProducts: [],
  currentProduct: null,
  currentVariants: [],
  currentGPSR: [],
  loadingState: 'idle',
  error: null,
  fetchProductGPSR: async (id: string) => {
    try {
      const gpsr = await apiService.getProductGPSR(id);
      set({ currentGPSR: gpsr });
    } catch (error) {
      set({ currentGPSR: [] });
    }
  },

  fetchProducts: async () => {
    set({ loadingState: 'loading', error: null });
    try {
      const products = await apiService.getProducts();
      set({ products, loadingState: 'success' });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar productos',
        loadingState: 'error' 
      });
    }
  },

  fetchFeaturedProducts: async () => {
    try {
      const featuredProducts = await apiService.getFeaturedProducts();
      set({ featuredProducts });
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  },

  fetchProduct: async (id: string) => {
    set({ loadingState: 'loading', error: null });
    try {
      const product = await apiService.getProduct(id);
      if (product) {
        set({ currentProduct: product, loadingState: 'success' });
      } else {
        set({ 
          error: 'Producto no encontrado',
          loadingState: 'error' 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar producto',
        loadingState: 'error' 
      });
    }
  },

  fetchProductVariants: async (id: string) => {
    try {
      const variants = await apiService.getProductVariants(id);
      set({ currentVariants: variants });
    } catch (error) {
      console.error('Error fetching product variants:', error);
    }
  },

  searchProducts: async (query: string) => {
    set({ loadingState: 'loading', error: null });
    try {
      const products = await apiService.searchProducts(query);
      set({ products, loadingState: 'success' });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error en la búsqueda',
        loadingState: 'error' 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetState: () => {
    set({ 
      error: null, 
      loadingState: 'idle',
      currentProduct: null,
      currentVariants: [],
      currentGPSR: []
    });
  },
}));

