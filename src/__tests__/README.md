# Frontend Tests

This directory contains comprehensive tests for the Cuñadismo Ilustrado frontend.

## Test Structure

```
src/__tests__/
├── stores/                 # Zustand store tests
│   └── cartStore.test.ts
├── components/            # Component tests
│   ├── ProductCard.test.tsx
│   ├── Header.test.tsx
│   └── Footer.test.tsx
├── routing/              # React Router tests
│   └── App.test.tsx
├── integration/          # Integration tests
│   └── complete-purchase-flow.test.tsx
├── products/             # Product feature tests
├── cart/                 # Shopping cart tests
├── checkout/             # Checkout & Stripe tests
├── reviews/              # Reviews feature tests
├── newsletter/           # Newsletter tests
├── admin/                # Admin panel tests
├── a11y/                 # Accessibility tests
├── keyboard-navigation/  # Keyboard navigation tests
└── performance/          # Performance tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/__tests__/stores/cartStore.test.ts

# Run tests matching pattern
npm test -- cart
```

## Test Coverage

Current test coverage:
- **Stores**: CartStore with all actions and getters
- **Components**: ProductCard, Header, Footer
- **Routing**: App routing configuration
- **Integration**: Complete purchase flow (browse → cart → update → checkout)

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import YourComponent from '../../components/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(
      <BrowserRouter>
        <YourComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Store Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useYourStore } from '../../stores/yourStore';

describe('YourStore', () => {
  beforeEach(() => {
    useYourStore.setState({ /* initial state */ });
  });

  it('should update state correctly', () => {
    useYourStore.getState().yourAction();
    expect(useYourStore.getState().yourValue).toBe(expectedValue);
  });
});
```

### Integration Tests

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCartStore } from '../../stores/cartStore';

describe('Integration: Feature Flow', () => {
  it('should complete full user flow', async () => {
    act(() => {
      // Perform actions
    });

    await waitFor(() => {
      // Assert final state
    });
  });
});
```

## Mocking

### Mock Zustand Stores

```typescript
vi.mock('../../stores/cartStore', () => ({
  useCartStore: vi.fn(() => ({
    items: [],
    addItem: vi.fn(),
  })),
}));
```

### Mock API Calls

```typescript
vi.mock('../../services/api', () => ({
  fetchProducts: vi.fn(() => Promise.resolve(mockProducts)),
}));
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `beforeEach` to reset state
3. **Descriptive Names**: Use clear test descriptions
4. **Arrange-Act-Assert**: Follow AAA pattern
5. **Mock External Dependencies**: Mock API calls, routers, stores
6. **Test User Behavior**: Test what users do, not implementation details
7. **Accessibility**: Include a11y assertions

## CI/CD Integration

Tests run automatically in GitHub Actions:
- On every push and pull request
- Daily security audits
- Weekly comprehensive test suites
- Feature-specific workflows

See `.github/workflows/` for workflow configurations.
