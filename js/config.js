/* ============================================
   Midnight Sanctuary — Configuration
   Edit this file to connect your accounts.
   ============================================ */

const SANCTUARY_CONFIG = {
  // ─── API Integrations ─────────────────────
  // MyAnimeList username (used with Jikan API — no key needed)
  mal_username: '',

  // AniList username (public GraphQL — no key needed)
  anilist_username: '',

  // Steam Web API (get key from https://steamcommunity.com/dev/apikey)
  steam_api_key: '',
  steam_id: '',   // Your Steam 64-bit ID

  // GitHub username (public API — no key needed)
  github_username: 'Boring-Otaku',

  // ─── Personalization ──────────────────────
  character_name: 'Operator',
  site_title: 'Project: Midnight Sanctuary',
  site_subtitle: '夜の電脳空間',

  // ─── Social Links (shown on mobile fallback) ───
  socials: {
    github: 'https://github.com/Boring-Otaku',
    mal: '',
    anilist: '',
    twitter: '',
    discord: '',
    steam: '',
  },

  // ─── Welcome VN Dialogue Lines ─────────────
  welcome_lines: [
    "...Another visitor? At this hour?",
    "Welcome to the Midnight Sanctuary. 夜の電脳空間.",
    "This is my corner of the internet. A place where code compiles and waifus are eternal.",
    "Feel free to look around. Open a terminal. Break something. I don't care.",
    "Just... don't touch the gacha funds."
  ],

  // ─── Random Monologue Pool ─────────────────
  monologues: [
    "I once debugged for 6 hours only to find a missing semicolon. Character development.",
    "People say 'touch grass.' I say 'optimize render pipeline.' We are not the same.",
    "My backlog has a backlog. It's backlogs all the way down.",
    "Sleep schedule? You mean the thing I sacrificed to the anime gods?",
    "They asked me what IDE I use. I said 'the one that matches my existential dread.'",
    "60fps or I don't watch it. Yes, I'm that person. No, I won't apologize.",
    "The gacha rates are a lie. But I'll roll anyway. It's called commitment.",
    "Every time I say 'one more episode,' a clock somewhere skips 4 hours.",
    "My code works. I don't know why. I'm afraid to ask.",
    "Isekai'd into a world where all merge conflicts resolve themselves... the dream.",
    "Current objective: survive until the next season drop.",
    "The compiler is my final boss. The runtime errors are the DLC.",
    "I write clean code the same way I maintain a sleep schedule — theoretically.",
    "Somewhere out there, a production server is on fire. Probably mine.",
    "They told me to 'go outside.' I alt-tabbed instead.",
    "My waifu tier list is peer-reviewed and cited in 3 Discord servers.",
    "Loading personality.dll... ERROR: File corrupted. Using defaults.",
    "I have more browser tabs open than reasons to live. And that's a lot of tabs.",
    "If debugging is removing bugs, then programming is adding them. I'm very productive.",
    "The plot armor in my code is thicker than any isekai protagonist."
  ],

  // ─── Mood Status Messages ──────────────────
  moods: [
    "Buffering next season...",
    "Stuck in Elo hell",
    "Compiling copium.exe",
    "Gacha pity at 89/90",
    "Sleep is for the weak",
    "404: Motivation not found",
    "Overclock engaged",
    "Deploying excuses...",
    "Existential crisis: 78%",
    "sudo rm -rf feelings",
    "Reticulating splines...",
    "Loading personality.dll",
    "Isekai queue: #9,241",
    "Current quest: survive Monday",
    "Debugging reality.exe",
    "Framerate: unstable",
    "Downloading more RAM...",
    "Alt+F4 is not an option",
    "Serotonin.exe has stopped",
    "Task failed successfully"
  ],

  // ─── Boot Sequence Lines ───────────────────
  boot_lines: [
    { text: '[BOOT] Midnight Sanctuary v2.7.1', type: 'system' },
    { text: '[INIT] Loading neural interface...', type: 'info' },
    { text: '[OK]   Core modules initialized', type: 'success' },
    { text: '[INIT] Decrypting sanctuary protocols...', type: 'info' },
    { text: '[OK]   Encryption layer: ACTIVE', type: 'success' },
    { text: '[INIT] Establishing connection to 夜の電脳空間...', type: 'info' },
    { text: '[OK]   Connection secured', type: 'success' },
    { text: '[WARN] Sanity levels: CRITICAL', type: 'warning' },
    { text: '[WARN] Sleep debt: OVERFLOW', type: 'warning' },
    { text: '[OK]   Desktop environment loaded', type: 'success' },
    { text: '[OK]   All systems nominal', type: 'success' },
    { text: '', type: 'blank' },
    { text: 'Welcome, Operator.', type: 'welcome' },
  ],

  // ─── Black Market Config Overrides ─────────
  // Override auto-generated repo classifications
  repo_overrides: {
    // 'repo-name': {
    //   japanese_subtitle: '禁断の武器',
    //   classification: 'Forbidden Artifact',
    //   bounty_override: 5,
    // }
  },
};
