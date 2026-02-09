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

  const jobLocation =
    [...document.querySelectorAll("span")]
      .map(el => el.textContent.trim())
      .find(t => t.includes(",") && t.length < 60) || null;

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
    location: jobLocation,
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
  const jobLocation = locationEl?.textContent?.trim() || null;
  console.log("📍 Location:", jobLocation);

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
    location: jobLocation,
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
  const jobLocation = locationEl?.textContent?.trim() || null;
  console.log("📍 Location:", jobLocation);

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
    location: jobLocation,
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
  await waitFor("h1");

  const jobId =
    window.location.pathname.match(/jobListingId=(\d+)/)?.[1] ||
    window.location.pathname.split("_").pop();

  if (!jobId) return null;

  const title =
    document.querySelector("h1")?.textContent.trim() || null;

  const company =
    document.querySelector('[data-test="employer-name"]')
      ?.textContent.trim() || null;

  const jobLocation =
    document.querySelector('[data-test="location"]')
      ?.textContent.trim() || null;

  // Extract salary estimate
  const salary =
    document.querySelector('[data-test="detailSalary"]')?.textContent.trim() ||
    document.querySelector('.salary')?.textContent.trim() ||
    [...document.querySelectorAll('div')].find(el =>
      /\$\d+K?\s*-\s*\$\d+K?/i.test(el.textContent)
    )?.textContent.trim() || null;

  // Extract company rating
  const rating =
    document.querySelector('[data-test="rating"]')?.textContent.trim() ||
    document.querySelector('.rating')?.textContent.trim() || null;

  // Extract job type
  const jobType = [...document.querySelectorAll('div, span')].find(el =>
    /(full-time|part-time|contract|temporary|internship)/i.test(el.textContent)
  )?.textContent.trim() || null;

  // Extract job description
  const descriptionEl = document.querySelector('[data-test="description"]') ||
    document.querySelector('.desc');
  const description = descriptionEl?.textContent.trim().substring(0, 1000) || null;

  // Extract posted date
  const postedText = [...document.querySelectorAll('div, span')]
    .map(el => el.textContent.trim())
    .find(t => /(posted|listed)\s+(\d+[dh]|\d+\s+(hour|day|week)s?\s+ago)/i.test(t)) || null;

  return {
    platform: "glassdoor",
    jobId,
    title,
    company,
    location: jobLocation,
    salary,
    rating,
    jobType,
    description,
    postedDate: postedText,
    jobUrl: window.location.href,
    scrapedAt: new Date().toISOString()
  };
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

