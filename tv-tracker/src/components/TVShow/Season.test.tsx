import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Season from './Season';
import { makeFullSeason } from '../../test/factories';

describe('Season', () => {
  it('renders the season name', () => {
    render(<Season data={makeFullSeason()} />);
    expect(screen.getByText('Season 1')).toBeInTheDocument();
  });

  it('renders the episode count', () => {
    render(<Season data={makeFullSeason()} />);
    expect(screen.getByText('Episodes: 2')).toBeInTheDocument();
  });

  it('renders the year from air_date', () => {
    render(<Season data={makeFullSeason({ air_date: '2024-03-15' })} />);
    expect(screen.getByText('(2024)')).toBeInTheDocument();
  });

  it('renders nothing for year when air_date is absent', () => {
    render(<Season data={makeFullSeason({ air_date: undefined })} />);
    expect(screen.queryByText(/\(\d{4}\)/)).not.toBeInTheDocument();
  });

  it('renders episode number and name', () => {
    render(<Season data={makeFullSeason()} />);
    expect(screen.getByText('1. Pilot')).toBeInTheDocument();
    expect(screen.getByText('2. Episode 2')).toBeInTheDocument();
  });

  it('renders episode air dates', () => {
    render(<Season data={makeFullSeason()} />);
    expect(screen.getByText('2024-01-08')).toBeInTheDocument();
  });

  it('renders without error when episodes is undefined', () => {
    const { container } = render(<Season data={makeFullSeason({ episodes: undefined })} />);
    expect(container).toBeInTheDocument();
    expect(screen.queryByText(/\. /)).not.toBeInTheDocument();
  });
});
