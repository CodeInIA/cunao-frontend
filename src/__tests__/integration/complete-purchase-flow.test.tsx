import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import type { CartItem } from '../../types';

// Mock dependencies
vi.mock('../../hooks/useGtag', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('../../utils/consent', () => ({
  getConsent: vi.fn(() => ({ analytics: true })),
}));

vi.mock('../../stores/productStore', () => ({
  useProductStore: {
    getState: vi.fn(() => ({
      products: [],
    })),
  },
}));

describe('Complete Purchase Flow Integration', () => {
  beforeEach(() => {
    // Reset cart before each test
    useCartStore.setState({ items: [], isOpen: false, cartShake: false });
    vi.clearAllMocks();
  });

  it('should complete a full purchase flow: browse -> add to cart -> update -> checkout', async () => {
    // Step 1: Browse products and add to cart
    const product1: CartItem = {
      productId: 'prod_123',
      variantId: 456,
      title: 'Test T-Shirt',
      price: 25.99,
      quantity: 1,
      image: 'https://example.com/tshirt.jpg',
      size: 'M',
      color: 'Red',
    };

    act(() => {
      useCartStore.getState().addItem(product1);
    });

    expect(useCartStore.getState().items).toHaveLength(1);

    // Step 2: Add another product
    const product2: CartItem = {
      productId: 'prod_456',
      variantId: 789,
      title: 'Test Hoodie',
      price: 45.99,
      quantity: 2,
      image: 'https://example.com/hoodie.jpg',
      size: 'L',
      color: 'Blue',
    };

    act(() => {
      useCartStore.getState().addItem(product2);
    });

    expect(useCartStore.getState().items).toHaveLength(2);

    // Step 3: Update quantity
    act(() => {
      useCartStore.getState().updateQuantity('prod_123', 456, 3);
    });

    const item = useCartStore.getState().items.find(
      (i) => i.productId === 'prod_123'
    );
    expect(item?.quantity).toBe(3);

    // Step 4: Calculate totals
    const totalItems = useCartStore.getState().getTotalItems();
    const totalPrice = useCartStore.getState().getTotalPrice();

    expect(totalItems).toBe(5); // 3 + 2
    expect(totalPrice).toBeCloseTo(25.99 * 3 + 45.99 * 2, 2);

    // Step 5: Remove an item
    act(() => {
      useCartStore.getState().removeItem('prod_456', 789);
    });

    expect(useCartStore.getState().items).toHaveLength(1);

    // Step 6: Verify final state
    const finalItems = useCartStore.getState().items;
    expect(finalItems[0].productId).toBe('prod_123');
    expect(finalItems[0].quantity).toBe(3);

    // Step 7: Clear cart (after checkout)
    act(() => {
      useCartStore.getState().clearCart();
    });

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('should handle cart visibility during shopping flow', async () => {
    const product: CartItem = {
      productId: 'prod_123',
      variantId: 456,
      title: 'Test Product',
      price: 25.99,
      quantity: 1,
      image: 'test.jpg',
      size: 'M',
      color: 'Red',
    };

    // Initially cart is closed
    expect(useCartStore.getState().isOpen).toBe(false);

    // Add item and open cart
    act(() => {
      useCartStore.getState().addItem(product);
      useCartStore.getState().openCart();
    });

    expect(useCartStore.getState().isOpen).toBe(true);

    // Toggle cart
    act(() => {
      useCartStore.getState().toggleCart();
    });

    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it('should handle multiple variant updates in shopping flow', async () => {
    const product: CartItem = {
      productId: 'prod_123',
      variantId: 456,
      title: 'Test T-Shirt',
      price: 25.99,
      quantity: 1,
      image: 'test.jpg',
      size: 'M',
      color: 'Red',
    };

    act(() => {
      useCartStore.getState().addItem(product);
    });

    expect(useCartStore.getState().items).toHaveLength(1);

    // User decides to change size (removes old variant, adds new one)
    act(() => {
      useCartStore.getState().removeItem('prod_123', 456);
      useCartStore.getState().addItem({
        ...product,
        variantId: 789,
        size: 'L',
      });
    });

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].size).toBe('L');
    expect(items[0].variantId).toBe(789);
  });

  it('should calculate correct totals with discounts', async () => {
    const items: CartItem[] = [
      {
        productId: 'prod_1',
        variantId: 1,
        title: 'Product 1',
        price: 20,
        quantity: 2,
        image: 'test1.jpg',
        size: 'M',
        color: 'Red',
      },
      {
        productId: 'prod_2',
        variantId: 2,
        title: 'Product 2',
        price: 30,
        quantity: 1,
        image: 'test2.jpg',
        size: 'L',
        color: 'Blue',
      },
    ];

    act(() => {
      items.forEach(item => useCartStore.getState().addItem(item));
    });

    const total = useCartStore.getState().getTotalPrice();
    // 20*2 + 30*1 = 70
    expect(total).toBe(70);
  });
});
