/* AIRUN V9.6 — Cộng đồng:
   1) Bảng xếp hạng người chạy theo tuần / tháng / khu vực (máy chủ tổng hợp từ các buổi chạy GPS đã đồng bộ).
   2) Bản tin khu vực chạy: tin do ban quản trị đăng + bản tin tự động theo thời tiết, không khí từng khu vực.
   Chỉ tải dữ liệu khi người dùng mở trang Cộng đồng. */
(() => {
  'use strict';
  if (typeof document === 'undefined' || typeof WARDS === 'undefined') return;
  const el = (id) => document.getElementById(id);
  const esc = (v) => escapeHTML(String(v ?? ''));
  const icon = (name) => `<svg class="ic" aria-hidden="true"><use href="#${name}"/></svg>`;
  const vn = (n) => String(n).replace('.', ',');
  const HIDE_KEY = 'airun-v96-lb-hidden';
  const NEWS_AREAS = ['HaiChau', 'SonTra', 'NguHanhSon', 'AnHai', 'ThanhKhe', 'LienChieu', 'CamLe', 'HoiAn'];
  const PERIODS = [{ key: 'week:0', label: 'Tuần này' }, { key: 'week:1', label: 'Tuần trước' }, { key: 'month:0', label: 'Tháng này' }];
  const st = { tab: 'board', period: 'week:0', area: '', data: null, loading: false, error: '', reqId: 0, bulletins: null, bulletinsAt: 0, bulletinsLoading: false };

  /* ---------- Bảng xếp hạng ---------- */
  async function loadBoard() {
    const id = ++st.reqId; st.loading = true; st.error = ''; render();
    try {
      const [period, offset] = st.period.split(':');
      const qs = new URLSearchParams({ period, offset, ...(st.area ? { area: st.area } : {}) });
      const res = await fetch(`/api/community?${qs}`, { cache: 'no-store', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (id !== st.reqId) return;
      if (!res.ok || data.error) throw new Error(data.reason || `HTTP ${res.status}`);
      st.data = data;
      if (data.ready && typeof data.totals?.runners === 'number' && st.period === 'week:0' && !st.area) setCat(data.totals.runners ? `${data.totals.runners} người chạy tuần này` : 'Hãy là người mở bảng tuần này');
    } catch (error) { if (id !== st.reqId) return; st.error = error.message; }
    st.loading = false; render();
  }
  function setCat(text) { const n = el('catCommunity'); if (n) n.textContent = text; }

  function boardHtml() {
    const d = st.data;
    if (st.error) return `<div class="empty-state">Chưa tải được bảng xếp hạng (${esc(st.error)}). <button type="button" class="chip-btn" id="cmRetry">Thử lại</button></div>`;
    if (!d) return '<div class="cm-skel"></div><div class="cm-skel"></div><div class="cm-skel"></div>';
    if (!d.ready) return `<div class="empty-state">${d.reason === 'needs_script_update' ? 'Bảng xếp hạng sắp mở: ban quản trị AIRUN cần cập nhật bảng dữ liệu để bật tính năng này.' : 'Máy chủ chưa kết nối bảng dữ liệu nên chưa có bảng xếp hạng.'} Trong lúc chờ, bạn xem Bản tin khu vực nhé.</div>`;
    const logged = Boolean(session?.token), me = d.me, hidden = localGet(HIDE_KEY, false) === true;
    const areas = [{ key: '', name: 'Tất cả khu vực' }, ...(d.areas || [])];
    const myCard = !logged
      ? `<div class="cm-me"><div><b>Bạn chưa có tên trên bảng</b><small>Đăng nhập rồi chạy với GPS, buổi chạy tự được tính.</small></div><button type="button" class="primary" id="cmLogin">Đăng nhập</button></div>`
      : me && me.runs ? `<div class="cm-me on"><span class="cm-rank">${me.rank ? '#' + me.rank : '—'}</span><div><b>${esc(session.user.ten)} · ${vn(me.km)} km</b><small>${me.runs} buổi${me.pace ? ` · pace TB ${esc(me.pace)}/km` : ''}${me.hidden ? ' · đang ẩn tên' : ''}</small></div></div>`
        : `<div class="cm-me"><div><b>${esc(session.user.ten)}, bạn chưa có buổi chạy GPS nào ${st.period === 'month:0' ? 'tháng này' : st.period === 'week:1' ? 'tuần trước' : 'tuần này'}</b><small>Chạy từ 0,3 km với GPS là có tên trên bảng.</small></div><a class="primary" href="#/run-gps">Chạy ngay</a></div>`;
    const rows = (d.board || []).map((r) => `<li class="${r.me ? 'me' : ''}${r.rank <= 3 ? ' top' + r.rank : ''}"><span class="cm-rank">${r.rank}</span><span class="cm-av" aria-hidden="true">${esc((r.ten || '?').trim().charAt(0).toUpperCase())}</span><span class="cm-who"><b>${esc(r.ten)}${r.me ? ' (bạn)' : ''}</b><small>${r.runs} buổi${r.pace ? ` · ${esc(r.pace)}/km` : ''}${r.area ? ` · ${esc(r.area)}` : ''}</small></span><span class="cm-km"><b>${vn(r.km)}</b><small>km</small></span></li>`).join('');
    return `<div class="cm-totals"><span><b>${d.totals?.runners || 0}</b>người chạy</span><span><b>${vn(d.totals?.km || 0)}</b>km</span><span><b>${d.totals?.runs || 0}</b>buổi</span></div>
      <div class="wx-areas cm-areas" role="listbox" aria-label="Lọc theo khu vực">${areas.map((a) => `<button type="button" role="option" class="${a.key === st.area ? 'on' : ''}" aria-selected="${a.key === st.area}" data-area="${esc(a.key)}">${esc(a.name)}${a.km ? `<small>${vn(a.km)} km</small>` : ''}</button>`).join('')}</div>
      ${myCard}
      ${rows ? `<ol class="cm-board">${rows}</ol>` : `<div class="empty-state">Chưa có ai chạy ${st.area ? 'ở khu vực này ' : ''}trong ${esc(d.range || 'khoảng này')}. Hãy là người đầu tiên!</div>`}
      <label class="cm-hide"><input type="checkbox" id="cmHide"${hidden ? ' checked' : ''}><span>Ẩn tên tôi trên bảng xếp hạng<small>Áp dụng từ buổi chạy kế tiếp được đồng bộ. Km của bạn vẫn cộng vào tổng cộng đồng.</small></span></label>
      <p class="wx-note">${esc(d.range || '')} · chỉ tính buổi chạy GPS của người đã đăng nhập, mỗi buổi 0,3–60 km, pace 2:45–16:00/km. Bảng cập nhật mỗi vài phút.</p>`;
  }

  /* ---------- Bản tin khu vực (tự động từ số liệu thật) ---------- */
  function bulletinFor(key, data) {
    const w = ward(key), plan = currentPlan();
    if (!data || isNoData(data)) return { key, name: w.name, ok: false };
    const hours = upcomingHours(data, 12), now = analyzeSnapshot({ ...data.current, time: vnIso() }, plan), best = bestTimeFor(data, plan);
    const alerts = [];
    const storm = hours.find((r) => [95, 96, 99].includes(Number(r.code)));
    const rain = [...hours].sort((a, b) => (b.rain || 0) - (a.rain || 0))[0];
    const heat = [...hours].sort((a, b) => (b.feels || 0) - (a.feels || 0))[0];
    const windy = [...hours].sort((a, b) => (b.wind || 0) - (a.wind || 0))[0];
    const h = (r) => `${Number(r.time.slice(11, 13))}h`;
    if (storm) alerts.push({ tone: 'bad', text: `Có dông quanh ${h(storm)}, tránh chạy ngoài trời lúc đó` });
    else if (rain && hasNum(rain.rain) && rain.rain >= 70) alerts.push({ tone: 'warn', text: `Khả năng mưa ${round(rain.rain)}% quanh ${h(rain)}` });
    if (hasNum(data.current?.aqi) && data.current.aqi > 100) alerts.push({ tone: data.current.aqi > 150 ? 'bad' : 'warn', text: `Không khí kém, AQI ${round(data.current.aqi)}` });
    if (heat && hasNum(heat.feels) && heat.feels >= 38) alerts.push({ tone: 'warn', text: `Nắng gắt, cảm giác ${round(heat.feels)}°C lúc ${h(heat)}` });
    if (windy && hasNum(windy.wind) && windy.wind >= 30) alerts.push({ tone: 'warn', text: `Gió mạnh ${round(windy.wind)} km/h lúc ${h(windy)}` });
    const bestText = best ? `${best.row.time.slice(11, 16)}${best.row.time.slice(0, 10) !== vnIso().slice(0, 10) ? ' ngày mai' : ' hôm nay'} · ${best.result.score}/10` : null;
    return { key, name: w.name, desc: w.desc, ok: true, score: now.score, tone: now.tone === 'caution' ? 'ok' : now.tone, title: now.title, temp: data.current?.temp, feels: data.current?.feels, aqi: data.current?.aqi, alerts, bestText };
  }
  async function loadBulletins(force = false) {
    if (st.bulletinsLoading || (!force && st.bulletins && Date.now() - st.bulletinsAt < 10 * 60e3)) return;
    st.bulletinsLoading = true; render();
    const keys = NEWS_AREAS.filter((k) => WARDS.some((w) => w.key === k)), out = [];
    for (let i = 0; i < keys.length; i += 3) {
      const part = await Promise.all(keys.slice(i, i + 3).map(async (k) => { try { return bulletinFor(k, await fetchEnvironment(k)); } catch { return bulletinFor(k, null); } }));
      out.push(...part);
    }
    st.bulletins = out.filter((b) => b.ok).sort((a, b) => b.score - a.score);
    st.bulletinsAt = Date.now(); st.bulletinsLoading = false; render();
  }
  function newsHtml() {
    const admin = (st.data?.news || []).map((n) => `<article class="card cm-post"><small>${icon('i-newspaper')}${esc([n.date, n.area].filter(Boolean).join(' · ') || 'Tin từ AIRUN')}</small><b>${esc(n.title)}</b>${n.text ? `<p>${esc(n.text)}</p>` : ''}${n.link ? `<a href="${esc(n.link)}" target="_blank" rel="noopener noreferrer">Xem chi tiết ${icon('i-arrow-right')}</a>` : ''}</article>`).join('');
    const areaStat = (name) => { const k = String(name).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().trim(); return (st.data?.areas || []).find((a) => a.key === k); };
    let auto = '';
    if (!st.bulletins) auto = '<div class="cm-skel"></div><div class="cm-skel"></div><div class="cm-skel"></div>';
    else if (!st.bulletins.length) auto = '<div class="empty-state">Chưa lấy được số liệu thời tiết của các khu vực. <button type="button" class="chip-btn" id="cmNewsRetry">Thử lại</button></div>';
    else auto = st.bulletins.map((b, i) => {
      const s = st.period === 'week:0' ? areaStat(b.name) : null;
      return `<article class="card cm-area t-${b.tone}"><div class="cm-area-top"><div><small>${i === 0 ? 'Đang đẹp nhất để chạy' : ''}</small><b>${esc(b.name)}</b></div><span class="cm-score"><b>${vn(b.score)}</b>/10</span></div>
        <p class="cm-area-line">${esc(b.title)} · ${hasNum(b.temp) ? `${round(b.temp)}°` : '—'}${hasNum(b.feels) ? `, cảm giác ${round(b.feels)}°` : ''}${hasNum(b.aqi) ? ` · AQI ${round(b.aqi)}` : ''}</p>
        ${b.alerts.length ? `<ul class="cm-alerts">${b.alerts.map((a) => `<li class="t-${a.tone}">${icon('i-triangle-alert')}${esc(a.text)}</li>`).join('')}</ul>` : '<p class="cm-calm">Không có cảnh báo trong 12 giờ tới.</p>'}
        <div class="cm-area-foot"><span>${b.bestText ? `${icon('i-timer')}Giờ đẹp: ${esc(b.bestText)}` : ''}${s ? `<em>${icon('i-users')}${s.runners} người · ${vn(s.km)} km tuần này</em>` : ''}</span><button type="button" class="chip-btn" data-plan-area="${esc(b.key)}">Lên kế hoạch ở đây</button></div></article>`;
    }).join('');
    return `${admin ? `<h3 class="hub-h">Tin từ AIRUN</h3>${admin}` : ''}<h3 class="hub-h">Bản tin khu vực · cập nhật ${st.bulletinsAt ? new Date(st.bulletinsAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'đang tải'}</h3>${auto}<p class="wx-note">Bản tin tự động từ dự báo Open-Meteo cho từng khu vực, dùng cùng công thức chấm điểm với trang Kế hoạch.</p>`;
  }

  /* ---------- Khung trang ---------- */
  function render() {
    const box = el('communityPage'); if (!box) return;
    box.innerHTML = `<div class="wx-head"><div><p class="eyebrow">CỘNG ĐỒNG AIRUN</p><h2>${st.tab === 'board' ? 'Bảng xếp hạng người chạy' : 'Bản tin khu vực chạy'}</h2></div></div>
      <div class="seg cm-tabs" role="tablist" aria-label="Mục cộng đồng"><button type="button" role="tab" class="${st.tab === 'board' ? 'on' : ''}" data-cm-tab="board">${icon('i-trophy')}Xếp hạng</button><button type="button" role="tab" class="${st.tab === 'news' ? 'on' : ''}" data-cm-tab="news">${icon('i-newspaper')}Bản tin</button></div>
      ${st.tab === 'board' ? `<div class="seg cm-period" role="tablist" aria-label="Khoảng thời gian">${PERIODS.map((p) => `<button type="button" role="tab" class="${p.key === st.period ? 'on' : ''}" data-period="${p.key}">${p.label}</button>`).join('')}</div><div class="cm-body${st.loading ? ' is-loading' : ''}" aria-live="polite">${boardHtml()}</div>` : `<div class="cm-body" aria-live="polite">${newsHtml()}</div>`}`;
    box.querySelectorAll('[data-cm-tab]').forEach((b) => b.addEventListener('click', () => { st.tab = b.dataset.cmTab; render(); if (st.tab === 'news') void loadBulletins(); }));
    box.querySelectorAll('[data-period]').forEach((b) => b.addEventListener('click', () => { st.period = b.dataset.period; void loadBoard(); }));
    box.querySelectorAll('[data-area]').forEach((b) => b.addEventListener('click', () => { st.area = b.dataset.area; void loadBoard(); }));
    el('cmRetry')?.addEventListener('click', () => void loadBoard());
    el('cmNewsRetry')?.addEventListener('click', () => void loadBulletins(true));
    el('cmLogin')?.addEventListener('click', () => openAccount('login'));
    el('cmHide')?.addEventListener('change', (e) => { localSet(HIDE_KEY, e.target.checked); showToast(e.target.checked ? 'Tên bạn sẽ được ẩn từ buổi chạy kế tiếp.' : 'Tên bạn sẽ hiện lại từ buổi chạy kế tiếp.'); });
    box.querySelectorAll('[data-plan-area]').forEach((b) => b.addEventListener('click', async () => { const key = b.dataset.planArea; activateView('plan'); try { await selectWard(key, { analyze: true }); } catch {} }));
  }

  document.addEventListener('airun:view', (e) => {
    if (e.detail?.view !== 'community') return;
    render();
    if (!st.data || Date.now() - (st.data.updated || 0) > 3 * 60e3 || e.detail.changed) void loadBoard();
    if (st.tab === 'news') void loadBulletins();
  });
  setCat('Xếp hạng tuần · bản tin khu vực');
  window.__airunCommunity = { state: st, reload: loadBoard };
  if (document.body.dataset.view === 'community') { render(); void loadBoard(); }
})();
