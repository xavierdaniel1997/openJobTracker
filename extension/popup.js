document.addEventListener("DOMContentLoaded", init);

// State
let allJobs = {};
let currentScrapedJob = null;
let currentEditingId = null; // jobKey

async function init() {
  const currentContainer = document.getElementById("currentJobContainer");
  const savedContainer = document.getElementById("savedJobsContainer");

  // Critical check
  if (!currentContainer || !savedContainer) {
    console.error("CRITICAL: DOM elements missing in init");
    return;
  }

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
}

// -------------------------------------------------------------
// DATA LAYER
// -------------------------------------------------------------
async function loadJobs() {
  const result = await chrome.storage.local.get("jobs");
  allJobs = result.jobs || {};
}

async function saveJobs(newJobs) {
  await chrome.storage.local.set({ jobs: newJobs });
  allJobs = newJobs;
  const searchInput = document.getElementById("searchInput");
  if (searchInput) renderSavedJobs(searchInput.value);
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
    <div class="job-card current-job-card">
      <div class="job-header">
        <div>
          <div class="job-title">${job.title || "Unknown Title"}</div>
          <div class="job-company">
            <span>${job.company || "Unknown Company"}</span>
          </div>
        </div>
      </div>
      
      <div class="job-info">
        ${job.location ? `<div class="tag">📍 ${job.location}</div>` : ""}
        ${job.salary ? `<div class="tag">💰 ${job.salary}</div>` : ""}
        ${job.platform ? `<div class="tag">🌐 ${job.platform}</div>` : ""}
        ${job.jobType ? `<div class="tag">⏰ ${job.jobType}</div>` : ""}
        ${job.hrName ? `<div class="tag" title="Recruiter Name">👤 ${job.hrName}</div>` : ""}
        ${job.hrEmail ? `<div class="tag" title="Recruiter Email">📧 ${job.hrEmail}</div>` : ""}
        ${job.hrPhone ? `<div class="tag" title="Recruiter Phone">📞 ${job.hrPhone}</div>` : ""}
      </div>

      <div class="job-actions">
        ${isSaved
      ? `<button class="btn btn-secondary scroll-saved-btn" data-key="${key}">
           <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
           Saved
         </button>`
      : `<button class="btn btn-primary" id="btnSaveCurrent">
           <svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
           Save
         </button>`
    }
        <button class="btn btn-outline" id="btnEditCurrent">
          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          Edit
        </button>
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
    jobsArray.sort((a, b) => new Date(b.scrapedAt) - new Date(a.scrapedAt));

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
      el.innerHTML = `
        <div class="job-header">
          <div>
            <div class="job-title">${job.title}</div>
            <div class="job-company">${job.company}</div>
          </div>
          <div class="status-badge status-${job.status}">${job.status}</div>
        </div>
        
        <div class="job-info">
          <div class="tag">📍 ${job.location || "N/A"}</div>
          <div class="tag">📅 ${new Date(job.scrapedAt).toLocaleDateString()}</div>
        </div>

        <div class="job-actions">
          <button class="btn btn-outline view-details-btn" data-key="${job.key}" title="Edit Details">
            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            Edit
          </button>
          
          <a href="${job.jobUrl}" target="_blank" class="btn btn-secondary btn-icon-only" title="Open Link">
            <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
          </a>
          
          <button class="btn btn-outline delete-job-btn btn-icon-only" data-key="${job.key}" title="Delete">
             <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
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
        const key = e.currentTarget.dataset.key;
        if (confirm("Remove this job?")) {
          delete allJobs[key];
          await saveJobs(allJobs);
          // Re-check current job validation
          if (currentScrapedJob) {
            const currentKey = `${currentScrapedJob.platform}:${currentScrapedJob.jobId}`;
            if (currentKey === key) detectAndScrape();
          }
        }
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
  const key = `${job.platform}:${job.jobId}`;

  if (allJobs[key]) return; // Already saved

  allJobs[key] = {
    ...job,
    status: "applied",
    scrapedAt: new Date().toISOString(),
    notes: ""
  };

  await saveJobs(allJobs);
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
    // Recruiter
    hrName: getVal("inpHrName"),
    hrEmail: getVal("inpHrEmail"),
    hrPhone: getVal("inpHrPhone"),

    scrapedAt: new Date().toISOString()
  };

  let key = currentEditingId;

  // New Job Key Generation
  if (!key) {
    const id = Date.now().toString();
    key = `${formData.platform}:${id}`;
  }

  if (currentScrapedJob && !currentEditingId && formData.title === currentScrapedJob.title) {
    key = `${currentScrapedJob.platform}:${currentScrapedJob.jobId}`;
  }

  allJobs[key] = {
    ...allJobs[key],
    ...formData
  };

  await saveJobs(allJobs);
  closeModal();

  // If we just saved the current job, update the card
  if (currentScrapedJob && key.includes(currentScrapedJob.jobId)) {
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
