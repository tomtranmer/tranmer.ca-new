/**
 * Google Analytics tracking utilities
 * These functions provide typed access to Google Analytics gtag global
 */

export type TrackingEventName = 
  | 'referral_form_submit'
  | 'referral_form_error'
  | 'referral_form_load'
  | 'page_view'
  | 'link_click'
  | 'app_icon_click'
  | 'app_folder_open'
  | 'external_link_click'
  | 'page_exit'
  | 'scroll_depth';

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

/**
 * Track link/button clicks
 */
export function trackLinkClick(
  linkText: string,
  linkUrl?: string,
  linkType: 'internal' | 'external' = 'internal'
) {
  trackEvent('link_click', {
    link_text: linkText,
    link_url: linkUrl,
    link_type: linkType,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track app icon clicks
 */
export function trackAppIconClick(appLabel: string, appHref: string) {
  trackEvent('app_icon_click', {
    app_label: appLabel,
    app_href: appHref,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track app folder opens
 */
export function trackAppFolderOpen(folderLabel: string, appCount: number) {
  trackEvent('app_folder_open', {
    folder_label: folderLabel,
    app_count: appCount,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track external link clicks
 */
export function trackExternalLinkClick(linkText: string, linkUrl: string) {
  trackEvent('external_link_click', {
    link_text: linkText,
    link_url: linkUrl,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(scrollPercentage: number) {
  trackEvent('scroll_depth', {
    scroll_percentage: scrollPercentage,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track when user leaves the page
 */
export function trackPageExit() {
  trackEvent('page_exit', {
    timestamp: new Date().toISOString(),
  });
}

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (command: string, eventName?: string, params?: Record<string, unknown>) => void;
  }
}
