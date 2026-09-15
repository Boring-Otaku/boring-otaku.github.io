/* ============================================
   Status Bar — Clock, Latency, Mood, Toggles
   ============================================ */

const StatusBar = (() => {
  let moodIndex = 0;
  let latencyInterval = null;
  let moodInterval = null;

  function init() {
    updateClock();
    setInterval(updateClock, 1000);

    updateLatency();
    latencyInterval = setInterval(updateLatency, 3000);

    updateMood();
    moodInterval = setInterval(updateMood, 45000);

    // CRT toggle
    const crtBtn = document.getElementById('tray-crt');
    crtBtn.addEventListener('click', () => {
      CRTShader.toggle();
      crtBtn.classList.toggle('active');
    });
    crtBtn.classList.add('active'); // CRT on by default

    // Audio toggle
    const audioBtn = document.getElementById('tray-audio');
    audioBtn.addEventListener('click', () => {
      const isPlaying = AudioEngine.toggle();
      audioBtn.classList.toggle('active', isPlaying);
      audioBtn.textContent = isPlaying ? '🔊' : '🔇';
    });
  }

  function updateClock() {
    const el = document.getElementById('tray-clock');
    if (!el) return;
    const now = new Date();
    const tokyoTime = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    el.textContent = `🕐 ${tokyoTime} JST`;
  }

  function updateLatency() {
    const el = document.getElementById('tray-latency');
    if (!el) return;
    const latencies = ['< 1ms', '3ms', '7ms', '12ms', '18ms', '24ms', '31ms', '42ms', '∞ms', '???'];
    el.textContent = `📡 ${Utils.pick(latencies)}`;
  }

  function updateMood() {
    const el = document.getElementById('tray-mood');
    if (!el) return;
    const moods = SANCTUARY_CONFIG.moods;
    moodIndex = (moodIndex + 1) % moods.length;
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = `💬 ${moods[moodIndex]}`;
      el.style.opacity = '1';
    }, 300);
  }

  return { init };
})();
