/* AIRUN V9.8 — Đưa ảnh địa danh (kèm nguồn) vào Trang chủ, trang Thời tiết và mục "Chạy giữa Đà Nẵng".
   Ảnh và nguồn lấy từ js/photos.js. */
(() => {
  'use strict';
  const PH = window.AIRUN_PHOTOS;
  if (!PH || typeof document === 'undefined' || typeof WARDS === 'undefined') return;
  const el = (id) => document.getElementById(id);
  const esc = (v) => escapeHTML(String(v ?? ''));

  // 1. Ảnh tĩnh trong trang (mục "Chạy giữa Đà Nẵng") + dòng nguồn.
  document.querySelectorAll('img[data-photo]').forEach((img) => {
    const p = PH.P[img.dataset.photo]; if (!p) return;
    img.src = p.src;
    img.addEventListener('error', () => { img.style.visibility = 'hidden'; }, { once: true });
  });
  document.querySelectorAll('[data-credit]').forEach((n) => {
    const p = PH.P[n.dataset.credit]; if (!p) return;
    n.innerHTML = `<a href="${p.page}" target="_blank" rel="noopener">${PH.credit(p)}</a>`;
  });

  // 2. Trang chủ: ảnh khu vực đang chọn phía trên thẻ "Bây giờ".
  let homeKey = '';
  function currentKey() {
    try { if (typeof gpsLocation !== 'undefined' && gpsLocation && typeof nearestWard === 'function') return nearestWard(gpsLocation.lat, gpsLocation.lon).item.key; } catch {}
    return typeof selectedKey !== 'undefined' ? selectedKey : 'HaiChau';
  }
  function renderHomePhoto() {
    const box = el('hubPhoto'); if (!box) return;
    const key = currentKey(); if (key === homeKey) return;
    homeKey = key;
    const w = WARDS.find((x) => x.key === key), pid = PH.area(key), p = PH.P[pid];
    box.innerHTML = PH.figure(pid, { cls: 'ph-hub', eager: true, caption: `<b>${esc(w?.name || '')}</b><span>${esc(p.title)}</span>` });
  }

  // 3. Trang chủ: "Góc chạy đẹp" — cuộn ngang, mỗi thẻ có ảnh, mẹo chạy và nút lên kế hoạch.
  function renderSpots() {
    const box = el('hubSpots'); if (!box || box.dataset.ready) return;
    box.dataset.ready = '1';
    box.innerHTML = `<h3 class="hub-h">Góc chạy đẹp ở Đà Nẵng</h3><div class="spots-row">${PH.SPOTS.map((s, i) => `<article class="spot">${PH.figure(s.photo, { cls: 'ph-spot' })}<div class="spot-body"><b>${esc(s.name)}</b><p>${esc(s.tip)}</p><button type="button" class="chip-btn" data-spot="${i}">Xem điểm chạy ở đây</button></div></article>`).join('')}</div>`;
    box.querySelectorAll('[data-spot]').forEach((b) => b.addEventListener('click', async () => {
      const s = PH.SPOTS[Number(b.dataset.spot)];
      activateView('plan');
      try { await selectWard(s.area, { analyze: true }); } catch {}
    }));
  }

  // 4. Trang Thời tiết: ảnh khu vực đang xem.
  let wxKey = '';
  function renderWeatherPhoto() {
    const box = el('wxPhoto'), name = el('wxAreaName')?.textContent?.trim(); if (!box || !name) return;
    const w = WARDS.find((x) => x.name === name), key = w?.key || 'gps';
    if (key === wxKey) return; wxKey = key;
    const pid = w ? PH.area(w.key) : 'cityView', p = PH.P[pid];
    box.innerHTML = PH.figure(pid, { cls: 'ph-wx', caption: `<b>${esc(w?.name || 'Vị trí của bạn')}</b><span>${esc(p.title)}</span>` });
  }
  const wxName = el('wxAreaName');
  if (wxName) new MutationObserver(renderWeatherPhoto).observe(wxName, { childList: true, characterData: true, subtree: true });

  document.addEventListener('airun:update', () => { renderHomePhoto(); });
  document.addEventListener('airun:view', (e) => { if (e.detail?.view === 'home') { renderHomePhoto(); renderSpots(); } if (e.detail?.view === 'weather') renderWeatherPhoto(); });
  renderHomePhoto(); renderSpots(); renderWeatherPhoto();
})();
