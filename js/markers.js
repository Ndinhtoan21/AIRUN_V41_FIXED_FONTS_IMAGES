/* AIRUN V9.5.1 — luôn hiện chấm vị trí trên cả 2 bản đồ
   - Chấm xanh dương "Bạn ở đây" = vị trí GPS hiện tại.
   - Ghim xanh lá "Điểm xuất phát" = điểm bạn chọn (chạm bản đồ / tìm địa điểm).
   - Nút ◎ trên bản đồ: lấy vị trí hiện tại, hiện chấm và đưa bản đồ về đó. */
(() => {
  'use strict';
  if (typeof document === 'undefined' || typeof routeFallbackMap === 'undefined') return;
  const el = (id) => document.getElementById(id);
  const icon = (n) => `<svg class="ic" aria-hidden="true"><use href="#${n}"/></svg>`;
  const mk = { routeMe: null, routePin: null, runMe: null, runPin: null };
  const near = (a, b) => a && b && haversine(+a.lat, +a.lon, +b.lat, +b.lon) < 0.03;

  function meEl() { const d = document.createElement('div'); d.className = 'airun-me'; d.innerHTML = '<i></i><span>Bạn ở đây</span>'; return d; }
  function pinEl(text) { const d = document.createElement('div'); d.className = 'airun-pin'; d.innerHTML = `<span>${text}</span><i></i>`; return d; }
  function place(key, map, pos, factory, anchor) {
    if (!map || !window.maplibregl) return;
    if (!pos) { if (mk[key]) { mk[key].remove(); mk[key] = null; } return; }
    const ll = [+pos.lon, +pos.lat];
    if (!mk[key]) mk[key] = new maplibregl.Marker({ element: factory(), anchor }).setLngLat(ll).addTo(map);
    else mk[key].setLngLat(ll);
  }
  const myPos = () => tracker.rawPoint || gpsLocation || null;

  function sync() {
    try {
      const me = myPos(), pin = routePlanner.customStart, route = routePlanner.current;
      // Bản đồ kế hoạch / cung chạy
      const rmap = routeFallbackMap.map;
      place('routeMe', rmap, me, meEl, 'center');
      const pinPos = pin && !(route && near(route.points?.[0], pin)) ? pin : null; // khi đã có cung, ghim "Bắt đầu / Kết thúc" sẵn có đã đánh dấu
      place('routePin', rmap, pinPos, () => pinEl('Điểm xuất phát'), 'bottom');
      // Bản đồ chạy
      const umap = runFallbackMap.map;
      place('runMe', umap, tracker.status === 'running' || tracker.status === 'paused' ? null : me, meEl, 'center'); // khi đang chạy đã có chấm GPS riêng
      const plannedStart = tracker.plannedRoute?.points?.[0] || null;
      place('runPin', umap, tracker.status === 'idle' || tracker.status === 'finished' ? (plannedStart || pin) : null, () => pinEl('Xuất phát'), 'bottom');
    } catch (error) { console.warn('AIRUN markers:', error); }
  }

  async function locate(which) {
    try {
      const p = await requestGPSPosition(() => {}, { maximumAge: 10000 });
      const pos = { lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy };
      if (tracker.status === 'idle' || tracker.status === 'finished') tracker.rawPoint = pos;
      if (!gpsLocation) {
        const n = nearestWard(pos.lat, pos.lon).item;
        gpsLocation = { lat: pos.lat, lon: pos.lon, accuracy: pos.accuracy, label: n.name, cacheId: `gps:${pos.lat.toFixed(3)},${pos.lon.toFixed(3)}` };
      }
      sync();
      const map = which === 'run' ? runFallbackMap.map : routeFallbackMap.map;
      map?.easeTo({ center: [pos.lon, pos.lat], zoom: 16, duration: 500 });
      showToast(`Đã định vị · sai số ±${Math.round(pos.accuracy || 0)} m`);
    } catch (error) { showToast(typeof gpsHelpMessage === 'function' ? gpsHelpMessage(error) : 'Chưa lấy được vị trí GPS.'); }
  }

  // Gọi sync sau các thao tác làm đổi vị trí / điểm xuất phát / cung
  for (const name of ['setCustomStart', 'clearCustomStart', 'useGPS', 'generateSuggestedRoute', 'useSuggestedRoute', 'renderSuggestedRoute', 'refreshRunMapLibre', 'ensureRouteMapLibre', 'ensureRunMapLibre', 'finishRun', 'startRun']) {
    const orig = window[name]; if (typeof orig !== 'function') continue;
    window[name] = function () { const out = orig.apply(this, arguments); Promise.resolve(out).finally(() => setTimeout(sync, 30)); return out; };
  }

  function mount() {
    for (const [wrapSel, which] of [['.route-map-wrap', 'route'], ['#trackerMapWrap', 'run']]) {
      const wrap = document.querySelector(wrapSel);
      if (wrap && !wrap.querySelector('.map-locate-btn')) {
        wrap.insertAdjacentHTML('beforeend', `<button type="button" class="map-locate-btn" data-locate="${which}" aria-label="Hiện vị trí của tôi trên bản đồ">${icon('i-locate-fixed')}</button>`);
      }
    }
    document.addEventListener('click', (e) => { const b = e.target.closest('[data-locate]'); if (b) { e.preventDefault(); void locate(b.dataset.locate); } });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mount, 0), { once: true }); else setTimeout(mount, 0);
  window.__airunMarkers = { sync, mk };
})();
