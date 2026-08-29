import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const THEME_KEY = 'nexora-theme';

const setSystemPreference = (prefersDark) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: prefersDark,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('theme switching', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('toggles light and dark mode and stores the selection', () => {
    setSystemPreference(false);
    render(<App />);

    const switchButton = screen.getByRole('switch', { name: /switch to dark mode/i });

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(switchButton).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(switchButton);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(screen.getByRole('switch', { name: /switch to light mode/i })).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  });

  it('reads the saved theme from localStorage when it is already set', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    setSystemPreference(false);

    render(<App />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(screen.getByRole('switch', { name: /switch to light mode/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('uses the system preference when no valid theme is stored', () => {
    setSystemPreference(true);

    render(<App />);

    const switchButton = screen.getByRole('switch', { name: /switch to light mode/i });

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(switchButton).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it('ignores invalid stored theme values and falls back to the system preference', () => {
    localStorage.setItem(THEME_KEY, 'blue');
    setSystemPreference(false);

    render(<App />);

    const switchButton = screen.getByRole('switch', { name: /switch to dark mode/i });

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(switchButton).toHaveAttribute('aria-checked', 'false');
    expect(localStorage.getItem(THEME_KEY)).toBe('blue');
  });

  it('exposes an accessible switch state with an updated label', () => {
    setSystemPreference(true);
    render(<App />);

    const switchButton = screen.getByRole('switch');

    expect(switchButton).toHaveAttribute('aria-checked', 'true');
    expect(switchButton).toHaveAccessibleName('Switch to light mode');

    fireEvent.click(switchButton);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('switch')).toHaveAccessibleName('Switch to dark mode');
  });
});
