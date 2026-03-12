# Resend Email Setup for GalaUs

This guide walks you through setting up Resend as your SMTP provider for Supabase Auth magic link emails.

## Step 1: Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day limit)
3. Verify your email address

## Step 2: Get Your Resend API Key

1. Log into your Resend dashboard
2. Go to **API Keys** in the left sidebar
3. Click **Create API Key**
   - Name it: `GalaUs Production` (or similar)
   - Choose **Full Access** for sending permissions
4. Copy the API key (starts with `re_`)
5. **Save it securely** - you won't see it again!

## Step 3: Add Domain (Optional but Recommended)

For production, you'll want to send from your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `galaus.com`)
4. Add the DNS records Resend provides to your domain registrar
5. Wait for verification (usually a few minutes)

For now, you can use Resend's default domain: `onboarding@resend.dev`

## Step 4: Configure Supabase to Use Resend

### Option A: Using Resend SMTP (Recommended)

1. Log into your Supabase Dashboard
2. Go to **Project Settings** → **Auth**
3. Scroll down to **SMTP Settings**
4. Enable **Enable Custom SMTP**
5. Fill in these values:
   ```
   Sender email: noreply@galaus.com (or your verified domain)
   Sender name: GalaUs
   Host: smtp.resend.com
   Port: 465
   Username: resend
   Password: [Your Resend API Key - starts with re_]
   ```
6. Click **Save**

### Option B: Using Resend API Directly (Alternative)

If you prefer to use Resend's API instead of SMTP:

1. Install Resend SDK:
   ```bash
   npm install resend
   ```

2. Create a custom email handler in your app (more complex, only if needed)

**For this project, stick with Option A (SMTP) - it's simpler and works with Supabase Auth out of the box.**

## Step 5: Configure Auth Email Template

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Select **Magic Link**
3. Update the email template with our custom design:
   - Copy the content from `supabase/email-template-magic-link.html`
   - Paste it into the email template editor
4. Make sure the confirmation URL variable is: `{{ .ConfirmationURL }}`
5. Click **Save**

## Step 6: Configure Redirect URLs

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/
   ```
3. When you deploy to production, also add:
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com/
   ```
4. Click **Save**

## Step 7: Set Session Duration

1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Find **JWT Expiry**
3. Set to: `604800` (7 days in seconds)
4. Click **Save**

## Step 8: Test Your Setup

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/login`

3. Enter your email address and click "Send Magic Link"

4. Check your email - you should receive:
   - From: `noreply@resend.dev` (or your custom domain)
   - Subject: "Your Magic Link"
   - Designed with GalaUs branding

5. Click the magic link and verify you're redirected to `/auth/callback` and then logged in

## Troubleshooting

### Emails Not Sending

- Check that your Resend API key is correct in Supabase SMTP settings
- Verify the sender email is verified in Resend (or use `onboarding@resend.dev`)
- Check Resend dashboard **Logs** to see if emails are being sent

### Emails Going to Spam

- Add DNS records (SPF, DKIM) for your custom domain in Resend
- Use a verified custom domain instead of `resend.dev`
- Add a physical address in email footer (required by anti-spam laws)

### Rate Limits

- Free tier: 100 emails/day, 3,000 emails/month
- If you need more, upgrade to paid plan ($20/month for 50k emails)

### "Invalid login credentials" Error

- Make sure you've run the database migration: `supabase/auth-migration.sql`
- Check that the `handle_new_user()` trigger is working
- Verify the email exists in both `auth.users` and `public.users` tables

## Resend Free Tier Limits

- **100 emails per day**
- **3,000 emails per month**
- **1 verified domain**
- **Single API key**

This is perfect for development and early-stage production!

## Next Steps

Once you've tested successfully:

1. ✅ Verify domain email template displays correctly
2. ✅ Test magic link flow end-to-end
3. ✅ Test on different email providers (Gmail, Outlook, etc.)
4. ✅ Monitor Resend dashboard for delivery rates
5. 🚀 Launch! Users can now log in with passwordless auth

## Production Checklist

Before going live:

- [ ] Set up custom domain in Resend
- [ ] Add DNS records (SPF, DKIM, DMARC)
- [ ] Update sender email to your domain
- [ ] Add production redirect URLs to Supabase
- [ ] Test from multiple email providers
- [ ] Monitor Resend logs for first week
- [ ] Set up usage alerts in Resend dashboard

## Support

- **Resend Docs**: https://resend.com/docs/introduction
- **Resend Support**: support@resend.com
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
