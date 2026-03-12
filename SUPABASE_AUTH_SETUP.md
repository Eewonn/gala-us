# Supabase Auth Setup Guide

This guide will help you configure passwordless authentication using Supabase Auth with magic links.

## Prerequisites

- A Supabase project created at [supabase.com](https://supabase.com)
- Environment variables set up:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Setup Steps

### 1. Configure Email Auth in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. Disable **"Confirm email"** if you want instant access (or keep it enabled for email verification)
5. Click **Save**

### 2. Configure Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Select **Magic Link** template
3. Customize the email template with your branding
4. The default template includes `{{ .ConfirmationURL }}` which is the magic link

### 3. Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL to **Site URL**: `http://localhost:3000` (for development)
3. Add redirect URLs to **Redirect URLs**:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### 4. Configure Session Duration (7 Days)

1. Go to **Authentication** → **Settings**
2. Find **JWT Expiry** setting
3. Set to `604800` (7 days in seconds)
4. This ensures users remain logged in for 7 days

### 5. Run Database Migration

Run the auth migration SQL in your Supabase SQL Editor:

```bash
# Copy the contents of supabase/auth-migration.sql
# Paste it into your Supabase SQL Editor
# Execute the script
```

Or run it directly from the file:

1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste contents of `supabase/auth-migration.sql`
3. Click **Run**

This migration:
- Links the users table with Supabase Auth
- Creates a trigger to auto-create user profiles
- Sets up Row Level Security (RLS) policies
- Adds email column to users table

### 6. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/login`
3. Enter your email address
4. Check your email for the magic link
5. Click the link to log in
6. You should be redirected to your dashboard

## How It Works

### Magic Link Flow

1. **User enters email** → Login page sends request to Supabase Auth
2. **Supabase sends email** → Contains a magic link with a one-time code
3. **User clicks link** → Redirected to `/auth/callback?code=...`
4. **Callback handler** → Exchanges code for session token
5. **Session stored** → User is authenticated for 7 days
6. **Auto user profile** → Trigger creates user profile in `public.users` table

### Session Management

- Sessions are stored in browser's localStorage
- Auto-refreshed by Supabase client
- Persist across page reloads
- Last 7 days (604,800 seconds)

### Route Protection

Protected routes automatically redirect to login:
- `/create-gala` - Requires authentication
- `/join` - Requires authentication
- `/my-galas` - Requires authentication (if you add it)

## Customization

### Changing Session Duration

Edit the JWT Expiry in Supabase Dashboard:
- 1 day: `86400`
- 7 days: `604800` (current)
- 30 days: `2592000`

### Custom Email Templates

Customize templates in **Authentication** → **Email Templates**:
- Magic Link - For passwordless login
- Confirm Signup - For email verification
- Reset Password - For password resets (if you add password auth)

### Styling Login Page

Edit [src/app/login/page.tsx](../src/app/login/page.tsx) to match your brand.

## Troubleshooting

### Magic link not working
- Check that redirect URLs are configured correctly
- Verify email provider is enabled
- Check spam folder for emails

### Session not persisting
- Verify JWT Expiry is set correctly (604800 for 7 days)
- Check browser localStorage is enabled
- Ensure `persistSession: true` is set in client config

### User profile not created
- Check that auth-migration.sql was run successfully
- Verify trigger `on_auth_user_created` exists in database
- Check Supabase logs for errors

### Redirect not working after login
- Ensure `/auth/callback` route exists
- Check that callback URL is in allowed redirect URLs
- Verify `emailRedirectTo` parameter is correct

## Security Notes

- Magic links expire after 1 hour
- Each magic link can only be used once
- Sessions are stored securely in localStorage
- RLS policies protect user data
- All auth operations use Supabase's secure APIs

## Production Checklist

Before deploying to production:

- [ ] Set production site URL in Supabase
- [ ] Add production redirect URLs
- [ ] Configure custom email domain (optional)
- [ ] Customize email templates with branding
- [ ] Test magic link flow end-to-end
- [ ] Enable email confirmation if desired
- [ ] Set up email rate limiting
- [ ] Configure SMTP settings (optional)
- [ ] Add monitoring and error tracking

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Magic Link Auth](https://supabase.com/docs/guides/auth/auth-magic-link)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
