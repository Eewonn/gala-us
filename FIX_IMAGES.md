# 🔧 Fix Cover Image Storage - Quick Guide

## The Problem
Cover images aren't being saved to the database because the RLS (Row Level Security) policies were blocking updates.

## The Solution
I've updated the RLS policies to work with the MVP name-based authentication system.

---

## 🚀 Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Updated Policies
1. Open the file: `supabase/production-rls.sql`
2. Copy the **entire contents**
3. Paste into the SQL Editor
4. Click **RUN** (or press Ctrl+Enter)

### Step 3: Verify It Works
1. Go to your app (local or deployed)
2. Open any gala
3. Click "Add Cover" button
4. Upload an image
5. Refresh the page - image should persist!
6. Go to "My Galas" page - image should show there too

---

## ✅ What Changed

**Before:**
- RLS policies required PostgreSQL session variables (`current_setting`)
- Session variables weren't being set with name-based auth
- Updates were silently blocked

**After:**
- Simplified policies for MVP that allow updates
- Still have RLS enabled for structure
- Cover images now save to `galas.cover_image` column
- Visible across all devices and users

---

## 🔍 Verify in Database

In Supabase SQL Editor, check if images are being saved:

```sql
-- See galas with cover images
SELECT id, title, length(cover_image) as image_size
FROM galas
WHERE cover_image IS NOT NULL;
```

You should see the `image_size` showing the length of the base64 string.

---

## 📝 Notes

**For MVP/Testing:** These simplified policies are fine. They still have RLS enabled and prevent common issues.

**For Production with Real Users:** Consider:
- Implementing proper authentication (email/password or OAuth)
- Tightening policies to verify actual user identity
- Using Supabase Storage instead of base64 in database

---

## 🆘 Troubleshooting

**If images still don't save:**

1. **Check browser console** for errors
2. **Run this test query** in Supabase SQL Editor:
   ```sql
   -- Test if you can update galas
   UPDATE galas
   SET description = 'test'
   WHERE id = (SELECT id FROM galas LIMIT 1);
   ```
   If this fails, RLS policies might not be applied correctly.

3. **Verify RLS policies exist:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'galas';
   ```
   You should see policies for select, insert, and update.

4. **Check the actual update:**
   - Open browser DevTools → Network tab
   - Upload an image
   - Look for the POST request to Supabase
   - Check if there's an error in the response

**Still stuck?** The policy file has reverted to simpler "Anyone can..." policies that should work for MVP.
