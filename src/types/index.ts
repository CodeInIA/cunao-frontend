// Tipos de productos
export interface Product {
  id: string;
  title: string;
  description: string;
  tags: string[];
  options: ProductOption[];
  images: ProductImage[];
  created_at: string;
  updated_at: string;
  visible: boolean;
  variants?: ProductVariant[];
  gpsr?: string; // HTML GPSR
}

export interface ProductOption {
  name: string;
  type: string;
  values: OptionValue[];
}

export interface OptionValue {
  id: number;
  title: string;
  colors?: string[];
}

export interface ProductImage {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
  // URLs de CDN optimizadas
  cdnUrl?: string;
  cdnPublicId?: string;
  cdnUrls?: {
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  };
  alt?: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  cost: number;
  price: number;
  title: string;
  grams: number;
  is_enabled: boolean;
  is_default: boolean;
  is_available: boolean;
  options: number[];
}

// Tipos del carrito
export interface CartItem {
  productId: string;
  variantId: number;
  quantity: number;
  title: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
}

// Tipos de dirección
export interface ShippingAddress {
  first_name: string;
  last_name: string;
  company?: string;
  region: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
  email: string;
  phone?: string;
  country: string;
}

// Tipos de pedidos
export interface Order {
  id: string;
  external_id: string;
  status: string;
  line_items: OrderLineItem[];
  address_to: ShippingAddress;
  shipments: Shipment[];
  created_at: string;
  updated_at: string;
  total_price: number;
  total_shipping: number;
  total_tax: number;
}

export interface OrderLineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
}

export interface Shipment {
  carrier: string;
  number: string;
  url: string;
  delivered_at?: string;
}

// Tipos de respuesta API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos de Stripe
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface CheckoutSession {
  checkout_url: string;
  session_id: string;
}

// Tipos de filtros
export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Tipos de estado de carga
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Tipos de notificaciones
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Tipos de configuración
export interface Config {
  API_URL: string;
  STRIPE_PUBLIC_KEY: string;
  CURRENCY: string;
  DEFAULT_SHIPPING_COST: number;
}

