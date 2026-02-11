console.log("JobTracker content script loaded", location.href);


// ================================
// UTILITIES
// ================================
function detectPlatform(url) {
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("indeed.com")) return "indeed";
  if (url.includes("naukri.com")) return "naukri";
  if (url.includes("glassdoor.com")) return "glassdoor";
  return null;
}

function waitFor(selector, timeout = 6000) {
  return new Promise(resolve => {
    const found = document.querySelector(selector);
    if (found) return resolve(found);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

// Parse location string into city, state, country components
function parseLocation(locationStr) {
  if (!locationStr) return { city: null, state: null, country: null, fullLocation: null };

  const location = locationStr.trim();
  const parts = location.split(',').map(p => p.trim()).filter(p => p);

  let city = null;
  let state = null;
  let country = null;

  if (parts.length === 1) {
    // Just one part - could be city or "Remote" or country
    if (location.toLowerCase().includes('remote')) {
      city = 'Remote';
    } else {
      city = parts[0];
    }
  } else if (parts.length === 2) {
    // Two parts: likely "City, State" or "City, Country"
    city = parts[0];
    // Check if second part looks like a state (2-3 letters) or country
    if (parts[1].length <= 3) {
      state = parts[1];
    } else {
      country = parts[1];
    }
  } else if (parts.length >= 3) {
    // Three or more parts: "City, State, Country"
    city = parts[0];
    state = parts[1];
    country = parts[2];
  }

  return {
    city,
    state,
    country,
    fullLocation: location
  };
}

// ================================
// LINKEDIN
// ================================
async function scrapeLinkedIn() {
  await waitFor("h1");

  let jobId = window.location.pathname.match(/\/jobs\/view\/(\d+)/)?.[1];

  // Attempt to find job ID from URL parameters if not in path (common in search view)
  if (!jobId) {
    const params = new URLSearchParams(window.location.search);
    jobId = params.get("currentJobId");
  }

  // If still no ID, use a hash of the title or something temporary, or just proceed with null ID logic handling later
  // But let's try to scrape title first to see if we are on a job page
  const title =
    document.querySelector("h1")?.textContent.trim() ||
    document.querySelector('a[href*="/jobs/view/"]')?.textContent.trim() ||
    document.querySelector(".job-details-jobs-unified-top-card__job-title")?.textContent.trim() ||
    null;

  if (!jobId && title) {
    // Generate a pseudo ID if we found a title but no ID in URL (e.g. modal overlay)
    jobId = "li-" + Math.floor(Math.random() * 1000000);
  }

  if (!jobId) return null;

  const company =
    document.querySelector('a[href*="/company/"]')?.textContent.trim() ||
    null;

  const locationStr = [...document.querySelectorAll("span")]
    .map(el => el.textContent.trim())
    .find(t => t.includes(",") && t.length < 60) || null;

  const locationData = parseLocation(locationStr);

  // Extract salary/compensation
  const salaryText = [...document.querySelectorAll("span")]
    .map(el => el.textContent.trim())
    .find(t => t.match(/\$|₹|€|£/) && t.match(/\d/)) || null;

  // Extract job type (Full-time, Contract, etc.)
  const jobType = [...document.querySelectorAll("span")]
    .map(el => el.textContent.trim())
    .find(t => /(full-time|part-time|contract|temporary|internship)/i.test(t)) || null;

  // Extract experience level
  const experienceLevel = [...document.querySelectorAll("span")]
    .map(el => el.textContent.trim())
    .find(t => /(entry level|associate|mid-senior|director|executive)/i.test(t)) || null;

  // Extract job description
  const descriptionEl = document.querySelector(".show-more-less-html__markup");
  const description = descriptionEl?.textContent.trim().substring(0, 1000) || null;

  // Extract HR/Recruiter details (Non-blocking)
  let hrName = null;
  let hrProfile = null;

  try {
    // 1. "Meet the hiring team" section
    const hiringTeamSection = document.querySelector('.hirer-card__hirer-information');
    if (hiringTeamSection) {
      const link = hiringTeamSection.querySelector('a');
      if (link) {
        hrName = link.textContent.trim();
        hrProfile = link.href;
      } else {
        hrName = hiringTeamSection.textContent.trim();
      }
    }

    // 2. Fallback: Search for "hiring" link text if specific class not found
    if (!hrName) {
      const possibleLinks = Array.from(document.querySelectorAll('a[href*="/in/"]'));
      const hiringLink = possibleLinks.find(a => a.closest('.jobs-unified-top-card__hiring-team') || a.textContent.toLowerCase().includes('hiring'));
      if (hiringLink) {
        hrName = hiringLink.textContent.trim();
        hrProfile = hiringLink.href;
      }
    }
  } catch (e) {
    console.warn("⚠️ Failed to extract recruiter info:", e);
  }

  // Extract number of applicants
  const applicantsText = [...document.querySelectorAll("span")]
    .map(el => el.textContent.trim())
    .find(t => /\d+\s+applicants?/i.test(t)) || null;

  // Extract posted date
  const postedText = [...document.querySelectorAll("span")]
    .map(el => el.textContent.trim())
    .find(t => /(reposted|posted)\s+\d+/i.test(t)) || null;

  return {
    platform: "linkedin",
    jobId,
    title,
    company,
    location: locationData.fullLocation,
    city: locationData.city,
    state: locationData.state,
    country: locationData.country,
    salary: salaryText,
    jobType,
    experienceLevel,
    description,
    hrName,
    hrProfile,
    date: postedText,
    applicants: applicantsText,
    jobUrl: window.location.href,
    scrapedAt: new Date().toISOString()
  };
}

// ================================
// INDEED
// ================================
async function scrapeIndeed() {
  console.log("🔵 Starting Indeed scraper...");
  await waitFor('h2[data-testid="jobsearch-JobInfoHeader-title"]');

  // Extract job ID from data attribute
  const jobIdEl = document.querySelector('[data-indeed-apply-jk]');
  const jobId = jobIdEl?.dataset.indeedApplyJk ||
    new URLSearchParams(window.location.search).get("jk");

  console.log("📌 Indeed Job ID:", jobId);

  if (!jobId) {
    console.error("❌ No job ID found");
    return null;
  }

  // Extract title from h2 > span structure
  const titleEl = document.querySelector('h2[data-testid="jobsearch-JobInfoHeader-title"] span');
  const title = titleEl?.textContent?.trim()?.replace(/ - job post$/, '') || null;
  console.log("📝 Title:", title);

  // Extract company name
  const companyEl = document.querySelector('div[data-testid="inlineHeader-companyName"] a') ||
    document.querySelector('div[data-testid="inlineHeader-companyName"]');
  const company = companyEl?.textContent?.trim() || null;
  console.log("🏢 Company:", company);

  // Extract location
  const locationEl = document.querySelector('div[data-testid="inlineHeader-companyLocation"]');
  const locationStr = locationEl?.textContent?.trim() || null;
  const locationData = parseLocation(locationStr);
  console.log("📍 Location:", locationData);

  // Extract salary
  const salaryEl = document.querySelector('#salaryInfoAndJobType span.css-1oc7tea');
  const salary = salaryEl?.textContent?.trim() || null;
  console.log("💰 Salary:", salary);

  // Extract job type - look in the metadata area
  const jobTypeEl = document.querySelector('#jobsearch-ViewJobButtons-container');
  let jobType = null;
  if (jobTypeEl) {
    const allText = jobTypeEl.textContent || '';
    const typeMatch = allText.match(/(Full-time|Part-time|Contract|Temporary|Internship)/i);
    if (typeMatch) jobType = typeMatch[1];
  }
  console.log("⏰ Job Type:", jobType);

  // Extract job description
  const descriptionEl = document.querySelector('#jobDescriptionText');
  const description = descriptionEl?.textContent?.trim().substring(0, 1000) || null;
  console.log("📄 Description length:", description?.length || 0);

  // Extract benefits if available
  let benefits = null;
  const benefitsSection = [...document.querySelectorAll('div')].find(el =>
    el.textContent?.includes('Benefits') || el.textContent?.includes('Pulled from')
  );
  if (benefitsSection) {
    benefits = benefitsSection.textContent.trim().substring(0, 300);
  }
  console.log("🎁 Benefits:", benefits ? "Found" : "Not found");

  // Extract posted date
  const postedText = [...document.querySelectorAll('span, div')]
    .map(el => el.textContent?.trim())
    .find(t => t && /posted\s+(today|yesterday|\d+\s+day|just posted|Posted\s+\d+)/i.test(t)) || null;
  console.log("📅 Posted:", postedText);

  const result = {
    platform: "indeed",
    jobId,
    title,
    company,
    location: locationData.fullLocation,
    city: locationData.city,
    state: locationData.state,
    country: locationData.country,
    salary,
    jobType,
    description,
    benefits,
    postedDate: postedText,
    jobUrl: window.location.href,
    scrapedAt: new Date().toISOString()
  };

  console.log("✅ Indeed scraping complete:", result);
  return result;
}

// ================================
// NAUKRI
// ================================
async function scrapeNaukri() {
  console.log("🔵 Starting Naukri scraper...");
  await waitFor('h1[class*="jd-header-title"]');

  // Extract job ID from URL - Naukri URLs end with job ID
  const urlParts = window.location.pathname.split('-');
  const jobId = urlParts[urlParts.length - 1] || Date.now().toString();
  console.log("📌 Naukri Job ID:", jobId);

  if (!jobId) {
    console.error("❌ No job ID found");
    return null;
  }

  // Extract title
  const titleEl = document.querySelector('h1[class*="jd-header-title"]');
  const title = titleEl?.textContent?.trim() || null;
  console.log("📝 Title:", title);

  // Extract company - look for the careers link first
  let company = null;
  const companyLink = document.querySelector('a[title*="Careers"]') ||
    document.querySelector('div[class*="jd-header-comp-name"] a');
  if (companyLink) {
    company = companyLink.textContent.trim();
  } else {
    const companyDiv = document.querySelector('div[class*="jd-header-comp-name"]');
    if (companyDiv) {
      company = companyDiv.firstChild?.textContent?.trim() || null;
    }
  }
  console.log("🏢 Company:", company);

  // Extract location
  const locationEl = document.querySelector('span[class*="jhc__location"] a') ||
    document.querySelector('[class*="jhc__loc"] span') ||
    document.querySelector('[class*="jhc__loc"]');
  const locationStr = locationEl?.textContent?.trim() || null;
  const locationData = parseLocation(locationStr);
  console.log("📍 Location:", locationData);

  // Extract salary
  const salaryEl = document.querySelector('[class*="jhc__salary"] span');
  const salary = salaryEl?.textContent?.trim() || null;
  console.log("💰 Salary:", salary);

  // Extract experience
  const experienceEl = document.querySelector('[class*="jhc__exp"] span');
  const experience = experienceEl?.textContent?.trim() || null;
  console.log("💼 Experience:", experience);

  // Extract job description
  const descriptionEl = document.querySelector('[class*="dang-inner-html"]');
  const description = descriptionEl?.textContent?.trim().substring(0, 1000) || null;
  console.log("📄 Description length:", description?.length || 0);

  // Extract skills
  const skillsElements = document.querySelectorAll('[class*="key-skill"] a span');
  const skillsArray = Array.from(skillsElements).map(el => el.textContent.trim());
  const skills = skillsArray.join(', ') || null;
  console.log("🔧 Skills found:", skillsArray.length);

  // Extract recruiter/posted by info
  const recruiterEl = document.querySelector('[title*="Posted by"]') ||
    document.querySelector('span[class*="company-name"]');
  const recruiterName = recruiterEl?.textContent?.replace('Posted by', '').trim() || null;
  console.log("👤 Recruiter:", recruiterName);

  // Extract posted date
  const postedLabel = [...document.querySelectorAll('label')]
    .find(el => el.textContent?.includes('Posted:'));
  const postedDate = postedLabel?.nextElementSibling?.textContent?.trim() || null;
  console.log("📅 Posted:", postedDate);

  // Extract applicants count
  const applicantsLabel = [...document.querySelectorAll('label')]
    .find(el => el.textContent?.includes('Applicants:'));
  const applicants = applicantsLabel?.nextElementSibling?.textContent?.trim() || null;
  console.log("👥 Applicants:", applicants);

  const result = {
    platform: "naukri",
    jobId,
    title,
    company,
    location: locationData.fullLocation,
    city: locationData.city,
    state: locationData.state,
    country: locationData.country,
    salary,
    experience,
    description,
    skills,
    recruiterName,
    postedDate,
    applicants,
    jobUrl: window.location.href,
    scrapedAt: new Date().toISOString()
  };

  console.log("✅ Naukri scraping complete:", result);
  return result;
}

// ================================
// GLASSDOOR
// ================================
async function scrapeGlassdoor() {
  console.log("🔵 Starting Glassdoor scraper...");
  console.log("📍 Current URL:", window.location.href);

  // Determine if we're on a search results page or a job detail page
  const isSearchResults = window.location.pathname.includes('Job/') || window.location.search.includes('SRCH_');
  const isJobDetail = window.location.pathname.includes('job-listing/') || window.location.search.includes('jl=');

  console.log("🔍 Page type - Search Results:", isSearchResults, "| Job Detail:", isJobDetail);

  // Wait for job cards to load (works for both list and detail view)
  const jobCardSelector = '.JobCard_jobTitle__GLyJ1, [data-test="job-title"], .JobsList_jobListItem__wjTHv';
  await waitFor(jobCardSelector, 8000);

  // Extract job ID from URL or data attribute
  let jobId = null;
  let selectedJobCard = null;

  // Try URL parameter first (e.g., ?jl=1010029421890)
  const urlParams = new URLSearchParams(window.location.search);
  jobId = urlParams.get('jl');

  // If on search results, find the selected job card
  if (!jobId && isSearchResults) {
    console.log("🔍 Searching for selected job in list view...");
    selectedJobCard = document.querySelector('.JobsList_jobListItem__wjTHv.JobsList_selected__nFuMW');

    if (selectedJobCard) {
      jobId = selectedJobCard.dataset.jobid;
      console.log("✅ Found selected job:", jobId);
    } else {
      console.warn("⚠️ No job is selected in the list. Please click on a job first.");
      return {
        error: "No job selected",
        message: "Please click on a job in the list to view its details before saving."
      };
    }
  }

  // Try from data-jobid attribute if still not found
  if (!jobId) {
    const jobListItem = document.querySelector('[data-jobid]');
    jobId = jobListItem?.dataset.jobid;
  }

  // Try from job listing link
  if (!jobId) {
    const jobLink = document.querySelector('[href*="jl="]');
    if (jobLink) {
      const match = jobLink.href.match(/jl=(\d+)/);
      jobId = match?.[1];
    }
  }

  console.log("📌 Glassdoor Job ID:", jobId);

  if (!jobId) {
    console.error("❌ No job ID found");
    return {
      error: "No job ID found",
      message: "Could not identify a job on this page. Make sure you've clicked on a job listing."
    };
  }

  // Define search scope: use selected card if in list view, otherwise search whole document
  const searchScope = selectedJobCard || document;

  // Helper function to search within scope
  const findInScope = (selectors) => {
    for (const selector of selectors) {
      const element = searchScope.querySelector(selector);
      if (element) return element;
    }
    return null;
  };

  // Extract title - updated selectors for current DOM structure
  const titleEl = findInScope([
    `#job-title-${jobId}`,
    '.JobCard_jobTitle__GLyJ1',
    '[data-test="job-title"]',
    'h1'
  ]);
  const title = titleEl?.textContent?.trim() || null;
  console.log("📝 Title:", title);

  // Extract company name - updated selectors
  const companyEl = findInScope([
    `#job-employer-${jobId}`,
    '.EmployerProfile_compactEmployerName__9MGcV',
    '[data-test="employer-name"]'
  ]);
  const company = companyEl?.textContent?.trim() || null;
  console.log("🏢 Company:", company);

  // Extract location - updated selectors
  const locationEl = findInScope([
    `#job-location-${jobId}`,
    '.JobCard_location__Ds1fM',
    '[data-test="emp-location"]',
    '[data-test="location"]'
  ]);
  const locationStr = locationEl?.textContent?.trim() || null;
  const locationData = parseLocation(locationStr);
  console.log("📍 Location:", locationData);

  // Extract salary estimate - updated selectors
  const salaryEl = findInScope([
    `#job-salary-${jobId}`,
    '.JobCard_salaryEstimate__QpbTW',
    '[data-test="detailSalary"]'
  ]);
  const salary = salaryEl?.textContent?.trim() || null;
  console.log("💰 Salary:", salary);

  // Extract company rating - look for rating display
  let rating = null;
  const ratingEl = document.querySelector('[data-test="rating"]') ||
    [...document.querySelectorAll('div, span')].find(el =>
      /^\d\.\d$/.test(el.textContent?.trim())
    );
  if (ratingEl) {
    rating = ratingEl.textContent.trim();
  }
  console.log("⭐ Rating:", rating);

  // Check for Easy Apply badge - search within scope
  const hasEasyApply = !!findInScope(['[aria-label="Easy Apply"]', '.JobCard_easyApplyTag__5vlo5']);
  console.log("⚡ Easy Apply:", hasEasyApply);

  // Extract job type from tags or badges
  let jobType = null;
  const badgeElements = selectedJobCard
    ? selectedJobCard.querySelectorAll('.tag_TagContainer__mG5or, [role="contentinfo"]')
    : document.querySelectorAll('.tag_TagContainer__mG5or, [role="contentinfo"]');

  const badgeText = [...badgeElements]
    .map(el => el.textContent?.trim())
    .join(' ');

  const jobTypeMatch = badgeText.match(/(full-time|part-time|contract|temporary|internship|remote)/i);
  if (jobTypeMatch) {
    jobType = jobTypeMatch[1];
  }
  console.log("⏰ Job Type:", jobType);

  // Extract job description - try multiple possible containers
  // Description is typically only in detail view, not list view
  let description = null;
  const descriptionEl =
    document.querySelector('[data-test="description"]') ||
    document.querySelector('.JobDetails_jobDescription__uW_fK') ||
    document.querySelector('[class*="description"]') ||
    document.querySelector('.desc');

  if (descriptionEl) {
    description = descriptionEl.textContent?.trim().substring(0, 1000) || null;
  }
  console.log("📄 Description length:", description?.length || 0);

  // Extract posted date/age - updated for "24h", "7d" format
  let postedDate = null;
  const listingAgeEl = findInScope([
    '.JobCard_listingAge__jJsuc',
    '[data-test="job-age"]'
  ]);

  if (listingAgeEl) {
    postedDate = listingAgeEl.textContent?.trim();
  }

  // Fallback to searching text nodes
  if (!postedDate) {
    const postedText = [...document.querySelectorAll('div, span')]
      .map(el => el.textContent?.trim())
      .find(t => t && /(posted|listed|ago|\d+[hdw])/i.test(t));
    if (postedText) {
      postedDate = postedText;
    }
  }
  console.log("📅 Posted:", postedDate);

  const result = {
    platform: "glassdoor",
    jobId,
    title,
    company,
    location: locationData.fullLocation,
    city: locationData.city,
    state: locationData.state,
    country: locationData.country,
    salary,
    rating,
    jobType,
    hasEasyApply,
    description,
    postedDate,
    jobUrl: window.location.href,
    scrapedAt: new Date().toISOString()
  };

  console.log("✅ Glassdoor scraping complete:", result);
  return result;
}

// ================================
// MESSAGE HANDLER
// ================================

// Always attach listener to ensure new context works
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("📩 Message received in content script:", msg);

  if (msg.type !== "SCRAPE_JOB") {
    console.log("⚠️ Unknown message type:", msg.type);
    return;
  }

  let responded = false;

  const safeRespond = (data) => {
    if (!responded) {
      responded = true;
      console.log("✅ Sending response:", data);
      sendResponse(data);
    }
  };

  (async () => {
    try {
      const platform = detectPlatform(location.href);
      console.log("🔍 Detected platform:", platform, "URL:", location.href);

      if (!platform) {
        console.error("❌ Platform not supported:", location.href);
        safeRespond({ error: "Unsupported platform", url: location.href });
        return;
      }

      let data = null;

      if (platform === "linkedin") {
        console.log("🔵 Scraping LinkedIn...");
        data = await scrapeLinkedIn();
      }
      if (platform === "indeed") {
        console.log("🔵 Scraping Indeed...");
        data = await scrapeIndeed();
      }
      if (platform === "naukri") {
        console.log("🔵 Scraping Naukri...");
        data = await scrapeNaukri();
      }
      if (platform === "glassdoor") {
        console.log("🔵 Scraping Glassdoor...");
        data = await scrapeGlassdoor();
      }

      if (!data) {
        console.error("❌ No data scraped");
        safeRespond({ error: "Could not scrape data from this page" });
        return;
      }

      console.log("✅ Scraping successful:", data);
      safeRespond(data);
    } catch (err) {
      console.error("❌ SCRAPE FAILED:", err);
      safeRespond({ error: err.message || "Unknown error" });
    }
  })();

  // ⏱️ ABSOLUTE FAILSAFE
  setTimeout(() => {
    if (!responded) {
      console.warn("⏱️ Timeout - sending null response");
      safeRespond({ error: "Timeout - page took too long to respond" });
    }
  }, 7000);

  return true; // Keep message channel open for async response
});

