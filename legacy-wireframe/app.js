/* ==========================================================================
 RAILWAY LETTER MANAGEMENT SYSTEM — APP LOGIC
 Handles Roles, Bilingual Forms, Local Storage database, and Access Rules.
 ========================================================================== */

// --- 1. System Users Registry ---
// --- 1. System Users Registry ---
const DEFAULT_SYSTEM_USERS = {
 admin: [
 { id: "admin", name: "System Admin", designation: "System Administrator", role: "admin", permissions: ["manage_users"] }
 ],
 head: [
 { id: "152", name: "Sudath", designation: "Head of Department", role: "head", permissions: ["view_all", "view_dashboard"] }
 ],
 officer: [
 { id: "151", name: "Priyangani", designation: "Department Officer", role: "officer", permissions: ["create_letter", "edit_letter", "view_all", "view_dashboard"] },
 { id: "135", name: "Gayanthi", designation: "Department Officer", role: "officer", permissions: ["create_letter", "edit_letter", "view_all", "view_dashboard"] },
 { id: "142", name: "Purnima", designation: "Department Officer", role: "officer", permissions: ["create_letter", "edit_letter", "view_all", "view_dashboard"] },
 { id: "141", name: "Dulani", designation: "Department Officer", role: "officer", permissions: ["create_letter", "edit_letter", "view_all", "view_dashboard"] },
 { id: "144", name: "Chathura", designation: "Department Officer", role: "officer", permissions: ["create_letter", "edit_letter", "view_all", "view_dashboard"] },
 { id: "143", name: "Erandi", designation: "Department Officer", role: "officer", permissions: ["create_letter", "edit_letter", "view_all", "view_dashboard"] },
 { id: "140", name: "Sandareka", designation: "Department Officer", role: "officer", permissions: ["create_letter", "edit_letter", "view_all", "view_dashboard"] },
 { id: "137", name: "Chathurika", designation: "Department Officer", role: "officer", permissions: ["create_letter", "edit_letter", "view_all", "view_dashboard"] },
 { id: "205", name: "Prabhamili", designation: "Department Officer", role: "officer", permissions: ["create_letter", "edit_letter", "view_all", "view_dashboard"] }
 ],
 secretary: [
 { id: "sec-admin", name: "Addl. Sec. (Administration)", designation: "Additional Secretary (Administration)", role: "secretary", permissions: ["view_assigned", "reply_letter"], category: "Additional Secretaries (Administration)" },
 { id: "sec-dev", name: "Addl. Sec. (Development)", designation: "Additional Secretary (Development)", role: "secretary", permissions: ["view_assigned", "reply_letter"], category: "Additional Secretaries (Development)" },
 { id: "sec-eng", name: "Addl. Sec. (Engineering)", designation: "Additional Secretary (Engineering)", role: "secretary", permissions: ["view_assigned", "reply_letter"], category: "Additional Secretaries (Engineering)" },
 { id: "sec-slacs", name: "Addl. Sec. (SLAcS - Special)", designation: "Additional Secretary (SLAcS - Special)", role: "secretary", permissions: ["view_assigned", "reply_letter"], category: "Additional Secretaries (SLAcS - Special)" },
 { id: "sec-slps", name: "Addl. Sec. (SLPS - Special)", designation: "Additional Secretary (SLPS - Special)", role: "secretary", permissions: ["view_assigned", "reply_letter"], category: "Additional Secretaries (SLPS - Special)" },
 { id: "sec-special", name: "Addl. Sec. (Special Projects)", designation: "Additional Secretary (Special Projects)", role: "secretary", permissions: ["view_assigned", "reply_letter"], category: "Additional Secretaries (Special Projects)" }
 ]
};

let SYSTEM_USERS = {
 admin: [...DEFAULT_SYSTEM_USERS.admin],
 head: [...DEFAULT_SYSTEM_USERS.head],
 officer: [...DEFAULT_SYSTEM_USERS.officer],
 secretary: [...DEFAULT_SYSTEM_USERS.secretary]
};

function loadUsersFromStorage() {
 const storedUsers = localStorage.getItem("railway_custom_users");
 
 // Reset registry
 SYSTEM_USERS.admin = [...DEFAULT_SYSTEM_USERS.admin];
 SYSTEM_USERS.head = [...DEFAULT_SYSTEM_USERS.head];
 SYSTEM_USERS.officer = [...DEFAULT_SYSTEM_USERS.officer];
 SYSTEM_USERS.secretary = [...DEFAULT_SYSTEM_USERS.secretary];
 
 if (storedUsers) {
 try {
 const custom = JSON.parse(storedUsers);
 custom.forEach(user => {
 if (SYSTEM_USERS[user.role]) {
 const exists = SYSTEM_USERS[user.role].some(u => u.id === user.id);
 if (!exists) {
 SYSTEM_USERS[user.role].push(user);
 }
 }
 });
 } catch (e) {
 console.error("Error loading custom users:", e);
 }
 }
}

// --- Routing/CC Targets List ---
const ROUTING_CHANNELS = [
  "GRM",
  "PSC",
  "PUBAD",
  "Pension Department",
  "DMS",
  "Additional Directors",
  "Additional Secretaries (Administration)",
  "Additional Secretaries (Development)",
  "Additional Secretaries (Engineering)",
  "Additional Secretaries (SLAcS - Special)",
  "Additional Secretaries (SLPS - Special)",
  "Additional Secretaries (Special Projects)",
  "Other"
];

// --- 2. Initial Sample Database ---
const DEFAULT_LETTERS = [
 {
 id: "RLY-001",
 dateReceived: "2026-06-20",
 referringOrg: "Pension Department",
 letterNumDate: "PEN/2026/SEC-99 - 2026-06-18",
 subject: "Implementation of Revised Pension Benefits for Retired Drivers",
 fileNumber: "SF/RLY/PENS/04",
 actionTaken: "Reviewed at administrative desk. Sent to General Manager for directives.",
 signatureDropdown: "Instructions Forwarded",
 submittedTo: "Additional Director (Admin)",
 dateForwarded: "2026-06-21",
 dateFileReceived: "2026-06-21",
 dateSigned: "2026-06-18",
 dateMailed: "",
 sendTo: ["Pension Department", "Additional Secretaries (Administration)"],
 sendCopies: ["GRM", "DMS"],
 stage: "Completed",
 reminderDate: "2026-07-01",
 pdfName: "pension_drivers_signed.pdf",
 createdBy: "Priyangani (151)",
 replies: [
 { sender: "Addl. Sec. (Administration)", designation: "Additional Secretary (Administration)", text: "Directives received. Please request the ledger sheets from the Pension Desk immediately.", date: "2026-06-22" }
 ],
 logs: [
 { user: "Priyangani (151)", action: "Created & Completed Letter Entry", date: "2026-06-20", timestamp: "2026-06-20T09:15:30" }
 ]
 },
 {
 id: "RLY-002",
 dateReceived: "2026-06-23",
 referringOrg: "Ministry of Transport",
 letterNumDate: "MOT/RLY/DEV/88",
 subject: "Proposals for Colombo-Kandy Double Line Special Railway Project Funding",
 fileNumber: "SF/RLY/DEV/88.02",
 actionTaken: "Pending review. Awaiting engineering cost plans.",
 signatureDropdown: "Pending Approval",
 submittedTo: "Head of Department (Sudath)",
 dateForwarded: "",
 dateFileReceived: "",
 dateSigned: "",
 dateMailed: "",
 sendTo: ["Additional Secretaries (Development)", "Additional Secretaries (Engineering)"],
 sendCopies: ["Other"],
 stage: "Draft",
 reminderDate: "",
 pdfName: "kandy_project_draft.pdf",
 createdBy: "Chathura (144)",
 replies: [],
 logs: [
 { user: "Chathura (144)", action: "Saved Initial Draft Entry", date: "2026-06-23", timestamp: "2026-06-23T07:45:10" }
 ]
 },
 {
 id: "RLY-003",
 dateReceived: "2026-06-24",
 referringOrg: "Public Administration Department",
 letterNumDate: "PUB/RLY/2026/05",
 subject: "Approval for SLAcS Grade Officers Postings and Special Audits",
 fileNumber: "SF/RLY/AUD/12",
 actionTaken: "Sent documents to the Special Project Board.",
 signatureDropdown: "Approved & Signed",
 submittedTo: "Addl. Secretary (SLAcS)",
 dateForwarded: "2026-06-24",
 dateFileReceived: "2026-06-24",
 dateSigned: "2026-06-23",
 dateMailed: "2026-06-24",
 sendTo: ["Additional Secretaries (SLAcS - Special)", "PSC"],
 sendCopies: ["PUBAD"],
 stage: "Completed",
 reminderDate: "2026-06-30",
 pdfName: "slacs_postings_approved.pdf",
 createdBy: "Gayanthi (135)",
 replies: [],
 logs: [
 { user: "Gayanthi (135)", action: "Created & Completed Letter Entry", date: "2026-06-24", timestamp: "2026-06-24T18:20:00" }
 ]
 },
 {
 id: "RLY-004",
 dateReceived: "2026-06-21",
 referringOrg: "Department of National Planning",
 letterNumDate: "NP/RLY/PLAN/12",
 subject: "Development Budget Allocation for Coastal Line Tracks Restoration",
 fileNumber: "SF/RLY/DEV/PLAN.01",
 actionTaken: "Forwarded plan to engineering department.",
 signatureDropdown: "Instructions Forwarded",
 submittedTo: "Addl. Secretary (Engineering)",
 dateForwarded: "2026-06-21",
 dateFileReceived: "2026-06-21",
 dateSigned: "2026-06-20",
 dateMailed: "",
 sendTo: ["Additional Secretaries (Engineering)"],
 sendCopies: ["Other"],
 stage: "Completed",
 reminderDate: "2026-06-23",
 pdfName: "coastal_restoration_signed.pdf",
 createdBy: "Purnima (142)",
 replies: [],
 logs: [
 { user: "Purnima (142)", action: "Created & Completed Letter Entry", date: "2026-06-21", timestamp: "2026-06-21T10:30:00" }
 ]
 },
 {
 id: "RLY-005",
 dateReceived: "2026-06-22",
 referringOrg: "State Railway Corporation",
 letterNumDate: "SRC/RLY/TRAIN/44",
 subject: "Technical Specifications for New Train Compartments Procurement",
 fileNumber: "SF/RLY/ENG/COMP",
 actionTaken: "Draft specifications prepared. Awaiting final inspection.",
 signatureDropdown: "Pending Approval",
 submittedTo: "Addl. Secretary (Engineering)",
 dateForwarded: "",
 dateFileReceived: "",
 dateSigned: "",
 dateMailed: "",
 sendTo: ["Additional Secretaries (Engineering)"],
 sendCopies: ["Other"],
 stage: "Draft",
 reminderDate: "2026-06-30",
 pdfName: "compartments_specs_draft.pdf",
 createdBy: "Dulani (141)",
 replies: [],
 logs: [
 { user: "Dulani (141)", action: "Saved Initial Draft Entry", date: "2026-06-22", timestamp: "2026-06-22T14:15:00" }
 ]
 },
 {
 id: "RLY-006",
 dateReceived: "2026-06-19",
 referringOrg: "SLPS Association",
 letterNumDate: "SLPS/RLY/OFF/05",
 subject: "Grade Promotion Ledger Check for Station Masters Group",
 fileNumber: "SF/RLY/SLPS/08",
 actionTaken: "Verified and signed off.",
 signatureDropdown: "Approved & Signed",
 submittedTo: "Addl. Secretary (SLPS)",
 dateForwarded: "2026-06-19",
 dateFileReceived: "2026-06-19",
 dateSigned: "2026-06-19",
 dateMailed: "2026-06-19",
 sendTo: ["Additional Secretaries (SLPS - Special)"],
 sendCopies: [],
 stage: "Completed",
 reminderDate: "",
 pdfName: "slps_promotion_signed.pdf",
 createdBy: "Erandi (143)",
 replies: [],
 logs: [
 { user: "Erandi (143)", action: "Created & Completed Letter Entry", date: "2026-06-19", timestamp: "2026-06-19T08:05:00" }
 ]
 },
 {
 id: "RLY-007",
 dateReceived: "2026-06-24",
 referringOrg: "Treasury Department",
 letterNumDate: "TRY/RLY/FIN/2026",
 subject: "Treasury Allocations and Financial Letters Clearance",
 fileNumber: "SF/RLY/FIN/TRES",
 actionTaken: "Forwarded details to head auditor.",
 signatureDropdown: "Approved & Signed",
 submittedTo: "Addl. Secretary (Special Projects)",
 dateForwarded: "2026-06-24",
 dateFileReceived: "2026-06-24",
 dateSigned: "2026-06-24",
 dateMailed: "2026-06-24",
 sendTo: ["Additional Secretaries (Special Projects)"],
 sendCopies: [],
 stage: "Completed",
 reminderDate: "",
 pdfName: "treasury_clearance_signed.pdf",
 createdBy: "Sandareka (140)",
 replies: [],
 logs: [
 { user: "Sandareka (140)", action: "Created & Completed Letter Entry", date: "2026-06-24", timestamp: "2026-06-24T17:15:00" }
 ]
 },
 {
 id: "RLY-008",
 dateReceived: "2026-06-23",
 referringOrg: "General Manager Office",
 letterNumDate: "GMO/RLY/GEN/12",
 subject: "Circular for General Operations & Office Holiday Working Schedule",
 fileNumber: "SF/RLY/GEN/CIRC",
 actionTaken: "Completed ledger logging. Circular distributed.",
 signatureDropdown: "Approved & Signed",
 submittedTo: "Additional Director (Admin)",
 dateForwarded: "2026-06-23",
 dateFileReceived: "2026-06-23",
 dateSigned: "2026-06-23",
 dateMailed: "2026-06-23",
 sendTo: ["Additional Secretaries (Administration)"],
 sendCopies: ["GRM"],
 stage: "Completed",
 reminderDate: "2026-06-28",
 pdfName: "circular_operations_signed.pdf",
 createdBy: "Chathurika (137)",
 replies: [],
 logs: [
 { user: "Chathurika (137)", action: "Created & Completed Letter Entry", date: "2026-06-23", timestamp: "2026-06-23T11:45:00" }
 ]
 },
 {
 id: "RLY-009",
 dateReceived: "2026-06-24",
 referringOrg: "Special Task Force",
 letterNumDate: "STF/RLY/SEC/09",
 subject: "Security Clearance Reports for Central Railway Stations Network",
 fileNumber: "SF/RLY/SEC/STF",
 actionTaken: "Draft safety requirements prepared. Pending feedback.",
 signatureDropdown: "Pending Approval",
 submittedTo: "Head of Department (Sudath)",
 dateForwarded: "",
 dateFileReceived: "",
 dateSigned: "",
 dateMailed: "",
 sendTo: ["Additional Secretaries (Special Projects)"],
 sendCopies: ["Other"],
 stage: "Draft",
 reminderDate: "",
 pdfName: "",
 createdBy: "Prabhamili (205)",
 replies: [],
 logs: [
 { user: "Prabhamili (205)", action: "Saved Initial Draft Entry", date: "2026-06-24", timestamp: "2026-06-24T06:30:00" }
 ]
 },
 {
 id: "RLY-010",
 dateReceived: "2026-06-22",
 referringOrg: "Administration Desk",
 letterNumDate: "ADM/RLY/STF/88",
 subject: "Recruitment Ledger Approval for Grade III Railway Clerks",
 fileNumber: "SF/RLY/ADM/CLERK",
 actionTaken: "Signed and mailed back.",
 signatureDropdown: "Approved & Signed",
 submittedTo: "Additional Director (Admin)",
 dateForwarded: "2026-06-22",
 dateFileReceived: "2026-06-22",
 dateSigned: "2026-06-22",
 dateMailed: "2026-06-22",
 sendTo: ["Additional Secretaries (Administration)"],
 sendCopies: [],
 stage: "Completed",
 reminderDate: "",
 pdfName: "clerk_recruitment_signed.pdf",
 createdBy: "Priyangani (151)",
 replies: [],
 logs: [
 { user: "Priyangani (151)", action: "Created & Completed Letter Entry", date: "2026-06-22", timestamp: "2026-06-22T15:00:00" }
 ]
 }
];

// --- 3. App State Variables ---
let currentGroup = "officer"; // Active group selected in login screen tabs
let currentUser = null; // Active logged-in user object
let lettersDatabase = []; // Array of letters
let selectedSendTo = []; // Temp storage for pills in Add Form
let selectedCcTo = []; // Temp storage for pills in Add Form
let activeAttachedPdf = ""; // Simulated attached PDF filename
let activeReplyPdf = ""; // Simulated attached PDF filename for reply modal

// New tracking and language settings
let currentLang = localStorage.getItem("rlms_lang") || "en";
let selectedTrackingUser = null;
let selectedTrackingPeriod = "weekly";
let selectedStatusPeriod = "daily";

// --- Translation: see i18n.js (LANG_DATA, t(), applyLanguage) ---

function getLocalDateTimeISO() {
 const now = new Date();
 const tzOffset = now.getTimezoneOffset() * 60000;
 return new Date(now.getTime() - tzOffset).toISOString().slice(0, 19);
}

function setLanguageSystem(lang) {
 currentLang = lang;
 localStorage.setItem("rlms_lang", lang);

 document.body.classList.remove("lang-en", "lang-si");
 document.body.classList.add("lang-" + lang);

 const btnEn = document.getElementById("lang-btn-en");
 const btnSi = document.getElementById("lang-btn-si");
 if (btnEn && btnSi) {
 btnEn.classList.toggle("active", lang === "en");
 btnSi.classList.toggle("active", lang === "si");
 }

 if (currentUser) {
 const activePage = document.querySelector(".app-page.active");
 if (activePage) {
 const pageId = activePage.id.replace("page-", "");
 navigateToPage(pageId);
 return;
 }
 }
 applyLanguage();
}

// --- 4. Initialization ---
document.addEventListener("DOMContentLoaded", () => {
 initAppDatabase();
 populateLoginSelectors();
 updateSimulatedPassword();
 renderFormPills();
 renderSubmittedByDropdown();
 renderAiSubmittedByDropdown();
 
 // Initialize language preference
 setLanguageSystem(currentLang);

 // Set up live clock
 setInterval(updateLiveClock, 1000);
 updateLiveClock();
});

// Initialize database from local storage if exists, else load defaults
function initAppDatabase() {
  loadUsersFromStorage();
  const stored = localStorage.getItem("railway_letters");
  if (stored) {
    try {
      lettersDatabase = JSON.parse(stored);
    } catch(e) {
      console.error("Error reading stored letters, using defaults", e);
      lettersDatabase = [...DEFAULT_LETTERS];
      saveToStorage();
    }
  } else {
    lettersDatabase = [...DEFAULT_LETTERS];
    saveToStorage();
  }

  // Migrate letters to support reminder history and No Action Taken history
  if (lettersDatabase) {
    lettersDatabase.forEach(letter => {
      if (!letter.reminders) {
        letter.reminders = [];
        if (letter.reminderDate) {
          letter.reminders.push({
            number: "1st",
            date: letter.reminderDate,
            addedBy: "System",
            notes: "Initial reminder set during registration."
          });
        }
      }
      if (!letter.noActionHistory) {
        letter.noActionHistory = [];
      }
    });
  }
}

function saveToStorage() {
 localStorage.setItem("railway_letters", JSON.stringify(lettersDatabase));
}

// Update clock in the topbar
function updateLiveClock() {
 const clockNode = document.getElementById("live-clock");
 if (clockNode) {
 const now = new Date();
 clockNode.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " — " + now.toLocaleDateString();
 }
}

// --- 5. Login Flow Logic (Part 0) ---

// Populates user lists into dropdown selectors on login card
function populateLoginSelectors() {
 const offSelect = document.getElementById("user-select-officer");
 const headSelect = document.getElementById("user-select-head");
 const secSelect = document.getElementById("user-select-secretary");
 const adminSelect = document.getElementById("user-select-admin");

 if (offSelect) offSelect.innerHTML = SYSTEM_USERS.officer.map(u => `<option value="${u.id}">${u.id} — ${u.name} (Officer)</option>`).join("");
 if (headSelect) headSelect.innerHTML = SYSTEM_USERS.head.map(u => `<option value="${u.id}">${u.id} — ${u.name} (Head)</option>`).join("");
 if (secSelect) secSelect.innerHTML = SYSTEM_USERS.secretary.map(u => `<option value="${u.id}">${u.name}</option>`).join("");
 if (adminSelect) adminSelect.innerHTML = SYSTEM_USERS.admin.map(u => `<option value="${u.id}">${u.id} — ${u.name} (Admin)</option>`).join("");
}

// Switches visible user selector based on tabs
function switchLoginGroup(group) {
 currentGroup = group;
 
 // Update tab buttons style
 const tabs = document.querySelectorAll(".role-tab");
 tabs.forEach(t => t.classList.remove("active"));
 
 const activeTab = document.getElementById(`tab-login-${group}`);
 if (activeTab) activeTab.classList.add("active");

 // Show corresponding selection container
 if (document.getElementById("group-select-officer")) document.getElementById("group-select-officer").classList.remove("active");
 if (document.getElementById("group-select-head")) document.getElementById("group-select-head").classList.remove("active");
 if (document.getElementById("group-select-secretary")) document.getElementById("group-select-secretary").classList.remove("active");
 if (document.getElementById("group-select-admin")) document.getElementById("group-select-admin").classList.remove("active");

 const container = document.getElementById(`group-select-${group}`);
 if (container) container.classList.add("active");
 updateSimulatedPassword();
}

// Simulated password filler
function updateSimulatedPassword() {
 const passField = document.getElementById("password-input");
 let selectedId = getActiveSelectedUserId();
 passField.value = `pass_${selectedId}`;
}

// Gets selected userId from currently active tab
function getActiveSelectedUserId() {
 if (currentGroup === "officer") {
 return document.getElementById("user-select-officer").value;
 } else if (currentGroup === "head") {
 return document.getElementById("user-select-head").value;
 } else if (currentGroup === "admin") {
 return document.getElementById("user-select-admin").value;
 } else {
 return document.getElementById("user-select-secretary").value;
 }
}

// Authenticates simulated login
function handleLogin() {
 const userId = getActiveSelectedUserId();
 let foundUser = null;
 
 // Find user object
 for (let grp in SYSTEM_USERS) {
 let match = SYSTEM_USERS[grp].find(u => u.id === userId);
 if (match) {
 foundUser = match;
 break;
 }
 }

 if (foundUser) {
 currentUser = foundUser;
 
 // Switch screens
 document.getElementById("login-screen").classList.remove("active");
 document.getElementById("app-screen").classList.add("active");
 
 // Populate header & sidebar profile
 document.getElementById("user-avatar").textContent = currentUser.name[0];
 document.getElementById("user-display-name").textContent = currentUser.name;
 document.getElementById("user-display-role").textContent = designationLabel(currentUser.role) || currentUser.designation;
 
 // Set Access level badge in sidebar
 const accessBadge = document.getElementById("user-display-access");
 accessBadge.removeAttribute("style");
 if (currentUser.role === 'head') {
 accessBadge.textContent = t("access_view_all");
 accessBadge.className = "user-access-pill badge-head";
 } else if (currentUser.role === 'officer') {
 if (currentUser.permissions.includes("edit_letter")) {
 accessBadge.textContent = t("access_create_edit");
 accessBadge.className = "user-access-pill badge-officer";
 } else {
 accessBadge.textContent = t("access_view_only");
 accessBadge.className = "user-access-pill badge-officer";
 }
 } else if (currentUser.role === 'admin') {
 accessBadge.textContent = t("access_admin");
 accessBadge.className = "user-access-pill badge-admin";
 } else {
 accessBadge.textContent = t("access_division");
 accessBadge.className = "user-access-pill badge-secretary";
 }

 // Set Welcome User Banner
 document.getElementById("welcome-username").textContent = currentUser.name;

 // Show/Hide sidebar buttons based on role
 const isSec = currentUser.role === 'secretary';
 const isAdmin = currentUser.role === 'admin';
 
 document.getElementById("nav-dashboard").style.display = (isSec || isAdmin) ? "none" : "flex";
 document.getElementById("nav-add-letter").style.display = (!isSec && !isAdmin && currentUser.permissions.includes("create_letter")) ? "flex" : "none";
 document.getElementById("nav-ai-letter").style.display = (!isSec && !isAdmin && currentUser.permissions.includes("create_letter")) ? "flex" : "none";
 document.getElementById("nav-ledger").style.display = (isSec || isAdmin) ? "none" : "flex";
 document.getElementById("nav-all-letters").style.display = (isSec || isAdmin) ? "none" : "flex";
 document.getElementById("nav-reminders").style.display = (isSec || isAdmin) ? "none" : "flex";
 document.getElementById("nav-secretary-inbox").style.display = isSec ? "flex" : "none";
 document.getElementById("nav-user-tracking").style.display = (isSec || isAdmin) ? "none" : "flex";
 document.getElementById("nav-history").style.display = (isSec || isAdmin) ? "none" : "flex";
 
 const navReg = document.getElementById("nav-user-registration");
 if (navReg) navReg.style.display = isAdmin ? "flex" : "none";

 // Set Welcome User Banner
 const welcomeUser = document.getElementById("welcome-username");
 if (welcomeUser) welcomeUser.textContent = currentUser.name;

 // Load initial views
 if (isSec) {
 navigateToPage("secretary-inbox");
 } else if (isAdmin) {
 navigateToPage("user-registration");
 } else {
 navigateToPage("dashboard");
 }
 updateReminderBadge();
 showToast(t("signed_in_as") + " " + currentUser.name + " (" + (designationLabel(currentUser.role) || currentUser.designation) + ")");
 console.log("Logged in successfully. User Workspace recommendation active.");
 }
}

// Log out procedure
function handleLogout() {
 currentUser = null;
 document.getElementById("app-screen").classList.remove("active");
 document.getElementById("login-screen").classList.add("active");
}

// --- 6. Navigation Control ---
function navigateToPage(pageId) {
 // Update sidebar active state
 const menuButtons = document.querySelectorAll(".sidebar-menu .menu-item");
 menuButtons.forEach(btn => btn.classList.remove("active"));
 
 const activeBtn = document.getElementById(`nav-${pageId}`);
 if (activeBtn) activeBtn.classList.add("active");

 // Show correct page
 const pages = document.querySelectorAll(".app-page");
 pages.forEach(p => p.classList.remove("active"));

 document.getElementById(`page-${pageId}`).classList.add("active");

 // Update Breadcrumb
 const breadcrumbCurrent = document.getElementById("breadcrumb-current");
 if (breadcrumbCurrent) {
 const key = `menu_${pageId.replace(/-/g, "_")}`;
 if (LANG_DATA[currentLang] && LANG_DATA[currentLang][key]) {
 breadcrumbCurrent.textContent = LANG_DATA[currentLang][key];
 } else {
 let cleanName = pageId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
 breadcrumbCurrent.textContent = cleanName;
 }
 }

 // Perform view renders
 if (pageId === "dashboard") {
 renderDashboardStats();
  } else if (pageId === "add-letter") {
  if (!document.getElementById("edit-letter-id").value) {
  clearActiveForm();
  }
  } else if (pageId === "ai-letter") {
  clearAiForm();
 } else if (pageId === "ledger") {
  populateLedgerTable();
  populateLedgerFilters();
 } else if (pageId === "all-letters") {
 renderAllLetters();
 } else if (pageId === "reminders") {
 renderReminderPage();
 } else if (pageId === "user-registration") {
 renderRegisteredUsersDirectory();
 } else if (pageId === "user-tracking") {
 if (!selectedTrackingUser) {
 selectedTrackingUser = SYSTEM_USERS.officer[0].id;
 }
 renderUserTracking(selectedTrackingUser);
 } else if (pageId === "history") {
 renderHistoryLog();
 } else if (pageId === "secretary-inbox") {
 renderSecretaryInbox();
 } else if (pageId === "letter-export") {
 renderLetterExportPage();
 }
 applyLanguage();
}

// --- 7. Form Multi-Select Pill Layout System (Part 1 Form) ---

function renderFormPills() {
 const sendToContainer = document.getElementById("send-to-pills-container");
 const ccContainer = document.getElementById("send-copies-pills-container");
 
 if (sendToContainer) {
   sendToContainer.innerHTML = ROUTING_CHANNELS.map(ch => {
     return `<div class="pill-item" data-val="${ch}" onclick="togglePillSelect(this, 'sendTo')">${ch}</div>`;
   }).join("");
 }

 if (ccContainer) {
   ccContainer.innerHTML = ROUTING_CHANNELS.map(ch => {
     return `<div class="pill-item" data-val="${ch}" onclick="togglePillSelect(this, 'cc')">${ch}</div>`;
   }).join("");
 }
}

// Toggles active state of pills
function togglePillSelect(element, fieldType) {
 // If view-only, disable pill clicks
 if (currentUser && !currentUser.permissions.includes("create_letter")) {
 return;
 }

 const isSelected = element.classList.toggle("selected");
 const val = element.getAttribute("data-val");

 if (fieldType === 'sendTo') {
 if (isSelected) {
 selectedSendTo.push(val);
 } else {
 selectedSendTo = selectedSendTo.filter(v => v !== val);
 }
 document.getElementById("field-send-to-values").value = selectedSendTo.join(",");
 } else {
 if (isSelected) {
 selectedCcTo.push(val);
 } else {
 selectedCcTo = selectedCcTo.filter(v => v !== val);
 }
 document.getElementById("field-send-copies-values").value = selectedCcTo.join(",");
 }
}

// Updates pills interface based on values loaded from drafts/editing
function syncPillInterface() {
 // Sync Send To pills
 const sendToPills = document.querySelectorAll("#send-to-pills-container .pill-item");
 sendToPills.forEach(pill => {
 const val = pill.getAttribute("data-val");
 if (selectedSendTo.includes(val)) {
 pill.classList.add("selected");
 } else {
 pill.classList.remove("selected");
 }
 });

 // Sync Copies pills
 const ccPills = document.querySelectorAll("#send-copies-pills-container .pill-item");
 ccPills.forEach(pill => {
 const val = pill.getAttribute("data-val");
 if (selectedCcTo.includes(val)) {
 pill.classList.add("selected");
 } else {
 pill.classList.remove("selected");
 }
 });
}

// Sets Stage Selector Toggle State
function setFormStage(stageValue) {
 // If view-only, disable toggle
 if (currentUser && !currentUser.permissions.includes("create_letter")) {
 return;
 }

 document.getElementById("field-stage-value").value = stageValue;
 
 const draftBtn = document.getElementById("stage-btn-draft");
 const completedBtn = document.getElementById("stage-btn-completed");

 if (stageValue === 'Draft') {
 draftBtn.classList.add("active");
 completedBtn.classList.remove("active");
 } else {
 draftBtn.classList.remove("active");
 completedBtn.classList.add("active");
 }
}

// Simulated PDF uploader logic
function simulatePdfUpload(input) {
 if (input.files && input.files[0]) {
 const file = input.files[0];
 
 // Hide info block, show progress
 document.getElementById("uploader-info-node").style.display = "none";
 const progWrap = document.getElementById("upload-progress-bar-wrap");
 const progFill = document.getElementById("upload-progress-fill");
 const progText = document.getElementById("upload-progress-text");
 
 progWrap.style.display = "block";
 progFill.style.width = "0%";
 progFill.textContent = "0%";
 
 let progress = 0;
 const interval = setInterval(() => {
 progress += 10;
 progFill.style.width = `${progress}%`;
 progFill.textContent = `${progress}%`;
 
 if (progress >= 100) {
 clearInterval(interval);
 
 // Complete upload simulation
 activeAttachedPdf = file.name;
 progWrap.style.display = "none";
 
 const attachedBadge = document.getElementById("attached-pdf-badge");
 document.getElementById("attached-pdf-name").textContent = file.name;
 attachedBadge.style.display = "inline-flex";
 showToast("PDF upload complete & attached to form");
 }
 }, 150);
 }
}

// Clears attached PDF
function clearAttachedPdf() {
 activeAttachedPdf = "";
 document.getElementById("attached-pdf-badge").style.display = "none";
 document.getElementById("uploader-info-node").style.display = "flex";
 document.getElementById("field-pdf-upload").value = "";
}

function setSelectValueWithFallback(selectId, value) {
 const select = document.getElementById(selectId);
 if (!select) return;
 if (!value) {
 select.value = "";
 return;
 }

 const hasOption = Array.from(select.options).some(option => option.value === value);
 if (!hasOption) {
 const option = document.createElement("option");
 option.value = value;
 option.textContent = value;
 select.appendChild(option);
 }
 select.value = value;
}

// --- 8. Save / Update Letters Ledger Logic (Bilingual Partial Save Support) ---

function clearActiveForm() {
 // Clear HTML form inputs
 document.getElementById("edit-letter-id").value = "";
 document.getElementById("field-date-received").value = "";
 document.getElementById("field-referring-org").value = "";
 document.getElementById("field-letter-num-date").value = "";
 document.getElementById("field-subject").value = "";
 document.getElementById("field-file-number").value = "";
 document.getElementById("field-action-taken").value = "";
 document.getElementById("field-signature-dropdown").value = "";
 document.getElementById("field-submitted-to").value = "";
 document.getElementById("field-date-forwarded").value = "";
 document.getElementById("field-date-file-received").value = "";
 document.getElementById("field-date-signed").value = "";
 document.getElementById("field-date-mailed").value = "";
 document.getElementById("field-reminder-date").value = "";
 
 // Clear other name field
 const otherNameInput = document.getElementById("field-other-name");
 if (otherNameInput) otherNameInput.value = "";
 const otherContainer = document.getElementById("other-name-container");
 if (otherContainer) otherContainer.style.display = "none";

 // Clear pills selections
 selectedSendTo = [];
 selectedCcTo = [];
 document.getElementById("field-send-to-values").value = "";
 document.getElementById("field-send-copies-values").value = "";
 syncSubmittedByDropdown();

 // Reset stage to Draft
 setFormStage("Draft");
 
 // Clear PDF upload
 clearAttachedPdf();

 // Reset titles
 document.getElementById("form-edit-status-badge").textContent = t("form_new_entry");
 if (typeof updateFormTitles === "function") updateFormTitles();

 // Re-enable form fields if they were disabled previously
 enableFormFields(true);
}

function enableFormFields(enable) {
 const fields = [
 "field-date-received", "field-referring-org", "field-letter-num-date",
 "field-subject", "field-file-number", "field-action-taken",
 "field-signature-dropdown", "field-submitted-to", "field-date-forwarded",
 "field-date-file-received", "field-date-signed", "field-date-mailed",
 "field-reminder-date", "field-pdf-upload"
 ];

 fields.forEach(id => {
 const node = document.getElementById(id);
 if (node) node.disabled = !enable;
 });

 const saveDraftBtn = document.getElementById("btn-save-draft");
 const saveFullBtn = document.getElementById("btn-save-full");
 if (saveDraftBtn) saveDraftBtn.style.display = enable ? "inline-flex" : "none";
 if (saveFullBtn) saveFullBtn.style.display = enable ? "inline-flex" : "none";
}

// Saves letter as Draft or Completed
function saveLetterData(isDraftSave = true) {
 // Access check
 if (currentUser && !currentUser.permissions.includes("create_letter")) {
 showToast(currentLang === 'si' ? "අවසර නැත: ලිපි ලියාපදිංචි කළ හැක්කේ දෙපාර්තමේන්තු නිලධාරීන්ට පමණි." : "Permission Denied: Only Department Officers can register entries.");
 return;
 }

 // Gather Form Variables
 const editId = document.getElementById("edit-letter-id").value;
 const dateReceived = document.getElementById("field-date-received").value;
 const referringOrg = document.getElementById("field-referring-org").value;
 const letterNumDate = document.getElementById("field-letter-num-date").value;
 const subject = document.getElementById("field-subject").value;
 const fileNumber = document.getElementById("field-file-number").value;
 const actionTaken = document.getElementById("field-action-taken").value;
 const signatureDropdown = document.getElementById("field-signature-dropdown").value;
 const submittedTo = document.getElementById("field-submitted-to").value;
 const dateForwarded = document.getElementById("field-date-forwarded").value;
 const dateFileReceived = document.getElementById("field-date-file-received").value;
 const dateSigned = document.getElementById("field-date-signed").value;
 const dateMailed = document.getElementById("field-date-mailed").value;
 const reminderDate = document.getElementById("field-reminder-date").value;

 const stage = isDraftSave ? "Draft" : "Completed";

 // VALIDATION:
 // If it's a COMPLETED submission, we require core fields
 if (!isDraftSave) {
 if (!dateReceived || !referringOrg || !letterNumDate || !subject) {
 showToast("Mandatory fields missing! Date Received, Organization, Ref Number, and Subject are required.");
 return;
 }
 } else {
 // For partial draft save, we only require at least the Subject or Referring Org to give it an identity
 if (!subject && !referringOrg && !letterNumDate) {
 showToast("Provide at least Subject, Sender, or Letter Reference to save draft.");
 return;
 }
 }

 // Validate "Other" custom name field
 const hasOther = selectedSendTo.includes("Other") || selectedCcTo.includes("Other");
 const otherName = document.getElementById("field-other-name") ? document.getElementById("field-other-name").value.trim() : "";
 if (hasOther && !otherName) {
   showToast("Please enter the department or user name for 'Other' option.");
   const otherInput = document.getElementById("field-other-name");
   if (otherInput) otherInput.focus();
   return;
 }

 // Map "Other" to the custom value for database storage
 const finalSendTo = selectedSendTo.map(val => val === "Other" ? otherName : val);
 const finalCcTo = selectedCcTo.map(val => val === "Other" ? otherName : val);

 const timestamp = getLocalDateTimeISO();
 const userSign = `${currentUser.name} (${currentUser.id})`;

 if (editId) {
 // EDIT MODE — Update existing letter in database
 const letterIdx = lettersDatabase.findIndex(l => l.id === editId);
 if (letterIdx !== -1) {
 let existingLetter = lettersDatabase[letterIdx];
 
 // Update fields
 existingLetter.dateReceived = dateReceived;
 existingLetter.referringOrg = referringOrg;
 existingLetter.letterNumDate = letterNumDate;
 existingLetter.subject = subject || "Untitled Subject";
 existingLetter.fileNumber = fileNumber;
 existingLetter.actionTaken = actionTaken;
 existingLetter.signatureDropdown = signatureDropdown;
 existingLetter.submittedTo = submittedTo;
 existingLetter.dateForwarded = dateForwarded;
 existingLetter.dateFileReceived = dateFileReceived;
 existingLetter.dateSigned = dateSigned;
 existingLetter.dateMailed = dateMailed;
 existingLetter.sendTo = [...finalSendTo];
 existingLetter.sendCopies = [...finalCcTo];
 existingLetter.stage = stage;
  if (reminderDate !== existingLetter.reminderDate) {
    if (reminderDate) {
      if (!existingLetter.reminders) existingLetter.reminders = [];
      const remCount = existingLetter.reminders.length;
      const remNum = getReminderNumberStr(remCount);
      existingLetter.reminders.push({
        number: remNum,
        date: reminderDate,
        addedBy: userSign,
        notes: "Updated during letter details modification.",
        timestamp: timestamp
      });
    }
    existingLetter.reminderDate = reminderDate;
  }
 if (activeAttachedPdf) existingLetter.pdfName = activeAttachedPdf;

 // Append Log
 existingLetter.logs.push({
 user: userSign,
 action: `Updated letter data (${stage})`,
 date: timestamp
 });

 lettersDatabase[letterIdx] = existingLetter;
 saveToStorage();
 showToast(`Letter ${editId} updated successfully as ${stage}.`);
 }
 } else {
 // NEW MODE — Generate ID and append
 const nextNum = lettersDatabase.length + 1;
 const newId = `RLY-${String(nextNum).padStart(3, '0')}`;

  const newLetter = {
    id: newId,
    dateReceived,
    referringOrg,
    letterNumDate,
    subject: subject || "Untitled Subject (Draft)",
    fileNumber,
    actionTaken,
    signatureDropdown,
    submittedTo,
    dateForwarded,
    dateFileReceived,
    dateSigned,
    dateMailed,
    sendTo: [...finalSendTo],
    sendCopies: [...finalCcTo],
    stage,
    reminderDate,
    reminders: reminderDate ? [{
      number: "1st",
      date: reminderDate,
      addedBy: userSign,
      notes: "Set on initial registration.",
      timestamp: timestamp
    }] : [],
    noActionHistory: [],
    isNoActionTaken: false,
    pdfName: activeAttachedPdf,
    createdBy: userSign,
    replies: [],
    logs: [
      { user: userSign, action: `Created entry as ${stage}`, date: timestamp }
    ]
  };

 lettersDatabase.unshift(newLetter);
 saveToStorage();
 showToast(`Letter registered successfully. Ref ID: ${newId}`);
 }

 // Clear form and navigate to Ledger
 clearActiveForm();
 navigateToPage("ledger");
}

// Opens letter for editing/updating (bilingual form view support)
function editLetter(letterId) {
 const letter = lettersDatabase.find(l => l.id === letterId);
 if (!letter) return;

 // Navigate to form page
 navigateToPage("add-letter");

 // Populate form fields
 document.getElementById("edit-letter-id").value = letter.id;
 document.getElementById("field-date-received").value = letter.dateReceived;
 setSelectValueWithFallback("field-referring-org", letter.referringOrg);
 document.getElementById("field-letter-num-date").value = letter.letterNumDate;
 document.getElementById("field-subject").value = letter.subject;
 document.getElementById("field-file-number").value = letter.fileNumber;
 document.getElementById("field-action-taken").value = letter.actionTaken;
 document.getElementById("field-signature-dropdown").value = letter.signatureDropdown;
 document.getElementById("field-submitted-to").value = letter.submittedTo;
 document.getElementById("field-date-forwarded").value = letter.dateForwarded;
 document.getElementById("field-date-file-received").value = letter.dateFileReceived;
 document.getElementById("field-date-signed").value = letter.dateSigned;
 document.getElementById("field-date-mailed").value = letter.dateMailed;
 document.getElementById("field-reminder-date").value = letter.reminderDate;

  // Set pills
  let sendToArr = letter.sendTo || [];
  let ccArr = letter.sendCopies || [];
  let customValue = "";
  sendToArr.forEach(v => {
    if (!ROUTING_CHANNELS.includes(v)) {
      customValue = v;
    }
  });
  ccArr.forEach(v => {
    if (!ROUTING_CHANNELS.includes(v)) {
      customValue = v;
    }
  });
  if (customValue) {
    document.getElementById("field-other-name").value = customValue;
    selectedSendTo = sendToArr.map(v => !ROUTING_CHANNELS.includes(v) ? "Other" : v);
    selectedCcTo = ccArr.map(v => !ROUTING_CHANNELS.includes(v) ? "Other" : v);
  } else {
    document.getElementById("field-other-name").value = "";
    selectedSendTo = [...sendToArr];
    selectedCcTo = [...ccArr];
  }
  document.getElementById("field-send-to-values").value = selectedSendTo.join(",");
  document.getElementById("field-send-copies-values").value = selectedCcTo.join(",");
  syncSubmittedByDropdown();
  const hasOther = selectedSendTo.includes("Other") || selectedCcTo.includes("Other");
  const container = document.getElementById("other-name-container");
  if (container) {
    container.style.display = hasOther ? "grid" : "none";
  }

 // Stage Selector sync
 setFormStage(letter.stage);

 // PDF Sync
 if (letter.pdfName) {
 activeAttachedPdf = letter.pdfName;
 document.getElementById("attached-pdf-badge").style.display = "inline-flex";
 document.getElementById("attached-pdf-name").textContent = letter.pdfName;
 document.getElementById("uploader-info-node").style.display = "none";
 } else {
 clearAttachedPdf();
 }

 // Update status title
 document.getElementById("form-edit-status-badge").textContent = `${t("editing_letter")} ${letter.id}`;
 document.getElementById("form-title-sinhala").textContent = "ලිපිය යාවත්‍කාලීන කිරීම";
 document.getElementById("form-title-english").textContent = "Update Letter Entry Details";

 // Re-enable form fields (or set read-only if permissions dictate, but only officers can edit)
 if (currentUser.permissions.includes("edit_letter")) {
 enableFormFields(true);
 } else {
 enableFormFields(false);
 }
}

// --- 9. Roles & Filtration Logic (Part 0 Matrix Validation) ---

// Filter letters shown in Ledger based on logged-in user role
function getFilteredLettersList() {
 if (!currentUser) return [];

 // Head and Department Officer see ALL letters
 if (currentUser.role === 'head' || currentUser.role === 'officer') {
 return lettersDatabase;
 }

 // Additional Secretary: Category Filter
 // Only view letters sent to them or CC'd to them
 if (currentUser.role === 'secretary') {
 const secCategory = currentUser.category; // e.g. "Additional Secretaries (Administration)"
 return lettersDatabase.filter(letter => {
 const matchSend = letter.sendTo && letter.sendTo.includes(secCategory);
 const matchCc = letter.sendCopies && letter.sendCopies.includes(secCategory);
 return matchSend || matchCc;
 });
 }

 return [];
}

// Populates stats counts on dashboard dynamically
function renderDashboardStats() {
 const visibleLetters = getFilteredLettersList();
 
 const drafts = visibleLetters.filter(l => l.stage === 'Draft').length;
 const completed = visibleLetters.filter(l => l.stage === 'Completed').length;

 const withReminders = visibleLetters.filter(l => l.reminderDate && l.reminderDate !== "");
 const activeReminders = withReminders.filter(l => l.stage === "Draft");
 const activeCount = activeReminders.length;
 const overdueCount = activeReminders.filter(l => getReminderStatus(l.reminderDate) === 'overdue').length;
 const upcomingCount = activeCount - overdueCount;

 document.getElementById("dash-draft-count").textContent = drafts;
 document.getElementById("dash-completed-count").textContent = completed;
 document.getElementById("dash-total-letters").textContent = visibleLetters.length;

 document.getElementById("dash-total-reminders").textContent = activeCount;
 document.getElementById("dash-rem-sub-active").textContent = `${upcomingCount} ${t("rem_active")}`;
 document.getElementById("dash-rem-sub-overdue").textContent = `${overdueCount} ${t("rem_overdue")}`;

 // Draw SVG Charts
 drawLetterStatusChart(selectedStatusPeriod);
 drawStaffActivityChart();

 // Render recent table list on dashboard (max 5)
 const dashboardRecentTable = document.getElementById("dashboard-recent-table").getElementsByTagName('tbody')[0];
 dashboardRecentTable.innerHTML = "";

 const recentList = visibleLetters.slice(0, 5);
 
 if (recentList.length === 0) {
 dashboardRecentTable.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">${t("no_recent_letters")}</td></tr>`;
 return;
 }

 recentList.forEach(letter => {
 const row = dashboardRecentTable.insertRow();
 
 // Format Stage Badge
    let stageBadgeHTML;
    if (letter.isNoActionTaken) {
      stageBadgeHTML = `<span class="stage-badge badge-no-action">${t("stage_no_action")}</span>`;
    } else {
      const stageBadgeClass = letter.stage === 'Draft' ? 'stage-badge badge-draft' : 'stage-badge badge-completed';
      stageBadgeHTML = `<span class="${stageBadgeClass}">${stageLabel(letter)}</span>`;
    }
 const stageBadgeText = letter.stage;

 row.innerHTML = `
 <td><strong>${letter.id}</strong></td>
 <td>${letter.dateReceived || t("lbl_na")}</td>
 <td>${letter.referringOrg || t("lbl_na")}</td>
 <td>${letter.subject}</td>
  <td>${stageBadgeHTML}</td>
 <td>
 <button type="button" class="btn btn-secondary btn-sm" onclick="viewLetterDetails('${letter.id}')">${t("btn_view_details")}</button>
 </td>
 `;
 });

 // Populate dynamic quick permissions list
 populateQuickPermissions();
}

function populateQuickPermissions() {
 const permList = document.getElementById("quick-permissions-list");
 if (!permList) return;

 const caps = [
 { name: t("cap_view_ledger"), allowed: true },
 { name: t("cap_register"), allowed: currentUser.permissions.includes("create_letter") },
 { name: t("cap_edit_entries"), allowed: currentUser.permissions.includes("edit_letter") },
 { name: t("cap_view_all"), allowed: (currentUser.role === 'head' || currentUser.role === 'officer') },
 { name: t("cap_reply_notes"), allowed: currentUser.permissions.includes("reply_letter") },
 { name: t("cap_delete"), allowed: false } // No one has delete
 ];

 permList.innerHTML = caps.map(c => `
 <div class="perm-item ${c.allowed ? 'allowed' : 'denied'}">
 <div class="perm-checkbox">${c.allowed ? '' : ''}</div>
 <span>${c.name}</span>
 </div>
 `).join("");
}

function populateLedgerFilters() {
  const selectFilter = document.getElementById("ledger-filter-submitted");
  if (!selectFilter) return;

  selectFilter.innerHTML = `<option value="">${t("opt_all_routing")}</option>` + 
  ROUTING_CHANNELS.map(ch => `<option value="${ch}">${ch}</option>`).join("");
}

// LEDGER VIEW POPULATE
function populateLedgerTable() {
 const tableBody = document.querySelector("#letters-ledger-table tbody");
 const emptyState = document.getElementById("ledger-empty-state");
 
 if (!tableBody) return;

 tableBody.innerHTML = "";

 const lettersList = getFilteredLettersList();

 // Retrieve filter states
 const searchVal = document.getElementById("ledger-filter-search").value.toLowerCase();
 const stageFilter = document.getElementById("ledger-filter-stage").value;
 const targetFilter = document.getElementById("ledger-filter-submitted").value;

 // Filter list
 const filteredList = lettersList.filter(l => {
 const matchSearch = l.id.toLowerCase().includes(searchVal) || 
 (l.subject && l.subject.toLowerCase().includes(searchVal)) || 
 (l.referringOrg && l.referringOrg.toLowerCase().includes(searchVal)) || 
 (l.fileNumber && l.fileNumber.toLowerCase().includes(searchVal));

    const matchStage = stageFilter === "" || 
      (stageFilter === "NoAction" ? l.isNoActionTaken : l.stage === stageFilter);
 
 // Match direct destination or CC target
 const matchTarget = targetFilter === "" || 
 (l.sendTo && l.sendTo.includes(targetFilter)) ||
 (l.sendCopies && l.sendCopies.includes(targetFilter));

 return matchSearch && matchStage && matchTarget;
 });

 if (filteredList.length === 0) {
 emptyState.style.display = "flex";
 return;
 }
 emptyState.style.display = "none";

 filteredList.forEach(letter => {
 const row = tableBody.insertRow();

 // Stage
    let stageBadgeHTML;
    if (letter.isNoActionTaken) {
      stageBadgeHTML = `<span class="stage-badge badge-no-action">${t("stage_no_action")}</span>`;
    } else {
      const stageBadgeClass = letter.stage === 'Draft' ? 'stage-badge badge-draft' : 'stage-badge badge-completed';
      stageBadgeHTML = `<span class="${stageBadgeClass}">${stageLabel(letter)}</span>`;
    }
 
 let targetsString = `<strong>${t("lbl_to")}</strong> ${(letter.sendTo || []).map(routingLabelForLang).join(', ') || t("lbl_none")}`;
 if (letter.sendCopies && letter.sendCopies.length > 0) {
 targetsString += `<br><span style="font-size: 10px; color: var(--text-soft);"><strong>${t("lbl_cc")}</strong> ${letter.sendCopies.map(routingLabelForLang).join(', ')}</span>`;
 }

   // Build Sending Route chain: createdBy (short) → sendTo[0] → sendTo[1] ...
  const sendingRouteHTML = buildSendingRouteHTML(letter);

  // Determine Action Buttons based on User Role
  let actionButtonsHTML = "";
  
  if (currentUser.role === 'officer') {
    actionButtonsHTML += `<button type="button" class="btn btn-secondary btn-sm" onclick="viewLetterDetails('${letter.id}')">${t("btn_view_details")}</button>`;
    actionButtonsHTML += ` <button type="button" class="btn btn-primary btn-sm" onclick="editLetter('${letter.id}')">${t("btn_edit")}</button>`;
  } else if (currentUser.role === 'secretary') {
    actionButtonsHTML += `<button type="button" class="btn btn-secondary btn-sm" onclick="viewLetterDetails('${letter.id}')">${t("btn_view")}</button>`;
    actionButtonsHTML += ` <button type="button" class="btn btn-primary btn-sm" onclick="openReplyModal('${letter.id}')">${t("btn_reply")}</button>`;
  } else {
    actionButtonsHTML += `<button type="button" class="btn btn-secondary btn-sm" onclick="viewLetterDetails('${letter.id}')">${t("btn_view_details")}</button>`;
  }

  row.innerHTML = `
  <td><strong>${letter.id}</strong></td>
  <td>${letter.dateReceived || t("lbl_na")}</td>
  <td>${letterTextForLang(letter.referringOrg) || t("lbl_na")}</td>
  <td><strong>${letterTextForLang(letter.subject)}</strong></td>
  <td><code>${letter.fileNumber || t("lbl_na")}</code></td>
  <td>${stageBadgeHTML}</td>
  <td><div style="max-width: 250px; line-height: 1.3;">${targetsString}</div></td>
  <td><div class="sending-route-chain">${sendingRouteHTML}</div></td>
  <td>
  <div class="actions-cell">
  ${actionButtonsHTML}
  </div>
  </td>
  `;
  });
}

function handleLedgerFiltering() {
  populateLedgerTable();
}

function resetLedgerFilters() {
  document.getElementById("ledger-filter-search").value = "";
  document.getElementById("ledger-filter-stage").value = "";
  document.getElementById("ledger-filter-submitted").value = "";
  populateLedgerTable();
  showToast(t("toast_ledger_reset"));
}

// Highlight Role block in permission flow diagram
function highlightMatrixDiagram() {
  // Clear previous highlights
  document.querySelectorAll(".flow-node").forEach(n => n.style.borderColor = "var(--border-color)");

  // Highlight active role
  if (currentUser) {
    let nodeClass = `.node-${currentUser.role}`;
    const activeNode = document.querySelector(nodeClass);
    if (activeNode) {
      activeNode.style.borderColor = "var(--railway-gold)";
      activeNode.style.boxShadow = "0 0 12px var(--railway-gold-soft)";
    }
  }
}

// --- 10. Modals & DetailViewer Panels ---

function viewLetterDetails(letterId) {
  try {
    console.log("viewLetterDetails called for ID:", letterId);
    const letter = lettersDatabase.find(l => l.id === letterId);
    if (!letter) {
      console.warn("viewLetterDetails: Letter not found in lettersDatabase:", letterId);
      alert("Letter not found in lettersDatabase: " + letterId);
      return;
    }

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    // Set titles
    setVal("view-modal-ref-id", `${t("ref_label")} ${letter.id} | ${t("origin_ref")} ${letter.letterNumDate || t("lbl_none")}`);
    
    // Set simple elements
    setVal("view-date-received", letter.dateReceived || "-");
    setVal("view-referring-org", letter.referringOrg || "-");
    setVal("view-letter-num-date", letter.letterNumDate || "-");
    setVal("view-file-number", letter.fileNumber || "-");
    setVal("view-subject", letter.subject || t("no_subject"));
    setVal("view-action-taken", letter.actionTaken || t("no_actions"));
    setVal("view-signature-dropdown", letter.signatureDropdown || t("none_selected"));
    setVal("view-submitted-to", letter.submittedTo || t("not_specified"));
    setVal("view-date-forwarded", letter.dateForwarded || "-");
    setVal("view-date-file-received", letter.dateFileReceived || "-");
    setVal("view-date-signed", letter.dateSigned || "-");
    setVal("view-date-mailed", letter.dateMailed || "-");
    setVal("view-reminder-date", letter.reminderDate || t("no_reminder_set"));

    // Open the modal as soon as the core fields are ready so optional rendering cannot block it.
    openModalSystem("view-letter-modal");

    // Render custom other name in View modal if present
    let customValue = "";
    const sendToArr = Array.isArray(letter.sendTo) ? letter.sendTo : [];
    const ccArr = Array.isArray(letter.sendCopies) ? letter.sendCopies : [];
    sendToArr.forEach(v => { if (v && !ROUTING_CHANNELS.includes(v)) customValue = v; });
    ccArr.forEach(v => { if (v && !ROUTING_CHANNELS.includes(v)) customValue = v; });

    const otherRow = document.getElementById("view-other-name-row");
    const otherVal = document.getElementById("view-other-name");
    if (otherRow && otherVal) {
      if (customValue) {
        otherRow.style.display = "block";
        otherVal.textContent = customValue;
      } else {
        otherRow.style.display = "none";
        otherVal.textContent = "";
      }
    }

    // Render Reminder timeline in View modal
    const reminderTimelineContainer = document.getElementById("view-reminder-timeline-container");
    if (reminderTimelineContainer) {
      reminderTimelineContainer.innerHTML = renderReminderTimelineHTML(letter);
    }

    // Stage Badge
    const stageBadge = document.getElementById("view-stage-badge");
    if (stageBadge) {
      stageBadge.textContent = stageLabel(letter);
      stageBadge.className = letter.stage === 'Draft' ? 'stage-badge badge-draft' : 'stage-badge badge-completed';
    }

    // Render Target Pills
    setHtml("view-send-to-pills", sendToArr.map(ch => `<span class="inline-badge">${ch}</span>`).join("") || t("lbl_none"));
    setHtml("view-send-copies-pills", ccArr.map(ch => `<span class="inline-badge cc-badge">${ch}</span>`).join("") || t("lbl_none"));

    // Render PDF attachment
    const pdfPanel = document.getElementById("view-pdf-attachment-panel");
    if (pdfPanel) {
      if (letter.pdfName) {
        pdfPanel.innerHTML = `
        <span style="font-size: 24px;"></span>
        <div style="flex: 1;">
        <strong style="display: block; font-size: 12px; color: var(--text-main);">${letter.pdfName}</strong>
        <span style="font-size: 10px; color: var(--text-soft);">Click to preview scanned correspondence document (Simulated PDF)</span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Displaying simulated PDF scanner preview...')">Preview PDF</button>
        `;
      } else {
        pdfPanel.innerHTML = `<span style="font-size: 12px; color: var(--text-muted); font-style: italic;">No scanned PDF documents attached to this correspondence.</span>`;
      }
    }

    // Render timeline replies
    const repliesContainer = document.getElementById("view-replies-timeline-container");
    if (repliesContainer) {
      repliesContainer.innerHTML = "";
      const replies = Array.isArray(letter.replies) ? letter.replies : [];
      if (replies.length === 0) {
        repliesContainer.innerHTML = `<div style="font-size: 11px; color: var(--text-muted); font-style: italic;">No reply comments or routing remarks have been logged.</div>`;
      } else {
        repliesContainer.innerHTML = replies.map(rep => {
          if (!rep) return '';
          return `
          <div class="timeline-bubble">
          <div class="timeline-header">
          <span> ${rep.sender || 'Unknown'} (${rep.designation || 'N/A'})</span>
          <span> ${rep.date || ''}</span>
          </div>
          <div class="timeline-comment">${rep.text || ''}</div>
          </div>
          `;
        }).join("");
      }
    }

    console.log("viewLetterDetails completed successfully for ID:", letterId);
  } catch (err) {
    console.error("CRASH in viewLetterDetails:", err);
    alert("CRASH in viewLetterDetails: " + err.message + "\nStack: " + err.stack);
  }
}

// Reply Dialog Control
function openReplyModal(letterId) {
 const letter = lettersDatabase.find(l => l.id === letterId);
 if (!letter) return;

 document.getElementById("reply-letter-id").value = letter.id;
 document.getElementById("reply-modal-ref-id").textContent = `${t("routing_reply")} ${letter.id}`;
 document.getElementById("reply-modal-subject-text").textContent = letter.subject;
 document.getElementById("field-reply-notes").value = "";

 // Reset PDF upload status
 activeReplyPdf = "";
 const uploadInput = document.getElementById("field-reply-pdf");
 if (uploadInput) uploadInput.value = "";
 const statusText = document.getElementById("reply-pdf-status-text");
 if (statusText) statusText.textContent = currentLang === 'si' ? "ගොනුවක් තෝරන්න" : "Click to upload a document";

 openModalSystem("reply-action-modal");
}

// Submits Reply Comments
function submitReplyAction() {
 const letterId = document.getElementById("reply-letter-id").value;
 const replyNotes = document.getElementById("field-reply-notes").value.trim();

 if (!replyNotes) {
 showToast("Remarks cannot be empty!");
 return;
 }

 const letterIdx = lettersDatabase.findIndex(l => l.id === letterId);
 if (letterIdx !== -1) {
 const timestamp = getLocalDateTimeISO();
 const userSign = `${currentUser.name} (${currentUser.id})`;

 lettersDatabase[letterIdx].replies.push({
 sender: currentUser.name,
 designation: currentUser.designation,
 text: replyNotes,
 date: timestamp,
 pdfName: activeReplyPdf || ""
 });

 lettersDatabase[letterIdx].logs.push({
 user: userSign,
 action: `Submitted reply comment`,
 date: timestamp
 });

 saveToStorage();
 closeModalSystem("reply-action-modal");
 populateLedgerTable();
 if (document.getElementById("page-secretary-inbox")?.classList.contains("active")) {
 renderSecretaryInbox();
 }
 showToast(`Reply logged for letter ${letterId}`);
 }
}

// Modal Toggle Helpers
function openModalSystem(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  } else {
    console.warn(`Modal element #${modalId} not found in DOM`);
  }
}

function closeModalSystem(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  } else {
    console.warn(`Modal element #${modalId} not found in DOM`);
  }
}

// --- 11. Custom Toast Notifications ---
function showToast(message) {
 const toast = document.getElementById("toast-node");
 const msgText = document.getElementById("toast-msg-text");
 
 if (!toast) return;

 msgText.textContent = message;
 toast.classList.add("active");

 setTimeout(() => {
 toast.classList.remove("active");
 }, 3500);
}

// Toggle Dark & Light Themes
function toggleThemeSystem() {
 const body = document.body;
 const isDark = body.classList.toggle("dark-theme");
 body.classList.toggle("light-theme", !isDark);

 const themeIcon = document.getElementById("theme-toggle-icon");
 const themeText = document.getElementById("theme-toggle-text");
 
 if (isDark) {
 themeIcon.textContent = "";
 applyLanguage();
 showToast(t("toast_theme_dark"));
 } else {
 themeIcon.textContent = "";
 applyLanguage();
 showToast(t("toast_theme_light"));
 }
}

// ==========================================================================
// SHARED REMINDER UTILITY HELPERS
// ==========================================================================

// Returns ISO today string for comparison
function todayISO() {
 return new Date().toISOString().split('T')[0];
}

// Classifies a reminderDate as 'none', 'upcoming', or 'overdue'
function getReminderStatus(reminderDate) {
 if (!reminderDate) return 'none';
 const today = todayISO();
 if (reminderDate > today) return 'upcoming';
 if (reminderDate === today) return 'upcoming'; // Due today = upcoming (not yet overdue)
 return 'overdue';
}

// Updates the sidebar bell badge with count of overdue + upcoming reminders
function updateReminderBadge() {
 const badge = document.getElementById("reminder-badge");
 if (!badge) return;
 const visibleLetters = getFilteredLettersList();
 const withReminders = visibleLetters.filter(l => l.reminderDate && l.reminderDate !== "");
 const overdueCount = withReminders.filter(l => getReminderStatus(l.reminderDate) === 'overdue').length;
 const total = withReminders.length;
 badge.textContent = total > 0 ? total : "0";
 badge.style.background = overdueCount > 0 ? "var(--color-pending)" : "var(--color-success)";
}

// ==========================================================================
// ALL LETTERS TAB — Full table renderer with row highlight logic
// ==========================================================================

function renderAllLetters() {
 const tbody = document.getElementById("all-letters-tbody");
 const emptyState = document.getElementById("al-empty-state");
 if (!tbody) return;
 tbody.innerHTML = "";

 // Gather filter values
 const globalQuery = (document.getElementById("al-filter-global")?.value || "").toLowerCase();
 const nameFilter = (document.getElementById("al-filter-name")?.value || "").toLowerCase();
 const dateFilter = (document.getElementById("al-filter-date")?.value || "");
 const numFilter = (document.getElementById("al-filter-number")?.value || "").toLowerCase();
 const statusFilter = (document.getElementById("al-filter-status")?.value || "");

 // Source list: filtered by role
 let letters = getFilteredLettersList();

 // Apply each filter
 letters = letters.filter(l => {
 // Global search — all text fields (English + Sinhala when applicable)
 if (globalQuery) {
 const blob = [
   l.id,
   letterSearchText(l.subject),
   letterSearchText(l.referringOrg),
   l.letterNumDate,
   l.fileNumber,
   letterSearchText(l.actionTaken),
   letterSearchText(l.submittedTo),
   l.createdBy,
 ]
 .join(" ").toLowerCase();
 if (!blob.includes(globalQuery)) return false;
 }

 // Name filter (org or sender)
 if (nameFilter) {
 const orgBlob = letterSearchText(l.referringOrg || "").toLowerCase();
 const toBlob = letterSearchText(l.submittedTo || "").toLowerCase();
 if (!orgBlob.includes(nameFilter) && !toBlob.includes(nameFilter)) return false;
 }

 // Date filter — matches on dateReceived exactly
 if (dateFilter) {
 if (l.dateReceived !== dateFilter) return false;
 }

 // Number filter — matches on ref id or letterNumDate
 if (numFilter) {
 if (!l.id.toLowerCase().includes(numFilter) && !(l.letterNumDate || "").toLowerCase().includes(numFilter)) return false;
 }

 // Status filter
 if (statusFilter === "Draft" && l.stage !== "Draft") return false;
 if (statusFilter === "Completed" && l.stage !== "Completed") return false;
 if (statusFilter === "reminder" && !l.reminderDate) return false;
  if (statusFilter === "NoAction" && !l.isNoActionTaken) return false;

 return true;
 });

 if (letters.length === 0) {
 emptyState.style.display = "flex";
 return;
 }
 emptyState.style.display = "none";

 letters.forEach(letter => {
 const row = tbody.insertRow();
 const remStatus = getReminderStatus(letter.reminderDate);

 // Apply row highlight class
 if (remStatus === 'upcoming') row.classList.add("row-highlight-upcoming");
 else if (remStatus === 'overdue') row.classList.add("row-highlight-overdue");

 // Status badge: Draft / Completed / Reminder (Upcoming or Overdue)
  // Status badge: No Action Taken / Draft / Completed / Reminder (Upcoming or Overdue)
  let statusTagHTML;
  if (letter.isNoActionTaken) {
    statusTagHTML = `<span class="status-tag tag-no-action">${t("stage_no_action")}</span>`;
  } else if (letter.stage === "Completed") {
    statusTagHTML = `<span class="status-tag tag-completed">${t("stage_completed")}</span>`;
  } else if (letter.reminderDate) {
    if (remStatus === 'overdue') {
      statusTagHTML = `<span class="status-tag tag-overdue-reminder">${t("rem_overdue")} (${letter.reminderDate})</span>`;
    } else {
      statusTagHTML = `<span class="status-tag tag-has-reminder">${t("card_reminders")} (${letter.reminderDate})</span>`;
    }
  } else {
    statusTagHTML = `<span class="status-tag tag-draft">${t("stage_draft")}</span>`;
  }

 let actionHTML = `<button class="btn btn-secondary btn-sm" onclick="viewLetterDetails('${letter.id}')">${t("btn_view")}</button>`;
 if (currentUser && currentUser.permissions.includes("edit_letter")) {
 actionHTML += ` <button class="btn btn-primary btn-sm" onclick="editLetter('${letter.id}')">${t("btn_edit")}</button>`;
 }

 row.innerHTML = `
 <td><strong>${letter.id}</strong><br><small style="color:var(--text-muted);font-size:10px;">${letter.letterNumDate || ''}</small></td>
 <td><strong>${letterTextForLang(letter.subject)}</strong></td>
 <td>${letterTextForLang(letter.referringOrg) || '—'}</td>
 <td>${letter.dateReceived || '—'}</td>
 <td>${statusTagHTML}</td>
 <td><div class="actions-cell">${actionHTML}</div></td>
 `;
 });
}

function resetAllLettersFilters() {
 const fields = ["al-filter-global","al-filter-name","al-filter-date","al-filter-number","al-filter-status"];
 fields.forEach(id => {
 const el = document.getElementById(id);
 if (el) el.value = "";
 });
 renderAllLetters();
}

// ==========================================================================
// REMINDER LETTERS TAB — Active + Completed sections
// ==========================================================================

function renderReminderPage() {
 const visibleLetters = getFilteredLettersList();
 const today = todayISO();

 // Split into those with reminders and those without
 const withReminders = visibleLetters.filter(l => l.reminderDate && l.reminderDate !== "");

 // Active = has reminder (regardless of stage — can be Draft or Completed)
 const activeReminders = withReminders.filter(l => l.stage === "Draft" || getReminderStatus(l.reminderDate) !== 'none');
 // Completed reminders = Completed stage + has reminder
 const completedReminders = withReminders.filter(l => l.stage === "Completed");
 // Active section hides completed ones so they only appear in the bottom section
 const activeOnly = withReminders.filter(l => l.stage === "Draft");

 // Count badges
 document.getElementById("active-reminder-count").textContent = `${activeOnly.length} ${t("rem_active")}`;
 document.getElementById("completed-reminder-count").textContent = `${completedReminders.length} ${t("rem_completed")}`;

 // Overdue detection — any overdue reminder triggers the alert banner
 const overdueItems = withReminders.filter(l => getReminderStatus(l.reminderDate) === 'overdue');
 const banner = document.getElementById("overdue-alert-banner");

 if (overdueItems.length > 0) {
 banner.style.display = "flex";
 const alertText = document.getElementById("overdue-alert-text");
 const subjects = overdueItems.map(l => `"${l.subject}"`).join(", ");
 alertText.textContent = `${overdueItems.length} ${t("overdue_reminders_require")}: ${subjects}`;
 } else {
 banner.style.display = "none";
 }

 // Update sidebar badge
 updateReminderBadge();

 // ── Render Active Section ──
 const activeBody = document.getElementById("active-reminders-tbody");
 const activeEmpty = document.getElementById("active-reminders-empty");
 activeBody.innerHTML = "";

 if (activeOnly.length === 0) {
 activeEmpty.style.display = "flex";
 } else {
 activeEmpty.style.display = "none";
 activeOnly.forEach(letter => {
 const row = activeBody.insertRow();
 const remStatus = getReminderStatus(letter.reminderDate);
 if (remStatus === 'overdue') row.classList.add("row-highlight-overdue");

 const isOverdue = remStatus === 'overdue';
 const overdueHTML = isOverdue
 ? `<span class="overdue-indicator">${t("overdue_yes")} — ${Math.ceil((new Date(today) - new Date(letter.reminderDate)) / 86400000)} ${t("days_overdue")}</span>`
 : `<span class="overdue-indicator upcoming">${t("overdue_not_yet")}</span>`;

      const stageBadge = letter.isNoActionTaken 
      ? `<span class="stage-badge badge-no-action">${t("stage_no_action")}</span>` 
      : `<span class="stage-badge badge-draft">${t("stage_draft")}</span>`;

 const editReminderBtn = (currentUser && currentUser.permissions.includes("edit_letter"))
 ? `<button class="btn-edit-reminder" onclick="openEditReminderModal('${letter.id}')">${t("edit_date")}</button>`
 : "";

 row.innerHTML = `
 <td><strong>${letter.id}</strong></td>
 <td>${letterTextForLang(letter.subject)}</td>
 <td>${letterTextForLang(letter.referringOrg) || '—'}</td>
 <td>${stageBadge}</td>
 <td>
 <span class="reminder-tag ${isOverdue ? 'tag-overdue' : 'tag-upcoming'}">${isOverdue ? '' : ''} ${letter.reminderDate}</span>
 ${editReminderBtn}
 </td>
 <td>${overdueHTML}</td>
 <td>
 <div class="actions-cell">
 <button class="btn btn-secondary btn-sm" onclick="viewLetterDetails('${letter.id}')">${t("btn_view")}</button>
 ${currentUser && currentUser.permissions.includes("edit_letter") ? `<button class="btn btn-primary btn-sm" onclick="editLetter('${letter.id}')">${t("btn_edit")}</button>` : ""}
 </div>
 </td>
 `;
 });
 }

 // ── Render Completed Section ──
 const completedBody = document.getElementById("completed-reminders-tbody");
 const completedEmpty = document.getElementById("completed-reminders-empty");
 completedBody.innerHTML = "";

 if (completedReminders.length === 0) {
 completedEmpty.style.display = "flex";
 } else {
 completedEmpty.style.display = "none";
 completedReminders.forEach(letter => {
 const row = completedBody.insertRow();

 row.innerHTML = `
 <td><strong>${letter.id}</strong></td>
 <td style="color:var(--text-soft);">${letterTextForLang(letter.subject)}</td>
 <td style="color:var(--text-soft);">${letterTextForLang(letter.referringOrg) || '—'}</td>
 <td><span class="reminder-tag tag-none"> ${letter.reminderDate}</span></td>
      <td>
        ${letter.isNoActionTaken 
          ? `<span class="stage-badge badge-no-action">${t("stage_no_action")}</span>` 
          : `<span class="stage-badge badge-completed">${t("stage_completed")}</span>`}
      </td>
 <td>
 <div class="actions-cell">
 <button class="btn btn-secondary btn-sm" onclick="viewLetterDetails('${letter.id}')">${t("btn_view")}</button>
 </div>
 </td>
 `;
 });
 }

  // ── Render No Action Taken Section ──
  const noActionLetters = visibleLetters.filter(l => l.isNoActionTaken);
  
  const noActionCountBadge = document.getElementById("no-action-reminder-count");
  if (noActionCountBadge) {
    noActionCountBadge.textContent = `${noActionLetters.length} ${t("stage_no_action")}`;
  }
  
  const noActionBody = document.getElementById("no-action-reminders-tbody");
  const noActionEmpty = document.getElementById("no-action-reminders-empty");
  
  if (noActionBody && noActionEmpty) {
    noActionBody.innerHTML = "";
    
    if (noActionLetters.length === 0) {
      noActionEmpty.style.display = "flex";
    } else {
      noActionEmpty.style.display = "none";
      noActionLetters.forEach(letter => {
        const row = noActionBody.insertRow();
        
        const canEdit = currentUser && currentUser.permissions.includes("edit_letter");
        const actionHTML = `
          <button class="btn btn-secondary btn-sm" onclick="viewLetterDetails('${letter.id}')">${t("btn_view")}</button>
          ${canEdit ? '<button class="btn btn-primary btn-sm" onclick="editLetter(\'' + letter.id + '\')">' + t("edit_letter") + '</button>' : ''}
          ${canEdit ? '<button class="btn btn-outline btn-sm" onclick="openEditReminderModal(\'' + letter.id + '\')">' + t("manage_reminder") + '</button>' : ''}
        `;
        
        row.innerHTML = `
          <td><strong>${letter.id}</strong></td>
          <td>${letterTextForLang(letter.subject)}</td>
          <td>${letterTextForLang(letter.referringOrg) || '—'}</td>
          <td>${letter.noActionDate || '—'}</td>
          <td>${letter.noActionReason || '—'}</td>
          <td><span class="stage-badge badge-no-action">${t("stage_no_action")}</span></td>

          <td>
            <div class="actions-cell">
              ${actionHTML}
            </div>
          </td>
        `;
      });
    }
  }

}

// ==========================================================================
// INLINE REMINDER DATE EDIT MODAL (from Reminder Tab)
// ==========================================================================

function openEditReminderModal(letterId) {
  const letter = lettersDatabase.find(l => l.id === letterId);
  if (!letter) return;

  document.getElementById("inline-reminder-letter-id").value = letterId;
  document.getElementById("edit-reminder-letter-ref").textContent = `${letter.id} — ${letterTextForLang(letter.subject)}`;

  // Clear inputs
  document.getElementById("inline-reminder-date-input").value = "";
  document.getElementById("inline-reminder-notes-input").value = "";

  // Set No Action Taken fields
  const noActionCheckbox = document.getElementById("inline-no-action-checkbox");
  const noActionDate = document.getElementById("inline-no-action-date-input");
  const noActionRemarks = document.getElementById("inline-no-action-remarks-input");

  if (letter.isNoActionTaken) {
    noActionCheckbox.checked = true;
    noActionDate.value = letter.noActionDate || todayISO();
    noActionRemarks.value = letter.noActionReason || "";
  } else {
    noActionCheckbox.checked = false;
    noActionDate.value = todayISO();
    noActionRemarks.value = "";
  }
  toggleNoActionFields();

  // Determine reminder count and update label
  const remCount = (letter.reminders || []).length;
  const nextNum = getReminderNumberStr(remCount);
  document.getElementById("new-reminder-header-label").textContent = currentLang === 'si'
    ? t("rem_add_ordinal_si").replace("{n}", nextNum)
    : t("rem_add_ordinal").replace("{n}", nextNum);

  // Render History in Modal
  const historyContainer = document.getElementById("inline-reminder-history-container");
  if (historyContainer) {
    historyContainer.innerHTML = renderReminderTimelineHTML(letter);
  }

  openModalSystem("edit-reminder-modal");
}

function saveInlineReminderDate() {
  const letterId = document.getElementById("inline-reminder-letter-id").value;
  const newDate = document.getElementById("inline-reminder-date-input").value;
  const newNotes = document.getElementById("inline-reminder-notes-input").value.trim();

  const letterIdx = lettersDatabase.findIndex(l => l.id === letterId);
  if (letterIdx === -1) return;

  const letter = lettersDatabase[letterIdx];
  const userSign = `${currentUser.name} (${currentUser.id})`;
  const now = getLocalDateTimeISO();

  // 1. Process No Action Taken
  const noActionCheckbox = document.getElementById("inline-no-action-checkbox");
  const noActionDateInput = document.getElementById("inline-no-action-date-input");
  const noActionRemarks = document.getElementById("inline-no-action-remarks-input").value.trim();

  const wasNoAction = letter.isNoActionTaken || false;
  const isNoAction = noActionCheckbox.checked;

  if (isNoAction) {
    if (!noActionDateInput.value) {
      showToast("Please select a date for 'No Action Taken'.");
      noActionDateInput.focus();
      return;
    }
    
    // Check if state changed or remarks changed to save to history
    if (!wasNoAction || letter.noActionReason !== noActionRemarks || letter.noActionDate !== noActionDateInput.value) {
      if (!letter.noActionHistory) letter.noActionHistory = [];
      letter.noActionHistory.push({
        marked: true,
        dateMarked: noActionDateInput.value,
        reason: noActionRemarks,
        addedBy: userSign,
        timestamp: now
      });
    }
    
    letter.isNoActionTaken = true;
    letter.noActionDate = noActionDateInput.value;
    letter.noActionReason = noActionRemarks;
    
    letter.logs.push({
      user: userSign,
      action: `Marked as No Action Taken: ${noActionRemarks || 'No reason provided'}`,
      date: now
    });
  } else {
    // If it was marked before, but now unmarked, log the clear event in history
    if (wasNoAction) {
      if (!letter.noActionHistory) letter.noActionHistory = [];
      letter.noActionHistory.push({
        marked: false,
        dateMarked: todayISO(),
        reason: "Cleared by user",
        addedBy: userSign,
        timestamp: now
      });
      letter.isNoActionTaken = false;
      letter.noActionDate = "";
      letter.noActionReason = "";
      
      letter.logs.push({
        user: userSign,
        action: "Cleared 'No Action Taken' status",
        date: now
      });
    }
  }

  // 2. Process New Reminder Date
  if (newDate) {
    if (!letter.reminders) letter.reminders = [];
    
    const remCount = letter.reminders.length;
    const remNum = getReminderNumberStr(remCount);
    
    letter.reminders.push({
      number: remNum,
      date: newDate,
      addedBy: userSign,
      notes: newNotes,
      timestamp: now
    });
    
    letter.reminderDate = newDate;
    
    letter.logs.push({
      user: userSign,
      action: `Added ${remNum} Reminder for ${newDate}`,
      date: now
    });
  } else {
    if (letter.reminderDate) {
      letter.reminderDate = "";
      letter.logs.push({
        user: userSign,
        action: "Cleared active reminder date",
        date: now
      });
    }
  }

  saveToStorage();
  updateReminderBadge();
  closeModalSystem("edit-reminder-modal");

  // Re-render both tabs
  renderReminderPage();
  if (typeof renderAllLetters === 'function') renderAllLetters();
  if (typeof populateLedgerTable === 'function') populateLedgerTable();
  showToast("Reminder configurations saved successfully.");
}
function dismissOverdueAlert() {
 document.getElementById("overdue-alert-banner").style.display = "none";
}

// ==========================================================================
// PHASE 2 CHARTING ENGINE & NEW PAGES LOGIC
// ==========================================================================

function updateLetterStatusPeriod(period) {
 selectedStatusPeriod = period;
 
 // Update button active state
 document.getElementById("btn-chart-daily").classList.toggle("active", period === "daily");
 document.getElementById("btn-chart-weekly").classList.toggle("active", period === "weekly");
 document.getElementById("btn-chart-monthly").classList.toggle("active", period === "monthly");
 
 drawLetterStatusChart(period);
}

function updateUserTrackingPeriod(period) {
 selectedTrackingPeriod = period;
 
 // Update button active state
 document.getElementById("btn-ut-weekly").classList.toggle("active", period === "weekly");
 document.getElementById("btn-ut-monthly").classList.toggle("active", period === "monthly");
 
 if (selectedTrackingUser) {
 renderUserTracking(selectedTrackingUser);
 }
}

function getLetterStatusData(period) {
 const visible = getFilteredLettersList();
 const now = new Date("2026-06-24"); // Fixed system today date for demo stability
 const buckets = [];
 
 if (period === 'daily') {
 // Last 7 days
 for (let i = 6; i >= 0; i--) {
 const d = new Date(now);
 d.setDate(now.getDate() - i);
 const iso = d.toISOString().split('T')[0];
 const label = d.toLocaleDateString(currentLang === 'si' ? 'si-LK' : 'en-US', { weekday: 'short', day: 'numeric' });
 
 const drafts = visible.filter(l => l.dateReceived === iso && l.stage === 'Draft').length;
 const completed = visible.filter(l => l.dateReceived === iso && l.stage === 'Completed').length;
 
 buckets.push({ label, drafts, completed });
 }
 } else if (period === 'weekly') {
 // Last 4 weeks
 for (let i = 3; i >= 0; i--) {
 const start = new Date(now);
 start.setDate(now.getDate() - (i + 1) * 7 + 1);
 const end = new Date(now);
 end.setDate(now.getDate() - i * 7);
 
 const startStr = start.toISOString().split('T')[0];
 const endStr = end.toISOString().split('T')[0];
 
 const label = currentLang === 'si' ? `සතිය ${4 - i}` : `Week ${4 - i}`;
 
 const drafts = visible.filter(l => l.dateReceived >= startStr && l.dateReceived <= endStr && l.stage === 'Draft').length;
 const completed = visible.filter(l => l.dateReceived >= startStr && l.dateReceived <= endStr && l.stage === 'Completed').length;
 
 buckets.push({ label, drafts, completed });
 }
 } else {
 // Last 6 months
 for (let i = 5; i >= 0; i--) {
 const d = new Date(now);
 d.setMonth(now.getMonth() - i);
 const year = d.getFullYear();
 const month = d.getMonth();
 const label = d.toLocaleDateString(currentLang === 'si' ? 'si-LK' : 'en-US', { month: 'short' });
 
 const drafts = visible.filter(l => {
 const parts = l.dateReceived.split("-");
 return parseInt(parts[0]) === year && (parseInt(parts[1]) - 1) === month && l.stage === 'Draft';
 }).length;
 
 const completed = visible.filter(l => {
 const parts = l.dateReceived.split("-");
 return parseInt(parts[0]) === year && (parseInt(parts[1]) - 1) === month && l.stage === 'Completed';
 }).length;
 
 buckets.push({ label, drafts, completed });
 }
 }
 return buckets;
}

function drawLetterStatusChart(period) {
 const container = document.getElementById("letter-status-chart-container");
 if (!container) return;
 
 const data = getLetterStatusData(period);
 
 // Find max value for Y scaling
 let maxVal = 0;
 data.forEach(d => {
 const total = Math.max(d.drafts, d.completed);
 if (total > maxVal) maxVal = total;
 });
 maxVal = Math.max(5, Math.ceil(maxVal / 5) * 5); // Nearest 5
 
 const width = 700;
 const height = 360;
 const paddingLeft = 45;
 const paddingRight = 25;
 const paddingTop = 25;
 const paddingBottom = 50;
 
 const plotWidth = width - paddingLeft - paddingRight;
 const plotHeight = height - paddingTop - paddingBottom;
 
 // Generate Y axis grid lines and ticks
 let gridLinesHTML = "";
 const ticks = 5;
 for (let i = 0; i <= ticks; i++) {
 const val = (maxVal / ticks) * i;
 const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
 gridLinesHTML += `
 <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="chart-grid-line" />
 <text x="${paddingLeft - 10}" y="${y + 4}" class="chart-axis-text" text-anchor="end">${Math.round(val)}</text>
 `;
 }
 
 // Generate Bars — bar width is proportional to slot width
 let barsHTML = "";
 const numBuckets = data.length;
 const step = plotWidth / numBuckets;
 const barWidth = Math.min(step * 0.35, 60);
 const barSpacing = Math.max(step * 0.04, 3);
 
 data.forEach((d, idx) => {
 const xCenter = paddingLeft + step * idx + step / 2;
 const totalLetters = d.drafts + d.completed;
 
 // X Label (day/week/month)
 const yLabel = height - paddingBottom + 16;
 barsHTML += `
 <text x="${xCenter}" y="${yLabel}" class="chart-axis-text" text-anchor="middle" style="font-size:11px;font-weight:500;">${d.label}</text>
 `;
 // Total count below label
 barsHTML += `
 <text x="${xCenter}" y="${yLabel + 15}" class="chart-axis-text" text-anchor="middle" style="font-size:12px;font-weight:700;">${totalLetters}</text>
 `;
 
 // Draft bar
 const xDraft = xCenter - barWidth - barSpacing / 2;
 const draftH = (d.drafts / maxVal) * plotHeight;
 const yDraft = paddingTop + plotHeight - draftH;
 
 if (d.drafts > 0) {
 barsHTML += `
 <rect x="${xDraft}" y="${yDraft}" width="${barWidth}" height="${draftH}" rx="4" class="chart-bar-draft"
 onmouseover="showChartTooltip(event, '${d.label}', '${t("stage_draft")}', ${d.drafts}, 'var(--railway-gold)')"
 onmousemove="moveChartTooltip(event)"
 onmouseout="hideChartTooltip()" />
 `;
 }
 
 // Completed bar
 const xComp = xCenter + barSpacing / 2;
 const compH = (d.completed / maxVal) * plotHeight;
 const yComp = paddingTop + plotHeight - compH;
 
 if (d.completed > 0) {
 barsHTML += `
 <rect x="${xComp}" y="${yComp}" width="${barWidth}" height="${compH}" rx="4" class="chart-bar-completed"
 onmouseover="showChartTooltip(event, '${d.label}', '${t("stage_completed")}', ${d.completed}, 'var(--railway-blue)')"
 onmousemove="moveChartTooltip(event)"
 onmouseout="hideChartTooltip()" />
 `;
 }
 });
 
 container.innerHTML = `
 <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
 <!-- Axis Lines -->
 <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" class="chart-axis-line" />
 <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" class="chart-axis-line" />
 <!-- Grid & Ticks -->
 ${gridLinesHTML}
 <!-- Bars & Labels -->
 ${barsHTML}
 </svg>
 <div class="chart-tooltip" id="ls-chart-tooltip"></div>
 `;
}

function drawStaffActivityChart() {
 const container = document.getElementById("staff-activity-chart-container");
 if (!container) return;
 
 const officers = SYSTEM_USERS.officer;
 const visible = getFilteredLettersList();
 
 // Aggregate data
 const data = officers.map(o => {
 const drafts = visible.filter(l => l.createdBy && l.createdBy.includes(o.id) && l.stage === 'Draft').length;
 const completed = visible.filter(l => l.createdBy && l.createdBy.includes(o.id) && l.stage === 'Completed').length;
 return {
 id: o.id,
 name: o.name,
 drafts,
 completed
 };
 });
 
 // Find max value
 let maxVal = 0;
 data.forEach(d => {
 const total = Math.max(d.drafts, d.completed);
 if (total > maxVal) maxVal = total;
 });
 maxVal = Math.max(5, Math.ceil(maxVal / 5) * 5);
 
 const width = 800;
 const height = 400;
 const paddingLeft = 45;
 const paddingRight = 25;
 const paddingTop = 25;
 const paddingBottom = 65;
 
 const plotWidth = width - paddingLeft - paddingRight;
 const plotHeight = height - paddingTop - paddingBottom;
 
 // Generate Y axis grid lines
 let gridLinesHTML = "";
 const ticks = 5;
 for (let i = 0; i <= ticks; i++) {
 const val = (maxVal / ticks) * i;
 const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
 gridLinesHTML += `
 <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="chart-grid-line" />
 <text x="${paddingLeft - 10}" y="${y + 4}" class="chart-axis-text" text-anchor="end">${Math.round(val)}</text>
 `;
 }
 
 // Generate Bars — bar width proportional to slot width
 let barsHTML = "";
 const numBuckets = data.length;
 const step = plotWidth / numBuckets;
 const barWidth = Math.min(step * 0.30, 50);
 const barSpacing = Math.max(step * 0.04, 3);
 
 data.forEach((d, idx) => {
 const xCenter = paddingLeft + step * idx + step / 2;
 const totalLetters = d.drafts + d.completed;
 
 // Group wrapper to handle click event
 barsHTML += `<g style="cursor:pointer;" onclick="navigateToUserTracking('${d.id}')">`;
 
 // Officer name label (horizontal)
 const yLabel = height - paddingBottom + 14;
 barsHTML += `
 <text x="${xCenter}" y="${yLabel}" class="chart-axis-text" text-anchor="middle" style="font-size:10px;font-weight:500;">${d.name}</text>
 `;
 // Total count below name
 barsHTML += `
 <text x="${xCenter}" y="${yLabel + 14}" class="chart-axis-text" text-anchor="middle" style="font-size:11px;font-weight:700;">${totalLetters}</text>
 `;
 
 // Draft bar
 const xDraft = xCenter - barWidth - barSpacing / 2;
 const draftH = (d.drafts / maxVal) * plotHeight;
 const yDraft = paddingTop + plotHeight - draftH;
 
 barsHTML += `
 <rect x="${xDraft}" y="${yDraft || 0}" width="${barWidth}" height="${Math.max(1, draftH)}" rx="3" class="chart-bar-draft"
 onmouseover="showChartTooltip(event, '${d.name}', '${t("stage_draft")}', ${d.drafts}, 'var(--railway-gold)')"
 onmousemove="moveChartTooltip(event)"
 onmouseout="hideChartTooltip()" />
 `;
 
 // Completed bar
 const xComp = xCenter + barSpacing / 2;
 const compH = (d.completed / maxVal) * plotHeight;
 const yComp = paddingTop + plotHeight - compH;
 
 barsHTML += `
 <rect x="${xComp}" y="${yComp || 0}" width="${barWidth}" height="${Math.max(1, compH)}" rx="3" class="chart-bar-completed"
 onmouseover="showChartTooltip(event, '${d.name}', '${t("stage_completed")}', ${d.completed}, 'var(--railway-blue)')"
 onmousemove="moveChartTooltip(event)"
 onmouseout="hideChartTooltip()" />
 `;
 
 barsHTML += `</g>`;
 });
 
 container.innerHTML = `
 <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
 <!-- Axis Lines -->
 <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" class="chart-axis-line" />
 <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" class="chart-axis-line" />
 <!-- Grid & Ticks -->
 ${gridLinesHTML}
 <!-- Bars & Labels -->
 ${barsHTML}
 </svg>
 <div class="chart-tooltip" id="sa-chart-tooltip"></div>
 `;
}

function showChartTooltip(event, label, title, value, color) {
 const tooltips = document.querySelectorAll(".chart-tooltip");
 tooltips.forEach(t => {
 t.innerHTML = `
 <strong style="color:${color}">${label}</strong><br/>
 <span>${title}: <strong>${value}</strong></span>
 `;
 t.style.display = "block";
 });
 moveChartTooltip(event);
}

function moveChartTooltip(event) {
 const tooltips = document.querySelectorAll(".chart-tooltip");
 tooltips.forEach(t => {
 const container = t.parentElement;
 const rect = container.getBoundingClientRect();
 const x = event.clientX - rect.left + 15;
 const y = event.clientY - rect.top - 40;
 t.style.left = x + "px";
 t.style.top = y + "px";
 });
}

function hideChartTooltip() {
 const tooltips = document.querySelectorAll(".chart-tooltip");
 tooltips.forEach(t => {
 t.style.display = "none";
 });
}

function navigateToUserTracking(userId) {
 selectedTrackingUser = userId;
 selectedTrackingPeriod = "weekly";
 navigateToPage("user-tracking");
}

function drawUserTimelineMiniChart(userId, period) {
 const container = document.getElementById("ut-svg-chart-wrapper");
 if (!container) return;
 
 const visible = lettersDatabase.filter(l => l.createdBy && l.createdBy.includes(userId));
 const now = new Date("2026-06-24");
 const buckets = [];
 
 if (period === 'weekly') {
 // 7 days
 for (let i = 6; i >= 0; i--) {
 const d = new Date(now);
 d.setDate(now.getDate() - i);
 const iso = d.toISOString().split('T')[0];
 const label = d.toLocaleDateString(currentLang === 'si' ? 'si-LK' : 'en-US', { weekday: 'short', day: 'numeric' });
 
 const count = visible.filter(l => {
 const creationDate = l.logs[0]?.date.split("T")[0] || l.dateReceived;
 return creationDate === iso;
 }).length;
 
 buckets.push({ label, count });
 }
 } else {
 // 4 weeks
 for (let i = 3; i >= 0; i--) {
 const start = new Date(now);
 start.setDate(now.getDate() - (i + 1) * 7 + 1);
 const end = new Date(now);
 end.setDate(now.getDate() - i * 7);
 
 const startStr = start.toISOString().split('T')[0];
 const endStr = end.toISOString().split('T')[0];
 
 const label = currentLang === 'si' ? `සතිය ${4 - i}` : `Week ${4 - i}`;
 
 const count = visible.filter(l => {
 const creationDate = l.logs[0]?.date.split("T")[0] || l.dateReceived;
 return creationDate >= startStr && creationDate <= endStr;
 }).length;
 
 buckets.push({ label, count });
 }
 }
 
 let maxVal = 0;
 buckets.forEach(b => {
 if (b.count > maxVal) maxVal = b.count;
 });
 maxVal = Math.max(3, Math.ceil(maxVal));
 
 const width = 500;
 const height = 140;
 const paddingLeft = 30;
 const paddingRight = 20;
 const paddingTop = 15;
 const paddingBottom = 25;
 
 const plotWidth = width - paddingLeft - paddingRight;
 const plotHeight = height - paddingTop - paddingBottom;
 
 let gridLines = "";
 for (let i = 0; i <= maxVal; i++) {
 const y = paddingTop + plotHeight - (i / maxVal) * plotHeight;
 gridLines += `
 <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="chart-grid-line" />
 <text x="${paddingLeft - 8}" y="${y + 3}" class="chart-axis-text" text-anchor="end">${i}</text>
 `;
 }
 
 let bars = "";
 const step = plotWidth / buckets.length;
 buckets.forEach((b, idx) => {
 const xCenter = paddingLeft + step * idx + step / 2;
 const barWidth = 20;
 const barH = (b.count / maxVal) * plotHeight;
 const y = paddingTop + plotHeight - barH;
 
 bars += `
 <text x="${xCenter}" y="${height - paddingBottom + 14}" class="chart-axis-text" text-anchor="middle">${b.label}</text>
 <rect x="${xCenter - barWidth/2}" y="${y}" width="${barWidth}" height="${barH}" rx="1.5" fill="var(--railway-blue)"
 onmouseover="showChartTooltip(event, '${b.label}', '${t("chart_entered")}', ${b.count}, 'var(--railway-blue)')"
 onmousemove="moveChartTooltip(event)"
 onmouseout="hideChartTooltip()" />
 `;
 });
 
 container.innerHTML = `
 <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
 <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" class="chart-axis-line" />
 <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" class="chart-axis-line" />
 ${gridLines}
 ${bars}
 </svg>
 <div class="chart-tooltip"></div>
 `;
}

function renderUserTracking(userId) {
 const officer = SYSTEM_USERS.officer.find(o => o.id === userId);
 if (!officer) return;
 
 selectedTrackingUser = userId;
 
 // Populate dropdown and set selected placeholder
 populateUtUserDropdown();
 const placeholder = document.getElementById("ut-user-select-placeholder");
 if (placeholder) {
   placeholder.textContent = `${officer.name} (${officer.id})`;
 }
 
 const title = document.getElementById("ut-user-title");
 const subtitle = document.getElementById("ut-user-subtitle");
 
 if (currentLang === 'si') {
 title.textContent = `${officer.name} (${officer.id}) — ${t("ut_activity_suffix")}`;
 const desig = (typeof designationLabel === "function" && officer.role)
   ? (designationLabel(officer.role) || officer.designation)
   : officer.designation;
 subtitle.textContent = `${desig} ${t("ut_subtitle_si_suffix")}`;
 } else {
 title.textContent = `${officer.name} (${officer.id}) — ${t("ut_activity_suffix")}`;
 subtitle.textContent = `${t("ut_subtitle_prefix")} ${officer.name}`;
 }
 
 drawUserTimelineMiniChart(userId, selectedTrackingPeriod);
 
 const btnW = document.getElementById("btn-ut-weekly");
 const btnM = document.getElementById("btn-ut-monthly");
 if (btnW && btnM) {
 btnW.classList.toggle("active", selectedTrackingPeriod === "weekly");
 btnM.classList.toggle("active", selectedTrackingPeriod === "monthly");
 }
 
 const tbody = document.getElementById("ut-letters-tbody");
 const emptyState = document.getElementById("ut-empty-state");
 const table = document.getElementById("ut-letters-table");
 if (!tbody) return;
 tbody.innerHTML = "";
 
 const compCol = document.getElementById("ut-col-compliance");
 if (compCol) {
 compCol.style.display = (currentUser.role === 'head') ? "" : "none";
 }
 
 let userLetters = lettersDatabase.filter(l => l.createdBy && l.createdBy.includes(userId));
 
 const now = new Date("2026-06-24");
 const cutoffDate = new Date(now);
 if (selectedTrackingPeriod === 'weekly') {
 cutoffDate.setDate(now.getDate() - 7);
 } else {
 cutoffDate.setDate(now.getDate() - 28);
 }
 
 userLetters = userLetters.filter(l => {
 const creationDate = new Date(l.logs[0]?.date || l.dateReceived);
 return creationDate >= cutoffDate;
 });
 
 userLetters.sort((a, b) => {
 const timeA = a.logs[0]?.date || a.dateReceived;
 const timeB = b.logs[0]?.date || b.dateReceived;
 return timeB.localeCompare(timeA);
 });
 
 if (userLetters.length === 0) {
 table.style.display = "none";
 emptyState.style.display = "flex";
 return;
 }
 
 table.style.display = "";
 emptyState.style.display = "none";
 
 userLetters.forEach(letter => {
 const creationTime = letter.logs[0]?.date || letter.dateReceived + "T09:00:00";
 const formattedTime = creationTime.replace("T", " ").substring(0, 19);
 
 const row = tbody.insertRow();
 
 let cellsHTML = `
 <td><strong>${letter.id}</strong></td>
 <td>${letterTextForLang(letter.subject)}</td>
 <td>${letter.dateReceived}</td>
 <td><small>${formattedTime}</small></td>
 `;
 
 if (currentUser.role === 'head') {
 const hour = parseInt(creationTime.substring(11, 13));
 const isOutside = isNaN(hour) || (hour < 8 || hour >= 17);
 
 if (isOutside) {
 cellsHTML += `<td><span class="compliance-flag flag-outside"> ${t("compliance_outside")}</span></td>`;
 } else {
 cellsHTML += `<td><span class="compliance-flag flag-normal"> ${t("compliance_normal")}</span></td>`;
 }
 }
 
 row.innerHTML = cellsHTML;
 row.style.cursor = "pointer";
 row.onclick = (e) => {
 if (e.target.tagName !== 'BUTTON') {
 viewLetterDetails(letter.id);
 }
 };
 });
}

function getFlattenedHistoryLogs() {
 const logs = [];
 lettersDatabase.forEach(letter => {
 if (letter.logs) {
 letter.logs.forEach(log => {
 logs.push({
 letterId: letter.id,
 user: log.user,
 action: log.action,
 timestamp: log.date || letter.dateReceived + "T09:00:00"
 });
 });
 }
 });
 logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
 return logs;
}

function renderHistoryLog() {
 const tbody = document.getElementById("history-log-tbody");
 const emptyState = document.getElementById("history-empty-state");
 if (!tbody) return;
 tbody.innerHTML = "";
 
 const fromDate = document.getElementById("history-filter-from").value;
 const toDate = document.getElementById("history-filter-to").value;
 
 let filtered = getFlattenedHistoryLogs();
 
 if (fromDate) {
 filtered = filtered.filter(log => log.timestamp.split("T")[0] >= fromDate);
 }
 if (toDate) {
 filtered = filtered.filter(log => log.timestamp.split("T")[0] <= toDate);
 }
 
 if (filtered.length === 0) {
 emptyState.style.display = "flex";
 return;
 }
 emptyState.style.display = "none";
 
 filtered.forEach(log => {
 const row = tbody.insertRow();
 const formattedTime = log.timestamp.replace("T", " ").substring(0, 19);
 
 row.innerHTML = `
 <td><small>${formattedTime}</small></td>
 <td><strong>${log.user}</strong></td>
 <td>${log.action}</td>
 <td><strong>${log.letterId}</strong></td>
 <td>
 <div class="actions-cell">
 <button class="btn btn-secondary btn-sm" onclick="viewLetterDetails('${log.letterId}')">${t("btn_view")}</button>
 </div>
 </td>
 `;
 });
}

function resetHistoryFilters() {
 document.getElementById("history-filter-from").value = "";
 document.getElementById("history-filter-to").value = "";
 renderHistoryLog();
}

// ==========================================================================
// SECRETARY INBOX VIEW & PDF UPLOAD ACTIONS
// ==========================================================================

function handleReplyPdfUpload(input) {
 if (input.files && input.files[0]) {
 const filename = input.files[0].name;
 activeReplyPdf = filename;
 document.getElementById("reply-pdf-status-text").textContent = currentLang === 'si' ? ` ඇමුණුවා: ${filename}` : ` Attached: ${filename}`;
 showToast(`PDF Attached: ${filename}`);
 }
}

function renderSecretaryInbox() {
 const tbody = document.getElementById("sec-inbox-tbody");
 const emptyState = document.getElementById("sec-empty-state");
 const table = document.getElementById("sec-inbox-table");
 if (!tbody) return;
 tbody.innerHTML = "";

 const searchQuery = (document.getElementById("sec-filter-search")?.value || "").toLowerCase();
 const dateQuery = (document.getElementById("sec-filter-date")?.value || "");

 // Secretary filtered letters list
 let letters = getFilteredLettersList();

 // Apply filters
 letters = letters.filter(l => {
 // Search filter
 if (searchQuery) {
 const blob = [l.id, l.subject, l.referringOrg, l.letterNumDate].join(" ").toLowerCase();
 if (!blob.includes(searchQuery)) return false;
 }
 // Date filter
 if (dateQuery) {
 if (l.dateReceived !== dateQuery) return false;
 }
 return true;
 });

 if (letters.length === 0) {
 table.style.display = "none";
 emptyState.style.display = "flex";
 return;
 }

 table.style.display = "";
 emptyState.style.display = "none";

 letters.forEach(letter => {
 const row = tbody.insertRow();
 
 // Status Badge
 let statusBadgeHTML;
 if (letter.stage === "Completed") {
 statusBadgeHTML = `<span class="status-tag tag-completed">${t("stage_completed")}</span>`;
 } else {
 statusBadgeHTML = `<span class="status-tag tag-draft">${t("status_pending")}</span>`;
 }

 // Actions cell
 let actionHTML = `<button class="btn btn-secondary btn-sm" onclick="viewLetterDetails('${letter.id}')">${t("btn_view")}</button>`;
 if (currentUser.permissions.includes("reply_letter")) {
 actionHTML += ` <button class="btn btn-primary btn-sm" onclick="openReplyModal('${letter.id}')">↩ ${t("btn_reply")}</button>`;
 }

 row.innerHTML = `
 <td>${letter.dateReceived}</td>
 <td><strong>${letter.id}</strong></td>
 <td><strong>${letter.subject}</strong></td>
 <td>${letter.referringOrg}</td>
 <td>${statusBadgeHTML}</td>
 <td><div class="actions-cell">${actionHTML}</div></td>
 `;
 });
}

function resetSecretaryInboxFilters() {
 const searchInput = document.getElementById("sec-filter-search");
 const dateInput = document.getElementById("sec-filter-date");
 if (searchInput) searchInput.value = "";
 if (dateInput) dateInput.value = "";
 renderSecretaryInbox();
}

// --- 16. User Registration Logic (System Admin Only) ---
function toggleRegSubjectField() {
 const roleSelect = document.getElementById("reg-user-role");
 const subjectContainer = document.getElementById("reg-subject-container");
 if (roleSelect && subjectContainer) {
 if (roleSelect.value === "secretary") {
 subjectContainer.style.display = "block";
 } else {
 subjectContainer.style.display = "none";
 }
 }
}

function handleUserRegistration(event) {
 event.preventDefault();
 
 const userIdVal = document.getElementById("reg-user-id").value.trim();
 const userNameVal = document.getElementById("reg-user-name").value.trim();
 const userDesignationVal = document.getElementById("reg-user-designation").value.trim();
 const userRoleVal = document.getElementById("reg-user-role").value;
 const userCategoryVal = document.getElementById("reg-user-category").value;
 const isViewer = document.getElementById("reg-user-viewer").checked;
 
 if (!userIdVal || !userNameVal || !userDesignationVal) {
 showToast("Please fill in all required fields!");
 return;
 }
 
 // Calculate permissions
 let userPermissions = [];
 if (userRoleVal === "officer") {
 if (isViewer) {
 userPermissions = ["view_all", "view_dashboard"];
 } else {
 userPermissions = ["create_letter", "edit_letter", "view_all", "view_dashboard"];
 }
 } else if (userRoleVal === "head") {
 userPermissions = ["view_all", "view_dashboard"];
 } else if (userRoleVal === "secretary") {
 userPermissions = ["view_assigned", "reply_letter"];
 }
 
 // Check duplicate ID
 const isDuplicate = 
 SYSTEM_USERS.admin.some(u => u.id.toLowerCase() === userIdVal.toLowerCase()) ||
 SYSTEM_USERS.head.some(u => u.id.toLowerCase() === userIdVal.toLowerCase()) ||
 SYSTEM_USERS.officer.some(u => u.id.toLowerCase() === userIdVal.toLowerCase()) ||
 SYSTEM_USERS.secretary.some(u => u.id.toLowerCase() === userIdVal.toLowerCase());
 
 if (isDuplicate) {
 showToast("Error: User ID already exists!");
 return;
 }
 
 // Create user object
 const newUser = {
 id: userIdVal,
 name: userNameVal,
 designation: userDesignationVal,
 role: userRoleVal,
 permissions: userPermissions
 };
 
 if (userRoleVal === "secretary") {
 newUser.category = userCategoryVal;
 }
 
 // Save custom user to localStorage
 const storedUsers = localStorage.getItem("railway_custom_users");
 let customUsersList = [];
 if (storedUsers) {
 try {
 customUsersList = JSON.parse(storedUsers);
 } catch (e) {
 customUsersList = [];
 }
 }
 
 customUsersList.push(newUser);
 localStorage.setItem("railway_custom_users", JSON.stringify(customUsersList));
 
 // Reload and render
 loadUsersFromStorage();
 populateLoginSelectors();
 renderRegisteredUsersDirectory();
 showToast("User account registered successfully!");
 
 // Reset form
 document.getElementById("user-registration-form").reset();
 toggleRegSubjectField();
}

function renderRegisteredUsersDirectory() {
 const tbody = document.getElementById("registered-users-tbody");
 if (!tbody) return;
 tbody.innerHTML = "";
 
 const allGroups = ["admin", "head", "officer", "secretary"];
 allGroups.forEach(grp => {
 if (SYSTEM_USERS[grp]) {
 SYSTEM_USERS[grp].forEach(user => {
 const row = tbody.insertRow();
 const subject = user.category ? user.category.replace("Additional Secretaries (", "").replace(")", "") : "—";
 
 let permText = user.permissions.join(", ");
 if (user.role === 'officer' && !user.permissions.includes("edit_letter")) {
 permText += " (RestrictedView-Only)";
 }
 
 row.innerHTML = `
 <td><strong>${user.id}</strong></td>
 <td>${user.name}</td>
 <td><span class="role-badge badge-${user.role}" style="text-transform: capitalize;">${user.role}</span></td>
 <td>${subject}</td>
 <td style="font-size:11px; color:var(--text-soft);">${permText}</td>
 `;
 });
 }
 });
}

// ==========================================================================
// SENDING ROUTE CHAIN — Utility to build the visual chain
// ==========================================================================

function buildSendingRouteHTML(letter) {
 const routeNodes = [];

 // Extract creator short ID (e.g. "151" from "Priyangani (151)")
 if (letter.createdBy) {
 const idMatch = letter.createdBy.match(/\(([^)]+)\)/);
 const shortId = idMatch ? idMatch[1] : letter.createdBy;
 routeNodes.push(shortId);
 }

 // Add sendTo destinations with short labels
 if (letter.sendTo && letter.sendTo.length > 0) {
 letter.sendTo.forEach(dest => {
 // Shorten "Additional Secretaries (xxx)" to just the short form
 const shortLabel = shortenRoutingLabel(dest);
 routeNodes.push(shortLabel);
 });
 }

 if (routeNodes.length === 0) {
 return '<span style="color: var(--text-muted); font-style: italic;">—</span>';
 }

 return routeNodes.map((node, i) => {
 const isFirst = i === 0;
 const nodeClass = isFirst ? 'route-node route-node-origin' : 'route-node route-node-dest';
 const arrow = i < routeNodes.length - 1 ? '<span class="route-arrow">→</span>' : '';
 return `<span class="${nodeClass}">${node}</span>${arrow}`;
 }).join('');
}

function shortenRoutingLabel(label) {
 // Map long routing channel names to short abbreviations
 const shortMap = {
 'GRM': 'GRM',
 'PSC': 'PSC',
 'PUBAD': 'PUBAD',
 'Other': t("route_abbr_other"),
 'Pension Department': t("route_abbr_pension"),
 'DMS': 'DMS',
 'Additional Directors': t("route_abbr_add_dir"),
 'Additional Secretaries (Administration)': t("route_abbr_sec_admin"),
 'Additional Secretaries (Development)': t("route_abbr_sec_dev"),
 'Additional Secretaries (Engineering)': t("route_abbr_sec_eng"),
 'Additional Secretaries (SLAcS-Special)': t("route_abbr_sec_slacs"),
 'Additional Secretaries (SLAcS - Special)': t("route_abbr_sec_slacs"),
 'Additional Secretaries (SLPS-Special)': t("route_abbr_sec_slps"),
 'Additional Secretaries (SLPS - Special)': t("route_abbr_sec_slps"),
 'Additional Secretaries (Special Projects)': t("route_abbr_sec_special"),
 'Additional Secretaries - Administration': t("route_abbr_sec_admin"),
 'Additional Secretaries - Development': t("route_abbr_sec_dev"),
 'Additional Secretaries - Engineering': t("route_abbr_sec_eng"),
 'Additional Secretaries - SLAcS Special': t("route_abbr_sec_slacs"),
 'Additional Secretaries - SLPS Special': t("route_abbr_sec_slps"),
 'Additional Secretaries - Special Projects': t("route_abbr_sec_special"),
 };
 if (shortMap[label]) return shortMap[label];
 return (typeof routingLabelForLang === "function") ? routingLabelForLang(label) : label;
}


// ==========================================================================
// LETTER EXPORT PAGE — Full Export Functionality
// ==========================================================================

let exportSelectedIds = new Set();

function renderLetterExportPage() {
 const tbody = document.getElementById("export-letters-tbody");
 const emptyState = document.getElementById("export-empty-state");
 if (!tbody) return;
 tbody.innerHTML = "";

 // Gather filter values
 const fromDate = (document.getElementById("export-filter-from")?.value || "");
 const toDate = (document.getElementById("export-filter-to")?.value || "");
 const statusFilter = (document.getElementById("export-filter-status")?.value || "");
 const searchQuery = (document.getElementById("export-filter-search")?.value || "").toLowerCase();

 // Source list filtered by role
 let letters = getFilteredLettersList();

 // Apply filters
 letters = letters.filter(l => {
 // Date range filter
 if (fromDate && l.dateReceived && l.dateReceived < fromDate) return false;
 if (toDate && l.dateReceived && l.dateReceived > toDate) return false;

 // Status filter
 if (statusFilter && l.stage !== statusFilter) return false;

 // Search filter
 if (searchQuery) {
 const blob = [l.id, l.subject, l.referringOrg, l.letterNumDate, l.fileNumber, l.actionTaken, l.createdBy]
 .join(" ").toLowerCase();
 if (!blob.includes(searchQuery)) return false;
 }

 return true;
 });

 if (letters.length === 0) {
 emptyState.style.display = "flex";
 updateExportSelectedCount();
 return;
 }
 emptyState.style.display = "none";

 letters.forEach(letter => {
 const row = tbody.insertRow();
 const isChecked = exportSelectedIds.has(letter.id);

 const stageBadgeClass = letter.stage === 'Draft' ? 'stage-badge badge-draft' : 'stage-badge badge-completed';
 const sendingRouteHTML = buildSendingRouteHTML(letter);
 const actionText = letterTextForLang(letter.actionTaken) || '—';
 const truncatedAction = actionText.length > 60 ? actionText.substring(0, 60) + '…' : actionText;

 row.innerHTML = `
 <td style="text-align:center;">
 <input type="checkbox" class="export-row-checkbox" data-letter-id="${letter.id}" 
 ${isChecked ? 'checked' : ''} onchange="handleExportCheckbox(this)">
 </td>
 <td><strong>${letter.id}</strong></td>
 <td>${letter.dateReceived || '—'}</td>
 <td>${letterTextForLang(letter.referringOrg) || '—'}</td>
 <td><strong>${letterTextForLang(letter.subject)}</strong></td>
 <td><div class="sending-route-chain">${sendingRouteHTML}</div></td>
 <td><span class="${stageBadgeClass}">${stageLabel(letter)}</span></td>
 <td title="${actionText.replace(/"/g, '&quot;')}" style="max-width:200px;">${truncatedAction}</td>
 `;
 });

 updateExportSelectedCount();
}

function handleExportCheckbox(checkbox) {
 const letterId = checkbox.getAttribute("data-letter-id");
 if (checkbox.checked) {
 exportSelectedIds.add(letterId);
 } else {
 exportSelectedIds.delete(letterId);
 }
 updateExportSelectedCount();
}

function toggleExportSelectAll() {
 const selectAll = document.getElementById("export-select-all");
 const checkboxes = document.querySelectorAll(".export-row-checkbox");

 checkboxes.forEach(cb => {
 cb.checked = selectAll.checked;
 const letterId = cb.getAttribute("data-letter-id");
 if (selectAll.checked) {
 exportSelectedIds.add(letterId);
 } else {
 exportSelectedIds.delete(letterId);
 }
 });

 updateExportSelectedCount();
}

function updateExportSelectedCount() {
 const countEl = document.getElementById("export-selected-count");
 if (countEl) {
 const count = exportSelectedIds.size;
 countEl.textContent = count === 1 ? `1 ${t("export_selected_one")}` : `${count} ${t("export_selected")}`;
 }
}

function resetExportFilters() {
 const fields = ["export-filter-from", "export-filter-to", "export-filter-status", "export-filter-search"];
 fields.forEach(id => {
 const el = document.getElementById(id);
 if (el) el.value = "";
 });
 exportSelectedIds.clear();
 const selectAll = document.getElementById("export-select-all");
 if (selectAll) selectAll.checked = false;
 renderLetterExportPage();
 showToast(t("toast_export_reset"));
}

function getSelectedExportLetters() {
 if (exportSelectedIds.size === 0) {
 // If nothing selected, use all visible letters in the table
 const checkboxes = document.querySelectorAll(".export-row-checkbox");
 const visibleIds = [];
 checkboxes.forEach(cb => visibleIds.push(cb.getAttribute("data-letter-id")));
 return lettersDatabase.filter(l => visibleIds.includes(l.id));
 }
 return lettersDatabase.filter(l => exportSelectedIds.has(l.id));
}

// --- CSV Export ---
function exportLettersAsCSV() {
 const letters = getSelectedExportLetters();

 if (letters.length === 0) {
 showToast(t("toast_no_export"));
 return;
 }

 const headers = [
 "Ref ID", "Date Received", "Referring Organization", "Letter No & Date",
 "Subject", "File Number", "Action Taken", "Signature/Approval",
 "Submitted To", "Date Forwarded", "Date File Received", "Date Signed", "Date Mailed", "Submitted By", "Stage", "Reminder Date",
 "Created By", "Sending Route"
 ];

 const rows = letters.map(l => {
 const routeNodes = [];
 if (l.createdBy) {
 const idMatch = l.createdBy.match(/\(([^)]+)\)/);
 routeNodes.push(idMatch ? idMatch[1] : l.createdBy);
 }
 (l.sendTo || []).forEach(dest => {
    const idMatch = dest.match(/\(([^)]+)\)/);
    routeNodes.push(idMatch ? idMatch[1] : shortenRoutingLabel(dest));
  });
 const routeStr = routeNodes.join(' → ');

 return [
 l.id, l.dateReceived || '', l.referringOrg || '', l.letterNumDate || '',
 l.subject || '', l.fileNumber || '', l.actionTaken || '', l.signatureDropdown || '',
 l.submittedTo || '', l.dateForwarded || '', l.dateFileReceived || '', l.dateSigned || '', l.dateMailed || '', (l.sendTo || []).join('; '),
 l.stage || '', l.reminderDate || '', l.createdBy || '', routeStr
 ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
 });

 const csvContent = [headers.join(","), ...rows].join("\n");
 const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
 const url = URL.createObjectURL(blob);
 const link = document.createElement("a");
 link.href = url;
 link.download = `RLMS_Letters_Export_${new Date().toISOString().slice(0,10)}.csv`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);

 showToast(`${t("csv_exported_prefix")} ${letters.length} ${t("csv_exported_suffix")}`);
}

// --- PDF / Print Export ---
function exportLettersAsPDF() {
 const letters = getSelectedExportLetters();

 if (letters.length === 0) {
 showToast(t("toast_no_export"));
 return;
 }

 const printArea = document.getElementById("print-preview-area");

 let tableRows = letters.map(l => {
 const routeNodes = [];
 if (l.createdBy) {
 const idMatch = l.createdBy.match(/\(([^)]+)\)/);
 routeNodes.push(idMatch ? idMatch[1] : l.createdBy);
 }
 (l.sendTo || []).forEach(dest => {
    const idMatch = dest.match(/\(([^)]+)\)/);
    routeNodes.push(idMatch ? idMatch[1] : shortenRoutingLabel(dest));
  });
 const routeStr = routeNodes.join(' → ');

 return `
 <tr>
 <td>${l.id}</td>
 <td>${l.dateReceived || '—'}</td>
 <td>${l.referringOrg || '—'}</td>
 <td>${l.subject || '—'}</td>
 <td>${routeStr}</td>
 <td>${stageLabel(l)}</td>
 <td>${l.actionTaken || '—'}</td>
 </tr>
 `;
 }).join("");

 printArea.innerHTML = `
 <div class="print-header">
 <h1>${t("print_report_h1")}</h1>
 <h2>${t("print_report_title")}</h2>
 <p>${t("print_generated")} ${new Date().toLocaleDateString(currentLang === 'si' ? 'si-LK' : 'en-GB')} | ${t("print_total")} ${letters.length}</p>
 </div>
 <table class="print-table">
 <thead>
 <tr>
 <th>${t("th_ref_id")}</th>
 <th>${t("th_date_received")}</th>
 <th>${t("th_referring_org")}</th>
 <th>${t("th_subject")}</th>
 <th>${t("th_sending_route")}</th>
 <th>${t("th_stage")}</th>
 <th>${t("th_action_taken")}</th>
 </tr>
 </thead>
 <tbody>
 ${tableRows}
 </tbody>
 </table>
 <div class="print-footer">
 <p>${t("print_footer")}</p>
 </div>
 `;

 printArea.style.display = "block";
 window.print();

 // Hide print area after a short delay
 setTimeout(() => {
 printArea.style.display = "none";
 }, 1000);
}

// --- Custom Multi-select Dropdowns for Submitted By & Copies ---
function renderSubmittedByDropdown() {
  const byPanel = document.getElementById("submitted-by-options");
  const copiesPanel = document.getElementById("submitted-copies-options");
  
  if (byPanel) {
    byPanel.innerHTML = ROUTING_CHANNELS.map((ch, idx) => {
      return `
        <div class="multiselect-option" onclick="toggleSubmittedByOption(event, '${ch}')">
          <input type="checkbox" id="chk-by-${idx}" value="${ch}" onclick="event.stopPropagation(); handleSubmittedByCheckboxChange();">
          <label for="chk-by-${idx}" onclick="event.stopPropagation();">${ch}</label>
        </div>
      `;
    }).join("");
  }

  if (copiesPanel) {
    copiesPanel.innerHTML = ROUTING_CHANNELS.map((ch, idx) => {
      return `
        <div class="multiselect-option" onclick="toggleSubmittedCopiesOption(event, '${ch}')">
          <input type="checkbox" id="chk-copies-${idx}" value="${ch}" onclick="event.stopPropagation(); handleSubmittedCopiesCheckboxChange();">
          <label for="chk-copies-${idx}" onclick="event.stopPropagation();">${ch}</label>
        </div>
      `;
    }).join("");
  }
}

function toggleSubmittedByOption(event, ch) {
  if (currentUser && !currentUser.permissions.includes("create_letter")) {
    return;
  }
  const checkbox = Array.from(document.querySelectorAll("#submitted-by-options input[type='checkbox']")).find(chk => chk.value === ch);
  if (checkbox) {
    checkbox.checked = !checkbox.checked;
    handleSubmittedByCheckboxChange();
  }
}

function handleSubmittedByCheckboxChange() {
  const checkboxes = document.querySelectorAll("#submitted-by-options input[type='checkbox']");
  selectedSendTo = [];
  checkboxes.forEach(chk => {
    if (chk.checked) {
      selectedSendTo.push(chk.value);
    }
  });
  checkOtherOptionState();
}

function updateSubmittedByPlaceholder() {
  const placeholder = document.getElementById("submitted-by-placeholder");
  if (!placeholder) return;
  const customVal = document.getElementById("field-other-name") ? document.getElementById("field-other-name").value.trim() : "";
  const displayList = selectedSendTo.map(val => val === "Other" ? (customVal || "Other") : val);
  placeholder.textContent = displayList.join(", ") || t("select_channels");
}

function toggleSubmittedByDropdown(event) {
  event.stopPropagation();
  const panel = document.getElementById("submitted-by-options");
  if (!panel) return;
  const isHidden = panel.style.display === "none";
  panel.style.display = isHidden ? "block" : "none";
  // Close the other panel
  const other = document.getElementById("submitted-copies-options");
  if (other) other.style.display = "none";
}

function toggleSubmittedCopiesOption(event, ch) {
  if (currentUser && !currentUser.permissions.includes("create_letter")) {
    return;
  }
  const checkbox = Array.from(document.querySelectorAll("#submitted-copies-options input[type='checkbox']")).find(chk => chk.value === ch);
  if (checkbox) {
    checkbox.checked = !checkbox.checked;
    handleSubmittedCopiesCheckboxChange();
  }
}

function handleSubmittedCopiesCheckboxChange() {
  const checkboxes = document.querySelectorAll("#submitted-copies-options input[type='checkbox']");
  selectedCcTo = [];
  checkboxes.forEach(chk => {
    if (chk.checked) {
      selectedCcTo.push(chk.value);
    }
  });
  checkOtherOptionState();
}

function updateSubmittedCopiesPlaceholder() {
  const placeholder = document.getElementById("submitted-copies-placeholder");
  if (!placeholder) return;
  const customVal = document.getElementById("field-other-name") ? document.getElementById("field-other-name").value.trim() : "";
  const displayList = selectedCcTo.map(val => val === "Other" ? (customVal || "Other") : val);
  placeholder.textContent = displayList.join(", ") || t("select_cc_channels");
}

function checkOtherOptionState() {
  const hasOther = selectedSendTo.includes("Other") || selectedCcTo.includes("Other");
  const container = document.getElementById("other-name-container");
  const input = document.getElementById("field-other-name");
  
  if (hasOther) {
    if (container && (container.style.display === "none" || !container.style.display)) {
      container.style.display = "grid";
      if (input && !input.value.trim()) {
        setTimeout(() => {
          const customValue = prompt("Please enter the department or user name.");
          if (customValue !== null && customValue.trim()) {
            input.value = customValue.trim();
            updateSubmittedByPlaceholder();
            updateSubmittedCopiesPlaceholder();
          }
        }, 50);
      }
    }
  } else {
    if (container) {
      container.style.display = "none";
    }
    if (input) {
      input.value = "";
    }
  }
  updateSubmittedByPlaceholder();
  updateSubmittedCopiesPlaceholder();
}

function toggleSubmittedCopiesDropdown(event) {
  event.stopPropagation();
  const panel = document.getElementById("submitted-copies-options");
  if (!panel) return;
  const isHidden = panel.style.display === "none";
  panel.style.display = isHidden ? "block" : "none";
  // Close the other panel
  const other = document.getElementById("submitted-by-options");
  if (other) other.style.display = "none";
}

function syncSubmittedByDropdown() {
  // Sync Submitted By
  const byCheckboxes = document.querySelectorAll("#submitted-by-options input[type='checkbox']");
  byCheckboxes.forEach(chk => {
    chk.checked = selectedSendTo.includes(chk.value);
  });
  updateSubmittedByPlaceholder();

  // Sync Submitted Copies
  const copiesCheckboxes = document.querySelectorAll("#submitted-copies-options input[type='checkbox']");
  copiesCheckboxes.forEach(chk => {
    chk.checked = selectedCcTo.includes(chk.value);
  });
  updateSubmittedCopiesPlaceholder();
}

// --- Custom Single-select Dropdown for User Tracking ---
function populateUtUserDropdown() {
  const container = document.getElementById("ut-user-list-container");
  if (!container) return;
  
  container.innerHTML = SYSTEM_USERS.officer.map(u => {
    return `
      <div class="multiselect-option" onclick="handleUtUserSelect('${u.id}', '${u.name}')" style="padding: 6px 10px; font-size: 12px;">
        ${u.name} (${u.id})
      </div>
    `;
  }).join("");
}

function handleUtUserSelect(userId, userName) {
  selectedTrackingUser = userId;
  renderUserTracking(userId);
  closeUtUserDropdown();
}

function toggleUtUserDropdown(event) {
  event.stopPropagation();
  const panel = document.getElementById("ut-user-select-options");
  if (!panel) return;
  const isHidden = panel.style.display === "none";
  panel.style.display = isHidden ? "block" : "none";
  if (isHidden) {
    const searchInput = document.getElementById("ut-user-search-input");
    if (searchInput) {
      searchInput.value = "";
      filterUtUsers({ target: searchInput });
      searchInput.focus();
    }
  }
}

function closeUtUserDropdown() {
  const panel = document.getElementById("ut-user-select-options");
  if (panel) panel.style.display = "none";
}

function filterUtUsers(event) {
  const query = event.target.value.toLowerCase();
  const options = document.querySelectorAll("#ut-user-list-container .multiselect-option");
  options.forEach(opt => {
    const text = opt.textContent.toLowerCase();
    opt.style.display = text.includes(query) ? "flex" : "none";
  });
}

// Document-wide listener to close custom dropdowns on click-outside
document.addEventListener("click", () => {
  const byOptions = document.getElementById("submitted-by-options");
  if (byOptions) byOptions.style.display = "none";
  const copiesOptions = document.getElementById("submitted-copies-options");
  if (copiesOptions) copiesOptions.style.display = "none";
  const utOptions = document.getElementById("ut-user-select-options");
  if (utOptions) utOptions.style.display = "none";
  
  const aiByOptions = document.getElementById("ai-submitted-by-options");
  if (aiByOptions) aiByOptions.style.display = "none";
  const aiCopiesOptions = document.getElementById("ai-submitted-copies-options");
  if (aiCopiesOptions) aiCopiesOptions.style.display = "none";
});


// ==========================================================================
// CUSTOM REMINDER & NO ACTION TAKEN HELPER FUNCTIONS
// ==========================================================================

function getReminderNumberStr(count) {
  const n = count + 1;
  if (currentLang === "si") {
    return String(n);
  }
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  
  // Custom suffix logic
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit === 1 && lastTwo !== 11) return `${n}st`;
  if (lastDigit === 2 && lastTwo !== 12) return `${n}nd`;
  if (lastDigit === 3 && lastTwo !== 13) return `${n}rd`;
  return `${n}th`;
}

function toggleNoActionFields() {
  const checkbox = document.getElementById("inline-no-action-checkbox");
  const container = document.getElementById("no-action-fields-container");
  if (container) {
    container.style.display = checkbox.checked ? "block" : "none";
  }
}

function renderReminderTimelineHTML(letter) {
  let html = "";
  const timelineEvents = [];
  
  if (letter && Array.isArray(letter.reminders)) {
    letter.reminders.forEach(r => {
      if (r) {
        timelineEvents.push({
          type: 'reminder',
          date: r.date || '',
          title: `${r.number || ''} ${t('tl_reminder')}`.trim(),
          addedBy: r.addedBy || t('lbl_system'),
          notes: r.notes || ''
        });
      }
    });
  }
  
  if (letter && Array.isArray(letter.noActionHistory)) {
    letter.noActionHistory.forEach(h => {
      if (h) {
        timelineEvents.push({
          type: 'no-action',
          date: h.dateMarked || '',
          title: h.marked ? t('tl_no_action_marked') : t('tl_no_action_cleared'),
          addedBy: h.addedBy || t('lbl_system'),
          notes: h.reason || ''
        });
      }
    });
  }
  
  timelineEvents.sort((a, b) => {
    const da = a.date ? new Date(a.date) : new Date(0);
    const db = b.date ? new Date(b.date) : new Date(0);
    return da - db;
  });
  
  if (timelineEvents.length === 0) {
    return `<div style="font-size: 11px; color: var(--text-muted); font-style: italic; padding: 10px; background: var(--bg-card-alt); border-radius: 6px;">${t('tl_empty')}</div>`;
  }
  
  html = `<div class="timeline-history-list" style="display: flex; flex-direction: column; gap: 8px;">`;
  timelineEvents.forEach(evt => {
    const iconColor = evt.type === 'no-action' ? '#ef4444' : 'var(--railway-blue)';
    const bgLight = evt.type === 'no-action' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(14, 116, 144, 0.08)';
    const borderCol = evt.type === 'no-action' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(14, 116, 144, 0.2)';
    
    html += `
      <div style="background: ${bgLight}; border: 1px solid ${borderCol}; border-radius: 6px; padding: 10px; font-size: 12px; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--text-main);">
          <span><span style="color: ${iconColor}; margin-right: 5px;">●</span>${evt.title}</span>
          <span style="font-size: 11px; color: var(--text-soft);">${evt.date || '-'}</span>
        </div>
        <div style="color: var(--text-soft); font-size: 11px; display: flex; justify-content: space-between; margin-top: 2px;">
          <span>${t('tl_added_by')} ${evt.addedBy}</span>
        </div>
        ${evt.notes ? `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed ${borderCol}; color: var(--text-main); font-style: italic; font-size: 11px;">"${evt.notes}"</div>` : ''}
      </div>
    `;
  });
  html += `</div>`;
  
  return html;
}

// ==========================================================================
// OPTION 02 - AI LETTER SCANNING & ROUTING CONTROLLERS
// ==========================================================================
let aiActiveAttachedPdf = "";
let selectedAiSendTo = [];
let selectedAiCcTo = [];

// --- Custom Multi-select Dropdowns for Option 02 (Add letter option two) ---
function renderAiSubmittedByDropdown() {
  const byPanel = document.getElementById("ai-submitted-by-options");
  const copiesPanel = document.getElementById("ai-submitted-copies-options");
  
  if (byPanel) {
    byPanel.innerHTML = ROUTING_CHANNELS.map((ch, idx) => {
      return `
        <div class="multiselect-option" onclick="toggleAiSubmittedByOption(event, '${ch}')">
          <input type="checkbox" id="ai-chk-by-${idx}" value="${ch}" onclick="event.stopPropagation(); handleAiSubmittedByCheckboxChange();">
          <label for="ai-chk-by-${idx}" onclick="event.stopPropagation();">${ch}</label>
        </div>
      `;
    }).join("");
  }

  if (copiesPanel) {
    copiesPanel.innerHTML = ROUTING_CHANNELS.map((ch, idx) => {
      return `
        <div class="multiselect-option" onclick="toggleAiSubmittedCopiesOption(event, '${ch}')">
          <input type="checkbox" id="ai-chk-copies-${idx}" value="${ch}" onclick="event.stopPropagation(); handleAiSubmittedCopiesCheckboxChange();">
          <label for="ai-chk-copies-${idx}" onclick="event.stopPropagation();">${ch}</label>
        </div>
      `;
    }).join("");
  }
}

function toggleAiSubmittedByDropdown(event) {
  event.stopPropagation();
  const panel = document.getElementById("ai-submitted-by-options");
  if (!panel) return;
  const isHidden = panel.style.display === "none";
  panel.style.display = isHidden ? "block" : "none";
  // Close the other panel
  const other = document.getElementById("ai-submitted-copies-options");
  if (other) other.style.display = "none";
}

function toggleAiSubmittedCopiesDropdown(event) {
  event.stopPropagation();
  const panel = document.getElementById("ai-submitted-copies-options");
  if (!panel) return;
  const isHidden = panel.style.display === "none";
  panel.style.display = isHidden ? "block" : "none";
  // Close the other panel
  const other = document.getElementById("ai-submitted-by-options");
  if (other) other.style.display = "none";
}

function toggleAiSubmittedByOption(event, ch) {
  if (currentUser && !currentUser.permissions.includes("create_letter")) {
    return;
  }
  const checkbox = Array.from(document.querySelectorAll("#ai-submitted-by-options input[type='checkbox']")).find(chk => chk.value === ch);
  if (checkbox) {
    checkbox.checked = !checkbox.checked;
    handleAiSubmittedByCheckboxChange();
  }
}

function toggleAiSubmittedCopiesOption(event, ch) {
  if (currentUser && !currentUser.permissions.includes("create_letter")) {
    return;
  }
  const checkbox = Array.from(document.querySelectorAll("#ai-submitted-copies-options input[type='checkbox']")).find(chk => chk.value === ch);
  if (checkbox) {
    checkbox.checked = !checkbox.checked;
    handleAiSubmittedCopiesCheckboxChange();
  }
}

function handleAiSubmittedByCheckboxChange() {
  const checkboxes = document.querySelectorAll("#ai-submitted-by-options input[type='checkbox']");
  selectedAiSendTo = [];
  checkboxes.forEach(chk => {
    if (chk.checked) {
      selectedAiSendTo.push(chk.value);
    }
  });
  checkAiOtherOptionState();
}

function handleAiSubmittedCopiesCheckboxChange() {
  const checkboxes = document.querySelectorAll("#ai-submitted-copies-options input[type='checkbox']");
  selectedAiCcTo = [];
  checkboxes.forEach(chk => {
    if (chk.checked) {
      selectedAiCcTo.push(chk.value);
    }
  });
  checkAiOtherOptionState();
}

function updateAiSubmittedByPlaceholder() {
  const placeholder = document.getElementById("ai-submitted-by-placeholder");
  if (!placeholder) return;
  const customVal = document.getElementById("ai-field-recipient-other") ? document.getElementById("ai-field-recipient-other").value.trim() : "";
  const displayList = selectedAiSendTo.map(val => val === "Other" ? (customVal || "Other") : val);
  placeholder.textContent = displayList.join(", ") || t("select_channels");
}

function updateAiSubmittedCopiesPlaceholder() {
  const placeholder = document.getElementById("ai-submitted-copies-placeholder");
  if (!placeholder) return;
  const customVal = document.getElementById("ai-field-recipient-other") ? document.getElementById("ai-field-recipient-other").value.trim() : "";
  const displayList = selectedAiCcTo.map(val => val === "Other" ? (customVal || "Other") : val);
  placeholder.textContent = displayList.join(", ") || t("select_cc_channels");
}

function checkAiOtherOptionState() {
  const hasOther = selectedAiSendTo.includes("Other") || selectedAiCcTo.includes("Other");
  const container = document.getElementById("ai-recipient-other-container");
  const input = document.getElementById("ai-field-recipient-other");
  
  if (hasOther) {
    if (container && (container.style.display === "none" || !container.style.display)) {
      container.style.display = "flex";
      if (input && !input.value.trim()) {
        setTimeout(() => {
          const customValue = prompt("Please enter the department or user name.");
          if (customValue !== null && customValue.trim()) {
            input.value = customValue.trim();
            updateAiSubmittedByPlaceholder();
            updateAiSubmittedCopiesPlaceholder();
          }
        }, 50);
      }
    }
  } else {
    if (container) {
      container.style.display = "none";
    }
    if (input) {
      input.value = "";
    }
  }
  updateAiSubmittedByPlaceholder();
  updateAiSubmittedCopiesPlaceholder();
}

function syncAiSubmittedByDropdown() {
  // Sync Submitted By
  const byCheckboxes = document.querySelectorAll("#ai-submitted-by-options input[type='checkbox']");
  byCheckboxes.forEach(chk => {
    chk.checked = selectedAiSendTo.includes(chk.value);
  });
  updateAiSubmittedByPlaceholder();

  // Sync Submitted Copies
  const copiesCheckboxes = document.querySelectorAll("#ai-submitted-copies-options input[type='checkbox']");
  copiesCheckboxes.forEach(chk => {
    chk.checked = selectedAiCcTo.includes(chk.value);
  });
  updateAiSubmittedCopiesPlaceholder();
}
function clearAiForm() {
  // Clear inputs
  document.getElementById("ai-field-letter-number").value = "";
  document.getElementById("ai-field-letter-number").placeholder = "Waiting for file upload...";
  document.getElementById("ai-field-letter-date").value = "";
  document.getElementById("ai-field-subject").value = "";
  document.getElementById("ai-field-subject").placeholder = "Waiting for file upload...";
  

  const customRecipient = document.getElementById("ai-field-recipient-other");
  if (customRecipient) customRecipient.value = "";
  
  const customRecipientContainer = document.getElementById("ai-recipient-other-container");
  if (customRecipientContainer) customRecipientContainer.style.display = "none";
  
  document.getElementById("ai-field-reminder-date").value = "";

  selectedAiSendTo = [];
  selectedAiCcTo = [];
  syncAiSubmittedByDropdown();

  // Reset file upload state
  aiActiveAttachedPdf = "";
  document.getElementById("ai-file-upload").value = "";
  
  // Show upload zone, hide progress and preview
  document.getElementById("ai-drag-zone").style.display = "flex";
  document.getElementById("ai-progress-container").style.display = "none";
  document.getElementById("ai-doc-preview-container").style.display = "none";
  document.getElementById("ai-prefilled-notice").style.display = "none";
  
  // Clean mock doc preview text
  document.getElementById("mock-doc-no").textContent = "...";
  document.getElementById("mock-doc-date").textContent = "...";
  document.getElementById("mock-doc-subject").textContent = "...";
}

function clearAiAttachedFile() {
  clearAiForm();
  showToast(t("toast_file_removed"));
}

function handleAiFileUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Hide drag zone, show progress container
    document.getElementById("ai-drag-zone").style.display = "none";
    const progContainer = document.getElementById("ai-progress-container");
    progContainer.style.display = "block";
    
    // Reset steps
    for (let i = 1; i <= 4; i++) {
      const step = document.getElementById(`ocr-step-${i}`);
      step.className = "ocr-step";
      if (currentLang === "si") {
        if (i === 1) step.textContent = "○ ගොනුව උඩුගත වෙමින් පවතී...";
        if (i === 2) step.textContent = "○ OCR තාක්ෂණය මඟින් පෙළ කියවමින් පවතී...";
        if (i === 3) step.textContent = "○ කෘතිම බුද්ධිය මඟින් ව්‍යුහය විශ්ලේෂණය කරයි...";
        if (i === 4) step.textContent = "○ අදාළ ක්ෂේත්‍ර ලබා ගනිමින් පවතී...";
      } else {
        if (i === 1) step.textContent = "○ Uploading scanned document...";
        if (i === 2) step.textContent = "○ Extracting text with layout-aware OCR...";
        if (i === 3) step.textContent = "○ Analyzing structure with AI model...";
        if (i === 4) step.textContent = "○ Extracting targeted fields...";
      }
    }
    
    const fill = document.getElementById("ai-progress-bar-fill");
    const statusText = document.getElementById("ai-progress-status-title");
    
    let step = 1;
    fill.style.width = "0%";
    fill.textContent = "0%";
    statusText.textContent = currentLang === "si" ? "පරිලෝකනය ආරම්භ කරමින්..." : "Starting OCR/AI scanning...";
    
    const interval = setInterval(() => {
      if (step === 1) {
        fill.style.width = "25%";
        fill.textContent = "25%";
        const s = document.getElementById("ocr-step-1");
        s.className = "ocr-step completed";
        s.textContent = (currentLang === "si" ? "✓ ගොනුව සාර්ථකව උඩුගත කරන ලදී" : "✓ Scanned document uploaded successfully");
        const next = document.getElementById("ocr-step-2");
        next.className = "ocr-step active";
        statusText.textContent = currentLang === "si" ? "පෙළ කියවමින්..." : "Running OCR engine...";
        step++;
      } else if (step === 2) {
        fill.style.width = "50%";
        fill.textContent = "50%";
        const s = document.getElementById("ocr-step-2");
        s.className = "ocr-step completed";
        s.textContent = (currentLang === "si" ? "✓ පෙළ හඳුනාගැනීම අවසන්" : "✓ OCR text recognition complete");
        const next = document.getElementById("ocr-step-3");
        next.className = "ocr-step active";
        statusText.textContent = currentLang === "si" ? "කෘතිම බුද්ධි විශ්ලේෂණය..." : "Analyzing text structure...";
        step++;
      } else if (step === 3) {
        fill.style.width = "75%";
        fill.textContent = "75%";
        const s = document.getElementById("ocr-step-3");
        s.className = "ocr-step completed";
        s.textContent = (currentLang === "si" ? "✓ කෘතිම බුද්ධි විශ්ලේෂණය අවසන්" : "✓ AI layout analysis complete");
        const next = document.getElementById("ocr-step-4");
        next.className = "ocr-step active";
        statusText.textContent = currentLang === "si" ? "තොරතුරු ලබා ගනිමින්..." : "Extracting core fields...";
        step++;
      } else if (step === 4) {
        fill.style.width = "100%";
        fill.textContent = "100%";
        const s = document.getElementById("ocr-step-4");
        s.className = "ocr-step completed";
        s.textContent = (currentLang === "si" ? "✓ තොරතුරු ලබා ගැනීම සාර්ථකයි" : "✓ Targeted fields extracted successfully");
        statusText.textContent = currentLang === "si" ? "පරිලෝකනය අවසන්!" : "Ingestion complete!";
        clearInterval(interval);
        
        // Finish simulation and populate form
        setTimeout(() => {
          progContainer.style.display = "none";
          
          // Map file content metadata
          const nameLower = file.name.toLowerCase();
          let extNumber = "";
          let extDate = "";
          let extSubject = "";
          
          if (nameLower.includes("land") || nameLower.includes("allocation")) {
            extNumber = "RAIL/2026/245";
            extDate = "2026-06-26";
            extSubject = currentLang === "si" ? "දුම්රිය ඉඩම් වෙන්කිරීමේ ඉල්ලීම - ශ්‍රී ජයවර්ධනපුර" : "Request for Railway Land Allocation - Sri Jayawardenepura";
          } else if (nameLower.includes("pension") || nameLower.includes("benefit") || nameLower.includes("retire")) {
            extNumber = "PEN/RLY/2026/912";
            extDate = "2026-06-22";
            extSubject = currentLang === "si" ? "දුම්රිය රියදුරන් සඳහා සංශෝධිත විශ්‍රාම වැටුප් ප්‍රතිලාභ සහ හිඟ මුදල් වෙන් කිරීම" : "Revised Pension Benefits and Arrears Allocation for Railway Drivers";
          } else if (nameLower.includes("salary") || nameLower.includes("allowance") || nameLower.includes("audit")) {
            extNumber = "AUD/SLR/2026/044";
            extDate = "2026-06-20";
            extSubject = currentLang === "si" ? "ඉන්ධන සහ විශේෂ ගමන් දීමනා පිළිබඳ විගණන විමසුම" : "Audit Query on Fuel and Special Travel Allowances";
          } else if (nameLower.includes("tender") || nameLower.includes("procurement")) {
            extNumber = "SLR/TEN/2026/1105";
            extDate = "2026-06-25";
            extSubject = currentLang === "si" ? "පන්තියේ ඒ රේල් පීලි මෙට්‍රික් ටොන් 10,000ක් සැපයීම සහ බෙදා හැරීම සඳහා වන ටෙන්ඩරය" : "Tender for Supply and Delivery of 10,000 Metric Tons of Class A Rails";
          } else {
            const rNo = Math.floor(100 + Math.random() * 900);
            extNumber = `SLR/COR/2026/${rNo}`;
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            extDate = `${year}-${month}-${day}`;
            const cleanName = file.name.replace(/\.[^/.]+$/, "");
            extSubject = currentLang === "si" ? `සාමාන්‍ය ලිපි හුවමාරුව: ${cleanName}` : `General Correspondence regarding: ${cleanName}`;
          }
          
          // Populate fields
          document.getElementById("ai-field-letter-number").value = extNumber;
          document.getElementById("ai-field-letter-date").value = extDate;
          document.getElementById("ai-field-subject").value = extSubject;
          
          // Populate mock paper
          document.getElementById("mock-doc-no").textContent = extNumber;
          const dParts = extDate.split("-");
          document.getElementById("mock-doc-date").textContent = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : extDate;
          document.getElementById("mock-doc-subject").textContent = extSubject.toUpperCase();
          
          aiActiveAttachedPdf = file.name;
          document.getElementById("ai-preview-filename").textContent = file.name;
          
          // Show doc preview & prefill notice
          document.getElementById("ai-doc-preview-container").style.display = "block";
          document.getElementById("ai-prefilled-notice").style.display = "flex";
          
          showToast(currentLang === "si" ? "AI පරිලෝකනය අවසන් සහ ක්ෂේත්‍ර පුරවන ලදී" : "AI scan complete. Extracted fields populated.");
        }, 800);
      }
    }, 600);
  }
}

function saveAiLetterData(isDraftSave = true) {
  // Access check
  if (currentUser && !currentUser.permissions.includes("create_letter")) {
    showToast(currentLang === 'si' ? "අවසර නැත: ලිපි ලියාපදිංචි කළ හැක්කේ දෙපාර්තමේන්තු නිලධාරීන්ට පමණි." : "Permission Denied: Only Department Officers can register entries.");
    return;
  }

  // Gather Form Variables
  const letterNumber = document.getElementById("ai-field-letter-number").value.trim();
  const letterDate = document.getElementById("ai-field-letter-date").value;
  const subject = document.getElementById("ai-field-subject").value.trim();
  const recipientOther = document.getElementById("ai-field-recipient-other") ? document.getElementById("ai-field-recipient-other").value.trim() : "";
  const reminderDate = document.getElementById("ai-field-reminder-date").value;

  const stage = isDraftSave ? "Draft" : "Completed";

  // VALIDATION:
  // 1. Require PDF uploaded
  if (!aiActiveAttachedPdf) {
    showToast(currentLang === "si" ? "කරුණාකර පරිලෝකනය කළ ගොනුවක් (PDF/රූපයක්) එක් කරන්න." : "Please upload a scanned document.");
    return;
  }

  // 2. Require at least one recipient selected
  if (selectedAiSendTo.length === 0) {
    showToast(currentLang === "si" ? "කරුණාකර අවම වශයෙන් එක් ලබන්නෙකු තෝරන්න." : "Please select at least one recipient.");
    return;
  }

  // If it's a COMPLETED submission, we require core fields
  if (!isDraftSave) {
    if (!letterNumber || !letterDate || !subject) {
      showToast(currentLang === "si" ? "අනිවාර්ය ක්ෂේත්‍ර හිස්ව පවතී! ලිපි අංකය, දිනය සහ මාතෘකාව අවශ්‍ය වේ." : "Mandatory fields missing! Letter Number, Date, and Subject are required.");
      return;
    }
    if ((selectedAiSendTo.includes("Other") || selectedAiCcTo.includes("Other")) && !recipientOther) {
      showToast(currentLang === "si" ? "කරුණාකර වෙනත් ලබන්නාගේ නම ඇතුළත් කරන්න." : "Please specify the custom recipient name.");
      document.getElementById("ai-field-recipient-other").focus();
      return;
    }
  } else {
    // For draft save, we only require at least some identifier (Letter Number or Subject)
    if (!letterNumber && !subject) {
      showToast(currentLang === "si" ? "කෙටුම්පත සුරැකීමට අවම වශයෙන් මාතෘකාවක් හෝ අංකයක් ඇතුළත් කරන්න." : "Provide at least Subject or Letter Number to save draft.");
      return;
    }
  }

  // Map custom fields
  const referringOrg = "General Manager Office";
  const finalSendTo = selectedAiSendTo.map(val => val === "Other" ? recipientOther : val);
  const finalCcTo = selectedAiCcTo.map(val => val === "Other" ? recipientOther : val);
  const letterNumDate = `${letterNumber} - ${letterDate}`;

  const timestamp = getLocalDateTimeISO();
  const userSign = `${currentUser.name} (${currentUser.id})`;

  // NEW MODE — Generate ID and append
  const nextNum = lettersDatabase.length + 1;
  const newId = `RLY-${String(nextNum).padStart(3, '0')}`;

  const newLetter = {
    id: newId,
    dateReceived: new Date().toISOString().split("T")[0],
    referringOrg,
    letterNumDate,
    subject: subject || "Untitled Subject (Draft)",
    fileNumber: "",
    actionTaken: "Registered via AI Scanning workflow.",
    signatureDropdown: "",
    submittedTo: "",
    dateForwarded: "",
    dateFileReceived: "",
    dateSigned: letterDate,
    dateMailed: "",
    sendTo: [...finalSendTo],
    sendCopies: [...finalCcTo],
    stage,
    reminderDate,
    reminders: reminderDate ? [{
      number: "1st",
      date: reminderDate,
      addedBy: userSign,
      notes: "Set on initial registration via AI scanning.",
      timestamp: timestamp
    }] : [],
    noActionHistory: [],
    isNoActionTaken: false,
    pdfName: aiActiveAttachedPdf,
    createdBy: userSign,
    replies: [],
    logs: [
      { user: userSign, action: `Created entry via AI Scanning as ${stage}`, date: timestamp }
    ]
  };

  lettersDatabase.unshift(newLetter);
  saveToStorage();
  
  showToast(currentLang === "si" ? `ලිපිය සාර්ථකව ලියාපදිංචි කරන ලදී. යොමු අංකය: ${newId}` : `Letter registered successfully. Ref ID: ${newId}`);

  // Clear form and navigate to Ledger
  clearAiForm();
  navigateToPage("ledger");
}

