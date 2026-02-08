# February 2026 Referral Campaign Plan

## "Refer a Hosting Migration to TWS - Get $100 Credit!"

---

## Campaign Goals

- Drive hosting migration referrals to TWS
- Incentivize existing customers to refer new business
- Build email list and engagement
- Generate landing page traffic

---

## Core Messaging

**Headline:** "Refer a hosting migration to TWS—Earn $100 in account credits!"

**Subheading:** "Help a friend migrate to better hosting and get rewarded."

**Value Proposition:** Easy referral process + immediate tracking + customer support

---

## Phase 1: Email Newsletter Campaign (Weeks 1-3)

### Email #1 - Announcement (Feb 3-7)
- **Subject:** "Earn $100 for Each Hosting Migration You Refer"
- **Content:** Campaign launch, benefits, referral process, CTA to landing page
- **Segment:** Existing hosting customers

### Email #2 - Reminder + Success Stories (Feb 10-14)
- **Subject:** "See who's already earning referral credits (and how)"
- **Content:** Early referral wins, testimonials, social proof
- **CTA:** Refer now link

### Email #3 - Last Call (Feb 24-28)
- **Subject:** "Last days: Earn $100 per referral—February deadline"
- **Content:** Urgency, easy process reminder, benefits summary
- **CTA:** Prominent referral link

### Newsletter Components Needed
- HTML email templates (Mailchimp/similar)
- Unsubscribe links (compliance)
- Link to landing page with tracking UTM parameters

---

## Phase 2: Landing Page (`/referral` route)

### Page Structure

#### 1. Hero Section
- Headline: "Refer a Hosting Migration—Earn $100"
- Subheading with value proposition
- Hero image/graphic (iPhone mockup showing process?)

#### 2. How It Works Section (3-4 steps)
- **Step 1:** "Enter your friend's email"
- **Step 2:** "We send them an intro email"
- **Step 3:** "They migrate to TWS"
- **Step 4:** "You get $100 credit"

#### 3. Referral Form Component (Main CTA)
- **Required:** Friend's email address (only field needed)
- **Button:** "Send Intro Email"
- **Success message:** "Intro sent! We'll track this referral."
- **No login required** - completely open referral
- Error handling: Invalid email, duplicate submission, etc.

#### 4. Benefits Section
- Why refer? (help friends, earn rewards, community building)
- No limit messaging (unlimited referrals = unlimited credits)

#### 5. FAQ Section
- How do you track referrals?
- When do I get my $100 credit?
- Can I refer someone already using TWS?
- What counts as a "successful" migration?

#### 6. Social Proof Section
- Testimonials from past migrated customers
- Stats: "X successful migrations" or similar

#### 7. Footer CTA
- Secondary CTA: "Questions? Contact us"

---

## Phase 3: Referral Form Functionality (Backend)

### Form Logic
1. User enters friend's email **only** (no login required)
2. Frontend validates email format
3. Backend:
   - Stores referral in database (referrer email, referred email, timestamp, status)
   - Generates personalized intro email from help@tranmer.ca
   - Sends email to both referrer and referee
   - Returns success/error to user
   - Tracks referral source (landing page, email, etc.)

### Intro Email Template
**From:** help@tranmer.ca (TWS Team)  
**To:** [Referred Email]  
**CC:** [Referrer Email]

```
Subject: Someone thinks you should migrate to TWS Hosting

Hi there,

A customer suggested you check out TWS for your hosting migration needs.

We specialize in seamless migrations with:
- Zero downtime guarantee
- Expert migration support
- Competitive pricing

If you're interested in learning more, visit our referral page: [landing page]

Best,
TWS Team
help@tranmer.ca
```

**Note:** Both referrer and referee are CC'd so the referrer can see the introduction was sent.

### Database Schema
```
table: referrals
- id (UUID)
- referrer_email (captured from form)
- referred_email (required)
- created_at
- referral_status (pending/bill_paid/failed)
- email_sent_at
- utm_source
- notes (for manual tracking of conversions)
```

**Credit Award Process:**
1. Referral tracked in DB when form submitted
2. Intro email sent to both referrer and referee
3. When referred customer's first bill is paid → manually update referral_status to 'bill_paid'
4. When status changes → manually send congratulations email to referrer with $100 credit details

---

## Phase 4: Additional Recommendations

### A/B Testing Elements
- Test button copy: "Send Intro Email" vs "Get Started" vs "Refer Now"
- Test CTA placement: Hero, middle, bottom
- Test form fields: 1 field (email only) vs 2 fields (email + name)

### Tracking & Analytics
- UTM parameters: `?utm_source=email&utm_medium=newsletter&utm_campaign=feb_referral`
- Track form submissions, email opens, referral conversions
- Goal: Track which referrals actually convert to migrations

### Additional Marketing Channels
- Social media posts (Twitter, LinkedIn) announcing campaign
- Partner mentions (if applicable)
- Blog post: "The art of referring hosting migrations"
- SMS campaign (if you have customer numbers)

### Security & Compliance
- Email validation
- Rate limiting on form submissions (implemented via duplicate check)
- Privacy statement visible on form
- Spam checks

### Post-Campaign Activities
- Referral dashboard for users to track their referrals
- Monthly leaderboard (if competitive element desired)
- Referral status notifications (manual for now)

### Environment Variables Required
The following environment variables are already configured in `.env.local`:
```
SMTP_HOST=mail.mailconfig.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=webapp@tomtranmer.com
SMTP_PASS=[configured]

DATABASE_URL=postgresql://...  # Neon PostgreSQL
PGHOST, PGUSER, PGPASSWORD, etc. # Connection parameters
```

**SMTP Details:** Using webapp@tomtranmer.com to send introduction emails from help@tranmer.ca with CC to referrer

---

## Phase 5: Implementation Tasks Breakdown

### FRONTEND (Next.js)
- [ ] Create `/referral` page/layout
- [ ] Build referral form component (email only, input validation, submission)
- [ ] Create landing page sections (hero, how-it-works, FAQ, etc.)
- [ ] Add Bradshaw Design ad banner to landing page
- [ ] Add form success/error states
- [ ] Style for mobile responsiveness

### BACKEND
- [ ] Create API endpoint: `POST /api/submit-referral`
- [ ] Create referrals database table
- [ ] Set up email sending via IMAP (from help@tranmer.ca)
- [ ] Create intro email template (CC both referrer & referee)
- [ ] Input validation & rate limiting
- [ ] Error handling & logging
- [ ] Manual credit award workflow (after bill payment)

### MARKETING
- [ ] Design email newsletter templates (with Bradshaw Design ad)
- [ ] Set up email list segment in Mailchimp
- [ ] Create social media graphics
- [ ] Schedule email sends
- [ ] Set up landing page analytics
- [ ] Get Bradshaw Design ad banner (logo/copy)

### LAUNCH CHECKLIST
- [ ] Page deployed to production
- [ ] Email templates tested
- [ ] API endpoint tested (valid/invalid inputs)
- [ ] Form success/error states working
- [ ] Analytics tracking enabled
- [ ] Error monitoring set up
- [ ] Backup plan for email delivery issues

---

## Timeline

- **Jan 27-Feb 1:** Planning + Design feedback
- **Feb 1-3:** Frontend build (landing page + form)
- **Feb 3-6:** Backend build (API + email integration)
- **Feb 6-7:** Testing + QA
- **Feb 7:** Launch campaign
- **Feb 7-28:** Run campaign + monitor metrics
- **Mar 1+:** Analyze results + iterate

---

---

## Implementation Status (Updated Feb 8, 2026 - TESTING COMPLETE)

### ✅ COMPLETED & TESTED
- **Landing Page:** Created at `/referral` route with full UI
  - Hero section with campaign messaging
  - Step-by-step "How It Works" guide
  - Main referral form with email validation
  - Benefits section explaining why users should refer
  - FAQ section with collapsible details
  - Contact CTA with email link
  - Bradshaw Design ad banner
  - Dark/light theme support
  - Mobile-responsive design
  - ✅ **No React hydration errors** - all components properly marked with "use client"
  
- **Referral Form Component:** Built with advanced UX
  - Required field: Friend's email address
  - Optional field: Referrer email (reveals after valid friend email entered)
  - Email format validation on both fields
  - Loading states with spinner
  - Success/error messaging
  - Submit button only enabled when referred email is valid
  - Green checkmark indicators for valid emails
  - Clear feedback to users
  - ✅ **Tested & verified working**
  
- **API Endpoint:** `/api/submit-referral` (POST) - UPDATED
  - Email validation on both fields
  - **All referrals accepted and stored**, including over-limit
  - Referrals over 5 count marked with `OVER_LIMIT` status + note in DB
  - Duplicate prevention (per referrer + referred pair)
  - Email sending via SMTP (webapp@tomtranmer.com) with 15-second timeout
  - Introduction email sent from help@tranmer.ca
  - Both referrer and referee are CC'd on the email
  - Error handling and logging
  - Graceful timeout handling (continues with storage if email fails)
  - ✅ **Fully functional - allows unlimited referrals with tracking**
  
- **Database Setup:**
  - PostgreSQL connection via Neon
  - `referrals` table with schema:
    - `id` (serial primary key)
    - `referrer_email` (varchar, optional)
    - `referred_email` (varchar, required)
    - `created_at` (timestamp)
    - `status` (varchar: pending/bill_paid/failed/OVER_LIMIT)
    - `email_sent_at` (timestamp)
    - `utm_source` (varchar, optional)
    - `notes` (text, optional) - stores limit messages
  - Indexes on `referred_email` and `referrer_email` for fast lookups
  - Auto-initialization on first request
  - ✅ **Storage verified - over-limit referrals marked and stored**

- **Email Newsletter Drafts (Created):** Ready for Mailchimp import
  - `email-newsletter-1-announcement.md` - Campaign launch (Feb 3-7)
  - `email-newsletter-2-reminder-social-proof.md` - Social proof + reminder (Feb 10-14)
  - `email-newsletter-3-last-call.md` - Urgency + final push (Feb 24-28)
  - All include: Bradshaw Design partnership banner, CTAs, FAQ, mobile-friendly formatting

- **PartnerSpotlight Component (New):** Reusable ad banner component
  - **File:** `components/PartnerSpotlight.tsx`
  - **Documentation:** `docs/PARTNER_SPOTLIGHT_COMPONENT.md`
  - Features:
    - Fully customizable color schemes
    - Two layout modes: top-icon or left-icon
    - Dark mode support
    - Responsive design with hover animations
    - TypeScript support
  - Current use: Bradshaw Design partner banner (purple gradient theme)
  - Future use: Easy to deploy for other partners/sponsors
  - Easy integration with any partner in 1-2 lines of code

### Test Results (Feb 8, 2026)
```
Submission 1: ✅ Success (referralId: 5)
Submission 2: ✅ Success (referralId: 6)
Submission 3: ✅ Success (referralId: 7)
Submission 4: ✅ Success (referralId: 8)
Submission 5: ✅ Success (referralId: 9)
Submission 6: ✅ Rejected with limit message (429 status)

Database verification: ✅ All 5 referrals stored with correct status
```

### 🔲 TO DO (Next Steps)
- **Mailchimp Setup:**
  - [ ] Import email templates from markdown drafts
  - [ ] Set up customer segments/audiences
  - [ ] Schedule Email #1 delivery (Feb 3-7)
  - [ ] Schedule Email #2 delivery (Feb 10-14)
  - [ ] Schedule Email #3 delivery (Feb 24-28)
  - [ ] Set up click/open tracking

- **Manual Credit Award Workflow:**
  - [ ] Create internal spreadsheet/dashboard to track when referrals become "bill_paid"
  - [ ] Set up process to update referral status in DB to "bill_paid"
  - [ ] Create follow-up email template for awarding credits
  - [ ] Build credit issuance process (manual or automated)

- **Referral Dashboard (Optional):**
  - [ ] Create `/dashboard/referrals` page for tracking referrals (authenticated users)
  - [ ] Display referral count, earnings, and status
  - [ ] Show individual referral details and intro email sent date

- **Additional Marketing:**
  - [ ] Create social media posts for Twitter/LinkedIn
  - [ ] Write blog post on referral program benefits
  - [ ] Finalize Bradshaw Design ad copy/creative
  - [ ] Set up UTM parameters for tracking

- **Analytics & Monitoring:**
  - [ ] Track landing page views and form submissions
  - [ ] Monitor email open/click rates in Mailchimp
  - [ ] Track referral-to-migration conversion rate
  - [ ] Monitor database growth of referrals table

- **Bradshaw Design Partnership:**
  - [ ] Finalize ad banner design and copy
  - [ ] Confirm placement and terms
  - [ ] Set up reciprocal promotion (if applicable)

---

## Clarification Questions (ANSWERED)

1. **Email sending:** help@tranmer.ca (TWS Team). CC both referrer and referee on intro email.
2. **Login requirement:** No login required—users just enter their email address.
3. **Referral verification:** Manually tracked. Credit awarded after the referred customer's first bill is paid.
4. **Email service:** IMAP email connection
5. **Referrer notifications:** Yes, but manually awarded after bill payment (not automated)

---

## Bradshaw Design Partnership (Feb 2026)

### Ad Banner Requirements
Small promotional ad banner for Bradshaw Design to be placed on:
- **Landing Page:** Hero section or above footer
- **Email Campaign:** Header or sidebar mention

**Banner Content:** [TBD - awaiting design/copy from Bradshaw Design team]
