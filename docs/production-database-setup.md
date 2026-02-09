# Production Database Setup - Vercel

## Issue
Production is failing with: `connect ECONNREFUSED 127.0.0.1:5432`

This means `DATABASE_URL` environment variable is not configured in Vercel.

## Solution: Add DATABASE_URL to Vercel

### Step 1: Get Your Database Connection String

If using **Neon PostgreSQL** (recommended for Vercel):
1. Go to [neon.tech](https://neon.tech)
2. Sign in to your project
3. Go to **Connection string** or **Database settings**
4. Copy the connection string (format: `postgresql://user:password@host.neon.tech/dbname`)

If using another provider:
- Get your PostgreSQL connection string from your database provider
- Format: `postgresql://username:password@host:5432/database_name`

### Step 2: Add to Vercel Environment Variables

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project
3. Go to **Settings > Environment Variables**
4. Add a new variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your connection string from Step 1
   - **Environments:** Select "Production" (and "Preview" if you want to test on preview deployments)
5. Click **Save**
6. Redeploy your application

#### Option B: Via Vercel CLI
```bash
vercel env add DATABASE_URL
# Paste your connection string when prompted
# Select: "production"
```

### Step 3: Redeploy

After setting the environment variable:

**Via Vercel Dashboard:**
1. Go to your project
2. Click **Deployments**
3. Select the latest deployment and click **Redeploy**

**Via CLI:**
```bash
vercel --prod
```

### Step 4: Verify

1. Go to your deployed app at https://tranmer.ca/referral
2. Test by submitting a referral
3. Check Vercel **Functions** logs for any errors

## Environment Variables Needed

Your production environment needs these variables:

| Variable | Required | Example | Source |
|----------|----------|---------|--------|
| `DATABASE_URL` | ✅ Yes | `postgresql://user:pw@neon.tech/db` | Neon/Database provider |
| `SMTP_HOST` | ✅ Yes | `mail.mailconfig.net` | Email provider |
| `SMTP_PORT` | ✅ Yes | `465` | Email provider |
| `SMTP_SECURE` | ✅ Yes | `true` | Email provider |
| `SMTP_USER` | ✅ Yes | `webapp@tomtranmer.com` | Email provider |
| `SMTP_PASS` | ✅ Yes | Your SMTP password | Email provider |
| `NEXT_PUBLIC_GA_ID` | ⚠️ Optional | `G-XXXXXXXXXX` | Google Analytics |

## Testing Locally with Production Variables

To test with your production database locally:

```bash
# Copy your production values to .env.local
echo "DATABASE_URL=postgresql://your:password@host/db" >> .env.local

# Start dev server
npm run dev

# Test the form at http://localhost:3000/referral
```

⚠️ **Warning:** Never commit `.env.local` or credentials to git!

## Troubleshooting

### Still seeing connection errors?
1. **Verify DATABASE_URL is set:**
   ```bash
   vercel env ls
   ```
2. **Check it's in the right environment:**
   - Should show under "Production"
3. **Redeploy after adding variable:**
   - Environment variables take effect only on new deployments
4. **Check connection string format:**
   - Should start with `postgresql://`
   - Should not have `<` or `>` characters
   - Should not contain extra spaces

### Neon-specific issues?
- Neon databases can be in "idle terminated" state
  - Go to Neon Project Settings and **Resume** the database
- Check Neon has an active connection pool
- Verify your IP is allowed (Neon > Settings > IP Whitelist)

### Still stuck?
1. Check Vercel logs: **Deployments > Click deployment > Functions tab**
2. Look for database connection errors
3. Verify DATABASE_URL format matches your provider's specification

## What Happens Next

Once DATABASE_URL is set:
1. Form submissions will store referrals in the database
2. Emails will be sent to referrers and referees
3. Campaign tracking will record all referral activity
4. Google Analytics will track form submissions and errors

Your Feb 9 campaign launch should work perfectly! 🚀
