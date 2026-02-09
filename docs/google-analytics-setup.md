# Google Analytics Setup Guide

## Overview

Google Analytics integration has been set up for tracking visits and behavior across all pages, with specific focus on the `/referral` campaign page.

## What's Included

### 1. **Automatic Page View Tracking**
- Google Analytics automatically tracks all page views across your site
- Works on all routes: `/`, `/referral`, `/hosting`, `/blog`, etc.

### 2. **Custom Events - Referral Campaign**
Specific events are tracked on the `/referral` page:

| Event | Trigger | Parameters |
|-------|---------|-----------|
| `referral_form_submit` | Successful form submission | `referred_email`, `has_referrer_email`, `timestamp` |
| `referral_form_error` | Form submission error | `error_message`, `timestamp` |

### 3. **Files Modified**
- `app/layout.tsx` - Added GoogleAnalytics component
- `app/referral/page.tsx` - Added event tracking on form submission
- `lib/analytics.ts` - New utility file with tracking functions

## Getting Started

### Step 1: Create a Google Analytics Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Sign in with your Google account
3. Click **"Create"** to set up a new property
4. Choose **"Web"** as the platform
5. Configure your property:
   - **Property name**: `tranmer.ca` (or your preference)
   - **Website URL**: `https://tranmer.ca`
   - **Industry**: Select appropriate industry
   - **Reporting timezone**: Choose your timezone
6. Accept the terms and create

### Step 2: Set Up a Data Stream

1. In your property, go to **Admin > Data Streams**
2. Click **"Create Stream"**
3. Select **Web**
4. Enter your website details:
   - **Website URL**: `https://tranmer.ca`
   - **Stream name**: `tranmer.ca`
5. Click **Create stream**

### Step 3: Get Your Measurement ID

1. After creating the stream, you'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)
2. Copy this ID

### Step 4: Configure Environment Variable

Add your Google Analytics Measurement ID to your `.env.local` file:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID from Step 3.

### Step 5: Redeploy

Rebuild and redeploy your application:

```bash
npm run build
npm run dev  # for local testing
```

For Vercel deployment, push to your preview or main branch to trigger a new deployment.

## Viewing Your Analytics

### In Google Analytics Dashboard

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property (`tranmer.ca`)
3. Look for:
   - **Realtime** - See visitors right now
   - **Reports > Life cycle > Acquisition** - See how people found you
   - **Reports > Engagement > Pages and screens** - See page performance
   - **Events** - See custom referral events

### Referral Campaign Insights

To view referral-specific tracking:

1. In Google Analytics, go to **Reports > Engagement > Events**
2. Look for these events:
   - `referral_form_submit` - Successful referrals
   - `referral_form_error` - Failed attempts

3. Click on the event to see detailed parameters:
   - `referred_email` - Email of person being referred
   - `has_referrer_email` - Whether referrer provided their email

## Custom Event Tracking

The `lib/analytics.ts` file provides utilities for tracking events:

```typescript
import { trackReferralSubmission, trackReferralError, trackEvent } from "@/lib/analytics";

// Track successful referral
trackReferralSubmission("john@example.com", true);

// Track an error
trackReferralError("Email validation failed");

// Track a custom event
trackEvent('custom_event_name', {
  custom_param: 'value'
});
```

## Useful Reports for Campaign Tracking

### 1. **Referral Page Performance**
- **Reports > Engagement > Pages and screens**
- Filter by `/referral`
- See: Page views, average session duration, bounce rate

### 2. **Form Submission Tracking**
- **Reports > Engagement > Events**
- Look for `referral_form_submit`
- See: Total submissions, success rate, referring email distribution

### 3. **User Flow**
- **Reports > Engagement > User journey**
- Understand how users arrive at and interact with the referral page

### 4. **Conversion Setup** (Optional)
To track referral submissions as conversions:

1. Go to **Admin > Conversions**
2. Click **Create new conversion event**
3. Configure:
   - **Event name**: `referral_form_submit`
   - **Conversion name**: `Referral Submission`
   - **Conversion value**: `100` (or whatever value you assign)
4. Save and track conversion metrics

## Seeing Data

**Note**: Google Analytics typically takes 24-48 hours to show initial data. In the meantime:

1. **Real-time debugging**: Use the Real-time report to see if analytics is firing
2. **Browser console**: Check network tab to see requests to Google Analytics
3. **Testing locally**: Add this to your browser console to verify gtag is loaded:
   ```javascript
   console.log(window.gtag);
   ```

## Campaign Tracking with UTM Parameters

For email campaigns (Mailchimp, etc.), add UTM parameters to your referral page link:

```
https://tranmer.ca/referral?utm_source=email&utm_medium=newsletter&utm_campaign=feb_2026_referral
```

Google Analytics automatically collects these and shows them under:
- **Reports > Life cycle > Acquisition > Traffic acquisition**

## Troubleshooting

### GA ID Not Loading
1. Check that `NEXT_PUBLIC_GA_ID` is set in `.env.local`
2. Verify the ID format: `G-XXXXXXXXXX`
3. Rebuild (`npm run build`)
4. Restart dev server

### Events Not Appearing
1. Wait 24-48 hours for initial data
2. Check the **Real-time** report to see if events are firing in real-time
3. Verify form submission is successful (check Network tab in DevTools)
4. Ensure event names match exactly: `referral_form_submit`, `referral_form_error`

### Production vs Preview
- Preview and production are separate GA properties
- Create separate GA properties for each:
  - Production: `https://tranmer.ca`
  - Preview: `https://tranmer-ca-new-git-preview-...vercel.app`
- Use different environment variables per Vercel environment

## Next Steps

1. ✅ Google Analytics is integrated
2. 📊 Set up custom dashboards for referral campaign metrics
3. 🎯 Generate insights on referral effectiveness
4. 📈 Optimize based on user behavior data
5. 🔄 Track ROI of different email campaigns
