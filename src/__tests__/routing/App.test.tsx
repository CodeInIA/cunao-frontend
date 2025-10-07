import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from '../../App';

// Mock all stores
vi.mock('../../stores/cartStore', () => ({
  useCartStore: vi.fn(() => ({
    getTotalItems: vi.fn(() => 0),
    isOpen: false,
    toggleCart: vi.fn(),
    cartShake: false,
  })),
}));

vi.mock('../../stores/productStore', () => ({
  useProductStore: vi.fn(() => ({
    products: [],
    isLoading: false,
    error: null,
    fetchProducts: vi.fn(),
  })),
}));

// Mock hooks
vi.mock('../../hooks/useGtag', () => ({
  trackEvent: vi.fn(),
  usePageTracking: vi.fn(),
}));

vi.mock('../../utils/consent', () => ({
  getConsent: vi.fn(() => ({ analytics: true })),
  saveConsent: vi.fn(),
}));

describe('App Routing', () => {
  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // App should render
    expect(document.body).toBeTruthy();
  });

  it('should render home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Home page should render (adjust based on actual content)
    expect(document.body).toBeTruthy();
  });
});
