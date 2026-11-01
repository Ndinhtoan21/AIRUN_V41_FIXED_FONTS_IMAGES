/* AIRUN V9.5 — bản đồ toàn màn hình + chế độ chạy chuyên nghiệp + giọng chỉ đường
   1) Bản đồ cung chạy "Phóng to": toàn màn hình, chạm chọn điểm xuất phát, chọn km, vẽ cung gợi ý, "Chạy cung này".
   2) Chế độ chạy: bản đồ toàn màn hình (mặc định nền tối), bảng chỉ đường, số liệu lớn, nút Theo dõi.
   3) Giọng chỉ đường: báo trước điểm rẽ (theo GraphHopper; nếu không có thì tự tính từ hình dạng cung),
      nhắc khi lệch cung, báo sắp về đích. Không gọi AI cho phần chỉ đường (tức thì, không tốn tiền). */
(() => {
  'use strict';
  if (typeof document === 'undefined' || typeof tracker === 'undefined') return;
  const el = (id) => document.getElementById(id);
  const icon = (n, c = 'ic') => `<svg class="${c}" aria-hidden="true"><use href="#${n}"/></svg>`;
  const dist = (a, b) => haversine(+a.lat, +a.lon, +b.lat, +b.lon) * 1000; // mét
  const bearing = (a, b) => { const r = Math.PI / 180, y = Math.sin((b.lon - a.lon) * r) * Math.cos(b.lat * r), x = Math.cos(a.lat * r) * Math.sin(b.lat * r) - Math.sin(a.lat * r) * Math.cos(b.lat * r) * Math.cos((b.lon - a.lon) * r); return (Math.atan2(y, x) / r + 360) % 360; };
  const turnWord = (sign) => ({ '-3': 'Rẽ gắt trái', '-2': 'Rẽ trái', '-1': 'Chếch trái', '1': 'Chếch phải', '2': 'Rẽ phải', '3': 'Rẽ gắt phải', '-7': 'Đi về bên trái', '7': 'Đi về bên phải', '6': 'Vào vòng xuyến', '-98': 'Quay đầu', '-8': 'Quay đầu', '8': 'Quay đầu' }[String(sign)] || 'Đi tiếp');
  const turnIcon = (sign) => sign <= -1 && sign >= -3 || sign === -7 ? 'nav-left' : sign >= 1 && sign <= 3 || sign === 7 ? 'nav-right' : sign === -98 || Math.abs(sign) === 8 ? 'nav-uturn' : 'nav-straight';
  const roundM = (m) => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.max(10, Math.round(m / 10) * 10)} m`;

  /* ---------- Chuẩn bị cung để chỉ đường ---------- */
  function prepareNav(route) {
    const pts = (route?.points || []).map((p) => ({ lat: +p.lat, lon: +p.lon }));
    if (pts.length < 2) return null;
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
    let steps = [];
    if (Array.isArray(route.steps) && route.steps.length) {
      steps = route.steps.filter((s) => s.at > 0 && s.at < pts.length).map((s) => ({ sign: s.sign, street: s.street || '', along: cum[s.at] }));
    } else steps = geometricTurns(pts, cum);
    steps = steps.filter((s, i, a) => !i || s.along - a[i - 1].along > 25);
    return { pts, cum, total: cum[cum.length - 1], steps, progress: 0, idx: 0, said: new Set(), off: 0, offSaidAt: 0, finishSaid: false };
  }
  // Không có chỉ dẫn từ dịch vụ → tìm chỗ đổi hướng > 40° trên cung (so sánh hướng 25 m trước/sau).
  function geometricTurns(pts, cum) {
    const at = (d) => { let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return { lat: pts[i - 1].lat + (pts[i].lat - pts[i - 1].lat) * t, lon: pts[i - 1].lon + (pts[i].lon - pts[i - 1].lon) * t }; };
    const total = cum[cum.length - 1], out = [];
    for (let d = 30; d < total - 30; d += 12) {
      const a = at(d - 25), m = at(d), b = at(d + 25);
      let delta = bearing(m, b) - bearing(a, m); delta = ((delta + 540) % 360) - 180;
      if (Math.abs(delta) < 40) continue;
      const sign = Math.abs(delta) > 150 ? -98 : delta > 0 ? (delta > 110 ? 3 : 2) : (delta < -110 ? -3 : -2);
      const last = out[out.length - 1];
      if (last && d - last.along < 45) { if (Math.abs(delta) > Math.abs(last.delta)) Object.assign(last, { along: d, sign, delta }); continue; }
      out.push({ along: d, sign, delta, street: '' });
    }
    return out;
  }
  // Chiếu vị trí lên cung: tìm đoạn gần nhất quanh tiến độ hiện tại (tránh nhảy sang đoạn quay về của vòng chạy).
  function locate(nav, p) {
    let best = { d: Infinity, along: nav.progress, i: nav.idx };
    const from = Math.max(0, nav.idx - 6), to = Math.min(nav.pts.length - 1, nav.idx + 120);
    for (let i = from; i < to; i++) {
      if (nav.cum[i] > nav.progress + 300) break; // chỉ xét đoạn phía trước ≤ 300 m: vòng chạy có điểm cuối trùng điểm đầu
      const a = nav.pts[i], b = nav.pts[i + 1], kx = Math.cos(a.lat * Math.PI / 180);
      const ax = 0, ay = 0, bx = (b.lon - a.lon) * kx, by = b.lat - a.lat, px = (p.lon - a.lon) * kx, py = p.lat - a.lat;
      const len2 = bx * bx + by * by, t = len2 ? Math.max(0, Math.min(1, (px * bx + py * by) / len2)) : 0;
      const q = { lat: a.lat + (b.lat - a.lat) * t, lon: a.lon + (b.lon - a.lon) * t }, d = dist(p, q);
      if (d < best.d) best = { d, along: nav.cum[i] + (nav.cum[i + 1] - nav.cum[i]) * t, i };
    }
    return best;
  }

  /* ---------- Giọng nói chỉ đường (không ngắt câu đang đọc dở) ---------- */
  let voiceOn = localGet('airun-v95-nav-voice', true) !== false;
  function say(text, urgent = false) {
    try {
      if (!voiceOn || !('speechSynthesis' in window) || !text) return;
      if (urgent) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'vi-VN'; u.rate = 1.04;
      const vi = speechSynthesis.getVoices().find((v) => /^vi/i.test(v.lang)); if (vi) u.voice = vi;
      speechSynthesis.speak(u);
    } catch {}
  }

  let nav = null;
  function nextStep() { return nav?.steps.find((s) => s.along > nav.progress + 5) || null; }
  function navUpdate(point) {
    if (!nav || !point) return;
    const loc = locate(nav, point);
    if (loc.d < 60 && loc.along >= nav.progress - 30) { nav.progress = Math.max(nav.progress, loc.along); nav.idx = loc.i; }
    // Lệch cung
    if (loc.d > 45) {
      nav.off++;
      if (nav.off >= 2 && Date.now() - nav.offSaidAt > 60000) { nav.offSaidAt = Date.now(); say('Bạn đang đi lệch cung. Hãy quay lại đường màu xanh trên bản đồ.', true); }
    } else if (nav.off >= 2) { nav.off = 0; say('Đã trở lại cung chạy.'); } else nav.off = 0;
    const step = nextStep(), left = Math.max(0, nav.total - nav.progress);
    if (step) {
      const toTurn = step.along - nav.progress, key = Math.round(step.along);
      const street = step.street ? ` vào ${step.street}` : '', name = `${turnWord(step.sign)}${street}`;
      if (toTurn <= 160 && toTurn > 60 && !nav.said.has(`far${key}`)) { nav.said.add(`far${key}`); say(`Khoảng ${Math.round(toTurn / 10) * 10} mét nữa, ${turnWord(step.sign).toLowerCase()}${street}.`); }
      if (toTurn <= 35 && !nav.said.has(`now${key}`)) { nav.said.add(`now${key}`); say(`${name}.`, true); }
    }
    if (!nav.finishSaid && nav.progress > nav.total * 0.6 && left < 250) { nav.finishSaid = true; say(`Sắp về đích, còn khoảng ${Math.round(left / 10) * 10} mét. Cố lên!`); }
    renderBanner();
  }
  function renderBanner() {
    const box = el('navBanner'); if (!box) return;
    if (!nav) { box.hidden = !document.body.classList.contains('run-mode'); box.innerHTML = `<span class="nb-ic">${icon('i-locate-fixed')}</span><div><b>Chạy tự do</b><small>Chưa chọn cung · AIRUN ghi quãng đường bằng GPS</small></div>`; return; }
    const step = nextStep(), left = Math.max(0, nav.total - nav.progress);
    box.hidden = false;
    if (nav.off >= 2) { box.className = 'nav-banner warn'; box.innerHTML = `<span class="nb-ic">${icon('i-triangle-alert')}</span><div><b>Đang lệch cung</b><small>Quay lại đường màu xanh · còn ${roundM(left)}</small></div>`; return; }
    box.className = 'nav-banner';
    box.innerHTML = step
      ? `<span class="nb-ic">${icon(turnIcon(step.sign))}</span><div><b>${roundM(step.along - nav.progress)}</b><small>${turnWord(step.sign)}${step.street ? ` vào ${escapeHTML(step.street)}` : ''} · còn ${roundM(left)}</small></div>`
      : `<span class="nb-ic">${icon('i-flag')}</span><div><b>${roundM(left)}</b><small>Đi thẳng về đích</small></div>`;
  }

  // Bọc handleTrackPosition: mỗi điểm GPS → cập nhật chỉ đường (watchPosition đọc tên hàm toàn cục lúc bắt đầu theo dõi).
  const originalTrack = handleTrackPosition;
  handleTrackPosition = function (position) { // eslint-disable-line no-global-assign
    const out = originalTrack.apply(this, arguments);
    try { if (tracker.status === 'running' && position?.coords && Number(position.coords.accuracy || 999) <= 80) navUpdate({ lat: position.coords.latitude, lon: position.coords.longitude }); } catch (error) { console.warn('AIRUN nav:', error); }
    return out;
  };
  // Khi đưa một cung vào GPS → chuẩn bị chỉ đường.
  const originalUse = useSuggestedRoute;
  useSuggestedRoute = function () { // eslint-disable-line no-global-assign
    const out = originalUse.apply(this, arguments);
    try { nav = prepareNav(tracker.plannedRoute); renderBanner(); } catch (error) { console.warn('AIRUN nav prepare:', error); }
    return out;
  };

  /* ---------- Toàn màn hình (dùng chung) ---------- */
  let fsKind = null, prevTheme = null;
  function lockPage(on) { document.body.classList.toggle('fs-open', on); }
  function resizeSoon(map) { [60, 260, 600].forEach((t) => setTimeout(() => { try { map?.resize(); } catch {} }, t)); }
  window.addEventListener('popstate', () => { if (fsKind === 'route') closeRouteFs(true); else if (fsKind === 'run') closeRunMode(true); });

  /* ---------- 1. Bản đồ cung chạy toàn màn hình ---------- */
  function syncRouteFs() {
    const panel = el('routeFsPanel'); if (!panel || fsKind !== 'route') return;
    const o = routeOrigin(), r = routePlanner.current;
    const target = Number(routePlanner.targetKm || planEstimate().distance) || 3;
    el('rfsStart').textContent = o.label || 'Vị trí hiện tại';
    el('rfsHint').textContent = routePlanner.picking ? 'Chạm vào bản đồ để chọn điểm xuất phát' : 'Đã chọn điểm xuất phát · chạm "Chọn lại" để đổi';
    panel.querySelectorAll('[data-fs-km]').forEach((b) => b.classList.toggle('on', Math.abs(Number(b.dataset.fsKm) - target) < 0.05));
    const res = el('rfsResult');
    if (r?.points?.length) {
      const eta = Math.round(r.distanceKm * planEstimate().pace);
      const q = el('routeQuality')?.querySelector('.rq-head .pill')?.textContent || '';
      res.hidden = false; res.innerHTML = `<b>${r.distanceKm.toFixed(2)} km</b><span>≈ ${eta} phút${q ? ` · chất lượng ${q}` : ''}</span>`;
      el('rfsRun').hidden = false; el('rfsAgain').hidden = false; el('rfsMake').textContent = 'Vẽ cung mới';
    } else { res.hidden = true; el('rfsRun').hidden = true; el('rfsAgain').hidden = true; el('rfsMake').textContent = `Vẽ cung ${target.toFixed(target < 10 ? 1 : 0)} km`; }
  }
  async function openRouteFs() {
    const wrap = document.querySelector('.route-map-wrap'); if (!wrap) return;
    fsKind = 'route'; wrap.classList.add('fs'); lockPage(true); history.pushState({ airunFs: 'route' }, '');
    if (!routePlanner.customStart) routePlanner.picking = true;
    el('routeFsPanel').hidden = false; syncRouteFs();
    const map = await ensureRouteMapLibre(); resizeSoon(map);
  }
  function closeRouteFs(fromPop = false) {
    const wrap = document.querySelector('.route-map-wrap'); if (!wrap || fsKind !== 'route') return;
    wrap.classList.remove('fs'); fsKind = null; lockPage(false); routePlanner.picking = false;
    el('routeFsPanel').hidden = true; const hint = el('pickHint'); if (hint) hint.hidden = true;
    resizeSoon(routeFallbackMap.map);
    if (!fromPop && history.state?.airunFs) history.back();
  }

  /* ---------- 2. Chế độ chạy toàn màn hình ---------- */
  function syncHud() {
    if (fsKind !== 'run') return;
    el('hudDist').textContent = el('trackerDistance')?.textContent || '0.00';
    el('hudTime').textContent = el('trackerTime')?.textContent || '00:00:00';
    el('hudPace').textContent = el('trackerPace')?.textContent || '—';
    const st = tracker.status;
    el('hudStart').hidden = st === 'running' || st === 'paused';
    el('hudPause').hidden = !(st === 'running' || st === 'paused');
    el('hudFinish').hidden = !(st === 'running' || st === 'paused');
    el('hudPause').innerHTML = st === 'paused' ? `${icon('i-play')}<span>Tiếp tục</span>` : `<i class="pause-ic"></i><span>Tạm dừng</span>`;
    el('hudVoice').setAttribute('aria-pressed', String(voiceOn));
    el('hudVoice').querySelector('span').textContent = voiceOn ? 'Giọng: bật' : 'Giọng: tắt';
    el('hudFollow').classList.toggle('on', Boolean(window.__airunFollow));
  }
  async function openRunMode() {
    const wrap = el('trackerMapWrap'); if (!wrap) return;
    const fromRoute = fsKind === 'route';
    if (fromRoute) closeRouteFs(true); // không history.back() để tránh popstate đóng luôn chế độ chạy
    activateView('run');
    fsKind = 'run'; document.body.classList.add('run-mode'); wrap.classList.add('fs'); lockPage(true);
    if (fromRoute && history.state?.airunFs) history.replaceState({ airunFs: 'run' }, ''); else history.pushState({ airunFs: 'run' }, '');
    el('runHud').hidden = false; window.__airunFollow = true;
    if (!nav && tracker.plannedRoute) nav = prepareNav(tracker.plannedRoute);
    renderBanner(); syncHud();
    prevTheme = mapTheme; const want = localGet('airun-v95-run-theme', 'dark');
    if (want !== mapTheme) await setMapTheme(want, { silent: true, remember: false });
    const map = await ensureRunMapLibre(); resizeSoon(map); void refreshRunMapLibre({ fit: true });
    try { if (!tracker.rawPoint && !gpsLocation && tracker.status === 'idle') { const p = await requestGPSPosition(() => {}, { maximumAge: 15000 }); tracker.rawPoint = { lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }; void refreshRunMapLibre({ fit: !tracker.plannedRoute }); } } catch {}
  }
  function closeRunMode(fromPop = false) {
    const wrap = el('trackerMapWrap'); if (!wrap || fsKind !== 'run') return;
    wrap.classList.remove('fs'); document.body.classList.remove('run-mode'); fsKind = null; lockPage(false); el('runHud').hidden = true; window.__airunFollow = false;
    if (prevTheme && prevTheme !== mapTheme) void setMapTheme(prevTheme, { silent: true, remember: false });
    resizeSoon(runFallbackMap.map);
    if (!fromPop && history.state?.airunFs) history.back();
  }
  function follow() {
    window.__airunFollow = true; runFallbackMap.userAt = 0;
    const p = tracker.rawPoint || gpsLocation, map = runFallbackMap.map;
    if (p && map) map.easeTo({ center: [+p.lon, +p.lat], zoom: 16.5, duration: 500 });
    syncHud(); showToast('Đang theo dõi vị trí của bạn.');
  }

  /* ---------- Gắn giao diện ---------- */
  function mount() {
    // Nút phóng to trên bản đồ cung chạy + bảng điều khiển toàn màn hình
    const rwrap = document.querySelector('.route-map-wrap');
    if (rwrap && !el('routeFsBtn')) {
      rwrap.insertAdjacentHTML('beforeend', `<button type="button" class="map-fs-btn" id="routeFsBtn" aria-label="Mở bản đồ toàn màn hình">${icon('i-maximize')}<span>Phóng to</span></button>
        <div class="route-fs-panel" id="routeFsPanel" hidden>
          <div class="rfs-top"><button type="button" class="rfs-close" id="rfsClose" aria-label="Thu nhỏ bản đồ">${icon('i-x')}</button><div class="rfs-hint">${icon('i-map-pin')}<span id="rfsHint">Chạm vào bản đồ để chọn điểm xuất phát</span></div></div>
          <div class="rfs-sheet">
            <div class="rfs-start"><small>Điểm xuất phát</small><b id="rfsStart">—</b><button type="button" class="chip-btn" id="rfsRepick">${icon('i-map-pin')}Chọn lại</button><button type="button" class="chip-btn" id="rfsGps">${icon('i-locate-fixed')}Vị trí của tôi</button></div>
            <div class="rfs-km">${[3, 5, 8, 10].map((k) => `<button type="button" data-fs-km="${k}">${k} km</button>`).join('')}</div>
            <div class="rfs-result" id="rfsResult" hidden></div>
            <div class="rfs-actions"><button type="button" class="primary" id="rfsMake">Vẽ cung</button><button type="button" class="soft-btn" id="rfsAgain" hidden>${icon('i-refresh-cw')}Cung khác</button><button type="button" class="light-btn" id="rfsRun" hidden>${icon('i-play')}Chạy cung này</button></div>
          </div>
        </div>`);
    }
    // HUD chế độ chạy
    const twrap = el('trackerMapWrap');
    if (twrap && !el('runHud')) {
      twrap.insertAdjacentHTML('beforeend', `<button type="button" class="map-fs-btn run" id="runModeBtn" aria-label="Mở chế độ chạy toàn màn hình">${icon('i-maximize')}<span>Chế độ chạy</span></button>
        <div class="run-hud" id="runHud" hidden>
          <div class="hud-top"><button type="button" class="hud-round" id="hudClose" aria-label="Thoát chế độ chạy">${icon('i-x')}</button><div class="nav-banner" id="navBanner" hidden></div></div>
          <div class="hud-side"><button type="button" class="hud-round" id="hudFollow" aria-label="Theo dõi vị trí">${icon('i-navigation')}</button></div>
          <div class="hud-bottom">
            <div class="hud-stats"><div><b id="hudDist">0.00</b><small>km</small></div><div><b id="hudTime">00:00:00</b><small>thời gian</small></div><div><b id="hudPace">—</b><small>pace /km</small></div></div>
            <div class="hud-actions">
              <button type="button" class="hud-btn ghost" id="hudVoice" aria-pressed="true">${icon('i-mic')}<span>Giọng: bật</span></button>
              <button type="button" class="hud-btn go" id="hudStart">${icon('i-play')}<span>Bắt đầu</span></button>
              <button type="button" class="hud-btn" id="hudPause" hidden><i class="pause-ic"></i><span>Tạm dừng</span></button>
              <button type="button" class="hud-btn stop" id="hudFinish" hidden><i class="stop-ic"></i><span>Kết thúc</span></button>
            </div>
          </div>
        </div>`);
    }
    // Nút "Chế độ chạy" cạnh các nút điều khiển GPS
    const ctr = document.querySelector('.tracker-controls');
    if (ctr && !el('runModeBig')) ctr.insertAdjacentHTML('beforebegin', `<button type="button" class="run-mode-cta" id="runModeBig">${icon('i-maximize')}<span><b>Mở chế độ chạy</b><small>Bản đồ toàn màn hình · giọng chỉ đường</small></span></button>`);

    const on = (id, fn) => el(id)?.addEventListener('click', fn);
    on('routeFsBtn', () => runAsyncTask('Bản đồ toàn màn hình', openRouteFs));
    on('rfsClose', () => closeRouteFs());
    on('rfsRepick', () => { routePlanner.picking = true; syncRouteFs(); showToast('Chạm vào bản đồ để chọn điểm xuất phát.'); });
    on('rfsGps', () => runAsyncTask('GPS', async () => { await useGPS({ scroll: false }); if (typeof clearCustomStart === 'function') clearCustomStart(); routePlanner.picking = false; syncRouteFs(); }));
    el('routeFsPanel')?.addEventListener('click', (e) => { const b = e.target.closest('[data-fs-km]'); if (!b) return; routePlanner.usePlan = false; routePlanner.targetKm = Number(b.dataset.fsKm); syncRoutePlanCard(); syncRouteFs(); });
    on('rfsMake', () => runAsyncTask('Tạo cung chạy', async () => { routePlanner.picking = false; await generateSuggestedRoute(); syncRouteFs(); }));
    on('rfsAgain', () => runAsyncTask('Tạo cung khác', async () => { await generateSuggestedRoute({ regenerate: true }); syncRouteFs(); }));
    on('rfsRun', () => { useSuggestedRoute(); runAsyncTask('Chế độ chạy', openRunMode); });
    on('runModeBtn', () => runAsyncTask('Chế độ chạy', openRunMode));
    on('runModeBig', () => runAsyncTask('Chế độ chạy', openRunMode));
    on('hudClose', () => closeRunMode());
    on('hudFollow', follow);
    on('hudStart', () => runAsyncTask('Bắt đầu chạy', async () => { if (!nav && tracker.plannedRoute) nav = prepareNav(tracker.plannedRoute); await startRun(); if (nav) { nav.progress = 0; nav.idx = 0; nav.said.clear(); nav.finishSaid = false; say(`Cung ${(nav.total / 1000).toFixed(1)} ki lô mét. Đi theo đường màu xanh, mình sẽ báo trước mỗi chỗ rẽ.`); } syncHud(); }));
    on('hudPause', () => runAsyncTask('Tạm dừng', async () => { await pauseOrResumeRun(); syncHud(); }));
    on('hudFinish', () => runAsyncTask('Kết thúc', async () => { await finishRun(); closeRunMode(); }));
    on('hudVoice', () => { voiceOn = !voiceOn; localSet('airun-v95-nav-voice', voiceOn); if (!voiceOn) try { speechSynthesis.cancel(); } catch {} syncHud(); });
    // Cập nhật bảng chọn khi điểm xuất phát/cung thay đổi
    for (const name of ['setCustomStart', 'generateSuggestedRoute']) {
      const orig = window[name]; if (typeof orig !== 'function') continue;
      window[name] = function () { const out = orig.apply(this, arguments); Promise.resolve(out).finally(() => setTimeout(syncRouteFs, 50)); return out; };
    }
    setInterval(syncHud, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mount, 0), { once: true }); else setTimeout(mount, 0);

  window.__airunNav = { prepareNav, geometricTurns, locate, navUpdate, get nav() { return nav; }, set nav(v) { nav = v; }, openRouteFs, closeRouteFs, openRunMode, closeRunMode };
})();
