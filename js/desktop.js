/* ============================================
   Desktop — Surface, Icons, Event Handling
   ============================================ */

const Desktop = (() => {
  const icons = [
    { id: 'chronicle', glyph: '📜', label: '記録', sublabel: 'Chronicle', windowType: 'chronicle' },
    { id: 'blackmarket', glyph: '🏴', label: '闇市', sublabel: 'Black Market', windowType: 'blackmarket' },
    { id: 'terminal', glyph: '⚔️', label: '端末', sublabel: 'Terminal', windowType: 'terminal' },
  ];

  let selectedIcon = null;
  let clickTimer = null;

  function init() {
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    const vnBox = document.getElementById('vn-box');

    desktop.classList.add('active');
    taskbar.classList.add('active');
    vnBox.classList.add('active');

    renderIcons();

    // Click on desktop surface to deselect icons
    desktop.addEventListener('click', (e) => {
      if (e.target === desktop || e.target.classList.contains('desktop-noise') || e.target.classList.contains('ambient-orb')) {
        deselectAll();
      }
    });
  }

  function renderIcons() {
    const container = document.querySelector('.desktop-icons');
    container.innerHTML = '';

    icons.forEach(icon => {
      const el = Utils.el('div', {
        className: 'desktop-icon',
        id: `icon-${icon.id}`,
        'data-window-type': icon.windowType,
      },
        Utils.el('div', { className: 'icon-glyph', textContent: icon.glyph }),
        Utils.el('div', { className: 'icon-label', textContent: icon.label }),
        Utils.el('div', { className: 'icon-sublabel', textContent: icon.sublabel }),
      );

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        handleIconClick(icon, el);
      });

      container.appendChild(el);
    });
  }

  function handleIconClick(icon, el) {
    if (clickTimer) {
      // Double click
      clearTimeout(clickTimer);
      clickTimer = null;
      openWindow(icon);
    } else {
      // First click — select, wait for potential double
      selectIcon(el);
      clickTimer = setTimeout(() => {
        clickTimer = null;
      }, 350);
    }
  }

  function selectIcon(el) {
    deselectAll();
    el.classList.add('selected');
    selectedIcon = el;
  }

  function deselectAll() {
    document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
    selectedIcon = null;
  }

  function openWindow(icon) {
    WindowManager.open(icon.windowType);
    deselectAll();
  }

  return { init };
})();
