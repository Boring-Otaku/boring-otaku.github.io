/* ============================================
   Konami Code — ↑↑↓↓←→←→BA Spectacle
   ============================================ */

const Konami = (() => {
  const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let inputBuffer = [];
  let isOnCooldown = false;

  function init() {
    document.addEventListener('keydown', (e) => {
      if (isOnCooldown) return;

      inputBuffer.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      if (inputBuffer.length > CODE.length) inputBuffer.shift();

      if (inputBuffer.length === CODE.length &&
          inputBuffer.every((key, i) => key === CODE[i])) {
        activate();
        inputBuffer = [];
      }
    });
  }

  async function activate() {
    isOnCooldown = true;

    // 1. Screen flash
    const flash = Utils.el('div', { className: 'konami-flash' });
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 800);

    // 2. Glitch shake
    document.body.classList.add('konami-glitch');
    setTimeout(() => document.body.classList.remove('konami-glitch'), 1000);

    // 3. Theme shift to corrupted dark rose
    document.body.classList.add('theme-corrupted');

    // 4. Crimson petals
    spawnPetals(60);

    // 5. VN line
    VNEngine.triggerLine('Forbidden protocol activated. 禁断の力が目覚める...', 'konami-vn-flash');

    // 6. Auto-revert after 12 seconds
    await Utils.sleep(12000);
    document.body.classList.remove('theme-corrupted');

    // Wait for cooldown
    await Utils.sleep(30000);
    isOnCooldown = false;
  }

  function spawnPetals(count) {
    for (let i = 0; i < count; i++) {
      const petal = Utils.el('div', {
        className: `petal ${Utils.pick(['', 'small', 'large'])}`,
      });

      petal.style.left = `${Math.random() * 100}vw`;
      petal.style.animationDuration = `${Utils.randInt(3, 7)}s`;
      petal.style.animationDelay = `${Math.random() * 2}s`;
      petal.style.opacity = (0.3 + Math.random() * 0.5).toString();

      document.body.appendChild(petal);

      // Cleanup
      setTimeout(() => petal.remove(), 8000);
    }
  }

  return { init };
})();
