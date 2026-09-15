/* ============================================
   Boot Sequence — Entry Gate & Terminal Boot
   ============================================ */

const Boot = (() => {
  let hasBooted = false;

  function init() {
    const gate = document.getElementById('entry-gate');
    const enterBtn = document.getElementById('gate-enter-btn');

    enterBtn.addEventListener('click', () => {
      startBoot(gate);
    });
  }

  async function startBoot(gate) {
    if (hasBooted) return;
    hasBooted = true;

    // Initialize audio context on user gesture
    AudioEngine.init();

    // Fade out entry gate
    gate.classList.add('hidden');

    // Show boot screen
    const bootScreen = document.getElementById('boot-screen');
    bootScreen.classList.add('active');

    // Play boot sequence
    await playBootSequence(bootScreen);

    // Fade out boot screen, show desktop
    bootScreen.classList.add('hidden');

    await Utils.sleep(500);
    bootScreen.style.display = 'none';

    // Initialize desktop
    Desktop.init();
    StatusBar.init();
    VNEngine.init();
    CRTShader.init();
    Konami.init();
  }

  async function playBootSequence(container) {
    const output = container.querySelector('.boot-output');
    const lines = SANCTUARY_CONFIG.boot_lines;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const el = Utils.el('div', { className: `boot-line ${line.type}` });

      if (line.type === 'blank') {
        el.innerHTML = '&nbsp;';
      } else {
        el.textContent = line.text;
      }

      output.appendChild(el);
      output.scrollTop = output.scrollHeight;

      // Variable delay per line type
      const delay = line.type === 'welcome' ? 400 :
                    line.type === 'blank' ? 100 :
                    line.type === 'warning' ? 200 :
                    Utils.randInt(60, 150);
      await Utils.sleep(delay);
    }

    // Hold for a moment on the welcome message
    await Utils.sleep(800);
  }

  return { init };
})();
