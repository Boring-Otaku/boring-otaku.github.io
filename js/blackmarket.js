/* ============================================
   Black Market — GitHub API & Artifact Styling
   ============================================ */

const BlackMarket = (() => {
  let initialized = false;
  let repos = [];
  let currentSort = 'bounty';

  function init() {
    if (initialized) return;
    initialized = true;

    const body = document.getElementById('blackmarket-body');
    if (!body) return;

    body.innerHTML = '';
    const container = Utils.el('div', { className: 'blackmarket-container' });

    // Controls
    const controls = Utils.el('div', { className: 'blackmarket-controls' });
    const sorts = [
      { id: 'bounty', label: '⚔ Bounty' },
      { id: 'updated', label: '🕐 Recent' },
      { id: 'stars', label: '★ Stars' },
    ];

    sorts.forEach(s => {
      const btn = Utils.el('button', {
        className: `blackmarket-sort ${s.id === currentSort ? 'active' : ''}`,
        textContent: s.label,
        'data-sort': s.id,
      });
      btn.addEventListener('click', () => sortRepos(s.id));
      controls.appendChild(btn);
    });

    const countEl = Utils.el('span', { className: 'blackmarket-count', id: 'bm-count', textContent: 'Loading...' });
    controls.appendChild(countEl);

    // List
    const list = Utils.el('div', { className: 'blackmarket-list', id: 'blackmarket-list' });

    container.append(controls, list);
    body.appendChild(container);

    fetchRepos();
  }

  async function fetchRepos() {
    const list = document.getElementById('blackmarket-list');
    const countEl = document.getElementById('bm-count');
    if (!list) return;

    // Show loading
    list.innerHTML = '<div class="chronicle-error"><div class="error-icon">⏳</div><div class="error-text">Scanning dark web...</div></div>';

    try {
      const username = SANCTUARY_CONFIG.github_username;
      if (!username) throw new Error('Set github_username in config.js');

      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`);
      if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
      repos = await res.json();

      // Filter out forks by default (optional)
      repos = repos.filter(r => !r.fork);

      if (countEl) countEl.textContent = `${repos.length} artifacts found`;
      renderRepos();
    } catch (err) {
      list.innerHTML = '';
      const errEl = Utils.el('div', { className: 'chronicle-error' });
      errEl.appendChild(Utils.el('div', { className: 'error-icon', textContent: '⚠' }));
      errEl.appendChild(Utils.el('div', { className: 'error-text', textContent: 'MARKET OFFLINE' }));
      errEl.appendChild(Utils.el('div', { className: 'error-hint', textContent: err.message }));
      list.appendChild(errEl);
    }
  }

  function sortRepos(sortId) {
    currentSort = sortId;
    document.querySelectorAll('.blackmarket-sort').forEach(b => {
      b.classList.toggle('active', b.dataset.sort === sortId);
    });
    renderRepos();
  }

  function renderRepos() {
    const list = document.getElementById('blackmarket-list');
    if (!list) return;
    list.innerHTML = '';

    const sorted = [...repos].sort((a, b) => {
      switch (currentSort) {
        case 'bounty': return Utils.calcBounty(b) - Utils.calcBounty(a);
        case 'stars': return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        case 'updated': return new Date(b.updated_at) - new Date(a.updated_at);
        default: return 0;
      }
    });

    sorted.forEach(repo => {
      list.appendChild(createArtifactItem(repo));
    });
  }

  function createArtifactItem(repo) {
    const bounty = Utils.calcBounty(repo);
    const classification = getClassification(repo);
    const jpSubtitle = getJpSubtitle(repo);
    const langColor = Utils.langColors[repo.language] || Utils.langColors[null];

    const item = Utils.el('div', { className: 'artifact-item' });

    // Accent bar
    item.appendChild(Utils.el('div', { className: `artifact-accent tier-${bounty}` }));

    // Body
    const body = Utils.el('div', { className: 'artifact-body' });

    // Header
    const header = Utils.el('div', { className: 'artifact-header' });
    header.appendChild(Utils.el('span', { className: 'artifact-name', textContent: repo.name }));
    header.appendChild(Utils.el('span', { className: 'artifact-jp', textContent: jpSubtitle }));
    body.appendChild(header);

    // Description
    if (repo.description) {
      body.appendChild(Utils.el('div', { className: 'artifact-desc', textContent: repo.description }));
    }

    // Meta
    const meta = Utils.el('div', { className: 'artifact-meta' });
    meta.appendChild(Utils.el('span', {
      className: `artifact-tag ${classification.cssClass}`,
      textContent: classification.label,
    }));

    if (repo.language) {
      meta.appendChild(Utils.el('span', {
        className: 'artifact-lang',
        innerHTML: `<span class="lang-dot" style="background:${langColor}"></span> ${repo.language}`,
      }));
    }

    if (repo.stargazers_count > 0) {
      meta.appendChild(Utils.el('span', {
        className: 'artifact-stars',
        textContent: `★ ${repo.stargazers_count}`,
      }));
    }

    body.appendChild(meta);
    item.appendChild(body);

    // Bounty section
    const bountyEl = Utils.el('div', { className: 'artifact-bounty' });
    bountyEl.appendChild(Utils.el('span', { className: 'bounty-label', textContent: 'Bounty' }));
    bountyEl.appendChild(Utils.el('span', {
      className: 'bounty-stars',
      textContent: '★'.repeat(bounty) + '☆'.repeat(5 - bounty),
    }));
    const acquireBtn = Utils.el('a', {
      className: 'artifact-acquire',
      textContent: 'Acquire',
      href: repo.html_url,
      target: '_blank',
    });
    acquireBtn.addEventListener('click', (e) => e.stopPropagation());
    bountyEl.appendChild(acquireBtn);
    item.appendChild(bountyEl);

    // Click to open repo
    item.addEventListener('click', () => window.open(repo.html_url, '_blank'));

    return item;
  }

  function getClassification(repo) {
    const override = SANCTUARY_CONFIG.repo_overrides[repo.name];
    if (override?.classification) {
      const classMap = {
        'Forbidden Artifact': 'tag-forbidden',
        'Contraband Tweak': 'tag-contraband',
        'Cursed Script': 'tag-cursed',
        'Dark Relic': 'tag-relic',
      };
      return { label: override.classification, cssClass: classMap[override.classification] || 'tag-cursed' };
    }
    return Utils.classifyRepo(repo);
  }

  function getJpSubtitle(repo) {
    const override = SANCTUARY_CONFIG.repo_overrides[repo.name];
    if (override?.japanese_subtitle) return override.japanese_subtitle;
    return Utils.generateJpSubtitle(repo.name, repo.language);
  }

  return { init };
})();
