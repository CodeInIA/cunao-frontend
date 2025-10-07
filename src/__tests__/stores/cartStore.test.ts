import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../../stores/cartStore';
import type { CartItem } from '../../types';

describe('CartStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({ items: [], isOpen: false, cartShake: false });
  });

  describe('addItem', () => {
    it('should add a new item to the cart', () => {
      const item: CartItem = {
        productId: '123',
        variantId: 456,
        title: 'Test Product',
        price: 25.99,
        quantity: 1,
        image: 'test.jpg',
        size: 'M',
        color: 'Red',
      };

      useCartStore.getState().addItem(item);
      
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject(item);
    });

    it('should increase quantity when adding existing item', () => {
      const item: CartItem = {
        productId: '123',
        variantId: 456,
        title: 'Test Product',
        price: 25.99,
        quantity: 1,
        image: 'test.jpg',
        size: 'M',
        color: 'Red',
      };

      useCartStore.getState().addItem(item);
      useCartStore.getState().addItem({ ...item, quantity: 2 });
      
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });

    it('should add different variants as separate items', () => {
      const item1: CartItem = {
        productId: '123',
        variantId: 456,
        title: 'Test Product',
        price: 25.99,
        quantity: 1,
        image: 'test.jpg',
        size: 'M',
        color: 'Red',
      };

      const item2: CartItem = {
        ...item1,
        variantId: 789,
        size: 'L',
      };

      useCartStore.getState().addItem(item1);
      useCartStore.getState().addItem(item2);
      
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      const item: CartItem = {
        productId: '123',
        variantId: 456,
        title: 'Test Product',
        price: 25.99,
        quantity: 1,
        image: 'test.jpg',
        size: 'M',
        color: 'Red',
      };

      useCartStore.setState({ items: [item] });
      useCartStore.getState().removeItem('123', 456);
      
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('should not remove items with different variantId', () => {
      const item1: CartItem = {
        productId: '123',
        variantId: 456,
        title: 'Test Product',
        price: 25.99,
        quantity: 1,
        image: 'test.jpg',
        size: 'M',
        color: 'Red',
      };

      const item2: CartItem = {
        ...item1,
        variantId: 789,
      };

      useCartStore.setState({ items: [item1, item2] });
      useCartStore.getState().removeItem('123', 456);
      
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].variantId).toBe(789);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const item: CartItem = {
        productId: '123',
        variantId: 456,
        title: 'Test Product',
        price: 25.99,
        quantity: 1,
        image: 'test.jpg',
        size: 'M',
        color: 'Red',
      };

      useCartStore.setState({ items: [item] });
      useCartStore.getState().updateQuantity('123', 456, 5);
      
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0', () => {
      const item: CartItem = {
        productId: '123',
        variantId: 456,
        title: 'Test Product',
        price: 25.99,
        quantity: 1,
        image: 'test.jpg',
        size: 'M',
        color: 'Red',
      };

      useCartStore.setState({ items: [item] });
      useCartStore.getState().updateQuantity('123', 456, 0);
      
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const items: CartItem[] = [
        {
          productId: '123',
          variantId: 456,
          title: 'Product 1',
          price: 25.99,
          quantity: 1,
          image: 'test1.jpg',
          size: 'M',
          color: 'Red',
        },
        {
          productId: '456',
          variantId: 789,
          title: 'Product 2',
          price: 35.99,
          quantity: 2,
          image: 'test2.jpg',
          size: 'L',
          color: 'Blue',
        },
      ];

      useCartStore.setState({ items });
      useCartStore.getState().clearCart();
      
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('cart visibility', () => {
    it('should toggle cart visibility', () => {
      expect(useCartStore.getState().isOpen).toBe(false);
      
      useCartStore.getState().toggleCart();
      expect(useCartStore.getState().isOpen).toBe(true);
      
      useCartStore.getState().toggleCart();
      expect(useCartStore.getState().isOpen).toBe(false);
    });

    it('should open cart', () => {
      useCartStore.getState().openCart();
      expect(useCartStore.getState().isOpen).toBe(true);
    });

    it('should close cart', () => {
      useCartStore.setState({ isOpen: true });
      useCartStore.getState().closeCart();
      expect(useCartStore.getState().isOpen).toBe(false);
    });
  });

  describe('getters', () => {
    it('should calculate total items correctly', () => {
      const items: CartItem[] = [
        {
          productId: '123',
          variantId: 456,
          title: 'Product 1',
          price: 25.99,
          quantity: 2,
          image: 'test1.jpg',
          size: 'M',
          color: 'Red',
        },
        {
          productId: '456',
          variantId: 789,
          title: 'Product 2',
          price: 35.99,
          quantity: 3,
          image: 'test2.jpg',
          size: 'L',
          color: 'Blue',
        },
      ];

      useCartStore.setState({ items });
      expect(useCartStore.getState().getTotalItems()).toBe(5);
    });

    it('should calculate total price correctly', () => {
      const items: CartItem[] = [
        {
          productId: '123',
          variantId: 456,
          title: 'Product 1',
          price: 10,
          quantity: 2,
          image: 'test1.jpg',
          size: 'M',
          color: 'Red',
        },
        {
          productId: '456',
          variantId: 789,
          title: 'Product 2',
          price: 15,
          quantity: 3,
          image: 'test2.jpg',
          size: 'L',
          color: 'Blue',
        },
      ];

      useCartStore.setState({ items });
      // 10*2 + 15*3 = 20 + 45 = 65
      expect(useCartStore.getState().getTotalPrice()).toBe(65);
    });

    it('should get item count correctly', () => {
      const items: CartItem[] = [
        {
          productId: '123',
          variantId: 456,
          title: 'Product 1',
          price: 25.99,
          quantity: 5,
          image: 'test1.jpg',
          size: 'M',
          color: 'Red',
        },
      ];

      useCartStore.setState({ items });
      expect(useCartStore.getState().getItemCount('123', 456)).toBe(5);
      expect(useCartStore.getState().getItemCount('123', 999)).toBe(0);
    });
  });

  describe('cart shake animation', () => {
    it('should trigger cart shake', () => {
      expect(useCartStore.getState().cartShake).toBe(false);
      useCartStore.getState().triggerCartShake();
      expect(useCartStore.getState().cartShake).toBe(true);
    });
  });
});
