/* ============================================
   Boss Raid Console — Interactive Terminal
   ============================================ */

const Terminal = (() => {
  let initialized = false;
  let history = [];
  let historyIndex = -1;
  let gameState = null; // For play command

  const BANNER = `
 ███╗   ███╗██╗██████╗ ███╗   ██╗██╗ ██████╗ ██╗  ██╗████████╗
 ████╗ ████║██║██╔══██╗████╗  ██║██║██╔════╝ ██║  ██║╚══██╔══╝
 ██╔████╔██║██║██║  ██║██╔██╗ ██║██║██║  ███╗███████║   ██║   
 ██║╚██╔╝██║██║██║  ██║██║╚██╗██║██║██║   ██║██╔══██║   ██║   
 ██║ ╚═╝ ██║██║██████╔╝██║ ╚████║██║╚██████╔╝██║  ██║   ██║   
 ╚═╝     ╚═╝╚═╝╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝
  SANCTUARY TERMINAL v2.7.1 — Type 'help' for commands
`.trim();

  const NEOFETCH_ASCII = `
    ⠀⠀⠀⠀⣀⣤⣴⣶⣶⣶⣦⣤⣀⠀⠀⠀⠀
    ⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀
    ⠀⣴⣿⣿⣿⡿⠟⠛⠛⠛⠻⢿⣿⣿⣿⣦⠀
    ⣸⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣇
    ⣿⣿⣿⠁⠀⢀⣤⣤⡀⠀⠀⠀⠀⠈⣿⣿⣿
    ⣿⣿⣿⠀⠀⠈⠻⠟⠁⠀⣴⣶⡄⠀⣿⣿⣿
    ⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠈⠉⠁⢀⣿⣿⣿
    ⠸⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⣿⠇
    ⠀⠻⣿⣿⣿⣶⣄⣀⣀⣀⣤⣶⣿⣿⣿⠟⠀
    ⠀⠀⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠁⠀⠀
    ⠀⠀⠀⠀⠈⠉⠛⠛⠛⠛⠉⠁⠀⠀⠀⠀⠀`.trim();

  const WAIFUS = [
    `
    ⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀
    ⠀⠀⠀⣰⣿⣿⣿⡟⠋⠙⢻⣿⣿⣿⣆⠀⠀⠀
    ⠀⠀⣸⣿⣿⠿⠉⠀⠀⠀⠀⠉⠿⣿⣿⣇⠀⠀
    ⠀⢀⣿⡿⠁⢀⣤⠀⠀⠀⢀⣤⡀⠈⢿⣿⡄⠀
    ⠀⢸⣿⠃⠀⢸⣿⠀⠀⠀⢸⣿⡇⠀⠘⣿⡇⠀
    ⠀⢸⣿⠀⠀⠈⠛⠀⠒⠒⠀⠛⠁⠀⠀⣿⡇⠀
    ⠀⠘⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⠃⠀
    ⠀⠀⢻⣿⣷⣄⡀⠀⠀⠀⠀⢀⣠⣾⣿⡟⠀⠀
    ⠀⠀⠀⠙⢿⣿⣿⣷⣶⣶⣾⣿⣿⡿⠋⠀⠀⠀
    ✨ Summoned: Unit-${Math.floor(Math.random() * 9000 + 1000)} ✨`,
    `
    ╔═══════════════════╗
    ║   (╯°□°)╯︵ ┻━┻  ║
    ║                   ║
    ║  GACHA SALT LEVEL ║
    ║  ████████░░ 80%   ║
    ║                   ║
    ║  Pity: 87/90      ║
    ╚═══════════════════╝
    ✨ SSR pulled: [Copium] ✨`,
    `
    ⠀⠀⢀⣀⣀⣀⡀⠀⠀
    ⠀⣰⠟⠉⠀⠉⠻⣆⠀
    ⢰⡏⠀⢰⠀⡆⠀⢹⡆
    ⢸⡇⠀⠀⠀⠀⠀⢸⡇
    ⠘⣧⠀⢤⣤⡄⠀⣼⠃
    ⠀⠹⣦⡀⠀⢀⣴⠟⠀
    ⠀⠀⠈⠙⠛⠋⠁⠀⠀
    ✨ Waifu rating: SSR+ ✨`,
  ];

  const FS = {
    'about.txt': `
╔══════════════════════════════════════════╗
║           OPERATOR PROFILE               ║
╠══════════════════════════════════════════╣
║                                          ║
║  Handle:    ${SANCTUARY_CONFIG.character_name.padEnd(28)}║
║  Title:     Digital Phantom              ║
║  Base:      Midnight Sanctuary           ║
║  Status:    Online                       ║
║                                          ║
║  Affiliation:                            ║
║    - Open Source Underground              ║
║    - Anime Preservation Society           ║
║    - High Framerate Advocacy Group        ║
║                                          ║
║  Skills:                                 ║
║    [████████░░] Code         80%          ║
║    [██████████] Anime Knowledge  100%     ║
║    [██░░░░░░░░] Sleep Hygiene   20%       ║
║    [████████░░] Caffeine Tolerance 85%    ║
║    [█░░░░░░░░░] Social Skills   10%       ║
║                                          ║
║  "I don't have bugs, I have features     ║
║   waiting to be understood."             ║
║                                          ║
╚══════════════════════════════════════════╝`.trim(),
    'secrets/': '[DIRECTORY] Access denied. Clearance level insufficient.',
    'gacha_receipts.csv': 'Date,Amount,Result\n2024-01-15,$49.99,R Duplicate\n2024-02-20,$29.99,R Duplicate\n2024-03-08,$99.99,SR (wrong one)\n2024-04-01,$9.99,SSR!!! (wrong banner)\nTOTAL: ∞ regret',
    '.hidden_power_level': 'POWER_LEVEL=OVER_9000\nFINAL_FORM=UNLOCKED\nPLOT_ARMOR=THICC\nDEBUG_MODE=TRUE',
  };

  function init() {
    if (initialized) return;
    initialized = true;

    const body = document.getElementById('terminal-body');
    if (!body) return;

    body.innerHTML = '';
    body.style.padding = '0';

    const container = Utils.el('div', { className: 'terminal-container' });
    const output = Utils.el('div', { className: 'terminal-output', id: 'terminal-output' });
    const inputLine = Utils.el('div', { className: 'terminal-input-line' });
    const prompt = Utils.el('span', {
      className: 'terminal-input-prompt',
      innerHTML: '<span class="terminal-prompt-prefix">midnight</span>@<span class="terminal-prompt-path">sanctuary</span><span class="terminal-prompt-symbol">:~$ </span>',
    });
    const input = Utils.el('input', {
      className: 'terminal-input',
      id: 'terminal-input',
      type: 'text',
      placeholder: 'Type a command...',
      autocomplete: 'off',
      spellcheck: 'false',
    });

    inputLine.append(prompt, input);
    container.append(output, inputLine);
    body.appendChild(container);

    // Banner
    printOutput(BANNER, 'ascii');

    // Input handling
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) {
          history.push(cmd);
          historyIndex = history.length;
          processCommand(cmd);
        }
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          input.value = history[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          input.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          input.value = '';
        }
      }
    });

    // Focus input on container click
    container.addEventListener('click', () => input.focus());

    // Auto-focus
    setTimeout(() => input.focus(), 100);
  }

  function printOutput(text, type = 'output') {
    const output = document.getElementById('terminal-output');
    if (!output) return;

    const lines = text.split('\n');
    lines.forEach(line => {
      const el = Utils.el('div', { className: `terminal-line ${type}` });
      el.textContent = line;
      output.appendChild(el);
    });
    output.scrollTop = output.scrollHeight;
  }

  function printHTML(html) {
    const output = document.getElementById('terminal-output');
    if (!output) return;
    const el = Utils.el('div', { className: 'terminal-line' });
    el.innerHTML = html;
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  }

  function printCommand(cmd) {
    const output = document.getElementById('terminal-output');
    if (!output) return;
    const el = Utils.el('div', { className: 'terminal-line command' });
    el.innerHTML = `<span class="terminal-prompt-prefix">midnight</span>@<span class="terminal-prompt-path">sanctuary</span><span class="terminal-prompt-symbol">:~$ </span>${Utils.escapeHtml(cmd)}`;
    output.appendChild(el);
  }

  function processCommand(input) {
    // Handle game input
    if (gameState) {
      handleGameInput(input);
      return;
    }

    printCommand(input);

    const parts = input.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help': cmdHelp(); break;
      case 'cat': cmdCat(args.join(' ')); break;
      case 'summon-waifu': cmdSummonWaifu(); break;
      case 'sudo': cmdSudo(args.join(' ')); break;
      case 'ls': cmdLs(); break;
      case 'whoami': cmdWhoami(); break;
      case 'ping': cmdPing(); break;
      case 'neofetch': cmdNeofetch(); break;
      case 'clear': cmdClear(); break;
      case 'hack': cmdHack(args[0]); break;
      case 'play': cmdPlay(args[0]); break;
      default:
        printOutput(`Command not found: '${cmd}'. Try 'help' or 'sudo blame-someone-else'`, 'error');
    }
  }

  function cmdHelp() {
    const commands = [
      ['help', 'Show this help message'],
      ['cat <file>', 'Display file contents'],
      ['summon-waifu', 'Summon a random waifu (gacha rates apply)'],
      ['sudo <cmd>', 'Try to run as root (nice try)'],
      ['ls', 'List directory contents'],
      ['whoami', 'Display operator identity'],
      ['ping', 'Test connection to anime servers'],
      ['neofetch', 'Display system information'],
      ['clear', 'Clear terminal output'],
      ['hack <target>', 'Initiate hacking sequence'],
      ['play <game>', 'Launch mini-game (try: guess)'],
    ];

    printOutput('╔══ AVAILABLE COMMANDS ══╗', 'system');
    commands.forEach(([cmd, desc]) => {
      printOutput(`  ${cmd.padEnd(20)} ${desc}`, 'info');
    });
    printOutput('╚════════════════════════╝', 'system');
  }

  function cmdCat(filename) {
    if (!filename) {
      printOutput("Usage: cat <filename>", 'warning');
      return;
    }
    const content = FS[filename];
    if (content) {
      if (content.startsWith('[DIRECTORY]')) {
        printOutput(content, 'error');
      } else {
        printOutput(content, 'output');
      }
    } else {
      printOutput(`cat: ${filename}: No such file or directory`, 'error');
    }
  }

  function cmdSummonWaifu() {
    printOutput('Initiating gacha pull...', 'info');
    printOutput('Rolling... ⬜⬜⬜', 'info');
    setTimeout(() => {
      printOutput('Rolling... 🟡⬜⬜', 'info');
      setTimeout(() => {
        printOutput('Rolling... 🟡🟡⬜', 'info');
        setTimeout(() => {
          const waifu = Utils.pick(WAIFUS);
          printOutput(waifu, 'ascii');
        }, 400);
      }, 400);
    }, 400);
  }

  function cmdSudo(args) {
    if (!args) {
      printOutput("sudo: you're not in the sudoers file. This incident will be reported.", 'error');
      return;
    }
    if (args === 'optimize-life') {
      printOutput("Permission denied. Nice try, normie.", 'error');
      printOutput("Life optimization requires ADMIN clearance.", 'error');
      printOutput("Current clearance: WEEB_TIER_3", 'warning');
      printOutput("Required: TOUCH_GRASS_CERTIFIED", 'warning');
      printOutput("", 'output');
      printOutput("Suggested alternatives:", 'info');
      printOutput("  - sudo apt-get install motivation", 'info');
      printOutput("  - sudo reboot social-life", 'info');
      printOutput("  - sudo rm -rf procrastination/", 'info');
    } else if (args === 'rm -rf /') {
      printOutput("I'm not falling for that one.", 'error');
    } else if (args === 'blame-someone-else') {
      printOutput("Blame redirected to: JavaScript", 'success');
      printOutput("Status: Accepted universally", 'success');
    } else {
      printOutput(`sudo: ${args}: command not found or access denied`, 'error');
      printOutput("This incident will be reported to /dev/null", 'warning');
    }
  }

  function cmdLs() {
    printOutput('drwxr-xr-x  2 operator sanctuary   about.txt', 'output');
    printOutput('drwx------  2 operator sanctuary   secrets/', 'output');
    printOutput('-rw-r--r--  1 operator sanctuary   gacha_receipts.csv', 'output');
    printOutput('-rw-------  1 operator sanctuary   .hidden_power_level', 'output');
    printOutput('drwxr-xr-x  2 operator sanctuary   anime_backlog/', 'output');
    printOutput('-rw-r--r--  1 operator sanctuary   todo.md (last modified: never)', 'output');
    printOutput('drwx------  2 operator sanctuary   waifu_folder/ (encrypted)', 'warning');
  }

  function cmdWhoami() {
    printOutput(`
╔════════════════════════════════╗
║  IDENTITY VERIFICATION         ║
╠════════════════════════════════╣
║  User:      ${SANCTUARY_CONFIG.character_name.padEnd(18)}║
║  Role:      Terminal Operator  ║
║  Shell:     /bin/midnight      ║
║  Home:      ~/sanctuary        ║
║  Groups:    dev, otaku, neet   ║
║  Status:    「永遠にオンライン」 ║
║  Uptime:    ∞ days             ║
╚════════════════════════════════╝`.trim(), 'system');
  }

  function cmdPing() {
    const targets = [
      { host: 'crunchyroll.com', ms: Utils.randInt(5, 30) },
      { host: 'myanimelist.net', ms: Utils.randInt(8, 45) },
      { host: 'anilist.co', ms: Utils.randInt(3, 20) },
      { host: 'steam.community', ms: Utils.randInt(10, 60) },
      { host: 'github.com', ms: Utils.randInt(2, 15) },
      { host: 'waifu-server.sanctuary', ms: Utils.randInt(1, 3) },
    ];

    printOutput(`PING waifu-server.sanctuary (127.0.0.1): 56 data bytes`, 'output');

    let i = 0;
    const interval = setInterval(() => {
      if (i >= targets.length) {
        clearInterval(interval);
        printOutput(`\n--- ping statistics ---`, 'output');
        printOutput(`${targets.length} packets transmitted, ${targets.length} received, 0% packet loss`, 'success');
        printOutput(`Conclusion: All anime servers operational ✓`, 'success');
        return;
      }
      const t = targets[i];
      printOutput(`64 bytes from ${t.host}: icmp_seq=${i + 1} ttl=64 time=${t.ms}ms`, 'output');
      i++;
    }, 500);
  }

  function cmdNeofetch() {
    const output = document.getElementById('terminal-output');
    if (!output) return;

    const container = Utils.el('div', { className: 'neofetch-container' });

    // ASCII art
    const ascii = Utils.el('pre', { className: 'neofetch-ascii', textContent: NEOFETCH_ASCII });

    // Info
    const info = Utils.el('div', { className: 'neofetch-info' });
    const lines = [
      ['OS', 'OtakuOS 2.7.1 (Midnight Edition)'],
      ['Host', 'Sanctuary Terminal'],
      ['Kernel', '6.6.6-midnight-custom'],
      ['Uptime', `${Utils.randInt(100, 999)} days (who's counting)`],
      ['Packages', `${Utils.randInt(200, 500)} (pacman), ${Utils.randInt(50, 150)} (npm)`],
      ['Shell', '/bin/midnight'],
      ['Resolution', `${window.innerWidth}x${window.innerHeight}`],
      ['DE', 'OtakuOS Desktop Environment'],
      ['WM', 'WindowManager.js (custom)'],
      ['Theme', 'Obsidian Violet [dark]'],
      ['Terminal', 'Boss Raid Console'],
      ['CPU', 'Copium Processor Unit @ ∞GHz'],
      ['GPU', 'Anime Rendering Engine v4.0'],
      ['Memory', `${Utils.randInt(2, 6)}GB / 16GB (Chrome ate the rest)`],
    ];

    lines.forEach(([label, value]) => {
      const line = Utils.el('div');
      line.innerHTML = `<span class="neofetch-label">${label}:</span> <span class="neofetch-value">${value}</span>`;
      info.appendChild(line);
    });

    // Color blocks
    const colors = Utils.el('div', { className: 'neofetch-colors' });
    ['#0a0a0f', '#4c1d95', '#7c3aed', '#8b5cf6', '#a78bfa', '#e11d48', '#f59e0b', '#10b981'].forEach(c => {
      colors.appendChild(Utils.el('span', {
        className: 'neofetch-color-block',
        style: { background: c },
      }));
    });
    info.appendChild(colors);

    container.append(ascii, info);
    output.appendChild(container);
    output.scrollTop = output.scrollHeight;
  }

  function cmdClear() {
    const output = document.getElementById('terminal-output');
    if (output) output.innerHTML = '';
  }

  async function cmdHack(target) {
    if (!target) {
      printOutput("Usage: hack <target>", 'warning');
      printOutput("Example: hack mainframe", 'info');
      return;
    }

    printOutput(`[*] Initializing hack sequence on '${target}'...`, 'info');
    await Utils.sleep(500);
    printOutput('[*] Scanning for vulnerabilities...', 'info');
    await Utils.sleep(800);
    printOutput(`[+] Found ${Utils.randInt(3, 12)} open ports`, 'success');
    await Utils.sleep(400);
    printOutput('[*] Deploying payload...', 'warning');

    // Animated progress bar
    const output = document.getElementById('terminal-output');
    const progressLine = Utils.el('div', { className: 'terminal-line' });
    const progressBar = Utils.el('div', { className: 'hack-progress' });
    const progressFill = Utils.el('div', { className: 'hack-progress-bar' });
    progressBar.appendChild(progressFill);

    const progressText = Utils.el('span', { className: 'terminal-line info', style: { marginLeft: '8px' } });
    progressLine.append(progressBar, progressText);
    output.appendChild(progressLine);

    for (let i = 0; i <= 100; i += Utils.randInt(3, 12)) {
      const pct = Math.min(i, 100);
      progressFill.style.width = pct + '%';
      progressText.textContent = ` ${pct}%`;
      output.scrollTop = output.scrollHeight;
      await Utils.sleep(Utils.randInt(50, 200));
    }
    progressFill.style.width = '100%';
    progressText.textContent = ' 100%';

    await Utils.sleep(300);
    printOutput('', 'output');
    printOutput(`[+] ACCESS GRANTED to '${target}'`, 'success');
    printOutput('[+] Just kidding. This is a portfolio website.', 'warning');
    printOutput('[+] But you looked cool doing it.', 'info');
    printOutput(`[+] Hacker rating: ${Utils.pick(['S-Tier', 'A-Rank', 'Script Kiddie', 'Neo', 'Zero Cool'])}`, 'system');
  }

  function cmdPlay(game) {
    if (!game) {
      printOutput("Usage: play <game>", 'warning');
      printOutput("Available games: guess", 'info');
      return;
    }

    if (game.toLowerCase() === 'guess') {
      startGuessGame();
    } else {
      printOutput(`Game '${game}' not found. Available: guess`, 'error');
    }
  }

  function startGuessGame() {
    const target = Utils.randInt(1, 100);
    gameState = { type: 'guess', target, attempts: 0, maxAttempts: 7 };
    printOutput('╔══ NUMBER GUESS GAME ══╗', 'system');
    printOutput('║  Guess a number 1-100  ║', 'system');
    printOutput(`║  You have ${gameState.maxAttempts} attempts     ║`, 'system');
    printOutput('╚════════════════════════╝', 'system');
    printOutput('Enter your guess:', 'info');
  }

  function handleGameInput(input) {
    printCommand(input);

    if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
      printOutput('Game ended.', 'warning');
      gameState = null;
      return;
    }

    if (gameState.type === 'guess') {
      const guess = parseInt(input);
      if (isNaN(guess)) {
        printOutput("That's not a number. Try again (or type 'quit').", 'error');
        return;
      }

      gameState.attempts++;
      const remaining = gameState.maxAttempts - gameState.attempts;

      if (guess === gameState.target) {
        printOutput(`🎉 CORRECT! The number was ${gameState.target}!`, 'success');
        printOutput(`Completed in ${gameState.attempts} attempts.`, 'success');
        const rating = gameState.attempts <= 3 ? 'SSR' : gameState.attempts <= 5 ? 'SR' : 'R';
        printOutput(`Rating: ${rating}`, 'system');
        gameState = null;
      } else if (remaining <= 0) {
        printOutput(`💀 GAME OVER! The number was ${gameState.target}.`, 'error');
        printOutput('Rating: N (Unranked)', 'error');
        gameState = null;
      } else if (guess < gameState.target) {
        printOutput(`Too low! ${remaining} attempts remaining.`, 'warning');
      } else {
        printOutput(`Too high! ${remaining} attempts remaining.`, 'warning');
      }
    }
  }

  return { init };
})();
