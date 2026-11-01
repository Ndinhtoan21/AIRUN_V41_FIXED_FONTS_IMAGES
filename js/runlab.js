/* AIRUN V9.3 — "phòng thí nghiệm" buổi chạy
   1) Độ cao & độ dốc của cung chạy (máy chủ → Open-Meteo Elevation, miễn phí).
   2) Thẻ "Chất lượng cung đường": thời tiết lúc chạy, độ dốc, đúng quãng đường/khép kín, loại đường, mặt đường.
   3) Bản đồ hành trình mỗi buổi chạy: lưu đường GPS đã rút gọn CHỈ TRÊN MÁY NÀY, xem lại, chia km (splits), tải GPX.
   Không gọi AI. Đường GPS thật của người dùng không bao giờ gửi lên máy chủ. */
(() => {
  'use strict';
  if (typeof document === 'undefined' || typeof renderSuggestedRoute !== 'function') return;

  const el = (id) => document.getElementById(id);
  const esc = (v) => escapeHTML(v);
  const icon = (name, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#${name}"/></svg>`;
  const km = (a, b) => haversine(Number(a.lat), Number(a.lon), Number(b.lat), Number(b.lon));
  const scoreTone = (s) => s >= 8 ? 'good' : s >= 6.5 ? 'ok' : s >= 5 ? 'warn' : 'bad';

  function cumulative(points) {
    const d = [0];
    for (let i = 1; i < points.length; i++) d.push(d[i - 1] + km(points[i - 1], points[i]));
    return d;
  }
  // Lấy n điểm cách đều theo quãng đường (nội suy tuyến tính).
  function sampleByDistance(points, n) {
    const d = cumulative(points), total = d[d.length - 1];
    if (!total || points.length < 2) return { pts: [], dist: [] };
    const pts = [], dist = [];
    let j = 1;
    for (let i = 0; i < n; i++) {
      const target = (total * i) / (n - 1);
      while (j < d.length - 1 && d[j] < target) j++;
      const a = points[j - 1], b = points[j], span = d[j] - d[j - 1] || 1, t = Math.min(1, Math.max(0, (target - d[j - 1]) / span));
      pts.push({ lat: +(Number(a.lat) + (Number(b.lat) - Number(a.lat)) * t).toFixed(5), lon: +(Number(a.lon) + (Number(b.lon) - Number(a.lon)) * t).toFixed(5) });
      dist.push(target);
    }
    return { pts, dist };
  }

  /* ---------- 1. Độ cao ---------- */
  async function fetchElevation(route) {
    const total = Number(route.distanceKm) || cumulative(route.points).slice(-1)[0];
    const n = Math.max(12, Math.min(100, Math.round((total * 1000) / 40)));
    const { pts, dist } = sampleByDistance(route.points, n);
    if (pts.length < 2) return null;
    const c = new AbortController(), timer = setTimeout(() => c.abort(), 12000);
    try {
      const res = await fetch('/api/elevation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ points: pts }), signal: c.signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(data.elevation)) return null;
      return analyzeElevation(data.elevation, dist);
    } catch { return null; } finally { clearTimeout(timer); }
  }
  function analyzeElevation(raw, dist) {
    const e = raw.map((v, i) => { const w = [raw[i - 1], v, raw[i + 1]].filter((x) => Number.isFinite(x)); return w.length ? w.reduce((a, b) => a + b, 0) / w.length : null; });
    if (e.some((v) => v === null)) return null;
    let gain = 0, loss = 0, maxGrade = 0;
    for (let i = 1; i < e.length; i++) { const dh = e[i] - e[i - 1]; if (dh > 0.3) gain += dh; else if (dh < -0.3) loss -= dh; }
    // Độ dốc tính trên đoạn ≥ 150 m để không bị nhiễu bởi bản đồ độ cao 90 m.
    for (let i = 0; i < e.length; i++) {
      let j = i + 1; while (j < e.length && (dist[j] - dist[i]) * 1000 < 150) j++;
      if (j >= e.length) break;
      maxGrade = Math.max(maxGrade, Math.abs(e[j] - e[i]) / ((dist[j] - dist[i]) * 1000) * 100);
    }
    return { e, dist, gain: Math.round(gain), loss: Math.round(loss), maxGrade: Math.round(maxGrade * 10) / 10, min: Math.round(Math.min(...e)), max: Math.round(Math.max(...e)) };
  }
  function elevationSvg(elev, w = 320, h = 70) {
    const total = elev.dist[elev.dist.length - 1] || 1, lo = Math.min(...elev.e), hi = Math.max(...elev.e), span = Math.max(8, hi - lo);
    const x = (d) => (d / total) * w, y = (v) => h - 6 - ((v - lo) / span) * (h - 14);
    const line = elev.e.map((v, i) => `${i ? 'L' : 'M'}${x(elev.dist[i]).toFixed(1)},${y(v).toFixed(1)}`).join('');
    return `<svg class="elev-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Độ cao dọc cung chạy từ ${elev.min} đến ${elev.max} mét">`
      + `<path d="${line}L${w},${h}L0,${h}Z" class="elev-area"/><path d="${line}" class="elev-line"/></svg>`;
  }

  /* ---------- 2. Chất lượng cung đường ---------- */
  const quality = { route: null, elev: undefined, loading: false };
  function slopeInfo(elev) {
    if (!elev) return null;
    const g = elev.maxGrade, perKm = elev.gain / Math.max(0.3, elev.dist[elev.dist.length - 1]);
    let score = g < 3 ? 10 : g < 6 ? 8 : g < 10 ? 6 : 4; if (perKm > 30) score -= 1;
    const word = g < 3 ? 'Bằng phẳng' : g < 6 ? 'Hơi dốc' : g < 10 ? 'Khá dốc' : 'Rất dốc';
    return { score, word, note: `leo +${elev.gain} m · dốc tối đa ${g}%` };
  }
  function renderQuality() {
    const box = el('routeQuality'), route = quality.route;
    if (!box) return;
    if (!route || !route.points?.length) { box.hidden = true; return; }
    const rows = [];
    // a) Thời tiết & không khí lúc chạy (cùng điểm AIRUN của kế hoạch)
    const plan = currentPlan();
    if (activeResult && activeSnapshot) {
      const s = activeResult.score;
      rows.push({ name: `Thời tiết & không khí lúc ${plan.time}`, score: s, word: activeResult.title, note: `AQI ${fmt(activeSnapshot.aqi)} · cảm giác ${fmt(activeSnapshot.feels)}°` });
    }
    // b) Độ dốc
    const slope = slopeInfo(quality.elev);
    if (slope) rows.push({ name: 'Độ dốc', score: slope.score, word: slope.word, note: slope.note });
    else rows.push({ name: 'Độ dốc', score: null, word: quality.loading ? 'Đang đo…' : 'Chưa có', note: quality.loading ? 'Đang lấy độ cao dọc cung' : 'Chưa lấy được độ cao' });
    // c) Quãng đường & khép kín
    const dist = Number(route.distanceKm) || 0, target = Number(route.targetKm) || null;
    const loop = km(route.points[0], route.points[route.points.length - 1]) <= 0.2;
    if (target) {
      const err = Math.abs(dist - target) / target;
      const s = err <= 0.05 ? 10 : err <= 0.1 ? 9 : err <= 0.2 ? 7 : 5;
      rows.push({ name: 'Quãng đường', score: loop ? s : s - 1, word: err <= 0.1 ? 'Khớp mục tiêu' : dist > target ? 'Dài hơn mục tiêu' : 'Ngắn hơn mục tiêu', note: `${dist.toFixed(2)}/${target.toFixed(2)} km · ${loop ? 'khép kín' : 'không về điểm đầu'}` });
    } else rows.push({ name: 'Quãng đường', score: loop ? 9 : 8, word: `${dist.toFixed(2)} km`, note: loop ? 'Khép kín, về lại điểm xuất phát' : 'Không về điểm xuất phát' });
    // d) Loại đường & mặt đường (khi dịch vụ định tuyến trả về)
    const roads = route.roads?.roads, surface = route.roads?.surface;
    if (roads) {
      const big = roads.big || 0, foot = roads.foot || 0;
      const s = Math.max(3, Math.min(10, Math.round((10 - big * 12 + foot * 2) * 10) / 10));
      rows.push({ name: 'Loại đường', score: s, word: big < 0.15 ? 'Ít xe' : big < 0.35 ? 'Vừa phải' : 'Nhiều đường lớn', note: `${Math.round(big * 100)}% đường lớn · ${Math.round(foot * 100)}% đường đi bộ` });
    }
    if (surface && (surface.unknown || 0) < 0.6) {
      const known = 1 - (surface.unknown || 0), paved = known ? (surface.paved || 0) / known : 0;
      rows.push({ name: 'Mặt đường', score: paved >= 0.9 ? 10 : paved >= 0.7 ? 8 : 6, word: paved >= 0.9 ? 'Trải nhựa/bê tông' : 'Có đoạn đất/sỏi', note: `${Math.round(paved * 100)}% đường trải nhựa` });
    }
    const scored = rows.filter((r) => Number.isFinite(r.score));
    const overall = scored.length ? Math.round((scored.reduce((a, r) => a + r.score, 0) / scored.length) * 10) / 10 : null;
    const approx = route.source === 'approx' || route.source === 'demo';
    box.hidden = false;
    box.innerHTML = `<div class="rq-head"><b>Chất lượng cung đường</b>${overall !== null ? `<span class="pill t-${scoreTone(overall)}">${overall}/10</span>` : ''}</div>`
      + `<ul class="rq-list">${rows.map((r) => `<li class="t-${Number.isFinite(r.score) ? scoreTone(r.score) : 'none'}"><span>${esc(r.name)}</span><b>${esc(r.word)}</b><small>${esc(r.note)}</small></li>`).join('')}</ul>`
      + (quality.elev ? `<div class="rq-elev">${elevationSvg(quality.elev)}<div class="rq-elev-axis"><small>Độ cao ${quality.elev.min}–${quality.elev.max} m</small><small>${dist.toFixed(1)} km</small></div></div>` : '')
      + `<p class="rq-note">${approx ? 'Cung này là vòng ước lượng, chưa bám đường thật. ' : ''}${roads ? '' : 'Loại đường chỉ có khi cung được tạo bằng GraphHopper. '}Chưa tính bóng râm và đèn đường.</p>`;
  }
  async function analyzeRoute(route) {
    quality.route = route; quality.elev = route.__elev; quality.loading = route.__elev === undefined;
    renderQuality();
    if (route.__elev !== undefined) return;
    const elev = await fetchElevation(route);
    route.__elev = elev;
    if (quality.route !== route) return;
    quality.elev = elev; quality.loading = false; renderQuality();
  }

  // Bọc hàm vẽ cung của app.js: mỗi cung mới → đo độ cao + chấm chất lượng (cung cũ dùng lại kết quả).
  const originalRender = renderSuggestedRoute;
  renderSuggestedRoute = function (route) { // eslint-disable-line no-global-assign
    const out = originalRender.apply(this, arguments);
    try { if (route?.points?.length) void analyzeRoute(route); } catch (error) { console.warn('AIRUN route quality:', error); }
    return out;
  };
  document.addEventListener('airun:update', () => { if (quality.route) renderQuality(); });

  /* ---------- 3. Bản đồ hành trình (chỉ lưu trên máy) ---------- */
  const TRACKS = 'airun-v93-tracks';
  const readTracks = () => { const t = localGet(TRACKS, {}); return t && typeof t === 'object' ? t : {}; };
  function simplifyTrack(points) {
    const good = (points || []).filter((p) => Number.isFinite(+p.lat) && Number.isFinite(+p.lon));
    if (good.length < 2) return null;
    const t0 = Number(good[0].timestamp) || Date.now();
    const kept = [good[0]];
    for (let i = 1; i < good.length - 1; i++) if (km(kept[kept.length - 1], good[i]) >= 0.012) kept.push(good[i]);
    kept.push(good[good.length - 1]);
    let out = kept;
    if (kept.length > 300) { out = []; for (let i = 0; i < 300; i++) out.push(kept[Math.round((i * (kept.length - 1)) / 299)]); }
    return { start: t0, p: out.map((q) => [+Number(q.lat).toFixed(5), +Number(q.lon).toFixed(5), Math.max(0, Math.round(((Number(q.timestamp) || t0) - t0) / 1000))]) };
  }
  function saveTrack(id) {
    const track = simplifyTrack(tracker.points);
    if (!track) return null;
    const all = readTracks(); all[id] = track;
    const ids = Object.keys(all).sort((a, b) => Number(b) - Number(a));
    for (const old of ids.slice(30)) delete all[old];
    if (!localSet(TRACKS, all)) { delete all[ids[ids.length - 1]]; localSet(TRACKS, all); }
    return track;
  }
  const trackPoints = (track) => track.p.map(([lat, lon, t]) => ({ lat, lon, t }));

  function trackSvg(track, w = 120, h = 80, pad = 6) {
    const pts = trackPoints(track);
    const lats = pts.map((p) => p.lat), lons = pts.map((p) => p.lon);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLon = Math.min(...lons), maxLon = Math.max(...lons);
    const kx = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
    const spanX = Math.max(1e-6, (maxLon - minLon) * kx), spanY = Math.max(1e-6, maxLat - minLat), s = Math.min((w - pad * 2) / spanX, (h - pad * 2) / spanY);
    const ox = (w - spanX * s) / 2, oy = (h - spanY * s) / 2;
    const X = (p) => (ox + (p.lon - minLon) * kx * s).toFixed(1), Y = (p) => (h - oy - (p.lat - minLat) * s).toFixed(1);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p)},${Y(p)}`).join('');
    const a = pts[0], b = pts[pts.length - 1];
    return `<svg class="track-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Hình đường chạy"><path d="${d}" class="trk-case"/><path d="${d}" class="trk-line"/>`
      + `<circle cx="${X(a)}" cy="${Y(a)}" r="3.2" class="trk-start"/><circle cx="${X(b)}" cy="${Y(b)}" r="3.2" class="trk-end"/></svg>`;
  }
  function splits(track) {
    const pts = trackPoints(track), out = [];
    let dist = 0, nextKm = 1, lastT = 0;
    for (let i = 1; i < pts.length; i++) {
      const seg = km(pts[i - 1], pts[i]);
      while (dist + seg >= nextKm && seg > 0) {
        const f = (nextKm - dist) / seg, t = pts[i - 1].t + (pts[i].t - pts[i - 1].t) * f;
        out.push({ km: nextKm, sec: Math.round(t - lastT) }); lastT = t; nextKm++;
      }
      dist += seg;
    }
    const rest = dist - (nextKm - 1);
    if (rest >= 0.1 && pts.length) out.push({ km: +(nextKm - 1 + rest).toFixed(2), sec: Math.round(pts[pts.length - 1].t - lastT), partial: rest });
    return out;
  }
  function gpx(row, track) {
    const start = Number(track.start) || Date.parse(row.at) || Date.now();
    const pts = trackPoints(track).map((p) => `<trkpt lat="${p.lat}" lon="${p.lon}"><time>${new Date(start + p.t * 1000).toISOString()}</time></trkpt>`).join('\n      ');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="AIRUN Da Nang" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>AIRUN · ${esc(row.area || 'Buổi chạy')}</name><time>${new Date(start).toISOString()}</time></metadata>\n  <trk><name>AIRUN ${esc(row.area || '')} ${row.distance ?? ''} km</name><type>running</type><trkseg>\n      ${pts}\n  </trkseg></trk>\n</gpx>\n`;
  }
  function downloadGpx(id) {
    const row = journalRows().find((r) => String(r.id) === String(id)), track = readTracks()[id];
    if (!row || !track) { showToast('Buổi chạy này chưa có bản đồ hành trình.'); return; }
    const blob = new Blob([gpx(row, track)], { type: 'application/gpx+xml' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `airun-${new Date(row.at).toISOString().slice(0, 10)}-${row.distance || 0}km.gpx`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    showToast('Đã tải file GPX. Trên Strava: Tải lên hoạt động → chọn file này.');
  }

  /* Hộp thoại xem lại một buổi chạy */
  let dialogMap = null, dialogId = null;
  async function drawDialogMap(track) {
    const box = el('runDialogMap'); box.innerHTML = trackSvg(track, 360, 220, 18);
    try {
      await ensureMapLibreAssets();
      const pts = trackPoints(track), coords = pts.map((p) => [p.lon, p.lat]);
      const holder = document.createElement('div'); holder.className = 'rd-map-gl'; box.appendChild(holder);
      dialogMap = new maplibregl.Map({ container: holder, style: await mapStyleUrl(), center: coords[0], zoom: 14, attributionControl: { compact: true } });
      dialogMap.on('load', () => {
        const pal = mapPalette();
        dialogMap.addSource('trk', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } } });
        dialogMap.addLayer({ id: 'trk-case', type: 'line', source: 'trk', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': pal.casing, 'line-width': 7 } });
        dialogMap.addLayer({ id: 'trk-line', type: 'line', source: 'trk', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': pal.main, 'line-width': 4 } });
        const b = new maplibregl.LngLatBounds(); coords.forEach((c) => b.extend(c));
        dialogMap.fitBounds(b, { padding: 30, duration: 0, maxZoom: 16 });
        holder.classList.add('ready');
      });
    } catch (error) { console.warn('AIRUN run dialog map:', error); }
  }
  function openRun(id) {
    const row = journalRows().find((r) => String(r.id) === String(id)), track = readTracks()[id], dlg = el('runDialog');
    if (!row || !track || !dlg) return;
    dialogId = id;
    const date = new Date(row.at);
    el('runDialogDate').textContent = date.toLocaleString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
    el('runDialogTitle').textContent = `Buổi chạy · ${row.area || ''}`;
    el('runDialogStats').innerHTML = [['Quãng đường', `${row.distance ?? 0}`, 'km'], ['Thời gian', formatDuration(row.durationSec || 0), ''], ['Pace TB', row.pace || '—', row.pace ? '/km' : '']]
      .map(([n, v, u]) => `<div><small>${n}</small><b>${esc(v)}<span>${u}</span></b></div>`).join('');
    const sp = splits(track), full = sp.filter((x) => !x.partial), fastest = full.length ? Math.min(...full.map((x) => x.sec)) : 0, slowest = full.length ? Math.max(...full.map((x) => x.sec)) : 0;
    el('runDialogSplits').innerHTML = sp.length
      ? `<h3>Từng km (splits)</h3><ol>${sp.map((x) => { const pace = x.partial ? x.sec / 60 / x.partial : x.sec / 60; const h = slowest > fastest && !x.partial ? 40 + 60 * (1 - (x.sec - fastest) / (slowest - fastest)) : 60; return `<li class="${!x.partial && x.sec === fastest ? 'best' : ''}"><i style="--h:${h.toFixed(0)}%"></i><b>${formatPace(pace)}</b><small>${x.partial ? `${x.km} km` : `km ${x.km}`}</small></li>`; }).join('')}</ol>`
      : '<p class="rd-note">Buổi chạy ngắn hơn 1 km nên chưa chia km.</p>';
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    void drawDialogMap(track);
  }
  function closeRun() { const dlg = el('runDialog'); if (dlg?.open) dlg.close?.(); }
  el('runDialog')?.addEventListener('close', () => { try { dialogMap?.remove(); } catch {} dialogMap = null; });
  el('runDialogClose')?.addEventListener('click', closeRun);
  el('runDialog')?.addEventListener('click', (e) => { if (e.target === el('runDialog')) closeRun(); });
  el('runDialogGpx')?.addEventListener('click', () => { if (dialogId) downloadGpx(dialogId); });

  // Nút trong nhật ký / thẻ tổng kết
  document.addEventListener('click', (e) => {
    const view = e.target.closest('[data-run-view]'); if (view) { e.preventDefault(); openRun(view.dataset.runView); return; }
    const g = e.target.closest('[data-run-gpx]'); if (g) { e.preventDefault(); downloadGpx(g.dataset.runGpx); }
  });

  function trackActions(id) {
    return `<div class="trk-actions"><button type="button" class="chip-btn" data-run-view="${id}">${icon('i-map-pin')}Xem bản đồ</button><button type="button" class="chip-btn" data-run-gpx="${id}">${icon('i-share-2')}GPX</button></div>`;
  }
  // Bọc renderJournal: thêm hình đường chạy cho các buổi có bản đồ; dọn bản đồ của buổi đã xoá.
  const originalJournal = renderJournal;
  renderJournal = function () { // eslint-disable-line no-global-assign
    const out = originalJournal.apply(this, arguments);
    try {
      const rows = journalRows(), tracks = readTracks(), ids = new Set(rows.map((r) => String(r.id)));
      let changed = false; for (const id of Object.keys(tracks)) if (!ids.has(id)) { delete tracks[id]; changed = true; }
      if (changed) localSet(TRACKS, tracks);
      document.querySelectorAll('#journalList .journal-item').forEach((item) => {
        const id = item.querySelector('[data-delete]')?.dataset.delete; const track = id && tracks[id];
        if (!track || item.querySelector('.journal-track')) return;
        item.classList.add('has-track');
        const main = item.querySelector('.journal-main');
        const fig = document.createElement('button'); fig.type = 'button'; fig.className = 'journal-track'; fig.dataset.runView = id; fig.setAttribute('aria-label', 'Xem bản đồ hành trình'); fig.innerHTML = trackSvg(track);
        item.insertBefore(fig, main);
        main?.insertAdjacentHTML('beforeend', trackActions(id));
      });
    } catch (error) { console.warn('AIRUN journal tracks:', error); }
    return out;
  };

  // Bọc saveRunToJournal: lưu đường đã rút gọn của buổi vừa chạy (chỉ trên máy).
  const originalSave = saveRunToJournal;
  saveRunToJournal = function () { // eslint-disable-line no-global-assign
    const before = journalRows()[0]?.id;
    const out = originalSave.apply(this, arguments);
    try {
      const row = journalRows()[0];
      if (row && row.type === 'run' && row.id !== before) {
        const track = saveTrack(row.id);
        renderJournal();
        const box = el('summaryTrack');
        if (box && track) { box.hidden = false; box.innerHTML = `<button type="button" class="journal-track big" data-run-view="${row.id}" aria-label="Xem bản đồ hành trình">${trackSvg(track, 160, 110, 8)}</button>${trackActions(row.id)}`; }
      }
    } catch (error) { console.warn('AIRUN save track:', error); }
    return out ?? journalRows()[0]?.id;
  };

  // Vẽ lại nhật ký sau khi gắn bọc (trường hợp app.js đã vẽ trước đó).
  const start = () => { try { renderJournal(); } catch {} try { syncMapThemeButtons(); } catch {} };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0), { once: true }); else setTimeout(start, 0);

  // Cho kiểm thử
  window.__airunRunLab = { simplifyTrack, splits, gpx, analyzeElevation, sampleByDistance, saveTrack, readTracks };
})();
