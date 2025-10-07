import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from '../../components/Footer';

describe('Footer Component', () => {
  it('should render footer content', () => {
    const { getByRole } = render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const footer = getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('should render social media links', () => {
    const { getAllByRole } = render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    // Footer should contain links
    const links = getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should display copyright information', () => {
    const { getByRole } = render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    // Check for current year or copyright text
    const currentYear = new Date().getFullYear();
    const footerText = getByRole('contentinfo').textContent;
    expect(footerText).toContain(currentYear.toString());
  });

  it('should have proper semantic structure', () => {
    const { container } = render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
