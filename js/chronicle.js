/* ============================================
   Chronicle Engine — API Integration & Cards
   ============================================ */

const Chronicle = (() => {
  let initialized = false;
  let currentTab = 'anime';
  let cache = {};

  function init() {
    if (initialized) return;
    initialized = true;

    const body = document.getElementById('chronicle-body');
    if (!body) return;

    body.innerHTML = '';
    const container = Utils.el('div', { className: 'chronicle-container' });

    // Tabs
    const tabs = Utils.el('div', { className: 'chronicle-tabs' });
    const tabData = [
      { id: 'anime', label: 'Anime' },
      { id: 'manga', label: 'Manga' },
      { id: 'games', label: 'Games' },
      { id: 'devbuilds', label: 'Dev Builds' },
    ];

    tabData.forEach(tab => {
      const btn = Utils.el('button', {
        className: `chronicle-tab ${tab.id === currentTab ? 'active' : ''}`,
        textContent: tab.label,
        'data-tab': tab.id,
      });
      btn.addEventListener('click', () => switchTab(tab.id));
      tabs.appendChild(btn);
    });

    // Grid
    const grid = Utils.el('div', { className: 'chronicle-grid', id: 'chronicle-grid' });

    container.append(tabs, grid);
    body.appendChild(container);

    loadTab(currentTab);
  }

  function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.chronicle-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
    loadTab(tabId);
  }

  async function loadTab(tabId) {
    const grid = document.getElementById('chronicle-grid');
    if (!grid) return;

    // Show skeletons
    grid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      grid.appendChild(createSkeleton());
    }

    try {
      let data;
      if (cache[tabId]) {
        data = cache[tabId];
      } else {
        switch (tabId) {
          case 'anime': data = await fetchAnimeList(); break;
          case 'manga': data = await fetchMangaList(); break;
          case 'games': data = await fetchGamesList(); break;
          case 'devbuilds': data = await fetchDevBuilds(); break;
        }
        cache[tabId] = data;
      }

      grid.innerHTML = '';
      if (!data || data.length === 0) {
        grid.appendChild(createError('No data found', 'Configure your accounts in config.js'));
        return;
      }

      data.forEach(item => {
        grid.appendChild(createCard(item));
      });
    } catch (err) {
      grid.innerHTML = '';
      grid.appendChild(createError('CONNECTION LOST', err.message || 'API request failed'));
    }
  }

  async function fetchAnimeList() {
    const username = SANCTUARY_CONFIG.mal_username;
    if (!username) {
      // Try AniList
      if (SANCTUARY_CONFIG.anilist_username) {
        return fetchAniList('ANIME');
      }
      throw new Error('Set mal_username or anilist_username in config.js');
    }

    const res = await fetch(`https://api.jikan.moe/v4/users/${username}/animelist?status=watching&limit=24`);
    if (!res.ok) throw new Error(`Jikan API: ${res.status}`);
    const json = await res.json();

    return (json.data || []).map(entry => ({
      title: entry.anime?.title || 'Unknown',
      titleJp: entry.anime?.title_japanese || '',
      image: entry.anime?.images?.jpg?.image_url || '',
      score: entry.score || 0,
      status: entry.status || 'Watching',
      episodes: `${entry.episodes_watched || 0}/${entry.anime?.episodes || '?'}`,
      type: 'anime',
      malId: entry.anime?.mal_id,
    }));
  }

  async function fetchMangaList() {
    const username = SANCTUARY_CONFIG.mal_username;
    if (!username) {
      if (SANCTUARY_CONFIG.anilist_username) {
        return fetchAniList('MANGA');
      }
      throw new Error('Set mal_username or anilist_username in config.js');
    }

    const res = await fetch(`https://api.jikan.moe/v4/users/${username}/mangalist?status=reading&limit=24`);
    if (!res.ok) throw new Error(`Jikan API: ${res.status}`);
    const json = await res.json();

    return (json.data || []).map(entry => ({
      title: entry.manga?.title || 'Unknown',
      titleJp: entry.manga?.title_japanese || '',
      image: entry.manga?.images?.jpg?.image_url || '',
      score: entry.score || 0,
      status: entry.status || 'Reading',
      chapters: `${entry.chapters_read || 0}/${entry.manga?.chapters || '?'}`,
      type: 'manga',
    }));
  }

  async function fetchAniList(mediaType) {
    const username = SANCTUARY_CONFIG.anilist_username;
    if (!username) throw new Error('Set anilist_username in config.js');

    const query = `
      query ($username: String, $type: MediaType) {
        MediaListCollection(userName: $username, type: $type, status: CURRENT) {
          lists {
            entries {
              score(format: POINT_10)
              progress
              media {
                title { romaji native }
                coverImage { large }
                episodes
                chapters
                status
              }
            }
          }
        }
      }
    `;

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username, type: mediaType } }),
    });

    if (!res.ok) throw new Error(`AniList API: ${res.status}`);
    const json = await res.json();
    const lists = json.data?.MediaListCollection?.lists || [];
    const entries = lists.flatMap(l => l.entries || []);

    return entries.map(entry => ({
      title: entry.media?.title?.romaji || 'Unknown',
      titleJp: entry.media?.title?.native || '',
      image: entry.media?.coverImage?.large || '',
      score: entry.score || 0,
      status: 'Current',
      episodes: mediaType === 'ANIME' ? `${entry.progress || 0}/${entry.media?.episodes || '?'}` : undefined,
      chapters: mediaType === 'MANGA' ? `${entry.progress || 0}/${entry.media?.chapters || '?'}` : undefined,
      type: mediaType.toLowerCase(),
    }));
  }

  async function fetchGamesList() {
    const apiKey = SANCTUARY_CONFIG.steam_api_key;
    const steamId = SANCTUARY_CONFIG.steam_id;
    if (!apiKey || !steamId) {
      throw new Error('Set steam_api_key and steam_id in config.js');
    }

    // Note: Steam API may have CORS issues from browser.
    // A CORS proxy or Cloudflare Worker would be needed in production.
    try {
      const res = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`);
      if (!res.ok) throw new Error(`Steam API: ${res.status}`);
      const json = await res.json();
      const games = (json.response?.games || [])
        .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
        .slice(0, 24);

      return games.map(g => ({
        title: g.name || 'Unknown',
        titleJp: '',
        image: `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`,
        score: 0,
        status: g.playtime_2weeks ? 'Playing' : 'Owned',
        playtime: `${Math.round((g.playtime_forever || 0) / 60)}h`,
        type: 'game',
      }));
    } catch (e) {
      throw new Error('Steam API unavailable (CORS). Use a proxy or Cloudflare Worker.');
    }
  }

  async function fetchDevBuilds() {
    // Reuse GitHub data from Black Market
    const username = SANCTUARY_CONFIG.github_username;
    if (!username) throw new Error('Set github_username in config.js');

    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`);
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    const repos = await res.json();

    return repos.map(repo => ({
      title: repo.name,
      titleJp: Utils.generateJpSubtitle(repo.name, repo.language),
      image: '',
      score: repo.stargazers_count || 0,
      status: repo.archived ? 'Archived' : 'Active',
      language: repo.language,
      type: 'dev',
      url: repo.html_url,
    }));
  }

  function getRarity(score) {
    if (score >= 10) return { label: 'SSR', css: 'ssr' };
    if (score >= 8) return { label: 'SR', css: 'sr' };
    if (score >= 6) return { label: 'R', css: 'r' };
    return { label: 'N', css: 'n' };
  }

  function createCard(item) {
    const rarity = getRarity(item.score);
    const card = Utils.el('div', {
      className: `chronicle-card rarity-${rarity.css}`,
    });

    // Cover image
    if (item.image) {
      const img = Utils.el('img', {
        className: 'card-cover',
        src: item.image,
        alt: item.title,
        loading: 'lazy',
      });
      img.onerror = () => { img.style.display = 'none'; };
      card.appendChild(img);
    } else {
      // Placeholder cover for dev builds
      const placeholder = Utils.el('div', {
        className: 'card-cover',
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          color: 'var(--violet-dim)',
          background: 'var(--bg-surface)',
        },
        textContent: item.type === 'dev' ? '⚙️' : '📦',
      });
      card.appendChild(placeholder);
    }

    // Rarity badge
    card.appendChild(Utils.el('span', {
      className: `card-rarity ${rarity.css}`,
      textContent: rarity.label,
    }));

    // Info
    const info = Utils.el('div', { className: 'card-info' });
    info.appendChild(Utils.el('div', { className: 'card-title', textContent: item.title }));
    if (item.titleJp) {
      info.appendChild(Utils.el('div', { className: 'card-title-jp', textContent: item.titleJp }));
    }

    const stats = Utils.el('div', { className: 'card-stats' });
    if (item.score > 0) {
      stats.appendChild(Utils.el('span', {
        className: 'card-stat card-score',
        textContent: `★ ${item.score}`,
      }));
    }
    if (item.episodes) {
      stats.appendChild(Utils.el('span', {
        className: 'card-stat',
        innerHTML: `EP <span class="card-stat-value">${item.episodes}</span>`,
      }));
    }
    if (item.chapters) {
      stats.appendChild(Utils.el('span', {
        className: 'card-stat',
        innerHTML: `CH <span class="card-stat-value">${item.chapters}</span>`,
      }));
    }
    if (item.playtime) {
      stats.appendChild(Utils.el('span', {
        className: 'card-stat',
        innerHTML: `⏱ <span class="card-stat-value">${item.playtime}</span>`,
      }));
    }
    if (item.language) {
      stats.appendChild(Utils.el('span', {
        className: 'card-stat',
        innerHTML: `<span class="lang-dot" style="background:${Utils.langColors[item.language] || '#666'}"></span> ${item.language}`,
      }));
    }

    info.appendChild(stats);
    card.appendChild(info);

    // Hover detail overlay with stat radar
    const overlay = Utils.el('div', { className: 'card-detail-overlay' });

    // Stat radar canvas
    const radarCanvas = Utils.el('canvas', {
      className: 'stat-radar',
      width: '120',
      height: '120',
    });
    overlay.appendChild(radarCanvas);

    // Draw radar on hover
    card.addEventListener('mouseenter', () => {
      drawStatRadar(radarCanvas, item);
    });

    // Flavor stats
    const flavorStats = generateFlavorStats(item);
    const flavorEl = Utils.el('div', { className: 'detail-flavor', innerHTML: flavorStats });
    overlay.appendChild(flavorEl);

    card.appendChild(overlay);

    // Click to open URL
    if (item.url) {
      card.addEventListener('click', () => window.open(item.url, '_blank'));
    }

    return card;
  }

  function drawStatRadar(canvas, item) {
    const ctx = canvas.getContext('2d');
    const cx = 60, cy = 60, r = 45;
    const stats = item.type === 'dev' ? [
      { label: 'Code', val: Utils.clamp(item.score * 10, 10, 100) },
      { label: 'Docs', val: Utils.randInt(20, 80) },
      { label: 'Stars', val: Utils.clamp(item.score * 20, 10, 100) },
      { label: 'Maint', val: Utils.randInt(30, 90) },
      { label: 'Fun', val: Utils.randInt(50, 100) },
      { label: 'Chaos', val: Utils.randInt(40, 100) },
    ] : [
      { label: 'Story', val: Utils.clamp(item.score * 10 + Utils.randInt(-10, 10), 10, 100) },
      { label: 'Art', val: Utils.clamp(item.score * 10 + Utils.randInt(-15, 15), 10, 100) },
      { label: 'Sound', val: Utils.clamp(item.score * 10 + Utils.randInt(-10, 10), 10, 100) },
      { label: 'Chars', val: Utils.clamp(item.score * 10 + Utils.randInt(-10, 15), 10, 100) },
      { label: 'Joy', val: Utils.clamp(item.score * 10 + Utils.randInt(-5, 20), 10, 100) },
      { label: 'Hype', val: Utils.randInt(40, 100) },
    ];

    ctx.clearRect(0, 0, 120, 120);
    const n = stats.length;

    // Draw hexagon outlines
    [1, 0.66, 0.33].forEach(scale => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        const x = cx + Math.cos(angle) * r * scale;
        const y = cy + Math.sin(angle) * r * scale;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Draw data polygon
    ctx.beginPath();
    stats.forEach((stat, i) => {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      const val = stat.val / 100;
      const x = cx + Math.cos(angle) * r * val;
      const y = cy + Math.sin(angle) * r * val;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw dots and labels
    stats.forEach((stat, i) => {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      const val = stat.val / 100;
      const x = cx + Math.cos(angle) * r * val;
      const y = cy + Math.sin(angle) * r * val;

      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#8b5cf6';
      ctx.fill();

      // Label
      const lx = cx + Math.cos(angle) * (r + 12);
      const ly = cy + Math.sin(angle) * (r + 12);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stat.label, lx, ly);
    });
  }

  function generateFlavorStats(item) {
    const flavors = [
      `Caffeine Level: <span>${Utils.pick(['EX', 'S+', 'A', 'MAX', 'OVER 9000'])}</span>`,
      `Sanity: <span>${Utils.randInt(3, 42)}%</span>`,
      `Rewatch Value: <span>${Utils.pick(['∞', 'High', 'A+', 'Yes'])}</span>`,
      `Salt Level: <span>${Utils.pick(['Critical', 'High', 'Moderate', 'Zen'])}</span>`,
    ];
    return Utils.shuffle(flavors).slice(0, 2).join('<br>');
  }

  function createSkeleton() {
    const skel = Utils.el('div', { className: 'chronicle-skeleton' });
    skel.appendChild(Utils.el('div', { className: 'skeleton-cover' }));
    skel.appendChild(Utils.el('div', { className: 'skeleton-text' }));
    skel.appendChild(Utils.el('div', { className: 'skeleton-text skeleton-text-short' }));
    return skel;
  }

  function createError(title, hint) {
    const err = Utils.el('div', { className: 'chronicle-error' });
    err.appendChild(Utils.el('div', { className: 'error-icon', textContent: '⚠' }));
    err.appendChild(Utils.el('div', { className: 'error-text', textContent: title }));
    err.appendChild(Utils.el('div', { className: 'error-hint', textContent: hint }));
    return err;
  }

  return { init };
})();
