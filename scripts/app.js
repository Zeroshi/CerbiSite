// Progress bar
const progress = document.getElementById("progress");
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = scrolled + "%";
});

// Spotlight cursor effect
const spotlight = document.querySelector(".spotlight");
document.addEventListener("mousemove", e => {
  if (!spotlight) return;
  spotlight.style.setProperty("--mx", e.clientX + "px");
  spotlight.style.setProperty("--my", e.clientY + "px");
});

// Theme toggle
const themeBtn = document.getElementById("themeBtn");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
  });
}

// Back to top
const toTop = document.getElementById("toTop");
window.addEventListener("scroll", () => {
  if (!toTop) return;
  if (window.scrollY > 400) toTop.classList.add("show");
  else toTop.classList.remove("show");
});
if (toTop) toTop.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

// Mobile nav
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("primaryNav");
if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", nav.classList.contains("open"));
  });
}

// Copy buttons
document.querySelectorAll("[data-copy]").forEach(btn => {
  btn.addEventListener("click", () => {
    const code = document.querySelector(btn.getAttribute("data-copy"))?.innerText || "";
    navigator.clipboard.writeText(code);
    const old = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = old), 2000);
  });
});

// Command palette
const cmdBtn = document.getElementById("cmdBtn");
const cmdkOverlay = document.getElementById("cmdkOverlay");
const cmdk = document.getElementById("cmdk");
function toggleCmd(open){ if(cmdk && cmdkOverlay){ cmdk.style.display = open ? "block" : "none"; cmdkOverlay.style.display = open ? "block" : "none"; } }
if (cmdBtn) cmdBtn.addEventListener("click", () => toggleCmd(true));
if (cmdkOverlay) cmdkOverlay.addEventListener("click", () => toggleCmd(false));
document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){ e.preventDefault(); toggleCmd(true); }
  if (e.key === "Escape"){ toggleCmd(false); }
});

// Demo switch
const piiSwitch = document.getElementById("piiSwitch");
const inputJson = document.getElementById("inputJson");
const evalJson = document.getElementById("evalJson");
function updateDemo(on){
  if(!inputJson || !evalJson) return;
  const log = { UserId: "12345" };
  if(on) log.SSN = "123-45-6789";
  inputJson.textContent = JSON.stringify(log, null, 2);
  evalJson.textContent = on
    ? JSON.stringify({ violations: ["SSN is forbidden"], status: "non-compliant" }, null, 2)
    : JSON.stringify({ violations: [], status: "ok" }, null, 2);
}
if (piiSwitch){
  piiSwitch.addEventListener("click", () => {
    const isOn = piiSwitch.classList.toggle("on");
    piiSwitch.setAttribute("aria-checked", isOn);
    updateDemo(isOn);
  });
  updateDemo(false);
}
