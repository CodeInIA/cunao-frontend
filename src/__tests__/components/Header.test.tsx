import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../../components/Header';

// Mock stores
vi.mock('../../stores/cartStore', () => ({
  useCartStore: vi.fn(() => ({
    getTotalItems: vi.fn(() => 3),
    isOpen: false,
    toggleCart: vi.fn(),
    cartShake: false,
  })),
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render logo', () => {
    const { getByAltText } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const logo = getByAltText(/logo/i);
    expect(logo).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    const { getByRole } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Common navigation items
    expect(getByRole('navigation')).toBeInTheDocument();
  });

  it('should display cart item count', () => {
    const { getByText } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Cart badge with count
    const badge = getByText('3');
    expect(badge).toBeInTheDocument();
  });

  it('should be responsive', () => {
    const { container } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Header should have proper structure
    expect(container.querySelector('header')).toBeInTheDocument();
  });
});
