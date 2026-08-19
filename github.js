fetch('https://api.github.com/users/MohammedRagab99/repos?sort=updated&per_page=6')
  .then(res => res.json())
  .then(repos => {
    const container = document.getElementById('githubRepos');
    if (!container) return;
    container.innerHTML = repos.map(repo => `
      <div class="repo-card">
        <a href="${repo.html_url}" target="_blank">
          <strong>${repo.name}</strong>
        </a>
        <span>${repo.language || 'N/A'}</span>
        <span>⭐ ${repo.stargazers_count}</span>
      </div>
    `).join('');
  });
