/* =========================================================
   RAGABVERSE — Consolidated Script
   Handles all dynamic rendering, navigation, theme, filters,
   modal, scroll UI, animations, and enhanced features.
========================================================= */

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
});

/* ---------- Data Rendering ---------- */

function renderExperience() {
  const root = $("#experienceList");
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
}

function renderExpertise() {
  const root = $("#expertiseGrid");
  root.innerHTML = portfolioData.expertise.map(item => `
    <article class="expertise-card reveal">
      <div class="expertise-icon">${item.icon}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `).join("");
}

function renderProjects(filter = "all") {
  const root = $("#projectsGrid");
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
  const items = portfolioData.certificates.filter(c => filter === "all" || c.category === filter);
  root.innerHTML = items.map((item, index) => `
    <article class="certificate-card reveal" data-index="${portfolioData.certificates.indexOf(item)}">
      <div class="certificate-thumb">
        <img src="${item.image}" alt="${escapeAttr(item.title)}" loading="lazy"
             onerror="handleImageError(this, 'certificate', '${escapeAttr(item.image)}')">
      </div>
      <div class="certificate-body">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.provider)}</p>
        <div class="certificate-meta"><span>${escapeHtml(item.year)}</span><span>VIEW ↗</span></div>
      </div>
    </article>
  `).join("");
  $$(".certificate-card", root).forEach(card => {
    card.addEventListener("click", () => openCertificate(Number(card.dataset.index)));
  });
  observeNewReveals();
}

function renderResearch() {
  const r = portfolioData.research;
  $("#researchContent").innerHTML = `
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
  $("#skillBars").innerHTML = portfolioData.skills.map(s => `
    <div class="skill-row reveal">
      <div class="skill-head"><span>${escapeHtml(s.name)}</span><span>${s.value}%</span></div>
      <div class="skill-bar"><div class="skill-fill" data-value="${s.value}"></div></div>
    </div>
  `).join("");

  $("#toolCloud").innerHTML = portfolioData.tools
    .map(t => `<span class="tool">${escapeHtml(t)}</span>`)
    .join("");
}

/* ---------- Theme ---------- */

function setupTheme() {
  const toggle = $("#themeToggle");
  const savedTheme = localStorage.getItem("ragabverse-theme");
  if (savedTheme === "light") {
    document.documentElement.dataset.theme = "light";
    toggle?.setAttribute("aria-pressed", "true");
  }
  updateThemeIcon();

  toggle?.addEventListener("click", () => {
    const isLight = document.documentElement.dataset.theme === "light";
    if (isLight) {
      delete document.documentElement.dataset.theme;
      localStorage.setItem("ragabverse-theme", "dark");
      toggle.setAttribute("aria-pressed", "false");
    } else {
      document.documentElement.dataset.theme = "light";
      localStorage.setItem("ragabverse-theme", "light");
      toggle.setAttribute("aria-pressed", "true");
    }
    updateThemeIcon();
  });

  function updateThemeIcon() {
    if (toggle) {
      toggle.innerHTML = document.documentElement.dataset.theme === "light" ? "☀" : "☾";
    }
  }
}

/* ---------- Mobile Navigation ---------- */

function setupNavigation() {
  const menuButton = $("#menuButton");
  const mobileNav = $("#mobileNav");

  menuButton?.addEventListener("click", () => {
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
  close?.addEventListener("click", () => modal.close());
  modal?.addEventListener("click", (event) => {
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

window.handleImageError = function(img, type, fallbackText = "") {
  const parent = img.parentElement;
  img.remove();
  if (type === "project") {
    parent.insertAdjacentHTML("beforeend", '<div class="placeholder">Add project image in assets/images/projects/</div>');
  } else if (type === "certificate") {
    parent.insertAdjacentHTML("beforeend", `<div class="placeholder">Add certificate image:<br>${fallbackText}</div>`);
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
  $("#currentYear").textContent = new Date().getFullYear();
}

/* ---------- Animated Stats ---------- */

function setupStats() {
  const statYears = $("#statYears");
  const statProjects = $("#statProjects");
  const statSkills = $("#statSkills");
  if (!statYears || !statProjects || !statSkills) return;

  const targetValues = [
    parseInt(portfolioData.profile.yearsIndustry) || 3,
    parseInt(portfolioData.profile.projects) || 8,
    parseInt(portfolioData.profile.skills) || 20
  ];
  const elements = [statYears, statProjects, statSkills];
  elements.forEach((el, i) => {
    el.textContent = "0";
    el.dataset.target = targetValues[i];
    el.dataset.suffix = portfolioData.profile[["yearsIndustry","projects","skills"][i]].includes("+") ? "+" : "";
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

  observer.observe($(".mini-stats"));
}

/* ---------- Toast System ---------- */

function setupToast() {
  // The toastWrap element should be present in HTML
  // No setup needed; functions are global
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
  // Buttons with onclick="copyEmail()" are already bound; no setup needed
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
  const query = document.getElementById('globalSearchInput')?.value.toLowerCase().trim();
  const resultsContainer = document.getElementById('globalSearchResults');
  if (!resultsContainer) return;
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

  let html = '';
  if (projectMatches.length) {
    html += `<div class="sr-label">Projects (${projectMatches.length})</div>`;
    projectMatches.forEach(p => {
      html += `<div class="task-item" onclick="closeSearchModal(); document.getElementById('projects').scrollIntoView({behavior:'smooth'});">
        <div class="ti-body"><div class="ti-title">${p.title}</div>
        <div class="ti-meta"><span class="project-tag">${p.tag}</span><span>${p.description}</span></div></div>
      </div>`;
    });
  }
  if (certMatches.length) {
    html += `<div class="sr-label" style="margin-top:16px;">Certificates (${certMatches.length})</div>`;
    certMatches.forEach(c => {
      html += `<div class="task-item" onclick="closeSearchModal(); document.getElementById('certificates').scrollIntoView({behavior:'smooth'});">
        <div class="ti-body"><div class="ti-title">${c.title}</div>
        <div class="ti-meta"><span>${c.provider} · ${c.year}</span></div></div>
      </div>`;
    });
  }
  if (skillMatches.length || toolMatches.length) {
    html += `<div class="sr-label" style="margin-top:16px;">Skills & Tools</div>`;
    skillMatches.forEach(s => {
      html += `<div class="task-item"><div class="ti-body"><div class="ti-title">${s.name} (${s.value}%)</div></div></div>`;
    });
    toolMatches.forEach(t => {
      html += `<div class="task-item"><div class="ti-body"><div class="ti-title">${t}</div></div></div>`;
    });
  }

  if (!html) {
    html = `<div class="empty-state"><div class="es-icon">🔍</div><h3>No results</h3><p>Nothing found for "${query}"</p></div>`;
  }
  resultsContainer.innerHTML = html;
}

/* ---------- Contact Form Modal ---------- */

function setupContactForm() {
  // No extra setup; functions are global
}

function openContactModal() {
  document.getElementById('moContact').classList.add('open');
}

function closeContactModal() {
  document.getElementById('moContact').classList.remove('open');
}

function submitContactForm() {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  if (!name || !email || !message) {
    toast('Please fill in name, email, and message', 'err');
    return;
  }

  const mailto = `mailto:mohammed.ragab.hamad@outlook.com?subject=${encodeURIComponent(subject || 'Portfolio Contact')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
  window.location.href = mailto;
  closeContactModal();
  toast('Your email client should open now', 'ok');
}

/* ---------- Chart.js Visualizations ---------- */

function setupCharts() {
  // Wait for DOM and Chart.js to be ready
  if (typeof Chart === 'undefined') return;
  setTimeout(initCharts, 300);
}

function initCharts() {
  // Skills Radar Chart
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
            pointLabels: { color: 'var(--text)', font: { size: 10 } }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  // Projects Bar Chart
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

/* ---------- Keyboard Shortcuts ---------- */

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      openSearchModal();
    }
  });
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
function escapeAttr(value) { return escapeHtml(value); }
