# 🚀 GalaUs - Deploy Tomorrow Checklist

## ⏰ Quick Timeline (1-2 hours)

### ✅ Step 1: Environment Setup (10 min)
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

### ✅ Step 2: Database Security (15 min) **CRITICAL**

1. Open your Supabase project: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Run `supabase/production-rls.sql` (copy and paste the entire file)
4. Click "Run"

**Why:** This locks down your database so only authorized users can access gala data.

---

### ✅ Step 3: Test Locally (15 min)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

**Test these:**
- [ ] Create a user (any name)
- [ ] Create a gala
- [ ] Join the gala with invite code
- [ ] Add a suggestion and vote on it
- [ ] Create a task and mark it done
- [ ] Add an expense
- [ ] Upload a cover image

**Visit:** http://localhost:3001/health to verify all systems

---

### ✅ Step 4: Push to GitHub (5 min)

```bash
git add .
git commit -m "Production ready for deployment"
git push origin main
```

---

### ✅ Step 5: Deploy to Vercel (10 min)

1. **Go to:** https://vercel.com
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import** your gala-us repository
5. **Add environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` → (from Supabase dashboard)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → (from Supabase dashboard)
6. **Click "Deploy"**
7. **Wait** 2-3 minutes for build to complete

---

### ✅ Step 6: Post-Deployment Testing (15 min)

Test on your live URL (something like `your-app.vercel.app`):

**Critical Flows:**
- [ ] Create user and login
- [ ] Create gala with cover image
- [ ] Copy invite link
- [ ] Open invite link in incognito/private window
- [ ] Join as second user
- [ ] Verify both users see the same gala
- [ ] Test voting, tasks, budget, memories

**Security:**
- [ ] Try accessing a gala you're not a member of (should fail)
- [ ] Verify non-members can't see gala content

---

### ✅ Step 7: Optional Enhancements (30 min)

**Custom Domain:**
- In Vercel dashboard → Settings → Domains
- Add your custom domain
- Update DNS records as instructed

**Analytics:**
```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';
// Add <Analytics /> in your body
```

**Error Tracking:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 🎯 Launch Day Checklist

### Morning:
- [ ] Final test on production URL
- [ ] Verify database security (try accessing other galas)
- [ ] Check health page: `/health`
- [ ] Prepare sample galas to show

### Launch:
- [ ] Share URL with initial users
- [ ] Monitor Supabase dashboard for errors
- [ ] Check Vercel Analytics for usage
- [ ] Be available for questions

### Evening:
- [ ] Review error logs in Vercel dashboard
- [ ] Check Supabase usage/quotas
- [ ] Collect user feedback

---

## 🆘 Emergency Contacts

**If something breaks:**

1. **Check health page:** `your-url.vercel.app/health`
2. **Supabase logs:** Supabase dashboard → Database → Logs
3. **Vercel logs:** Vercel dashboard → Deployments → View Function Logs
4. **Rollback:** Vercel dashboard → Deployments → Previous → Promote

**Common Issues:**

| Problem | Solution |
|---------|----------|
| "Gala not found" | Check RLS policies are applied |
| Cover images not loading | Verify database has cover_image data |
| Invite codes not working | Test with lowercase version |
| Database permission errors | Re-run production-rls.sql |

---

## 📊 Success Metrics

**Track these first week:**
- Number of users created
- Number of galas created
- Average suggestions per gala
- Tasks completed
- Total expenses tracked

**Supabase Free Tier Limits:**
- Database: 500 MB
- Bandwidth: 5 GB
- File Storage: 1 GB
- API requests: Unlimited

You're good for ~100-200 active users!

---

## 🎉 You're Ready!

**Time investment:** 1-2 hours
**Result:** Production-ready app with security

**Good luck tomorrow! 🚀**
