import { useEffect, useState } from 'react';

function readNightCityFlag(): boolean {
  return document.documentElement.getAttribute('data-theme') === 'night-city';
}

/** Hook for components that need to react to theme attribute changes. */
export function useNightCityEnabled(): boolean {
  const [enabled, setEnabled] = useState(readNightCityFlag);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setEnabled(readNightCityFlag());
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return enabled;
}

/** Returns true when the active theme is Night City (cyberpunk effects enabled). */
export function isNightCity(): boolean {
  return readNightCityFlag();
}

/** Returns the style object only when Night City is active; otherwise empty. */
export function ncStyle(styles: React.CSSProperties): React.CSSProperties {
  return readNightCityFlag() ? styles : {};
}
