# Email Template Setup for GalaUs

## How to Customize Your Supabase Email Templates

### 1. Access Email Templates in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. You'll see templates for:
   - Confirm signup
   - Invite user
   - **Magic Link** ← This is the one we need!
   - Change Email Address
   - Reset Password

### 2. Customize the Magic Link Template

1. Click on **Magic Link**
2. Replace the entire template content with the custom HTML from `supabase/email-template-magic-link.html`
3. The template uses GalaUs branding with:
   - GalaUs logo and colors
   - Playful design matching your app
   - Bold borders and shadows
   - Clear call-to-action button
   - Information about link expiration

### 3. Important Variables

The template uses these Supabase variables (don't change these):
- `{{ .ConfirmationURL }}` - The magic link URL (required)
- `{{ .Email }}` - Recipient's email address (optional)
- `{{ .Token }}` - Auth token (optional)
- `{{ .TokenHash }}` - Token hash (optional)
- `{{ .SiteURL }}` - Your site URL (optional)

### 4. Customize Further (Optional)

You can personalize the template by:

**Change the footer links:**
```html
<a href="https://yourwebsite.com">Visit our website</a>
<a href="https://yourwebsite.com/help">Get help</a>
```

**Add your domain name:**
Replace `yourwebsite.com` with your actual domain

**Modify colors:**
- Primary: `#ff5833` (orange)
- Dark: `#23130f` (almost black)
- Blue accents: `#eff6ff`, `#93c5fd`, `#1e3a8a`

**Add custom copy:**
Modify the text to match your brand voice

### 5. Configure Email Settings

For production, you should configure custom SMTP:

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure with your email provider:
   - **Host:** e.g., `smtp.sendgrid.net`
   - **Port:** Usually `587` or `465`
   - **Username:** Your SMTP username
   - **Password:** Your SMTP password
   - **Sender email:** `noreply@galaus.com` or your domain
   - **Sender name:** `GalaUs`

Popular SMTP providers:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **Amazon SES** (62,000 emails/month free first year)
- **Postmark** (100 emails/month free)

### 6. Set Custom Sender Name

Even without custom SMTP, you can change the sender name:

1. In Email Templates, look for **Sender name** field
2. Set it to: `GalaUs Team` or `GalaUs`
3. This will show as the sender instead of "noreply@..."

### 7. Test Your Template

After saving:

1. Go to your app login page
2. Enter your email
3. Check your inbox
4. Verify the email looks good on:
   - Desktop email client
   - Mobile email app
   - Web email (Gmail, Outlook, etc.)

### 8. Email Subject Line

Don't forget to customize the subject line in Supabase:

**Default:** "Magic Link"
**Better:** "🎉 Your GalaUs Login Link"

### Preview of the Custom Email

The custom template includes:
- ✅ GalaUs branding with logo
- ✅ Playful design matching your app
- ✅ Clear, large login button
- ✅ Helpful information box
- ✅ Professional footer
- ✅ Mobile-responsive design
- ✅ Bold borders and shadows

## Troubleshooting

**Email not arriving?**
- Check spam folder
- Verify email is enabled in Supabase Auth settings
- Check rate limits (default: 4 emails per hour per user)

**Email template not updating?**
- Clear browser cache
- Wait a few minutes for changes to propagate
- Try sending a new test email

**Email looks broken?**
- Some email clients strip CSS
- Test in multiple clients
- Use inline styles for critical styling

## Best Practices

1. **Keep it simple:** Email clients have limited CSS support
2. **Use inline styles:** Better compatibility
3. **Test thoroughly:** Different clients render differently
4. **Mobile first:** Most people check email on mobile
5. **Clear CTA:** Make the button obvious and easy to tap
6. **Set expectations:** Tell users the link expires

## Advanced: Custom Domain Email

For the best sender reputation:

1. Set up email with your domain (e.g., hello@galaus.com)
2. Configure SPF, DKIM, and DMARC records
3. Use a dedicated sending domain
4. Warm up your IP address gradually

This ensures emails don't go to spam and look professional!
