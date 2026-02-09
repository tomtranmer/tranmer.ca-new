/**
 * Google Analytics tracking utilities
 * These functions provide typed access to Google Analytics gtag global
 */

export type TrackingEventName = 
  | 'referral_form_submit'
  | 'referral_form_error'
  | 'referral_form_load'
  | 'page_view';

interface TrackingEventParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  eventName: TrackingEventName,
  params?: TrackingEventParams
) {
  // Check if gtag is available in window
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/**
 * Track referral form submission
 */
export function trackReferralSubmission(
  referredEmail: string,
  hasReferrerEmail: boolean
) {
  trackEvent('referral_form_submit', {
    referred_email: referredEmail,
    has_referrer_email: hasReferrerEmail,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track referral form errors
 */
export function trackReferralError(errorMessage: string) {
  trackEvent('referral_form_error', {
    error_message: errorMessage,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track page view (automatic with GA setup, but useful for custom tracking)
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    timestamp: new Date().toISOString(),
  });
}

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (command: string, eventName?: string, params?: Record<string, unknown>) => void;
  }
}
