# Troubleshooting Supabase Auth Issues

## Common Issues and Solutions

### 1. "PKCE code verifier not found in storage" Error

This is the most common error when setting up magic link authentication. Here's how to fix it:

#### Solution A: Use Server-Side Route Handler (Recommended)

We've created a server-side route handler at `/auth/callback/route.ts` that handles the auth callback more reliably.

**How it works:**
- The route handler runs on the server
- It has direct access to cookies
- No PKCE verifier storage issues
- More secure and reliable

**To use it:**
1. Keep both files: `page.tsx` (for the UI) and `route.ts` (for handling)
2. The route handler will automatically be used first
3. If there's an issue, it redirects to login with an error message

#### Solution B: Clear Browser Data

If you're still in development:

1. **Clear localStorage:**
   - Open browser DevTools (F12)
   - Go to Application → Local Storage
   - Delete all supabase-related items

2. **Clear cookies:**
   - Application → Cookies
   - Delete all cookies for localhost:3000

3. **Try again:**
   - Request a new magic link
   - Don't open it in a different browser/device

#### Solution C: Check Redirect URLs

Ensure your redirect URLs are configured correctly in Supabase:

1. **Supabase Dashboard** → Authentication → URL Configuration
2. **Redirect URLs** should include:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
3. Make sure there are no typos or trailing slashes

#### Solution D: Storage Configuration

Check that browser storage is enabled:

```javascript
// Test in browser console
localStorage.setItem('test', 'data')
localStorage.getItem('test') // should return 'data'
```

If this fails, you might have:
- Private/Incognito mode enabled
- Browser storage disabled
- Browser extension blocking storage

### 2. Magic Link Not Arriving

**Check spam folder:**
- Magic links often end up in spam initially

**Rate limiting:**
- Supabase limits to 4 emails per hour per user
- Wait an hour or use a different email

**Email provider verification:**
1. Go to Authentication → Settings
2. Check if email provider is enabled
3. Verify SMTP settings (if using custom SMTP)

**Check Supabase logs:**
1. Dashboard → Logs
2. Look for email sending errors

### 3. Session Not Persisting

**Issue:** User has to log in every time they refresh

**Solutions:**

1. **Check JWT expiry:**
   - Authentication → Settings
   - JWT Expiry should be `604800` (7 days)

2. **Verify client configuration:**
   ```typescript
   // src/lib/supabase/client.ts should have:
   auth: {
     persistSession: true,
     autoRefreshToken: true,
   }
   ```

3. **Browser settings:**
   - Ensure cookies aren't being cleared
   - Check browser privacy settings

### 4. "Invalid login credentials" Error

This usually means:
- The magic link expired (1 hour)
- The link was already used
- The code was tampered with

**Solution:** Request a new magic link

### 5. Redirect After Login Not Working

**Issue:** User logs in but doesn't go to the intended page

**Check:**
1. URL parameter is being passed correctly:
   ```
   /login?redirect=/create-gala
   ```

2. Callback is preserving the redirect:
   ```typescript
   const redirect = searchParams.get("redirect") || "/my-galas";
   ```

3. The page is mounted before redirect happens

### 6. "Auth session missing" Error

This happens when trying to access authenticated resources before session is loaded.

**Solution:**

Add loading states:
```typescript
const { user, loading } = useAuth();

if (loading) {
  return <div>Loading...</div>;
}

if (!user) {
  // redirect to login
}
```

### 7. Email Template Not Showing

**Issue:** Email arrives but looks plain/broken

**Checks:**
1. Template saved in Supabase dashboard
2. No syntax errors in template
3. `{{ .ConfirmationURL }}` variable is present
4. Test in multiple email clients

### 8. Development vs Production Issues

**Development works but production doesn't:**

1. **Update redirect URLs:**
   - Add production domain to redirect URLs
   - Update site URL in settings

2. **Environment variables:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL`
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Variables are properly set in hosting platform

3. **CORS issues:**
   - Check allowed domains in Supabase settings

### 9. Multiple Tabs/Windows Issues

**Issue:** Opening magic link in different browser/tab causes errors

**Solution:**
- Magic link must be opened in same browser session where you requested it
- If you need to test, use the same browser window
- For production, users should open link on same device

### 10. Testing Tips

**For smooth testing:**

1. **Use route handler approach** (already implemented)
2. **Clear storage between tests**
3. **Use different emails for each test**
4. **Check browser console for detailed errors**
5. **Look at Supabase logs**

## Debug Checklist

When auth isn't working, check these in order:

- [ ] Email provider enabled in Supabase
- [ ] Redirect URLs configured correctly
- [ ] Client has proper configuration
- [ ] Browser storage is working
- [ ] Not in incognito mode
- [ ] Magic link not expired
- [ ] Same browser session used
- [ ] No browser extensions blocking
- [ ] Environment variables set
- [ ] Network requests succeeding

## Getting More Help

**Check browser console:**
```javascript
// Enable Supabase debug logging
localStorage.setItem('supabase.debug', 'true')
```

**Check Supabase logs:**
- Dashboard → Logs
- Filter by Auth events

**Network tab:**
- Look for failed requests
- Check request/response details

## Production Checklist

Before going live:

- [ ] Custom SMTP configured
- [ ] Email templates customized
- [ ] Production redirect URLs added
- [ ] Site URL set correctly
- [ ] Environment variables in production
- [ ] Test magic link flow end-to-end
- [ ] Test on multiple devices/browsers
- [ ] Monitor error rates

## Still Having Issues?

If none of these solutions work:

1. Check the implementation files:
   - `src/app/auth/callback/route.ts` (server-side handler)
   - `src/app/auth/callback/page.tsx` (client-side UI)
   - `src/app/login/page.tsx` (login form)
   - `src/lib/supabase/client.ts` (client config)

2. Verify server-side client works:
   - `src/lib/supabase/server.ts`

3. Check AuthContext:
   - `src/contexts/AuthContext.tsx`

4. Look for typos in:
   - Redirect URLs
   - Environment variables
   - File paths

Remember: The server-side route handler (`route.ts`) should handle most PKCE issues automatically!
