/* ============================================
   VN Dialogue Engine — Typewriter + Blips
   ============================================ */

const VNEngine = (() => {
  let isTyping = false;
  let currentLine = 0;
  let phase = 'welcome'; // 'welcome' | 'idle'
  let isMinimized = false;
  let typeTimeout = null;
  let audioCtx = null;

  function init() {
    const vnBox = document.getElementById('vn-box');
    const advanceEl = vnBox.querySelector('.vn-advance');
    const toggleBtn = vnBox.querySelector('.vn-toggle');

    // Click to advance
    vnBox.addEventListener('click', (e) => {
      if (e.target.closest('.vn-toggle')) return;
      if (isMinimized) {
        toggleMinimize();
        return;
      }
      advance();
    });

    advanceEl.addEventListener('click', (e) => {
      e.stopPropagation();
      advance();
    });

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMinimize();
    });

    // Start welcome sequence
    startWelcome();
  }

  async function startWelcome() {
    phase = 'welcome';
    currentLine = 0;
    await typeLine(SANCTUARY_CONFIG.welcome_lines[0]);
  }

  function advance() {
    if (isTyping) {
      // Skip to end of current line
      skipType();
      return;
    }

    if (phase === 'welcome') {
      currentLine++;
      if (currentLine < SANCTUARY_CONFIG.welcome_lines.length) {
        typeLine(SANCTUARY_CONFIG.welcome_lines[currentLine]);
      } else {
        phase = 'idle';
        typeRandomMonologue();
      }
    } else {
      typeRandomMonologue();
    }
  }

  function typeRandomMonologue() {
    const line = Utils.pick(SANCTUARY_CONFIG.monologues);
    typeLine(line);
  }

  async function typeLine(text) {
    const textEl = document.querySelector('.vn-text');
    const advanceEl = document.querySelector('.vn-advance');
    isTyping = true;
    advanceEl.style.display = 'none';
    textEl.innerHTML = '<span class="vn-typed"></span><span class="vn-cursor"></span>';
    const typedEl = textEl.querySelector('.vn-typed');

    for (let i = 0; i < text.length; i++) {
      if (!isTyping) {
        // Skip was triggered
        typedEl.textContent = text;
        break;
      }
      typedEl.textContent += text[i];
      playBlip();
      await Utils.sleep(text[i] === '.' || text[i] === ',' || text[i] === '?' || text[i] === '!' ? 80 : 30);
    }

    isTyping = false;
    advanceEl.style.display = '';
  }

  function skipType() {
    isTyping = false;
  }

  function playBlip() {
    try {
      const ctx = AudioEngine.getContext();
      if (!ctx || ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.value = 440 + Math.random() * 200;
      gain.gain.value = 0.03;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) { /* Audio not available */ }
  }

  function toggleMinimize() {
    const vnBox = document.getElementById('vn-box');
    isMinimized = !isMinimized;
    vnBox.classList.toggle('minimized', isMinimized);
    const toggleBtn = vnBox.querySelector('.vn-toggle');
    toggleBtn.textContent = isMinimized ? '▲' : '▼';
  }

  /** Trigger a specific line (used by Konami code) */
  function triggerLine(text, cssClass = '') {
    const textEl = document.querySelector('.vn-text');
    if (cssClass) textEl.classList.add(cssClass);
    typeLine(text).then(() => {
      if (cssClass) setTimeout(() => textEl.classList.remove(cssClass), 3000);
    });
  }

  return { init, triggerLine };
})();
