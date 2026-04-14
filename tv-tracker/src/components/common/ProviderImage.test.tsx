import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProviderImage from './ProviderImage';
import { makeProvider } from '../../test/factories';

describe('ProviderImage', () => {
  it('renders images up to the count limit', () => {
    const providers = [
      makeProvider({ provider_id: 1, logo_path: '/a.png' }),
      makeProvider({ provider_id: 2, logo_path: '/b.png' }),
      makeProvider({ provider_id: 3, logo_path: '/c.png' }),
    ];
    render(<ProviderImage count={2} providers={providers} />);
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('renders providers regardless of display_priority (ordering is handled upstream)', () => {
    const providers = [
      makeProvider({ provider_id: 1, display_priority: 10, logo_path: '/a.png' }),
      makeProvider({ provider_id: 2, display_priority: 50, logo_path: '/b.png' }),
      makeProvider({ provider_id: 3, display_priority: 99, logo_path: '/c.png' }),
    ];
    render(<ProviderImage count={10} providers={providers} />);
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('excludes providers without logo_path', () => {
    const providers = [
      makeProvider({ provider_id: 1, logo_path: '/logo.png' }),
      makeProvider({ provider_id: 2, logo_path: undefined }),
    ];
    render(<ProviderImage count={10} providers={providers} />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('image src contains the provider logo_path', () => {
    render(
      <ProviderImage count={1} providers={[makeProvider({ logo_path: '/mylogo.png' })]} />
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('/mylogo.png'));
  });

  it('uses provider_name as alt text', () => {
    render(
      <ProviderImage count={1} providers={[makeProvider({ provider_name: 'Netflix' })]} />
    );
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Netflix');
  });

  it('falls back to "provider name missing" when provider_name is undefined', () => {
    render(
      <ProviderImage
        count={1}
        providers={[makeProvider({ provider_name: undefined })]}
      />
    );
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'provider name missing');
  });

  it('renders nothing when providers is undefined', () => {
    const { container } = render(<ProviderImage count={1} providers={undefined} />);
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});
