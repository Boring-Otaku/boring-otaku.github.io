/* ============================================
   Utilities — Shared helpers
   ============================================ */

const Utils = {
  /** Generate a random ID */
  id: (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 9)}`,

  /** Random integer between min and max (inclusive) */
  randInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  /** Pick a random element from array */
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],

  /** Shuffle array (Fisher-Yates) */
  shuffle: (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  /** Delay (promise-based) */
  sleep: (ms) => new Promise(r => setTimeout(r, ms)),

  /** Clamp a number */
  clamp: (val, min, max) => Math.max(min, Math.min(max, val)),

  /** Create element with attributes and children */
  el: (tag, attrs = {}, ...children) => {
    const el = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'className') el.className = val;
      else if (key === 'textContent') el.textContent = val;
      else if (key === 'innerHTML') el.innerHTML = val;
      else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
      else if (key === 'style' && typeof val === 'object') Object.assign(el.style, val);
      else el.setAttribute(key, val);
    }
    for (const child of children) {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else if (child) el.appendChild(child);
    }
    return el;
  },

  /** Escape HTML */
  escapeHtml: (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /** Debounce */
  debounce: (fn, ms) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },

  /** Format number with commas */
  formatNum: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),

  /** GitHub language colors */
  langColors: {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Shell: '#89e051',
    Lua: '#000080',
    Vim: '#199f4b',
    PowerShell: '#012456',
    Batchfile: '#C1F12E',
    null: '#666',
  },

  /** Japanese subtitle generator for repos */
  generateJpSubtitle: (name, language) => {
    const subtitles = [
      '禁断のスクリプト', // Forbidden Script
      '闇の道具',        // Dark Tool
      '呪われた断片',    // Cursed Fragment
      '影のコード',      // Shadow Code
      '秘密兵器',        // Secret Weapon
      '暗黒の遺物',      // Dark Relic
      '虚空の書',        // Void Scripture
      '深淵の鍵',        // Abyssal Key
      '封印されし力',    // Sealed Power
      '失われた技術',    // Lost Technology
    ];
    // Use name hash for consistent subtitle per repo
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
    return subtitles[Math.abs(hash) % subtitles.length];
  },

  /** Classification generator based on repo type */
  classifyRepo: (repo) => {
    const name = (repo.name || '').toLowerCase();
    const desc = (repo.description || '').toLowerCase();
    const lang = repo.language;

    if (name.includes('dotfile') || name.includes('config') || name.includes('setup'))
      return { label: 'Contraband Tweak', cssClass: 'tag-contraband' };
    if (name.includes('script') || name.includes('user') || name.includes('bot'))
      return { label: 'Cursed Script', cssClass: 'tag-cursed' };
    if (desc.includes('tool') || desc.includes('util') || desc.includes('cli'))
      return { label: 'Dark Relic', cssClass: 'tag-relic' };
    if (repo.stargazers_count > 5)
      return { label: 'Forbidden Artifact', cssClass: 'tag-forbidden' };
    return { label: 'Cursed Script', cssClass: 'tag-cursed' };
  },

  /** Calculate bounty rating (1-5 stars) based on repo stats */
  calcBounty: (repo) => {
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const size = repo.size || 0;
    const score = stars * 3 + forks * 5 + Math.log(size + 1) * 2;
    if (score >= 50) return 5;
    if (score >= 25) return 4;
    if (score >= 10) return 3;
    if (score >= 3) return 2;
    return 1;
  },
};
