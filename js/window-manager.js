/* ============================================
   Window Manager — Drag, Resize, Stack, Min/Max
   ============================================ */

const WindowManager = (() => {
  const windows = new Map(); // id -> { el, state, config }
  let topZ = 10;
  let cascadeOffset = 0;

  const WINDOW_CONFIGS = {
    chronicle: {
      title: 'Chronicle Engine',
      titleJp: '記録',
      icon: '📜',
      defaultWidth: 680,
      defaultHeight: 480,
      onOpen: () => Chronicle.init(),
    },
    blackmarket: {
      title: 'Black Market',
      titleJp: '闇市',
      icon: '🏴',
      defaultWidth: 620,
      defaultHeight: 450,
      onOpen: () => BlackMarket.init(),
    },
    terminal: {
      title: 'Boss Raid Console',
      titleJp: '端末',
      icon: '⚔️',
      defaultWidth: 600,
      defaultHeight: 380,
      onOpen: () => Terminal.init(),
    },
  };

  function open(type) {
    // If already open, focus it
    for (const [id, win] of windows) {
      if (win.type === type) {
        if (win.state === 'minimized') restore(id);
        else focus(id);
        return;
      }
    }

    const config = WINDOW_CONFIGS[type];
    if (!config) return;

    const id = Utils.id('win');
    const el = createWindowElement(id, type, config);

    document.querySelector('.desktop-area').appendChild(el);

    // Position with cascade
    const area = document.querySelector('.desktop-area');
    const areaRect = area.getBoundingClientRect();
    const x = Math.min(60 + cascadeOffset * 30, areaRect.width - config.defaultWidth - 20);
    const y = Math.min(30 + cascadeOffset * 30, areaRect.height - config.defaultHeight - 20);
    el.style.left = Math.max(10, x) + 'px';
    el.style.top = Math.max(10, y) + 'px';
    el.style.width = config.defaultWidth + 'px';
    el.style.height = config.defaultHeight + 'px';

    cascadeOffset = (cascadeOffset + 1) % 8;

    const winData = { el, type, state: 'normal', config, preMaxBounds: null };
    windows.set(id, winData);

    setupDrag(id, el);
    setupResize(id, el);
    focus(id);
    updateTaskbar();

    // Trigger content init
    if (config.onOpen) config.onOpen();
  }

  function createWindowElement(id, type, config) {
    const el = Utils.el('div', { className: 'os-window', id, 'data-window-type': type });

    // Title bar
    const titlebar = Utils.el('div', { className: 'window-titlebar' });

    const controls = Utils.el('div', { className: 'window-controls' });
    const btnClose = Utils.el('button', { className: 'window-control-btn btn-close', title: 'Close' });
    const btnMin = Utils.el('button', { className: 'window-control-btn btn-minimize', title: 'Minimize' });
    const btnMax = Utils.el('button', { className: 'window-control-btn btn-maximize', title: 'Maximize' });

    btnClose.addEventListener('click', (e) => { e.stopPropagation(); close(id); });
    btnMin.addEventListener('click', (e) => { e.stopPropagation(); minimize(id); });
    btnMax.addEventListener('click', (e) => { e.stopPropagation(); toggleMaximize(id); });

    controls.append(btnClose, btnMin, btnMax);

    const title = Utils.el('span', { className: 'window-title', textContent: config.title });
    const titleJp = Utils.el('span', { className: 'window-title-jp', textContent: config.titleJp });

    titlebar.append(controls, title, titleJp);

    // Body
    const body = Utils.el('div', { className: 'window-body', id: `${type}-body` });

    // Resize handles
    const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(dir =>
      Utils.el('div', { className: `resize-handle resize-${dir}`, 'data-dir': dir })
    );

    el.append(titlebar, body, ...handles);

    // Focus on click
    el.addEventListener('mousedown', () => focus(id));

    return el;
  }

  function focus(id) {
    windows.forEach((win, wid) => {
      win.el.classList.toggle('focused', wid === id);
    });
    const win = windows.get(id);
    if (win) {
      topZ++;
      win.el.style.zIndex = topZ;
    }
    updateTaskbar();
  }

  function minimize(id) {
    const win = windows.get(id);
    if (!win) return;
    win.el.classList.add('minimizing');
    win.state = 'minimized';
    setTimeout(() => {
      win.el.style.display = 'none';
      win.el.classList.remove('minimizing');
    }, 300);
    updateTaskbar();
  }

  function restore(id) {
    const win = windows.get(id);
    if (!win) return;
    win.el.style.display = 'flex';
    win.state = 'normal';
    win.el.style.animation = 'window-open 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    focus(id);
    updateTaskbar();
  }

  function toggleMaximize(id) {
    const win = windows.get(id);
    if (!win) return;

    if (win.state === 'maximized') {
      // Restore
      if (win.preMaxBounds) {
        win.el.style.left = win.preMaxBounds.left;
        win.el.style.top = win.preMaxBounds.top;
        win.el.style.width = win.preMaxBounds.width;
        win.el.style.height = win.preMaxBounds.height;
      }
      win.el.classList.remove('maximized');
      win.state = 'normal';
    } else {
      // Maximize
      win.preMaxBounds = {
        left: win.el.style.left,
        top: win.el.style.top,
        width: win.el.style.width,
        height: win.el.style.height,
      };
      win.el.style.left = '0';
      win.el.style.top = '0';
      win.el.style.width = '100%';
      win.el.style.height = '100%';
      win.el.classList.add('maximized');
      win.state = 'maximized';
    }
    focus(id);
  }

  function close(id) {
    const win = windows.get(id);
    if (!win) return;
    win.el.style.animation = 'window-close 0.25s ease forwards';
    setTimeout(() => {
      win.el.remove();
      windows.delete(id);
      updateTaskbar();
    }, 250);
  }

  function setupDrag(id, el) {
    const titlebar = el.querySelector('.window-titlebar');
    let isDragging = false;
    let startX, startY, origLeft, origTop;

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('window-control-btn')) return;
      const win = windows.get(id);
      if (win && win.state === 'maximized') return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = el.offsetLeft;
      origTop = el.offsetTop;
      el.style.transition = 'none';

      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', onDragEnd);
      e.preventDefault();
    });

    function onDrag(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.left = (origLeft + dx) + 'px';
      el.style.top = Math.max(0, origTop + dy) + 'px';
    }

    function onDragEnd() {
      isDragging = false;
      el.style.transition = '';
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onDragEnd);
    }
  }

  function setupResize(id, el) {
    const handles = el.querySelectorAll('.resize-handle');
    let isResizing = false;
    let resizeDir = '';
    let startX, startY, origRect;

    handles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        const win = windows.get(id);
        if (win && win.state === 'maximized') return;

        isResizing = true;
        resizeDir = handle.dataset.dir;
        startX = e.clientX;
        startY = e.clientY;
        origRect = {
          left: el.offsetLeft,
          top: el.offsetTop,
          width: el.offsetWidth,
          height: el.offsetHeight,
        };
        el.style.transition = 'none';

        document.addEventListener('mousemove', onResize);
        document.addEventListener('mouseup', onResizeEnd);
        e.preventDefault();
        e.stopPropagation();
      });
    });

    function onResize(e) {
      if (!isResizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const minW = 320;
      const minH = 220;

      let newLeft = origRect.left;
      let newTop = origRect.top;
      let newWidth = origRect.width;
      let newHeight = origRect.height;

      if (resizeDir.includes('e')) newWidth = Math.max(minW, origRect.width + dx);
      if (resizeDir.includes('w')) {
        newWidth = Math.max(minW, origRect.width - dx);
        if (newWidth > minW) newLeft = origRect.left + dx;
      }
      if (resizeDir.includes('s')) newHeight = Math.max(minH, origRect.height + dy);
      if (resizeDir.includes('n')) {
        newHeight = Math.max(minH, origRect.height - dy);
        if (newHeight > minH) newTop = origRect.top + dy;
      }

      el.style.left = newLeft + 'px';
      el.style.top = Math.max(0, newTop) + 'px';
      el.style.width = newWidth + 'px';
      el.style.height = newHeight + 'px';
    }

    function onResizeEnd() {
      isResizing = false;
      el.style.transition = '';
      document.removeEventListener('mousemove', onResize);
      document.removeEventListener('mouseup', onResizeEnd);
    }
  }

  function updateTaskbar() {
    const container = document.querySelector('.taskbar-windows');
    container.innerHTML = '';

    windows.forEach((win, id) => {
      const btn = Utils.el('button', {
        className: `taskbar-window-btn ${win.state !== 'minimized' && win.el.classList.contains('focused') ? 'active' : ''}`,
        textContent: `${win.config.icon} ${win.config.titleJp}`,
      });
      btn.addEventListener('click', () => {
        if (win.state === 'minimized') restore(id);
        else if (win.el.classList.contains('focused')) minimize(id);
        else focus(id);
      });
      container.appendChild(btn);
    });
  }

  return { open, close, focus, minimize, restore };
})();
