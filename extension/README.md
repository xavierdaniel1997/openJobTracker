# JobTracker Chrome Extension

Track your job applications across LinkedIn, Indeed, Naukri, and Glassdoor with automatic data scraping.

## Quick Start

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top-right)
3. Click "Load unpacked"
4. Select this folder
5. Start tracking jobs!

## Features

- 🔍 **Auto-scrape** job data from 4 major platforms
- 📝 **Manual entry** for other platforms
- 📊 **Track status**: Applied → Interview → Offer → Rejected
- 🔍 **Search & filter** your applications
- 📥 **Export to CSV** for backups
- 👁️ **View & edit** job details anytime

## How to Use

### Save a Job (Auto-scrape)
1. Visit a job page on LinkedIn/Indeed/Naukri/Glassdoor
2. Click the JobTracker extension icon
3. Click "Save Current Job"

### Add Manually
1. Click extension icon
2. Click "➕ Add Manually"
3. Fill in details

### Manage Jobs
- **Change Status**: Click 🔄 Status
- **View Details**: Click 👁️ View
- **Delete**: Click 🗑️ Delete
- **Search**: Use search box to filter
- **Export**: Click 📥 Export for CSV

## What Gets Scraped

- Job title, company, location
- Salary/compensation
- HR/Recruiter details (when available)
- Job description
- Posted date
- Application count
- Company ratings
- And more!

## Files

- `manifest.json` - Extension configuration
- `content.js` - Scraping logic for all platforms
- `popup.html` - Extension UI
- `popup.js` - UI functionality
- `icons/` - Extension icons

## Tech Stack

- Vanilla JavaScript (no dependencies)
- Chrome Extension Manifest V3
- Chrome Storage API for local data
- Platform-specific DOM scraping

## Support

The extension works best on:
- LinkedIn job detail pages
- Indeed job view pages
- Naukri job detail pages
- Glassdoor job listings

For other platforms, use manual entry.

---

**Built to help you stay organized in your job search! 🚀**
