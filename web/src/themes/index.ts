import { nightCity } from './night-city';
import { brutalist } from './brutalist';

export type ThemeId = 'night-city' | 'brutalist';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  preview: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
  };
}

export const themes: ThemeDefinition[] = [nightCity, brutalist];

export const DEFAULT_THEME: ThemeId = 'night-city';

export function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id);
  const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
  if (favicon) {
    favicon.href = id === 'night-city' ? '/zouk-night-city.svg' : '/zouk.svg';
  }
}

export function getTheme(id: ThemeId): ThemeDefinition | undefined {
  return themes.find((t) => t.id === id);
}
