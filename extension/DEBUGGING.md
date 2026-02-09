# 🐛 JobTracker Extension - Debugging Guide

## How to Debug Scraping Issues

I've added comprehensive logging to help identify scraping problems. Follow these steps:

---

## Step 1: Reload the Extension

After the recent fixes:

1. Go to `chrome://extensions/`
2. Find **JobTracker**
3. Click the **🔄 Reload** button

---

## Step 2: Open Developer Tools

### For the Extension Popup:
1. Click the JobTracker extension icon
2. **Right-click** anywhere in the popup
3. Select **"Inspect"**
4. Go to the **Console** tab

Keep this console open while testing.

### For the Job Page:
1. Navigate to a job posting (LinkedIn/Indeed/Naukri/Glassdoor)
2. Press **F12** or **Ctrl+Shift+I**
3. Go to the **Console** tab

---

## Step 3: Test Scraping

1. Go to a job posting on one of the supported platforms
2. Open the extension popup
3. Click **"Save Current Job"**
4. Watch both consoles (popup console AND page console)

---

## What the Logs Tell You

### ✅ **Successful Scraping** - You'll see:

**In Page Console:**
```
📩 Message received in content script: {type: "SCRAPE_JOB"}
🔍 Detected platform: "linkedin" URL: https://...
🔵 Scraping LinkedIn...
✅ Scraping successful: {platform: "linkedin", jobId: "123", ...}
✅ Sending response: {platform: "linkedin", ...}
```

**In Popup Console:**
```
📍 Active tab: https://www.linkedin.com/jobs/view/1234567890
✅ Content script injected
📦 Received data from content script: {platform: "linkedin", ...}
```

### ❌ **Common Errors:**

#### **"❌ Unsupported page"**
- **Cause**: You're not on a job detail page
- **Solution**: Navigate to a specific job posting, not a search results page

#### **"❌ Cannot read page"**
- **Cause**: Content script failed to load or communicate
- **Solution**: 
  1. Reload the extension
  2. Refresh the job page
  3. Try again

#### **"❌ Platform not supported"**
- **Cause**: URL doesn't match supported platforms
- **Solution**: Make sure you're on linkedin.com, indeed.com, naukri.com, or glassdoor.com

#### **"❌ Could not scrape data from this page"**
- **Cause**: Scraper couldn't find expected elements
- **Solution**: 
  1. Check if the page has fully loaded
  2. Platform may have changed their HTML structure
  3. Use manual entry instead

---

## Step 4: Check What Was Scraped

In the **page console**, look for the scraped data object. Example:

```javascript
{
  platform: "linkedin",
  jobId: "1234567890",
  title: "Senior Software Engineer",
  company: "Google",
  location: "San Francisco, CA",
  salary: "$150k - $200k",  // May be null
  hrName: "Jane Recruiter",  // May be null
  // ... more fields
}
```

**If fields are `null`**: The scraper couldn't find them on the page. This is normal - not all job postings have all fields.

---

## Step 5: Test Each Platform

### LinkedIn (`linkedin.com/jobs`)
✅ **Working URL**: `https://www.linkedin.com/jobs/view/1234567890`
❌ **Won't work**: `https://www.linkedin.com/jobs/search/`

### Indeed (`indeed.com`)
✅ **Working URL**: `https://www.indeed.com/viewjob?jk=abc123`
❌ **Won't work**: `https://www.indeed.com/jobs?q=engineer`

### Naukri (`naukri.com`)
✅ **Working URL**: `https://www.naukri.com/job-listings-software-engineer-xyz-123456`

### Glassdoor (`glassdoor.com`)
✅ **Working URL**: `https://www.glassdoor.com/job-listing/xyz`

---

## Common Issues & Solutions

### Issue: "No response from content script"

**Possible causes:**
1. Content script didn't load
2. Page hasn't finished loading
3. JavaScript error in content script

**Solutions:**
1. Check page console for errors (red text)
2. Reload the extension
3. Refresh the job page
4. Wait 2-3 seconds after page loads, then click "Save"

### Issue: All fields are null/empty

**Possible causes:**
1. Page structure changed (platform updated their design)
2. Content loaded dynamically (not visible yet)

**Solutions:**
1. Scroll down on the job page to load all content
2. Wait a few seconds before scraping
3. Check page console to see what was actually found
4. Use **"➕ Add Manually"** to enter data yourself

### Issue: "Script injection failed"

**This is usually OKAY!** The script might already be loaded via the manifest. The extension will continue trying to scrape.

---

## Testing Checklist

- [ ] Extension reloaded after code changes
- [ ] On a job **detail** page (not search results)
- [ ] Page fully loaded (scroll down to load content)
- [ ] Developer console open (both page and popup)
- [ ] Clicked "Save Current Job" and watched console logs

---

## If Still Not Working

### Share These Details:

1. **Which platform?** (LinkedIn/Indeed/Naukri/Glassdoor)
2. **Full URL** of the job page
3. **Console errors** (screenshot of red errors in console)
4. **What the button says** after clicking (e.g., "❌ Cannot read page")
5. **Scraped data** from console logs (if any)

### Workaround: Manual Entry

While debugging, you can always use:
1. Click extension icon
2. Click **"➕ Add Manually"**
3. Copy-paste job details from the page
4. Save manually

---

## Debug Mode Tips

### Enable Verbose Logging

The extension now logs everything with emojis:
- 📩 = Message received
- 🔍 = Detection/searching
- 🔵 = Action in progress
- ✅ = Success
- ❌ = Error
- ⚠️ = Warning

Look for these in the console to understand what's happening.

### Network Issues

If using a VPN or corporate network, check if Chrome extensions have network access.

---

## Expected Behavior

**Timeline:**
1. Click "Save Current Job" → Button says "Checking page…"
2. ~0.5s → "Injecting script…"
3. ~1s → "Scraping data…"
4. ~2s → "✅ Saved!" (success) or "❌ Error message" (failure)

**Total time**: 2-3 seconds for successful scrape

---

## Quick Test

Try this LinkedIn job (public):
1. Go to any LinkedIn job posting
2. Make sure you're logged into LinkedIn
3. Open extension
4. Click "Save Current Job"
5. Check console logs

If the job page is not public/requires login, make sure you're signed in to the platform first.

---

Good luck debugging! The console logs will tell you exactly what's happening. 🚀
