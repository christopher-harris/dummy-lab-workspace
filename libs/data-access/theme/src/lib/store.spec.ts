import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  DARK_MODE_CLASS,
  DEFAULT_MODE,
  DEFAULT_PRESET,
  DEFAULT_PRIMARY_COLOR,
  THEME_STORAGE_KEY,
} from './config';
import { ThemeStore } from './store';

const hasDarkClass = () =>
  document.documentElement.classList.contains(DARK_MODE_CLASS);

describe('ThemeStore', () => {
  beforeEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.remove(DARK_MODE_CLASS);
    TestBed.resetTestingModule();
  });

  it('starts from the defaults', () => {
    const store = TestBed.inject(ThemeStore);

    expect(store.mode()).toBe(DEFAULT_MODE);
    expect(store.preset()).toBe(DEFAULT_PRESET);
    expect(store.primaryColor()).toBe(DEFAULT_PRIMARY_COLOR);
    expect(store.isDark()).toBe(false);
  });

  it('sets the mode explicitly', () => {
    const store = TestBed.inject(ThemeStore);

    store.setMode('dark');

    expect(store.mode()).toBe('dark');
    expect(store.isDark()).toBe(true);
  });

  it('toggles between light and dark', () => {
    const store = TestBed.inject(ThemeStore);

    store.setMode('light');
    store.toggleDarkMode();
    expect(store.mode()).toBe('dark');

    store.toggleDarkMode();
    expect(store.mode()).toBe('light');
  });

  it('sets and cycles the preset', () => {
    const store = TestBed.inject(ThemeStore);

    store.setPreset('nora');
    expect(store.preset()).toBe('nora');

    store.cyclePreset();
    expect(store.preset()).toBe('aura');
  });

  it('sets and cycles the primary colour', () => {
    const store = TestBed.inject(ThemeStore);

    store.setPrimaryColor('indigo');
    expect(store.primaryColor()).toBe('indigo');

    store.cyclePrimaryColor();
    expect(store.primaryColor()).toBe('violet');
  });

  it('resets every selection back to its default', () => {
    const store = TestBed.inject(ThemeStore);

    store.setMode('dark');
    store.setPreset('material');
    store.setPrimaryColor('rose');
    store.reset();

    expect(store.mode()).toBe(DEFAULT_MODE);
    expect(store.preset()).toBe(DEFAULT_PRESET);
    expect(store.primaryColor()).toBe(DEFAULT_PRIMARY_COLOR);
  });

  it('persists the selections to localStorage', () => {
    const store = TestBed.inject(ThemeStore);

    store.setMode('dark');
    store.setPreset('lara');
    store.setPrimaryColor('sky');

    expect(JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) ?? '{}')).toEqual(
      {
        mode: 'dark',
        preset: 'lara',
        primaryColor: 'sky',
      },
    );
  });

  it('rehydrates from localStorage on init', () => {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ mode: 'dark', preset: 'nora', primaryColor: 'amber' }),
    );

    const store = TestBed.inject(ThemeStore);

    expect(store.mode()).toBe('dark');
    expect(store.preset()).toBe('nora');
    expect(store.primaryColor()).toBe('amber');
  });

  it('applies the dark class to <html> and removes it again', () => {
    const store = TestBed.inject(ThemeStore);
    TestBed.tick();
    expect(hasDarkClass()).toBe(false);

    store.toggleDarkMode();
    TestBed.tick();
    expect(hasDarkClass()).toBe(true);

    store.toggleDarkMode();
    TestBed.tick();
    expect(hasDarkClass()).toBe(false);
  });

  it('applies the dark class on init when restored from storage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ mode: 'dark' }));

    TestBed.inject(ThemeStore);
    TestBed.tick();

    expect(hasDarkClass()).toBe(true);
  });
});
