/* ============================================
   Audio Engine — Procedural Dark Ambient Synth
   ============================================ */

const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let isPlaying = false;
  let nodes = [];

  function init() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.2;
      masterGain.connect(ctx.destination);

      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) {
      console.warn('AudioContext not available');
    }
  }

  function getContext() {
    return ctx;
  }

  function start() {
    if (!ctx || isPlaying) return;
    isPlaying = true;

    // Dark ambient pad
    createDarkPad();
    // Rain noise
    createRainNoise();
    // Sub bass drone
    createSubBass();

    // Occasional glitch
    scheduleGlitch();
  }

  function stop() {
    isPlaying = false;
    nodes.forEach(n => {
      try { n.stop && n.stop(); } catch (e) {}
      try { n.disconnect(); } catch (e) {}
    });
    nodes = [];
  }

  function toggle() {
    if (isPlaying) stop();
    else start();
    return isPlaying;
  }

  function createDarkPad() {
    if (!ctx) return;
    // Two detuned sawtooth oscillators for thick pad
    [0, 7].forEach(detune => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = 55; // Low A
      osc.detune.value = detune;

      filter.type = 'lowpass';
      filter.frequency.value = 200;
      filter.Q.value = 2;

      // Slow filter sweep via LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05; // Very slow
      lfoGain.gain.value = 100;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      gain.gain.value = 0.06;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start();

      nodes.push(osc, filter, gain, lfo, lfoGain);
    });
  }

  function createRainNoise() {
    if (!ctx) return;
    // White noise → bandpass → low volume = rain
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 3000;
    bandpass.Q.value = 0.5;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 1000;

    const gain = ctx.createGain();
    gain.gain.value = 0.04;

    source.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(masterGain);
    source.start();

    nodes.push(source, bandpass, highpass, gain);
  }

  function createSubBass() {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 35;
    gain.gain.value = 0.08;

    // Slow volume modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();

    nodes.push(osc, gain, lfo, lfoGain);
  }

  function scheduleGlitch() {
    if (!isPlaying || !ctx) return;

    const delay = Utils.randInt(30000, 60000);
    setTimeout(() => {
      if (!isPlaying || !ctx) return;
      playGlitch();
      scheduleGlitch();
    }, delay);
  }

  function playGlitch() {
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;

    source.connect(gain);
    gain.connect(masterGain);
    source.start();
  }

  // Expose analyser for orb sync
  function getAnalyserData() {
    if (!ctx || !isPlaying) return 0;
    // Simple approximation based on time for the orb
    return 0.5 + 0.5 * Math.sin(Date.now() / 1000);
  }

  return { init, getContext, start, stop, toggle, getAnalyserData };
})();
