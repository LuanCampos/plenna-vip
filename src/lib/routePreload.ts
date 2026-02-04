/**
 * Preload functions for lazy route chunks.
 * Call on link hover so the chunk is ready when the user clicks.
 */

const preload = (importFn: () => Promise<unknown>) => {
  void importFn();
};

export const routePreload = {
  '/': () => preload(() => import('@/pages/Dashboard')),
  '/bookings': () => preload(() => import('@/pages/Bookings')),
  '/clients': () => preload(() => import('@/pages/Clients')),
  '/services': () => preload(() => import('@/pages/Services')),
  '/professionals': () => preload(() => import('@/pages/Professionals')),
  '/team': () => preload(() => import('@/pages/Team')),
  '/settings': () => preload(() => import('@/pages/Settings')),
} as const;

export type RoutePath = keyof typeof routePreload;
