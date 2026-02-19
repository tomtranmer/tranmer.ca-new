import { useEffect } from 'react';
import { trackScrollDepth, trackPageExit } from './analytics';

const SCROLL_TRACKING_INTERVALS = [25, 50, 75, 100];

/**
 * Hook to track page interactions including scroll depth and page exits
 */
export function usePageTracking() {
  useEffect(() => {
    const trackedScrollDepths = new Set<number>();

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight === 0) return;

      const scrollPercentage = Math.round(
        (window.scrollY / scrollHeight) * 100
      );

      // Track scroll depth at intervals
      SCROLL_TRACKING_INTERVALS.forEach((interval) => {
        if (
          scrollPercentage >= interval &&
          !trackedScrollDepths.has(interval)
        ) {
          trackedScrollDepths.add(interval);
          trackScrollDepth(interval);
        }
      });
    };

    const handleBeforeUnload = () => {
      trackPageExit();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
