import axios from 'axios';
import { config } from '../config';
import type { Product, ProductVariant, CartItem, ShippingAddress, ApiResponse, PaymentIntent, CheckoutSession } from '../types';

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const apiService = {
  // Productos
  async getProducts(): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>('/products');
    return response.data.data || [];
  },

  async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error getting product ${id}:`, error);
      return null;
    }
  },

  async getProductVariants(id: string): Promise<ProductVariant[]> {
    const response = await api.get<ApiResponse<ProductVariant[]>>(`/products/${id}/variants`);
    return response.data.data || [];
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>('/products/featured');
    return response.data.data || [];
  },

  async searchProducts(query: string): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data.data || [];
  },

  // Pedidos
  async createPaymentIntent(items: CartItem[], shippingAddress: ShippingAddress): Promise<PaymentIntent> {
    const response = await api.post<ApiResponse<PaymentIntent>>('/orders/payment-intent', {
      items,
      shipping_address: shippingAddress
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Error creating payment intent');
    }
    
    return response.data.data;
  },

  async createCheckoutSession(items: CartItem[]): Promise<CheckoutSession> {
    const response = await api.post<ApiResponse<CheckoutSession>>('/orders/checkout-session', {
      items
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Error creating checkout session');
    }
    
    return response.data.data;
  },

  async processOrder(paymentIntentId?: string, sessionId?: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/orders/process', {
      payment_intent_id: paymentIntentId,
      session_id: sessionId
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error processing order');
    }
    
    return response.data.data;
  },

  async getOrderStatus(orderId: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/orders/${orderId}/status`);
    return response.data.data;
  },

  async calculateShipping(items: CartItem[], address: ShippingAddress): Promise<any[]> {
    const response = await api.post<ApiResponse<any[]>>('/orders/shipping', {
      items,
      address
    });
    return response.data.data || [];
  }
};

export default apiService;

