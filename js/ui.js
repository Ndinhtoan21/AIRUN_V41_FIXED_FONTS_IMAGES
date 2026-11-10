/* AIRUN V9.1 — tương tác giao diện điện thoại
   - hiệu ứng gợn sóng + rung nhẹ khi chạm (Android hỗ trợ navigator.vibrate)
   - thanh "Lộ trình 5 bước" tự sáng đúng bước đang làm
   - tiểu mục dính trong tab Nhật ký
   - nút "Hỏi AI" thu gọn khi cuộn xuống
   Chỉ đọc/ghi giao diện, không đụng tới dữ liệu hay logic chấm điểm trong js/app.js. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const isMobile = () => window.matchMedia?.('(max-width: 780px)').matches;
  const view = () => document.body.dataset.view || 'home';

  /* ---------- 1. Hiệu ứng khi chạm ---------- */
  // iOS chỉ áp :active khi trang có lắng nghe touchstart.
  document.addEventListener('touchstart', () => {}, { passive: true });

  const PRESSABLE = [
    '.primary', '.light-btn', '.ghost-btn', '.soft-btn', '.save-btn', '.location-action', '.mini-action', '.chip-btn',
    '.run-start', '.run-secondary', '.run-finish', '.segment button', '.decision-actions button', '.coach-suggest button',
    '.ai-route-examples button', '.route-distance-chips button', '.acc-tabs button', '.next-step', '.journey a', '.subnav a'
  ].join(',');
  const HAPTIC = '.primary,.light-btn,.run-start,.run-finish,.next-step,.tabbar a,.ai-fab,.segment button,.route-distance-chips button';

  document.addEventListener('pointerdown', (event) => {
    const target = event.target.closest?.(PRESSABLE);
    if (target && !target.disabled && !(reduceMotion && reduceMotion.matches)) {
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const dot = document.createElement('span');
      dot.className = 'ui-ripple';
      dot.style.width = dot.style.height = `${size}px`;
      dot.style.left = `${event.clientX - rect.left - size / 2}px`;
      dot.style.top = `${event.clientY - rect.top - size / 2}px`;
      target.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
      setTimeout(() => dot.remove(), 900);
    }
    if (event.pointerType === 'touch' && event.target.closest?.(HAPTIC) && navigator.vibrate) {
      try { navigator.vibrate(8); } catch {}
    }
  }, { passive: true });

  /* ---------- 2. Lộ trình 5 bước ---------- */
  const journey = $('#journey');
  const RUN_SECTIONS = [
    { step: 3, el: () => $('#mapSection') },
    { step: 4, el: () => $('#tracker') },
    { step: 5, el: () => $('#feedbackFold') }
  ];
  const stepTarget = { 3: '#mapSection', 4: '#tracker', 5: '#feedbackFold' };

  function currentStep() {
    const v = view();
    if (v === 'plan') return 1;
    if (v === 'coach') return 2;
    if (v !== 'run') return 0;
    const line = window.innerHeight * 0.38;
    let step = 3;
    for (const s of RUN_SECTIONS) {
      const el = s.el();
      if (el && el.getBoundingClientRect().top < line) step = s.step;
    }
    return step;
  }

  let lastStep = -1;
  function paintJourney() {
    if (!journey) return;
    const step = currentStep();
    if (step === lastStep) return;
    lastStep = step;
    $$('a', journey).forEach((a) => {
      const n = Number(a.dataset.step);
      a.classList.toggle('current', n === step);
      a.classList.toggle('done', step > 0 && n < step);
      if (n === step) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
    const cur = $('a.current', journey);
    if (cur && journey.scrollWidth > journey.clientWidth) {
      journey.scrollTo({ left: cur.offsetLeft - journey.clientWidth / 2 + cur.offsetWidth / 2, behavior: reduceMotion?.matches ? 'auto' : 'smooth' });
    }
  }

  function smoothTo(selector) {
    const el = $(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion?.matches ? 'auto' : 'smooth', block: 'start' });
  }

  journey?.addEventListener('click', (event) => {
    const a = event.target.closest('a[data-step]');
    if (!a) return;
    const step = Number(a.dataset.step);
    // Đang ở tab Chạy thì chỉ cuộn tới đúng phần, không đổi trang.
    if (step >= 3 && view() === 'run') {
      event.preventDefault();
      if (step === 5) { const f = $('#feedbackFold'); if (f) f.open = true; }
      smoothTo(stepTarget[step]);
      if (location.hash !== '#/run') history.replaceState(null, '', '#/run');
    } else if (location.hash === a.getAttribute('href')) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  /* ---------- 3. Tiểu mục dính trong Nhật ký ---------- */
  const SUBNAVS = [['journal', $('#journalNav')], ['coach', $('#coachNav')]].filter((x) => x[1]);
  SUBNAVS.forEach(([, nav]) => nav.addEventListener('click', (event) => {
    const a = event.target.closest('a[href^="#"]');
    if (!a) return;
    event.preventDefault();
    const id = a.getAttribute('href');
    const target = $(id);
    if (target?.tagName === 'DETAILS') target.open = true;
    smoothTo(id);
  }));
  function paintSubnav() {
    const found = SUBNAVS.find(([v]) => v === view());
    if (!found) return;
    const subnav = found[1];
    const line = window.innerHeight * 0.35;
    let active = null;
    $$('a', subnav).forEach((a) => {
      const el = $(a.getAttribute('href'));
      if (el && el.offsetParent !== null && el.getBoundingClientRect().top < line) active = a;
    });
    active = active || $('a', subnav);
    $$('a', subnav).forEach((a) => a.classList.toggle('active', a === active));
    if (active && subnav.scrollWidth > subnav.clientWidth) {
      const left = active.offsetLeft - subnav.clientWidth / 2 + active.offsetWidth / 2;
      if (Math.abs(subnav.scrollLeft - left) > 40) subnav.scrollTo({ left, behavior: 'smooth' });
    }
  }

  /* ---------- 4. Nút "Hỏi AI" thu gọn khi cuộn xuống ---------- */
  let lastY = window.scrollY;
  function onScrollFab() {
    const y = window.scrollY;
    if (Math.abs(y - lastY) < 8) return;
    document.body.classList.toggle('fab-mini', y > 160 && y > lastY);
    lastY = y;
  }

  /* ---------- 5. Gom sự kiện cuộn (1 lần mỗi khung hình) ---------- */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      paintJourney();
      paintSubnav();
      onScrollFab();
    });
  }, { passive: true });

  // Đổi tab (app.js đặt body.dataset.view) → cập nhật thanh lộ trình.
  new MutationObserver(() => { lastStep = -1; paintJourney(); paintSubnav(); document.body.classList.remove('fab-mini'); })
    .observe(document.body, { attributes: true, attributeFilter: ['data-view'] });
  window.addEventListener('hashchange', () => setTimeout(() => { lastStep = -1; paintJourney(); }, 120));

  /* ---------- 6. "Về AIRUN": mở sẵn trên máy tính, thu gọn trên điện thoại ---------- */
  const about = $('#aboutAirun');
  if (about && !isMobile()) about.open = true;

  paintJourney();
  paintSubnav();
})();
