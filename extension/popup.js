document.addEventListener("DOMContentLoaded", init);

// State
let allJobs = {};
let currentScrapedJob = null;
let currentEditingId = null; // jobKey
let editingMetadata = null; // Stores {jobId, platform, id}

async function init() {
  const currentContainer = document.getElementById("currentJobContainer");
  const savedContainer = document.getElementById("savedJobsContainer");

  // Critical check
  if (!currentContainer || !savedContainer) {
    console.error("CRITICAL: DOM elements missing in init");
    return;
  }

  // Check auth and update header
  await updateHeaderAuth();

  await loadJobs();
  renderSavedJobs();

  // Auto-scrape active tab
  detectAndScrape();

  // Listeners
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", (e) => renderSavedJobs(e.target.value));

  const addManualBtn = document.getElementById("addManualBtn");
  if (addManualBtn) addManualBtn.addEventListener("click", () => openModal(null));

  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) exportBtn.addEventListener("click", exportJobs);

  // Modal Actions
  const modalClose = document.getElementById("modalClose");
  if (modalClose) modalClose.addEventListener("click", closeModal);

  const modalCancel = document.getElementById("modalCancel");
  if (modalCancel) modalCancel.addEventListener("click", closeModal);

  const modalSave = document.getElementById("modalSave");
  if (modalSave) modalSave.addEventListener("click", saveJobFromModal);

  const jobModal = document.getElementById("jobModal");
  if (jobModal) {
    jobModal.addEventListener("click", (e) => {
      if (e.target === jobModal) closeModal();
    });
  }

  // Sign In button handler
  const signInBtn = document.getElementById("signInBtn");
  if (signInBtn) {
    signInBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: 'http://localhost:3000/login' });
    });
  }

  // Dashboard button handler
  const dashboardBtn = document.getElementById("dashboardBtn");
  if (dashboardBtn) {
    dashboardBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
    });
  }
}

// -------------------------------------------------------------
// DATA LAYER
// -------------------------------------------------------------
async function loadJobs() {
  const { accessToken } = await chrome.storage.local.get("accessToken");

  if (!accessToken) {
    allJobs = {};
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/jobs", {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (response.ok) {
      const jobs = await response.json();
      // Transform array to object keyed by custom ID for existing logic compatibility
      allJobs = jobs.reduce((acc, job) => {
        // Use platform:jobId as key if available, otherwise fallback
        const key = job.jobId && job.platform ? `${job.platform}:${job.jobId}` : job.id;
        acc[key] = { ...job, key };
        return acc;
      }, {});
    } else {
      console.error("Failed to fetch jobs:", response.statusText);
    }
  } catch (error) {
    console.error("Error loading jobs:", error);
  }
}

async function saveJobToApi(jobData) {
  const { accessToken } = await chrome.storage.local.get("accessToken");

  if (!accessToken) {
    console.error("No access token found");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(jobData)
    });

    if (response.ok) {
      await loadJobs(); // Reload to get updated list
      renderSavedJobs();
    } else {
      console.error("Failed to save job:", await response.text());
    }
  } catch (error) {
    console.error("Error saving job:", error);
  }
}

async function updateJobInApi(id, jobData) {
  const { accessToken } = await chrome.storage.local.get("accessToken");

  if (!accessToken) {
    console.error("No access token found");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(jobData)
    });

    if (response.ok) {
      await loadJobs();
      renderSavedJobs();
    } else {
      console.error("Failed to update job:", await response.text());
    }
  } catch (error) {
    console.error("Error updating job:", error);
  }
}

// -------------------------------------------------------------
// CORE LOGIC: SCRAPING
// -------------------------------------------------------------
async function detectAndScrape() {
  renderLoader("Checking current tab...");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url) {
      renderCurrentMessage("No active tab found.", "empty-icon");
      return;
    }

    const isSupported =
      tab.url.includes("linkedin.com/jobs") ||
      tab.url.includes("indeed.com") ||
      tab.url.includes("naukri.com") ||
      tab.url.includes("glassdoor.com");

    if (!isSupported) {
      // Show the domain for clarity
      try {
        const urlObj = new URL(tab.url);
        renderCurrentMessage(`Not a supported job site.<br><small>${urlObj.hostname}</small>`, "👋");
      } catch (e) {
        renderCurrentMessage("Navigate to a job post to track it.", "👋");
      }
      return;
    }

    renderLoader("Connecting to page...");

    // Helper to send message
    const attemptScrape = async () => {
      return await chrome.tabs.sendMessage(tab.id, { type: "SCRAPE_JOB" });
    };

    let response = null;

    // 1. Try sending message immediately (content script might be loaded by manifest)
    try {
      response = await attemptScrape();
    } catch (msgError) {
      console.log("First attempt failed, injecting script...", msgError);

      // 2. If failed, inject script and retry
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });

        // Give it a moment to initialize
        await new Promise(r => setTimeout(r, 1000));

        response = await attemptScrape();
      } catch (injectError) {
        console.error("Injection failed:", injectError);
        throw new Error("Could not connect to page. Try refreshing the tab.");
      }
    }

    if (!response) throw new Error("No response from page");
    if (response.error) throw new Error(response.error);

    // Success
    currentScrapedJob = response;
    renderCurrentJobCard(currentScrapedJob);

  } catch (error) {
    console.error(error);
    renderCurrentMessage(
      `Scraping failed.<br><small>${error.message}</small><br><button class="btn btn-outline" style="margin-top:8px" onclick="location.reload()">Retry</button>`,
      "❌"
    );
  }
}

// -------------------------------------------------------------
// RENDERING
// -------------------------------------------------------------
function renderLoader(text) {
  const container = document.getElementById("currentJobContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="loader">
      <div class="spinner"></div>
      <span>${text}</span>
    </div>
  `;
}

function renderCurrentMessage(text, iconStr) {
  const container = document.getElementById("currentJobContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">${iconStr}</div>
      <div>${text}</div>
    </div>
  `;
}

function renderCurrentJobCard(job) {
  const container = document.getElementById("currentJobContainer");
  if (!container) return;

  const key = `${job.platform}:${job.jobId}`;
  const isSaved = !!allJobs[key];

  const html = `
    <div class="job-card current-job-card" style="border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
      <div class="job-header" style="margin-bottom: 8px;">
        <div style="flex: 1; min-width: 0;">
          <div class="job-title" style="margin-bottom: 8px; font-size: 18px; font-weight: 700;">${job.title || "Unknown Title"}</div>
          <div class="job-company" style="font-size: 15px; color: #8a8a8a; font-weight: 500; display: flex; align-items: center; gap: 8px;">
            <span>${job.company || "Unknown Company"}</span>
            ${job.location ? `
              <span style="opacity:0.3; font-weight: 300;">|</span>
              <span style="display: flex; align-items: center; gap: 4px;">
                <span style="color: #ef4444; font-size: 14px;">📍</span>
                <span>${job.location}</span>
              </span>
            ` : ""}
          </div>
        </div>
      </div>
      
      <div class="job-info" style="margin-top: 20px; gap: 12px; display: flex; flex-wrap: wrap; align-items: center;">
        ${job.salary ? `<div class="tag tag-salary">💰 ${job.salary}</div>` : ""}
        ${job.jobType ? `<div class="tag">⏰ ${job.jobType}</div>` : ""}
      </div>

      <div class="job-divider" style="height: 1px; background: rgba(255, 255, 255, 0.08); margin: 20px 0;"></div>

      <div class="job-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${isSaved ? `<div class="status-badge" style="background: rgba(255,255,255,0.05); color: #8a8a8a; border: 1px solid rgba(255,255,255,0.1);">SAVED</div>` : ""}
          ${job.platform ? `<span class="platform-tag" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">${job.platform}</span>` : ""}
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <div id="btnEditCurrent" style="cursor: pointer; opacity: 0.6; padding: 8px; border-radius: 10px; background: rgba(255,255,255,0.03);" title="Edit Detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </div>
          ${isSaved
      ? `<button class="btn btn-secondary scroll-saved-btn" data-key="${key}" style="padding: 0 16px; height: 36px; border-radius: 12px; font-size: 13px; font-weight: 400;">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
             View
           </button>`
      : `<button class="btn btn-primary" id="btnSaveCurrent" style="padding: 0 16px; height: 36px; border-radius: 12px; font-weight: 400; font-size: 13px;">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
           Save
         </button>`
    }
        </div>
      </div>
    </div>
  `;

  // Set HTML content once
  container.innerHTML = html;

  // Bind Events
  const btnSave = document.getElementById("btnSaveCurrent");
  const btnEdit = document.getElementById("btnEditCurrent");
  const btnSavedScroll = container.querySelector(".scroll-saved-btn");

  if (btnSave) {
    btnSave.addEventListener("click", () => {
      quickSave(job);
    });
  }

  if (btnEdit) {
    btnEdit.addEventListener("click", () => {
      openModal(null, job);
    });
  }

  if (btnSavedScroll) {
    btnSavedScroll.addEventListener("click", (e) => {
      const key = e.currentTarget.dataset.key;
      window.scrollToSaved(key);
    });
  }
}

function renderSavedJobs(query = "") {
  try {
    const container = document.getElementById("savedJobsContainer");
    const countEl = document.getElementById("savedCount");

    if (!container) {
      console.warn("savedJobsContainer not found in DOM");
      return;
    }

    container.innerHTML = "";

    // Safety check for allJobs
    if (!allJobs || typeof allJobs !== 'object') {
      allJobs = {};
    }

    const jobsArray = Object.entries(allJobs).map(([k, v]) => ({ key: k, ...v }));

    // Sort by date (newest first)
    jobsArray.sort((a, b) => new Date(b.createdAt || b.scrapedAt) - new Date(a.createdAt || a.scrapedAt));

    // Filter
    const filtered = jobsArray.filter(j => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (j.title || "").toLowerCase().includes(q) ||
        (j.company || "").toLowerCase().includes(q)
      );
    });

    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div>No saved jobs found.</div>
        </div>
      `;
      return;
    }

    filtered.forEach(job => {
      const el = document.createElement("div");
      el.className = "job-card";
      el.id = `job-${job.key}`;

      const platformClass = `platform-${job.platform?.toLowerCase() || 'other'}`;

      el.innerHTML = `
        <div class="job-header" style="margin-bottom: 8px;">
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div class="job-title" style="margin-bottom: 8px; font-size: 18px; font-weight: 700;">${job.title}</div>
              <div class="job-date" style="color: #8a8a8a; font-weight: 500; font-size: 13px;">${new Date(job.createdAt || job.scrapedAt).toLocaleDateString()}</div>
            </div>
            <div class="job-company" style="font-size: 15px; color: #8a8a8a; font-weight: 500; display: flex; align-items: center; gap: 8px;">
              <span>${job.company}</span>
              ${job.location ? `
                <span style="opacity:0.3; font-weight: 300;">|</span>
                <span style="display: flex; align-items: center; gap: 4px;">
                  <span style="color: #ef4444; font-size: 14px;">📍</span>
                  <span>${job.location}</span>
                </span>
              ` : ""}
            </div>
          </div>
        </div>
        
        <div class="job-info" style="margin-top: 20px; gap: 12px; display: flex; flex-wrap: wrap; align-items: center;">
          ${job.salary ? `<div class="tag tag-salary">💰 ${job.salary}</div>` : ""}
          ${job.contactMethod ? `<div class="tag tag-contact">📞 ${job.contactMethod}</div>` : ""}
        </div>

        ${job.feedback ? `
          <div class="job-feedback" style="margin-top: 16px;">
            <span style="opacity: 0.4; font-style: normal; margin-right: 4px;">“</span>
            ${job.feedback}
            <span style="opacity: 0.4; font-style: normal; margin-left: 4px;">”</span>
          </div>
        ` : ""}

        <div class="job-divider" style="height: 1px; background: rgba(255, 255, 255, 0.08); margin: 20px 0;"></div>

        <div class="job-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="status-badge">${job.status}</div>
            ${job.platform ? `<span class="platform-tag">${job.platform}</span>` : ""}
          </div>
          
          <div style="display: flex; gap: 16px; align-items: center; opacity: 0.6;">
            ${job.jobUrl ? `
              <a href="${job.jobUrl}" target="_blank" style="color: white;" title="Open Link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            ` : ""}
            <div class="view-details-btn" data-key="${job.key}" style="cursor: pointer; color: white;" title="Edit Detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </div>
            <div class="delete-job-btn" data-key="${job.key}" style="cursor: pointer; color: white;" title="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
          </div>
        </div>
      `;
      container.appendChild(el);
    });

    // Events - Delegated or attached
    container.querySelectorAll(".view-details-btn").forEach(b => {
      b.addEventListener("click", (e) => {
        const key = e.currentTarget.dataset.key;
        openModal(key, allJobs[key]);
      });
    });

    container.querySelectorAll(".delete-job-btn").forEach(b => {
      b.addEventListener("click", async (e) => {
        alert("Delete functionality is currently disabled as it requires backend API implementation.");
      });
    });

  } catch (err) {
    console.error("Error in renderSavedJobs:", err);
  }
}

// -------------------------------------------------------------
// ACTIONS
// -------------------------------------------------------------
async function quickSave(job) {
  // Check authentication before saving
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    chrome.tabs.create({ url: 'http://localhost:3000/login' });
    return;
  }

  const key = `${job.platform}:${job.jobId}`;

  if (allJobs[key]) return; // Already saved

  allJobs[key] = {
    ...job,
    status: "applied",
    scrapedAt: new Date().toISOString(),
    notes: ""
  };

  const jobData = {
    ...job,
    status: "applied",
    scrapedAt: new Date().toISOString(),
    notes: ""
  };

  await saveJobToApi(jobData);
  renderCurrentJobCard(job); // updates button state
}

// MODAL HANDLING
function openModal(existingKey = null, prefillData = null) {
  currentEditingId = existingKey;
  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) modalTitle.textContent = existingKey ? "Edit Job" : "Add / Save Job";

  let data = {};

  if (existingKey) {
    data = allJobs[existingKey];
  } else if (prefillData) {
    data = prefillData;
  }

  editingMetadata = {
    jobId: data.jobId,
    platform: data.platform,
    id: data.id // Internal DB ID if it exists
  };

  // Fill inputs function to safely set values
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  };

  setVal("inpTitle", data.title);
  setVal("inpCompany", data.company);
  setVal("inpPlatform", data.platform || "other");
  setVal("inpLocation", data.location);
  setVal("inpSalary", data.salary);
  setVal("inpUrl", data.jobUrl || currentScrapedJob?.jobUrl || "");
  setVal("inpStatus", data.status || "applied");
  setVal("inpContactMethod", data.contactMethod);
  setVal("inpFeedback", data.feedback);
  setVal("inpNotes", data.notes);

  // Recruiter Fields
  setVal("inpHrName", data.hrName);
  setVal("inpHrEmail", data.hrEmail);
  setVal("inpHrPhone", data.hrPhone);

  const modal = document.getElementById("jobModal");
  if (modal) modal.classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("jobModal");
  if (modal) modal.classList.remove("active");
  currentEditingId = null;
}

async function saveJobFromModal() {
  // Check authentication before saving
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    chrome.tabs.create({ url: 'http://localhost:3000/login' });
    closeModal();
    return;
  }

  const inpTitle = document.getElementById("inpTitle");
  const inpCompany = document.getElementById("inpCompany");

  const title = inpTitle ? inpTitle.value.trim() : "";
  const company = inpCompany ? inpCompany.value.trim() : "";

  if (!title || !company) {
    alert("Title and Company are required.");
    return;
  }

  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "";
  };

  const formData = {
    title,
    company,
    platform: getVal("inpPlatform"),
    location: getVal("inpLocation"),
    salary: getVal("inpSalary"),
    jobUrl: getVal("inpUrl"),
    status: getVal("inpStatus"),
    notes: getVal("inpNotes"),
    contactMethod: getVal("inpContactMethod"),
    feedback: getVal("inpFeedback"),

    scrapedAt: new Date().toISOString(),
    // Include metadata
    jobId: editingMetadata?.jobId,
    platform: editingMetadata?.platform
  };

  const key = currentEditingId;

  // If editing an existing job, merging might be needed, but for now we just save the new data
  // For the API approach, we might want to handle PUT vs POST if key exists
  // But strictly per "save job" requirement, we'll try to just POST or strict update

  // Actually, handle create vs update based on key/id
  if (key && editingMetadata?.id) {
    await updateJobInApi(editingMetadata.id, formData);
  } else {
    await saveJobToApi(formData);
  }

  closeModal();

  // If we just saved the current job, update local state so the UI reflects the edits
  if (currentScrapedJob && (!key || key.includes(currentScrapedJob.jobId))) {
    // Merge new data into currentScrapedJob
    Object.assign(currentScrapedJob, formData);
    renderCurrentJobCard(currentScrapedJob);
  }
}

// EXPORT
function exportJobs() {
  const jobs = Object.values(allJobs);
  if (!jobs.length) return alert("Nothing to export.");

  const headers = ["Title", "Company", "Status", "Platform", "Location", "Salary", "URL", "Notes", "Date"];
  const rows = jobs.map(j => [
    `"${(j.title || "").replace(/"/g, '""')}"`,
    `"${(j.company || "").replace(/"/g, '""')}"`,
    j.status,
    j.platform,
    `"${(j.location || "").replace(/"/g, '""')}"`,
    `"${(j.salary || "").replace(/"/g, '""')}"`,
    j.jobUrl,
    `"${(j.notes || "").replace(/"/g, '""')}"`,
    j.scrapedAt
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jobs-${Date.now()}.csv`;
  a.click();
}

// Expose helper
window.scrollToSaved = (key) => {
  const el = document.getElementById(`job-${key}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    el.style.borderColor = "var(--primary)";
    setTimeout(() => el.style.borderColor = "var(--border)", 2000);
  }
};

// -------------------------------------------------------------
// AUTHENTICATION
// -------------------------------------------------------------
async function checkAuth() {
  const result = await chrome.storage.local.get('accessToken');
  return !!result.accessToken;
}

async function updateHeaderAuth() {
  const isAuthenticated = await checkAuth();
  const signInBtn = document.getElementById('signInBtn');
  const dashboardBtn = document.getElementById('dashboardBtn');

  if (signInBtn) {
    signInBtn.style.display = isAuthenticated ? 'none' : 'inline-flex';
  }

  if (dashboardBtn) {
    dashboardBtn.style.display = isAuthenticated ? 'inline-flex' : 'none';
  }
}

function renderAuthRequired() {
  const body = document.body;
  body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 550px;
      padding: 40px 20px;
      text-align: center;
      background: var(--bg);
    ">
      <div style="
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, var(--primary), #a855f7);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: white;
        margin-bottom: 24px;
        box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
      ">🔐</div>
      
      <h2 style="
        font-size: 24px;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 12px;
        letter-spacing: -0.02em;
      ">Sign In Required</h2>
      
      <p style="
        font-size: 14px;
        color: var(--text-muted);
        margin-bottom: 32px;
        line-height: 1.6;
        max-width: 320px;
      ">
        Please sign in to your JobTracker account to save and manage your job applications.
      </p>
      
      <button id="btnSignIn" class="btn btn-primary" style="
        font-size: 14px;
        padding: 14px 32px;
        height: auto;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      ">
        <svg viewBox="0 0 24 24" style="width: 18px; height: 18px;">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        Sign In to JobTracker
      </button>
    </div>
  `;

  const btnSignIn = document.getElementById('btnSignIn');
  if (btnSignIn) {
    btnSignIn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3000/login' });
    });
  }
}
