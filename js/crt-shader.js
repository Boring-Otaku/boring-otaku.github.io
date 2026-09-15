/* ============================================
   CRT Shader — Toggle Logic
   ============================================ */

const CRTShader = (() => {
  let isActive = true;

  function init() {
    const overlay = document.getElementById('crt-overlay');
    overlay.classList.add('active');
    isActive = true;
  }

  function toggle() {
    const overlay = document.getElementById('crt-overlay');
    isActive = !isActive;
    overlay.classList.toggle('active', isActive);
    return isActive;
  }

  function getState() {
    return isActive;
  }

  return { init, toggle, getState };
})();
