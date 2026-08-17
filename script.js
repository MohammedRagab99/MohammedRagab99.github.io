const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", () => {
  renderExperience();
  renderExpertise();
  renderProjects("all");
  renderCertificates("all");
  renderResearch();
  renderSkills();
  setupNavigation();
  setupTheme();
  setupFilters();
  setupModal();
  setupReveal();
  setupScrollUI();
  setupYear();
  setupStats();
});

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
          ? `<img src="${item.image}" alt="${escapeAttr(item.title)}" loading="lazy" onerror="this.remove(); this.parentElement.insertAdjacentHTML('beforeend','<div class=&quot;placeholder&quot;>Add project image in assets/images/projects/</div>');">`
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
             onerror="this.remove(); this.parentElement.insertAdjacentHTML('beforeend','<div class=&quot;placeholder&quot;>Add certificate image:<br>${escapeHtml(item.image)}</div>');">
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

function setupFilters() {
  $$(".filter[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter[data-filter]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProjects(btn.dataset.filter);
    });
  });

  $$(".filter[data-cert-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter[data-cert-filter]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCertificates(btn.dataset.certFilter);
    });
  });
}

function setupNavigation() {
  const menuButton = $("#menuButton");
  const mobileNav = $("#mobileNav");
  menuButton.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  $$("#mobileNav a").forEach(a => a.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));
}

function setupTheme() {
  const toggle = $("#themeToggle");
  const stored = localStorage.getItem("mr-theme");
  if (stored === "light") document.body.classList.add("light-theme");
  updateThemeIcon();

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    localStorage.setItem("mr-theme", document.body.classList.contains("light-theme") ? "light" : "dark");
    updateThemeIcon();
  });

  function updateThemeIcon() {
    toggle.textContent = document.body.classList.contains("light-theme") ? "☀" : "☾";
  }
}

function setupModal() {
  const modal = $("#certificateModal");
  const close = $("#modalClose");
  close.addEventListener("click", () => modal.close());
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

function setupReveal() {
  observeNewReveals();
}

let revealObserver;
function observeNewReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          const fills = entry.target.querySelectorAll?.(".skill-fill") || [];
          fills.forEach(fill => fill.style.width = `${fill.dataset.value}%`);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
  }
  $$(".reveal:not(.show)").forEach(el => revealObserver.observe(el));

  // Make all bars visible when their parent is not inside a reveal wrapper.
  $$(".skill-fill").forEach(fill => {
    const parent = fill.closest(".skill-row");
    if (parent && parent.classList.contains("show")) fill.style.width = `${fill.dataset.value}%`;
  });
}

function setupScrollUI() {
  const progress = $("#scrollProgress");
  const header = $("#siteHeader");
  const top = $("#backToTop");

  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${(window.scrollY / Math.max(max, 1)) * 100}%`;
    header.classList.toggle("scrolled", window.scrollY > 8);
    top.classList.toggle("visible", window.scrollY > 650);
  }, { passive: true });

  top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function setupYear() {
  $("#currentYear").textContent = new Date().getFullYear();
}

function setupStats() {
  $("#statYears").textContent = portfolioData.profile.yearsIndustry;
  $("#statProjects").textContent = portfolioData.profile.projects;
  $("#statSkills").textContent = portfolioData.profile.skills;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(value) { return escapeHtml(value); }
