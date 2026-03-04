import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { $counter } from '../lib/stores';
import LoadIsland from '../components/islands/LoadIsland';
import VisibleIsland from '../components/islands/VisibleIsland';
import CounterIsland from '../components/islands/CounterIsland';
import DisplayIsland from '../components/islands/DisplayIsland';

describe('Astro + React island hydration with shadcn/ui', () => {
  describe('LoadIsland (client:load)', () => {
    it('renders shadcn Button and is interactive on load', () => {
      render(<LoadIsland />);
      const button = screen.getByRole('button', { name: /increment/i });
      expect(button).toBeDefined();
    });

    it('increments counter when button is clicked', () => {
      render(<LoadIsland />);
      const button = screen.getByRole('button', { name: /increment/i });
      expect(screen.getByText('Count: 0')).toBeDefined();
      fireEvent.click(button);
      expect(screen.getByText('Count: 1')).toBeDefined();
    });
  });

  describe('VisibleIsland (client:visible)', () => {
    it('renders shadcn Card with Input inside', () => {
      render(<VisibleIsland />);
      expect(screen.getByRole('textbox')).toBeDefined();
    });

    it('reflects input value changes', () => {
      render(<VisibleIsland />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'tekon' } });
      expect(input.value).toBe('tekon');
    });
  });

  describe('nanostores cross-island state sharing', () => {
    beforeEach(() => {
      $counter.set(0);
    });

    it('CounterIsland and DisplayIsland share state via nanostore', () => {
      render(
        <div>
          <CounterIsland />
          <DisplayIsland />
        </div>
      );
      expect(screen.getByText('Display: 0')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: /add/i }));
      expect(screen.getByText('Display: 1')).toBeDefined();
    });

    it('nanostore change in CounterIsland propagates to separate DisplayIsland tree', () => {
      const { unmount: unmountCounter } = render(<CounterIsland />);
      const { unmount: unmountDisplay } = render(<DisplayIsland />);

      expect(screen.getByText('Display: 0')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: /add/i }));
      expect(screen.getByText('Display: 1')).toBeDefined();

      unmountCounter();
      unmountDisplay();
    });
  });

  describe('shadcn/ui components inside islands', () => {
    it('shadcn Button renders with correct role', () => {
      render(<LoadIsland />);
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });

    it('shadcn Input renders with correct role', () => {
      render(<VisibleIsland />);
      expect(screen.getByRole('textbox')).toBeDefined();
    });

    it('shadcn Card renders with title text', () => {
      render(<VisibleIsland />);
      // CardTitle renders as a div (not h3), so we check by text content
      expect(screen.getByText('Búsqueda')).toBeDefined();
    });
  });
});
