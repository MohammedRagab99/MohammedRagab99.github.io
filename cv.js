function renderCV() {
  const d = portfolioData;
  let html = `
    <div class="cv-header">
      <h1>${d.profile?.name || "Mohammed Ragab Al‑Attar"}</h1>
      <p>${d.profile?.title || "Reliability & Rotating Equipment Engineer"}</p>
      <p>${d.profile?.email || "mohammed.ragab.hamad@outlook.com"} | ${d.profile?.phone || "+20 109 359 7338"} | ${d.profile?.location || "Cairo, Egypt"}</p>
    </div>
  `;

  // Experience
  html += `<div class="cv-section"><h2>Experience</h2>`;
  d.experience.forEach(exp => {
    html += `
      <div class="cv-item">
        <h3>${exp.role} — ${exp.company}</h3>
        <div class="sub">${exp.date}</div>
        <ul>${exp.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
      </div>`;
  });
  html += `</div>`;

  // Education
  if (d.education) {
    html += `<div class="cv-section"><h2>Education</h2>`;
    d.education.forEach(edu => {
      html += `
        <div class="cv-item">
          <h3>${edu.degree}</h3>
          <div class="sub">${edu.institution} | ${edu.start} – ${edu.end} | ${edu.location || ''}</div>
          ${edu.description ? `<p>${edu.description}</p>` : ''}
        </div>`;
    });
    html += `</div>`;
  }

  // Research
  html += `<div class="cv-section"><h2>Research</h2>
    <div class="cv-item">
      <h3>${d.research.title}</h3>
      <p>${d.research.intro}</p>
      <ul>${d.research.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
    </div>
  </div>`;

  // Projects (selected)
  html += `<div class="cv-section"><h2>Selected Projects</h2>`;
  d.projects.forEach(p => {
    html += `
      <div class="cv-item">
        <h3>${p.title} <span class="sub">(${p.tag})</span></h3>
        <p>${p.description}</p>
      </div>`;
  });
  html += `</div>`;

  // Certifications
  if (d.certificates) {
    html += `<div class="cv-section"><h2>Certifications</h2>`;
    html += `<ul>`;
    d.certificates.forEach(c => {
      html += `<li><strong>${c.title}</strong> — ${c.provider} (${c.year})</li>`;
    });
    html += `</ul></div>`;
  }

  // Skills
  html += `<div class="cv-section"><h2>Skills</h2>
    <p><strong>Core Competencies:</strong> ${d.skills.map(s => s.name).join(' • ')}</p>
    <p><strong>Tools & Technologies:</strong> ${d.tools.join(', ')}</p>
  </div>`;

  // Awards
  if (d.awards) {
    html += `<div class="cv-section"><h2>Awards & Honors</h2><ul>`;
    d.awards.forEach(a => {
      html += `<li><strong>${a.title}</strong> — ${a.issuer} (${a.year})</li>`;
    });
    html += `</ul></div>`;
  }

  // Languages
  if (d.languages) {
    html += `<div class="cv-section"><h2>Languages</h2><ul>`;
    d.languages.forEach(l => {
      html += `<li>${l.language}: ${l.proficiency}</li>`;
    });
    html += `</ul></div>`;
  }

  // Publications (if any)
  if (d.publications && d.publications.length) {
    html += `<div class="cv-section"><h2>Publications</h2><ul>`;
    d.publications.forEach(pub => {
      html += `<li>${pub.title} — ${pub.journal} (${pub.year})</li>`;
    });
    html += `</ul></div>`;
  }

  document.getElementById('cvContent').innerHTML = html;
}

renderCV();
