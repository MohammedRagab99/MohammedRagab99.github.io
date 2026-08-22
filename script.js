/* =========================================================
   RAGABVERSE — Consolidated Script
   Handles all dynamic rendering, navigation, theme, filters,
   modal, scroll UI, animations, and enhanced features.
   Fully corrected & improved.
========================================================= */
console.log(typeof portfolioData);
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", () => {
  // Render dynamic content
  renderExperience();
  renderExpertise();
  renderProjects("all");
  renderCertificates("all");
  renderResearch();
  renderSkills();
  renderMachinery("all");
  renderOverhaul();
  renderUpwork();

  // Setup UI features
  setupTheme();
  setupNavigation();
  setupFilters();
  setupModal();
  setupActiveNav();
  setupReveal();
  setupScrollUI();
  setupCursorGlow();
  setupYear();
  setupStats();          // animated counters

  // Setup enhanced features
  setupToast();
  setupGlobalSearch();
  setupContactForm();
  setupCharts();
  setupCopyEmail();
  setupKeyboardShortcuts();

  // Initialise the interactive schematic dashboard
  initSchematicDashboard();

  // Render additional sections if they exist
  renderAchievements();
  renderCareerInterests();
  renderGitHubRepos();
});

/* ---------- Data Rendering ---------- */

function renderExperience() {
  const root = $("#experienceList");
  if (!root) return;
  root.innerHTML = portfolioData.experience.map(item => `
    <article class="timeline-item reveal">
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="timeline-top">
          <h3>${escapeHtml(item.role)}</h3>
          <span class="timeline-date">${escapeHtml(item.date)}</span>
        </div>
        <div class="timeline-company">${escapeHtml(item.company)}</div>
        <ul>${item.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
      </div>
    </article>
  `).join("");
  observeNewReveals();
}

function renderExpertise() {
  const root = $("#expertiseGrid");
  if (!root) return;
  root.innerHTML = portfolioData.expertise.map(item => `
    <article class="expertise-card reveal">
      <div class="expertise-icon">${item.icon}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `).join("");
  observeNewReveals();
}

function renderProjects(filter = "all") {
  const root = $("#projectsGrid");
  if (!root) return;
  const items = portfolioData.projects.filter(p => filter === "all" || p.category === filter);
  root.innerHTML = items.map(item => `
    <article class="project-card reveal">
      <div class="project-image">
        ${item.image
          ? `<img src="${item.image}" alt="${escapeAttr(item.title)}" loading="lazy" onerror="handleImageError(this, 'project')">`
          : `<div class="placeholder">Add project image in assets/images/projects/</div>`}
      </div>
      <div class="project-body">
        <div class="project-tag">${escapeHtml(item.tag)}</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        <div class="project-links">
          ${item.repo ? `<a href="${item.repo}" target="_blank" rel="noopener">Open repository ↗</a>` : ""}
        </div>
      </div>
    </article>
  `).join("");
  observeNewReveals();
}

function renderCertificates(filter = "all") {
  const root = $("#certificatesGrid");
  if (!root) return;
  const items = portfolioData.certificates.filter(c => filter === "all" || c.category === filter);
  root.innerHTML = items.map((item, index) => {
    const fallback = escapeAttr(item.image);
    return `
      <article class="certificate-card reveal" data-index="${portfolioData.certificates.indexOf(item)}">
        <div class="certificate-thumb">
          <img src="${item.image}" alt="${escapeAttr(item.title)}" loading="lazy"
               data-fallback="${fallback}" onerror="handleImageError(this, 'certificate')">
        </div>
        <div class="certificate-body">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.provider)}</p>
          <div class="certificate-meta"><span>${escapeHtml(item.year)}</span><span>VIEW ↗</span></div>
        </div>
      </article>
    `;
  }).join("");

  $$(".certificate-card", root).forEach(card => {
    card.addEventListener("click", () => openCertificate(Number(card.dataset.index)));
  });
  observeNewReveals();
}

function renderResearch() {
  const r = portfolioData.research;
  const root = $("#researchContent");
  if (!root) return;
  root.innerHTML = `
    <p><strong>${escapeHtml(r.title)}</strong></p>
    <p>${escapeHtml(r.intro)}</p>
    <ul class="research-list">
      ${r.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}
    </ul>
    <div class="quick-links">
      ${r.links.map(link => `<a href="${link.url}" target="_blank" rel="noopener">${escapeHtml(link.label)} →</a>`).join("")}
    </div>
  `;
}

function renderSkills() {
  const barsRoot = $("#skillBars");
  if (barsRoot) {
    barsRoot.innerHTML = portfolioData.skills.map(s => `
      <div class="skill-row reveal">
        <div class="skill-head"><span>${escapeHtml(s.name)}</span><span>${s.value}%</span></div>
        <div class="skill-bar"><div class="skill-fill" data-value="${s.value}"></div></div>
      </div>
    `).join("");
  }

  const toolsRoot = $("#toolCloud");
  if (toolsRoot) {
    toolsRoot.innerHTML = portfolioData.tools
      .map(t => `<span class="tool">${escapeHtml(t)}</span>`)
      .join("");
  }
  observeNewReveals();
}

function renderMachinery(filter = "all") {
  const root = document.getElementById("machineryGrid");
  if (!root) return;

  const machinery = portfolioData.machinery || [];
  const items = machinery.filter(m => filter === "all" || m.category === filter);

  root.innerHTML = items.map(item => `
    <div class="machinery-card reveal">
      <span class="machinery-icon">${getMachineryIcon(item.category)}</span>
      <div class="machinery-name">${escapeHtml(item.name)}</div>
      <div class="machinery-family">${escapeHtml(item.family)}</div>
    </div>
  `).join("");

  observeNewReveals();
}

function renderOverhaul() {
  const root = document.getElementById("overhaulTimeline");
  if (!root) return;

  const overhaul = portfolioData.majorOverhaul || [];
  root.innerHTML = overhaul.map((phase, index) => `
    <div class="overhaul-item reveal">
      <div class="overhaul-phase">
        <span class="phase-number">${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(phase.phase)}</h3>
      </div>
      <ul class="overhaul-activities">
        ${phase.activities.map(act => `<li>${escapeHtml(act)}</li>`).join("")}
      </ul>
    </div>
  `).join("");

  observeNewReveals();
}

/* ---------- Theme ---------- */

function setupTheme() {
  const toggle = $("#themeToggle");
  if (!toggle) return;

  const savedTheme = localStorage.getItem("ragabverse-theme") || "dark";
  if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    toggle.setAttribute("aria-pressed", "true");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    toggle.setAttribute("aria-pressed", "false");
  }
  updateThemeIcon();

  toggle.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("ragabverse-theme", "dark");
      toggle.setAttribute("aria-pressed", "false");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("ragabverse-theme", "light");
      toggle.setAttribute("aria-pressed", "true");
    }
    updateThemeIcon();
  });

  function updateThemeIcon() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    toggle.innerHTML = isLight ? "☀" : "☾";
  }
}

/* ---------- Mobile Navigation ---------- */

function setupNavigation() {
  const menuButton = $("#menuButton");
  const mobileNav = $("#mobileNav");
  if (!menuButton || !mobileNav) return;

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.setAttribute("aria-hidden", String(isOpen));
    document.body.classList.toggle("menu-open", !isOpen);
  });

  $$("#mobileNav a").forEach(link => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
    });
  });
}

/* ---------- Active Navigation Highlighting ---------- */

function setupActiveNav() {
  const sections = $$("main section[id]");
  const navLinks = $$(".desktop-nav a");
  if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", active);
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });

  sections.forEach(section => observer.observe(section));
}

/* ---------- Filters ---------- */

function setupFilters() {
  // Project filters
  $$(".filter[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter[data-filter]").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      renderProjects(btn.dataset.filter);
    });
  });

  // Machinery filters
  $$("#machineryFilters .filter").forEach(btn => {
    btn.addEventListener("click", () => {
      $$("#machineryFilters .filter").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      renderMachinery(btn.dataset.machineryFilter);
    });
  });

  // Certificate filters
  $$(".filter[data-cert-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter[data-cert-filter]").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      renderCertificates(btn.dataset.certFilter);
    });
  });
}

/* ---------- Certificate Modal ---------- */

function setupModal() {
  const modal = $("#certificateModal");
  const close = $("#modalClose");
  if (!modal) return;
  close?.addEventListener("click", () => modal.close());
  modal.addEventListener("click", (event) => {
    const rect = modal.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right &&
                   event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) modal.close();
  });
}

function openCertificate(index) {
  const item = portfolioData.certificates[index];
  if (!item) return;
  $("#modalImage").src = item.image;
  $("#modalImage").alt = item.title;
  $("#modalCategory").textContent = item.category.replace("-", " & ");
  $("#modalTitle").textContent = item.title;
  $("#modalProvider").textContent = `${item.provider} · ${item.year}`;
  const modal = $("#certificateModal");
  if (!modal.open) modal.showModal();
}

/* ---------- Image Fallback ---------- */

window.handleImageError = function(img, type) {
  const parent = img.parentElement;
  const fallback = type === 'certificate' ? escapeHtml(img.dataset.fallback || '') : '';
  img.remove();
  if (type === "project") {
    parent.insertAdjacentHTML("beforeend", '<div class="placeholder">Add project image in assets/images/projects/</div>');
  } else if (type === "certificate") {
    parent.insertAdjacentHTML("beforeend", `<div class="placeholder">${fallback || 'Certificate image unavailable'}</div>`);
  }
};

/* ---------- Reveal Animations ---------- */

let revealObserver;

function setupReveal() {
  observeNewReveals();
}

function observeNewReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          const fills = entry.target.querySelectorAll?.(".skill-fill") || [];
          fills.forEach(fill => fill.style.width = `${fill.dataset.value}%`);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }
  $$(".reveal:not(.is-visible)").forEach(el => revealObserver.observe(el));

  $$(".skill-row.is-visible .skill-fill").forEach(fill => {
    fill.style.width = `${fill.dataset.value}%`;
  });
}

/* ---------- Scroll UI ---------- */

function setupScrollUI() {
  const progress = $("#scrollProgress");
  const header = $("#siteHeader");
  const top = $("#backToTop");

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${(window.scrollY / Math.max(max, 1)) * 100}%`;
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    if (top) top.classList.toggle("visible", window.scrollY > 650);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  top?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  onScroll();
}

/* ---------- Cursor Glow (desktop only) ---------- */

function setupCursorGlow() {
  const cursorGlow = $("#cursorGlow");
  if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      cursorGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    }, { passive: true });
  }
}

/* ---------- Footer Year ---------- */

function setupYear() {
  const el = $("#currentYear");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Animated Stats (supports both old & new IDs) ---------- */

function setupStats() {
  const newIds = ["statAssets", "statAvailability", "statTools"];
  const oldIds = ["statYears", "statProjects", "statSkills"];

  let elements = newIds.map(id => document.getElementById(id)).filter(Boolean);
  let suffixes = ["+", "%+", "+"];
  let targets = [15, 95, 20];

  if (elements.length !== 3) {
    elements = oldIds.map(id => document.getElementById(id)).filter(Boolean);
    suffixes = ["+", "+", "+"];
    targets = [
      parseInt(portfolioData.profile.yearsIndustry) || 3,
      parseInt(portfolioData.profile.projects) || 8,
      parseInt(portfolioData.profile.skills) || 20
    ];
  }

  if (elements.length !== 3) return;

  elements.forEach((el, i) => {
    el.textContent = "0";
    el.dataset.target = targets[i];
    el.dataset.suffix = suffixes[i];
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        elements.forEach(el => {
          const target = parseInt(el.dataset.target);
          const suffix = el.dataset.suffix || "";
          let current = 0;
          const step = Math.max(1, Math.round(target / 30));
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(interval);
              el.textContent = current + suffix;
            } else {
              el.textContent = current + suffix;
            }
          }, 30);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsContainer = $(".mini-stats");
  if (statsContainer) observer.observe(statsContainer);
}

/* ---------- Toast System ---------- */

function setupToast() {
  // No setup needed; toast function is global
}

function toast(message, type = 'ok', duration = 3000) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { ok:'✓', err:'✕', warn:'⚠' };
  t.innerHTML = `<span>${icons[type] || '✓'}</span><span>${message}</span>`;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

/* ---------- Copy Email ---------- */

function setupCopyEmail() {
  // No setup needed; copyEmail is bound via HTML onclick
}

function copyEmail() {
  const email = 'mohammed.ragab.hamad@outlook.com';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(email).then(() => toast('Email copied to clipboard', 'ok'));
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = email;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    toast('Email copied', 'ok');
  }
}

/* ---------- Global Search Modal ---------- */

function setupGlobalSearch() {
  const searchBar = document.querySelector('.search-bar');
  if (searchBar) searchBar.addEventListener('click', openSearchModal);
}

function openSearchModal() {
  const modal = document.getElementById('moSearch');
  if (modal) modal.classList.add('open');
  setTimeout(() => document.getElementById('globalSearchInput')?.focus(), 100);
}

function closeSearchModal() {
  const modal = document.getElementById('moSearch');
  if (modal) modal.classList.remove('open');
}

function performGlobalSearch() {
  const input = document.getElementById('globalSearchInput');
  const resultsContainer = document.getElementById('globalSearchResults');
  if (!input || !resultsContainer) return;

  const query = input.value.toLowerCase().trim();
  if (!query) {
    resultsContainer.innerHTML = '<p style="text-align:center;color:var(--muted);padding:24px;font-size:.85rem;">Start typing to search...</p>';
    return;
  }

  const projectMatches = portfolioData.projects.filter(p =>
    p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query) || p.tag.toLowerCase().includes(query)
  );
  const certMatches = portfolioData.certificates.filter(c =>
    c.title.toLowerCase().includes(query) || c.provider.toLowerCase().includes(query) || c.category.toLowerCase().includes(query)
  );
  const skillMatches = portfolioData.skills.filter(s => s.name.toLowerCase().includes(query));
  const toolMatches = portfolioData.tools.filter(t => t.toLowerCase().includes(query));

  const machineryMatches = (portfolioData.machinery || []).filter(m =>
    m.name.toLowerCase().includes(query) || m.family.toLowerCase().includes(query)
  );
  const overhaulMatches = (portfolioData.majorOverhaul || []).filter(phase =>
    phase.phase.toLowerCase().includes(query) || phase.activities.some(a => a.toLowerCase().includes(query))
  );

  let html = '';
  if (projectMatches.length) {
    html += `<div class="sr-label">Projects (${projectMatches.length})</div>`;
    projectMatches.forEach(p => {
      html += `<div class="task-item" onclick="closeSearchModal(); document.getElementById('projects').scrollIntoView({behavior:'smooth'});">
        <div class="ti-body"><div class="ti-title">${escapeHtml(p.title)}</div>
        <div class="ti-meta"><span class="project-tag">${escapeHtml(p.tag)}</span><span>${escapeHtml(p.description)}</span></div></div>
      </div>`;
    });
  }
  if (certMatches.length) {
    html += `<div class="sr-label" style="margin-top:16px;">Certificates (${certMatches.length})</div>`;
    certMatches.forEach(c => {
      html += `<div class="task-item" onclick="closeSearchModal(); document.getElementById('certificates').scrollIntoView({behavior:'smooth'});">
        <div class="ti-body"><div class="ti-title">${escapeHtml(c.title)}</div>
        <div class="ti-meta"><span>${escapeHtml(c.provider)} · ${escapeHtml(c.year)}</span></div></div>
      </div>`;
    });
  }
  if (machineryMatches.length) {
    html += `<div class="sr-label" style="margin-top:16px;">Machinery (${machineryMatches.length})</div>`;
    machineryMatches.forEach(m => {
      html += `<div class="task-item" onclick="closeSearchModal(); document.getElementById('machinery').scrollIntoView({behavior:'smooth'});">
        <div class="ti-body"><div class="ti-title">${escapeHtml(m.name)}</div>
        <div class="ti-meta"><span>${escapeHtml(m.family)}</span></div></div>
      </div>`;
    });
  }
  if (overhaulMatches.length) {
    html += `<div class="sr-label" style="margin-top:16px;">Overhaul Phases (${overhaulMatches.length})</div>`;
    overhaulMatches.forEach(phase => {
      html += `<div class="task-item" onclick="closeSearchModal(); document.getElementById('overhaul').scrollIntoView({behavior:'smooth'});">
        <div class="ti-body"><div class="ti-title">${escapeHtml(phase.phase)}</div></div>
      </div>`;
    });
  }
  if (skillMatches.length || toolMatches.length) {
    html += `<div class="sr-label" style="margin-top:16px;">Skills & Tools</div>`;
    skillMatches.forEach(s => {
      html += `<div class="task-item"><div class="ti-body"><div class="ti-title">${escapeHtml(s.name)} (${s.value}%)</div></div></div>`;
    });
    toolMatches.forEach(t => {
      html += `<div class="task-item"><div class="ti-body"><div class="ti-title">${escapeHtml(t)}</div></div></div>`;
    });
  }

  if (!html) {
    html = `<div class="empty-state"><div class="es-icon">🔍</div><h3>No results</h3><p>Nothing found for "${escapeHtml(query)}"</p></div>`;
  }
  resultsContainer.innerHTML = html;
}

/* ---------- Contact Form Modal ---------- */

function setupContactForm() {
  // No extra setup; functions are global
}

function openContactModal() {
  const modal = document.getElementById('moContact');
  if (modal) modal.classList.add('open');
}

function closeContactModal() {
  const modal = document.getElementById('moContact');
  if (modal) modal.classList.remove('open');
}

function submitContactForm() {
  const nameEl = document.getElementById('contactName');
  const emailEl = document.getElementById('contactEmail');
  const subjectEl = document.getElementById('contactSubject');
  const messageEl = document.getElementById('contactMessage');
  if (!nameEl || !emailEl || !messageEl) return;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const subject = subjectEl ? subjectEl.value.trim() : '';
  const message = messageEl.value.trim();

  if (!name || !email || !message) {
    toast('Please fill in name, email, and message', 'err');
    return;
  }

  const mailto = `mailto:mohammed.ragab.hamad@outlook.com?subject=${encodeURIComponent(subject || 'Portfolio Contact')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
  window.location.href = mailto;
  closeContactModal();
  toast('Your email client should open now', 'ok');
}

/* ---------- Export Word (.docx) ---------- */

async function exportWord() {
  if (typeof docx === 'undefined') {
    toast('Word export library not loaded', 'err');
    return;
  }

  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
  const d = portfolioData;

  function p(text, options = {}) {
    return new Paragraph({
      children: [new TextRun({ text, ...options })],
      ...options.paragraph
    });
  }

  function h(text, level = HeadingLevel.HEADING_1) {
    return new Paragraph({
      text,
      heading: level,
      spacing: { before: 200, after: 100 }
    });
  }

  const children = [];

  children.push(new Paragraph({
    children: [new TextRun({ text: d.profile?.name || "Mohammed Ragab Al‑Attar", bold: true, size: 56 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 50 }
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: d.profile?.title || "Reliability & Rotating Equipment Engineer", size: 36, color: "4A5270" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 }
  }));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: d.profile?.email || "mohammed.ragab.hamad@outlook.com", size: 22, color: "4A5270" }),
      new TextRun({ text: "  |  ", size: 22 }),
      new TextRun({ text: d.profile?.phone || "+20 109 359 7338", size: 22, color: "4A5270" }),
      new TextRun({ text: "  |  ", size: 22 }),
      new TextRun({ text: d.profile?.location || "Cairo, Egypt", size: 22, color: "4A5270" })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 }
  }));

  children.push(h("Experience"));
  d.experience.forEach(exp => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: exp.role, bold: true, size: 24 }),
        new TextRun({ text: "  —  ", size: 24 }),
        new TextRun({ text: exp.company, bold: true, size: 24 })
      ],
      spacing: { before: 120, after: 60 }
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: exp.date, size: 20, color: "4A5270" })],
      spacing: { after: 80 }
    }));
    exp.bullets.forEach(b => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `• ${b}`, size: 22 })],
        indent: { left: 400 },
        spacing: { after: 40 }
      }));
    });
  });

  if (d.education && d.education.length) {
    children.push(h("Education"));
    d.education.forEach(edu => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: edu.degree, bold: true, size: 24 }),
          new TextRun({ text: "  —  ", size: 24 }),
          new TextRun({ text: edu.institution, size: 24 })
        ],
        spacing: { before: 100, after: 40 }
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `${edu.start} – ${edu.end}${edu.location ? ' | ' + edu.location : ''}`, size: 20, color: "4A5270" })],
        spacing: { after: 60 }
      }));
      if (edu.description) {
        children.push(new Paragraph({
          children: [new TextRun({ text: edu.description, size: 22 })],
          indent: { left: 200 },
          spacing: { after: 60 }
        }));
      }
    });
  }

  children.push(h("Research"));
  children.push(new Paragraph({
    children: [new TextRun({ text: d.research.title, bold: true, size: 24 })],
    spacing: { after: 40 }
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: d.research.intro, size: 22 })],
    spacing: { after: 80 }
  }));
  d.research.bullets.forEach(b => {
    children.push(new Paragraph({
      children: [new TextRun({ text: `• ${b}`, size: 22 })],
      indent: { left: 400 },
      spacing: { after: 40 }
    }));
  });

  children.push(h("Selected Projects"));
  d.projects.forEach(proj => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: proj.title, bold: true, size: 24 }),
        new TextRun({ text: `  (${proj.tag})`, size: 20, color: "4A5270" })
      ],
      spacing: { before: 100, after: 40 }
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: proj.description, size: 22 })],
      spacing: { after: 80 }
    }));
  });

  if (d.certificates && d.certificates.length) {
    children.push(h("Certifications"));
    d.certificates.forEach(c => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: "• ", size: 22 }),
          new TextRun({ text: c.title, bold: true, size: 22 }),
          new TextRun({ text: ` — ${c.provider} (${c.year})`, size: 22 })
        ],
        indent: { left: 200 },
        spacing: { after: 40 }
      }));
    });
  }

  children.push(h("Skills"));
  children.push(new Paragraph({
    children: [new TextRun({ text: "Core Competencies: ", bold: true, size: 22 }), new TextRun({ text: d.skills.map(s => s.name).join(' • '), size: 22 })],
    spacing: { after: 60 }
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "Tools & Technologies: ", bold: true, size: 22 }), new TextRun({ text: d.tools.join(', '), size: 22 })],
    spacing: { after: 100 }
  }));

  if (d.awards && d.awards.length) {
    children.push(h("Awards & Honors"));
    d.awards.forEach(a => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: "• ", size: 22 }),
          new TextRun({ text: a.title, bold: true, size: 22 }),
          new TextRun({ text: ` — ${a.issuer} (${a.year})`, size: 22 })
        ],
        indent: { left: 200 },
        spacing: { after: 40 }
      }));
    });
  }

  if (d.languages && d.languages.length) {
    children.push(h("Languages"));
    d.languages.forEach(l => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `• ${l.language}: ${l.proficiency}`, size: 22 })],
        indent: { left: 200 },
        spacing: { after: 40 }
      }));
    });
  }

  if (d.publications && d.publications.length) {
    children.push(h("Publications"));
    d.publications.forEach(pub => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `• ${pub.title} — ${pub.journal} (${pub.year})`, size: 22 })],
        indent: { left: 200 },
        spacing: { after: 40 }
      }));
    });
  }

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  try {
    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Mohammed-Ragab-CV.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Word document downloaded', 'ok');
  } catch (err) {
    toast('Failed to generate DOCX', 'err');
  }
}

/* ---------- Chart.js Visualizations ---------- */

function setupCharts() {
  if (typeof Chart === 'undefined') return;
  setTimeout(initCharts, 300);
}

function initCharts() {
  const getCssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const radarCtx = document.getElementById('skillsRadarChart');
  if (radarCtx && window.Chart && portfolioData.skills) {
    const labels = portfolioData.skills.map(s => s.name.split('(')[0].trim());
    const data = portfolioData.skills.map(s => s.value);
    new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Proficiency',
          data,
          backgroundColor: 'rgba(16,185,129,0.2)',
          borderColor: '#10b981',
          borderWidth: 2,
          pointBackgroundColor: '#10b981',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { display: false },
            grid: { color: 'rgba(0,0,0,0.05)' },
            angleLines: { color: 'rgba(0,0,0,0.05)' },
            pointLabels: {
              color: getCssVar('--text') || '#0f172a',
              font: { size: 10 }
            }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  const barCtx = document.getElementById('projectsBarChart');
  if (barCtx && window.Chart && portfolioData.projects) {
    const categories = [...new Set(portfolioData.projects.map(p => p.category))];
    const counts = categories.map(cat => portfolioData.projects.filter(p => p.category === cat).length);
    const colors = categories.map(cat => {
      if (cat === 'field') return '#ef4444';
      if (cat === 'energy') return '#10b981';
      if (cat === 'computation') return '#3b82f6';
      if (cat === 'design') return '#a855f7';
      return '#f59e0b';
    });
    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
        datasets: [{
          data: counts,
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }
}

/* ---------- Machinery Icon Helper ---------- */

function getMachineryIcon(category) {
  const icons = {
    "pumps": "⚙️",
    "compressors": "🔧",
    "fans-blowers": "🌀",
    "turbines-drivers": "⚡",
    "specialty-auxiliary": "🛠️"
  };
  return icons[category] || "🔩";
}

/* ---------- Keyboard Shortcuts ---------- */

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      openSearchModal();
    }
  });
}

/* ---------- Interactive Schematic Dashboard ---------- */

function initSchematicDashboard() {
  const canvas = document.getElementById('streamCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const nodes = {
    top:    { x: 232, y: 90,  color: 'rgb(16, 185, 129)' },
    left:   { x: 112, y: 210, color: 'rgb(239, 68, 68)' },
    right:  { x: 352, y: 210, color: 'rgb(59, 130, 246)' },
    bottom: { x: 232, y: 330, color: 'rgb(71, 85, 105)' }
  };

  let frame = 0;
  let activeNode = null;

  class Particle {
    constructor(startNode, color) {
      this.start = startNode;
      this.end = nodes.bottom;
      this.color = color;
      this.progress = Math.random();
      this.speed = 0.006 + Math.random() * 0.01;
      this.amplitude = (Math.random() - 0.5) * 16;
    }
    update() {
      this.progress += this.speed;
      if (this.progress >= 1) this.progress = 0;
    }
    draw() {
      const t = this.progress;
      const x = this.start.x + (this.end.x - this.start.x) * t;
      const y = this.start.y + (this.end.y - this.start.y) * t;
      const dx = this.end.x - this.start.x;
      const dy = this.end.y - this.start.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const normX = -dy / len;
      const normY = dx / len;
      const wave = Math.sin(t * Math.PI * 3 + frame * 0.1) * this.amplitude * Math.sin(t * Math.PI);

      ctx.beginPath();
      ctx.arc(x + normX * wave, y + normY * wave, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  const particles = [
    ...Array.from({ length: 15 }, () => new Particle(nodes.top, nodes.top.color)),
    ...Array.from({ length: 15 }, () => new Particle(nodes.left, nodes.left.color)),
    ...Array.from({ length: 15 }, () => new Particle(nodes.right, nodes.right.color))
  ];

  function drawStream(start, end, colorHex, opacity, waveFreq, speed, amp) {
    ctx.beginPath();
    ctx.strokeStyle = colorHex;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = colorHex;

    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const normX = -dy / len;
      const normY = dx / len;
      const envelope = Math.sin(t * Math.PI);
      const wave = Math.sin(t * Math.PI * waveFreq + frame * speed) * amp * envelope;
      const px = x + normX * wave;
      const py = y + normY * wave;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame += 0.04;

    const gAlpha = (!activeNode || activeNode === 'green') ? 0.9 : 0.2;
    drawStream(nodes.top, nodes.bottom, nodes.top.color, gAlpha, 4, 1.2, 8);
    drawStream(nodes.top, nodes.bottom, 'rgba(52, 211, 153, 0.8)', gAlpha * 0.7, 6, -1.5, 12);

    const rAlpha = (!activeNode || activeNode === 'red') ? 0.9 : 0.2;
    drawStream(nodes.left, nodes.bottom, nodes.left.color, rAlpha, 3.5, 1.4, 10);
    drawStream(nodes.left, nodes.bottom, 'rgba(248, 113, 113, 0.8)', rAlpha * 0.7, 5, -1.1, 14);

    const bAlpha = (!activeNode || activeNode === 'blue') ? 0.9 : 0.2;
    drawStream(nodes.right, nodes.bottom, nodes.right.color, bAlpha, 3.5, 1.3, 10);
    drawStream(nodes.right, nodes.bottom, 'rgba(96, 165, 250, 0.8)', bAlpha * 0.7, 5.5, -1.2, 14);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  document.querySelectorAll('.node-group').forEach(node => {
    node.addEventListener('mouseenter', () => {
      activeNode = node.getAttribute('data-node');
    });
    node.addEventListener('mouseleave', () => {
      activeNode = null;
    });
  });

  animate();
}

/* ---------- Additional Renderers ---------- */

function renderAchievements() {
  const root = document.getElementById('achievementsGrid');
  if (!root || !portfolioData.achievements) return;
  root.innerHTML = portfolioData.achievements.map(a => `
    <div class="achievement-card reveal">
      <span class="achievement-icon">${a.icon}</span>
      <h3>${escapeHtml(a.title)}</h3>
      <p>${escapeHtml(a.issuer)} • ${escapeHtml(a.year)}</p>
    </div>
  `).join("");
  observeNewReveals();
}

function renderCareerInterests() {
  const root = document.getElementById('interestsCloud');
  if (!root || !portfolioData.careerInterests) return;
  root.innerHTML = portfolioData.careerInterests.map(i => `
    <span class="interest-pill">${escapeHtml(i)}</span>
  `).join("");
}

function renderGitHubRepos() {
  fetch('https://api.github.com/users/MohammedRagab99/repos?sort=updated&per_page=6')
    .then(res => res.json())
    .then(repos => {
      const root = document.getElementById('githubRepos');
      if (!root) return;
      root.innerHTML = repos.map(repo => `
        <div class="repo-card reveal">
          <a href="${repo.html_url}" target="_blank" rel="noopener">
            <strong>${escapeHtml(repo.name)}</strong>
          </a>
          <span class="repo-lang">${repo.language || 'N/A'}</span>
          <span class="repo-stars">⭐ ${repo.stargazers_count}</span>
        </div>
      `).join("");
      observeNewReveals();
    })
    .catch(() => {
      const root = document.getElementById('githubRepos');
      if (root) root.innerHTML = '<p style="color:var(--muted)">Unable to load repositories.</p>';
    });
}

/* ---------- Engineering Calculators ---------- */

function calcAffinity() {
  const q1 = parseFloat(document.getElementById('affQ1').value) || 0;
  const h1 = parseFloat(document.getElementById('affH1').value) || 0;
  const n1 = parseFloat(document.getElementById('affN1').value) || 1;
  const n2 = parseFloat(document.getElementById('affN2').value) || 1;
  const ratio = n2 / n1;
  const q2 = q1 * ratio;
  const h2 = h1 * ratio * ratio;
  const result = document.getElementById('affResult');
  if (result) result.innerHTML = `New Flow: <strong>${q2.toFixed(2)} m³/h</strong><br>New Head: <strong>${h2.toFixed(2)} m</strong>`;
}

function calcBearing() {
  const rpm = parseFloat(document.getElementById('brgSpeed').value) || 0;
  const bd = parseFloat(document.getElementById('brgBallDia').value) || 0;
  const pd = parseFloat(document.getElementById('brgPitchDia').value) || 1;
  const nb = parseFloat(document.getElementById('brgBallCount').value) || 1;
  const fr = rpm / 60;
  const bpfo = (fr / 2) * nb * (1 - (bd / pd));
  const result = document.getElementById('brgResult');
  if (result) result.innerHTML = `BPFO: <strong>${bpfo.toFixed(2)} Hz</strong>`;
}
function renderUpwork() {
  const u = portfolioData.upwork;
  const root = document.getElementById('upworkContent');
  if (!u || !root) return;

  root.innerHTML = `
    <div class="upwork-grid">
      <div class="upwork-card reveal">
        <div class="upwork-header">
          <div>
            <span class="upwork-verified">✓ ${u.verified ? 'Verified' : 'Unverified'}</span>
            <span class="upwork-status">● ${u.status}</span>
          </div>
          <span class="upwork-rate">${u.hourlyRate}</span>
        </div>
        <h3>${u.name}</h3>
        <p class="upwork-title">${u.title}</p>
        <p class="upwork-summary">${u.summary}</p>
        <div class="upwork-stats">
          <div><strong>${u.totalEarnings}</strong><span>Earnings</span></div>
          <div><strong>${u.totalJobs}</strong><span>Jobs</span></div>
          <div><strong>${u.rating}★</strong><span>Rating</span></div>
        </div>
      </div>

      <div class="upwork-details reveal delay-1">
        <div class="upwork-job">
          <h4>Completed Job</h4>
          <p>${u.recentJob.title}</p>
          <span>${u.recentJob.date} • ${u.recentJob.earnings}</span>
        </div>
        <div class="upwork-skills">
          <h4>Top Skills</h4>
          <div class="upwork-skill-pills">
            ${u.skills.map(skill => `<span class="upwork-skill">${skill}</span>`).join('')}
          </div>
        </div>
        <a class="button button-primary" href="${u.profileUrl}" target="_blank" rel="noopener">
          View Upwork Profile →
        </a>
      </div>
    </div>
  `;
  observeNewReveals();
}

/* ---------- Utility: Escape HTML ---------- */

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
/* ---------- Service Worker Registration ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

/* ---------- Hide Page Loader ---------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    loader.classList.add('hidden');
  }
});
