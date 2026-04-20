export const MOBILE_BREAKPOINT = 1024;

export function isMobileViewport(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function isStandalonePWA(): boolean {
  try {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
      (window.navigator as any).standalone === true;
  } catch {
    return false;
  }
}
