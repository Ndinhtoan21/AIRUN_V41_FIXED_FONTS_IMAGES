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
  const st = { feed: null, feedAt: 0, feedLoading: false, feedError: '', composer: false, draft: { kind: 'event' }, posting: false, tab: 'news', period: 'week:0', area: '', data: null, loading: false, error: '', reqId: 0, bulletins: null, bulletinsAt: 0, bulletinsLoading: false };

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
      if (data.ready && !st.feed?.daily && typeof data.totals?.runners === 'number' && st.period === 'week:0' && !st.area) setCat(data.totals.runners ? `${data.totals.runners} người chạy tuần này` : 'Hãy là người mở bảng tuần này');
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
  /* ---------- Ảnh khu vực: lấy từ kho ảnh chung js/photos.js (luôn kèm tác giả · giấy phép · nguồn) ---------- */
  const PH = window.AIRUN_PHOTOS;
  const photo = (key, cls = '') => PH ? PH.figure(PH.area(key), { cls: cls === 'hero' ? 'ph-hero' : 'ph-thumb' }) : '';
  const WEEK = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayLabel = (iso) => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return { wd: '', d: '', m: '', text: esc(iso || '') }; const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); return { wd: WEEK[d.getUTCDay()], d: m[3], m: `Th${Number(m[2])}`, text: `${WEEK[d.getUTCDay()]}, ${Number(m[3])}/${Number(m[2])}` }; };

  /* ---------- Bản tin hôm nay + sự kiện + tin (máy chủ tổng hợp) ---------- */
  async function loadFeed(force = false) {
    if (st.feedLoading || (!force && st.feed && Date.now() - st.feedAt < 3 * 60e3)) return;
    st.feedLoading = true; st.feedError = ''; render();
    try {
      const res = await fetch('/api/bulletin', { cache: 'no-store', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.reason || `HTTP ${res.status}`);
      st.feed = data; st.feedAt = Date.now();
      if (data.daily?.headline) setCat(data.daily.headline);
    } catch (error) { st.feedError = error.message; }
    st.feedLoading = false; render();
  }
  function dailyHtml() {
    const f = st.feed;
    if (!f) return st.feedError ? `<div class="empty-state">Chưa tải được bản tin hôm nay (${esc(st.feedError)}). <button type="button" class="chip-btn" id="cmFeedRetry">Thử lại</button></div>` : '<div class="cm-skel tall"></div>';
    const d = f.daily || {}, areas = (f.areas || []).filter((a) => hasNum(a.temp_c)), c = f.community;
    const center = areas.find((a) => a.key === 'HaiChau') || areas[0];
    const air = [...areas].filter((a) => hasNum(a.us_aqi)).sort((a, b) => a.us_aqi - b.us_aqi)[0];
    const tmin = areas.length ? Math.min(...areas.map((a) => a.temp_min_c).filter(hasNum)) : null, tmax = areas.length ? Math.max(...areas.map((a) => a.temp_max_c).filter(hasNum)) : null;
    const uv = areas.length ? Math.max(...areas.map((a) => a.uv_max).filter(hasNum)) : null;
    const chip = (ic, k, v) => v ? `<li>${icon(ic)}<span><small>${k}</small><b>${v}</b></span></li>` : '';
    const stats = [
      chip('i-thermometer-sun', 'Nhiệt độ hôm nay', hasNum(tmin) && hasNum(tmax) ? `${round(tmin)}–${round(tmax)}°C` : ''),
      chip('i-sun', 'Mặt trời mọc · lặn', center?.sunrise ? `${center.sunrise} · ${center.sunset}` : ''),
      chip('i-gauge', 'Không khí sạch nhất', air ? `${esc(air.name)} · AQI ${round(air.us_aqi)}` : ''),
      chip('i-timer', 'Giờ mát nhất còn lại', center?.coolest_run ? `${center.coolest_run.time} · ${round(center.coolest_run.feels_c)}°C` : ''),
      chip('i-triangle-alert', 'UV cao nhất', hasNum(uv) ? `${round(uv, 1)}${uv >= 8 ? ' · rất cao' : uv >= 6 ? ' · cao' : ''}` : ''),
      c ? chip('i-users', 'Cộng đồng hôm qua', c.yesterday?.runs ? `${vn(c.yesterday.km)} km · ${c.yesterday.runners} người` : 'Chưa có buổi chạy') : ''
    ].join('');
    const when = d.generatedAt ? new Date(d.generatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
    return `<article class="card cm-daily">${photo(d.featured || 'HaiChau', 'hero')}
      <div class="cm-daily-body"><p class="eyebrow">BẢN TIN HÔM NAY · ${esc(dayLabel(d.date).text)}</p><h3>${esc(d.headline || 'Bản tin chạy bộ hôm nay')}</h3>${d.summary ? `<p>${esc(d.summary)}</p>` : ''}
      ${(d.highlights || []).length ? `<ul class="cm-hl">${d.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
      ${stats ? `<ul class="cm-stats">${stats}</ul>` : ''}
      <p class="cm-src">Tổng hợp ${when ? `lúc ${when} ` : ''}từ dự báo Open-Meteo cho 8 khu vực${c ? ' và các buổi chạy GPS của cộng đồng AIRUN' : ''}. ${d.source === 'ai' ? 'Lời tóm tắt do AI viết, chỉ dựa trên các số liệu này.' : 'Lời tóm tắt viết tự động theo quy tắc.'} Các ô số liệu cập nhật mỗi 30 phút.</p></div></article>`;
  }
  function eventsHtml() {
    const f = st.feed; if (!f) return '';
    const admin = Boolean(f.admin), list = f.events || [];
    if (!f.ready) return '';
    const cards = list.map((e) => {
      const dl = dayLabel(e.date), pct = e.slots ? Math.min(100, Math.round(e.count / e.slots * 100)) : 0;
      const who = e.names?.length ? ` · ${e.names.map(esc).join(', ')}${e.count > e.names.length ? ` và ${e.count - e.names.length} người khác` : ''}` : '';
      const btn = e.joined ? `<button type="button" class="soft-btn" data-leave="${esc(e.id)}">${icon('i-check')}Đã tham gia · Huỷ</button>` : e.full ? '<button type="button" class="soft-btn" disabled>Đã đủ người</button>' : `<button type="button" class="primary" data-join="${esc(e.id)}">${icon('i-users')}Tham gia</button>`;
      return `<article class="card ev">${e.image ? `<img class="ev-img" src="${esc(e.image)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
        <div class="ev-body"><div class="ev-date" aria-hidden="true"><b>${esc(dl.d)}</b><small>${esc(dl.m)}</small></div>
        <div class="ev-main"><small>${esc([dl.wd, e.time, e.area].filter(Boolean).join(' · '))}</small><b>${esc(e.title)}</b>
          <p class="ev-place">${icon('i-map-pin')}${esc(e.place)}${e.km ? ` · ${vn(e.km)} km` : ''}</p>${e.desc ? `<p class="ev-desc">${esc(e.desc)}</p>` : ''}
          <div class="ev-slots">${e.slots ? `<span><i style="width:${pct}%"></i></span>` : ''}<small>${e.count}${e.slots ? `/${e.slots}` : ''} người đã tham gia${who}</small></div>
          <div class="ev-actions">${btn}${e.link ? `<a class="chip-btn" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">Chi tiết ${icon('i-arrow-right')}</a>` : ''}${admin ? `<button type="button" class="link-danger" data-hide="event:${esc(e.id)}">Ẩn sự kiện</button>` : ''}</div>
          ${e.contact ? `<p class="ev-contact">Liên hệ ban tổ chức: <span>${esc(e.contact)}</span></p>` : ''}</div></div></article>`;
    }).join('');
    return `<h3 class="hub-h">Sự kiện tìm thành viên</h3>${cards || `<div class="empty-state">Chưa có sự kiện nào sắp diễn ra.${admin ? ' Bấm "Đăng tin / sự kiện" ở trên để đăng sự kiện đầu tiên.' : ' Khi có nhóm chạy hay giải chạy tìm thành viên, tin sẽ hiện ở đây.'}</div>`}`;
  }
  function postsHtml() {
    const f = st.feed, admin = Boolean(f?.admin), list = f?.news || [];
    if (!list.length) return '';
    const date = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.split('-').reverse().join('/') : v;
    return `<h3 class="hub-h">Tin từ AIRUN</h3>${list.map((n) => `<article class="card cm-post">${n.image ? `<img class="ev-img" src="${esc(n.image)}" alt="" loading="lazy" onerror="this.remove()">` : ''}<div class="cm-post-body"><small>${icon('i-newspaper')}${esc([date(n.date), n.area].filter(Boolean).join(' · ') || 'Tin từ AIRUN')}</small><b>${esc(n.title)}</b>${n.text ? `<p>${esc(n.text)}</p>` : ''}<div class="ev-actions">${n.link ? `<a class="chip-btn" href="${esc(n.link)}" target="_blank" rel="noopener noreferrer">Xem chi tiết ${icon('i-arrow-right')}</a>` : ''}${admin && n.id ? `<button type="button" class="link-danger" data-hide="news:${esc(n.id)}">Ẩn tin</button>` : ''}</div></div></article>`).join('')}`;
  }
  function composerHtml() {
    const f = st.feed; if (!f?.admin) return '';
    if (!st.composer) return `<div class="cm-admin"><span>${icon('i-settings-2')}Bạn đang đăng nhập với quyền quản trị.</span><button type="button" class="primary" id="cmCompose">${icon('i-newspaper')}Đăng tin / sự kiện</button></div>`;
    const d = st.draft, ev = d.kind !== 'news', v = (k) => esc(d[k] ?? '');
    const areas = WARDS.map((w) => `<option${d.area === w.name ? ' selected' : ''}>${esc(w.name)}</option>`).join('');
    const today = vnIso().slice(0, 10);
    return `<form class="card cm-form" id="cmForm" autocomplete="off" novalidate>
      <div class="seg cm-kind" role="tablist"><button type="button" role="tab" class="${ev ? 'on' : ''}" data-kind="event">Sự kiện tìm thành viên</button><button type="button" role="tab" class="${ev ? '' : 'on'}" data-kind="news">Tin tức</button></div>
      <div class="cp-grid">
        <label class="wide">Tiêu đề *<input id="cfTitle" data-k="title" maxlength="120" required value="${v('title')}" placeholder="${ev ? 'VD: Chạy bình minh 10 km bán đảo Sơn Trà' : 'VD: Đường Hoàng Sa rào chắn đến hết tuần'}"></label>
        ${ev ? `<label>Ngày *<input id="cfDate" data-k="date" type="date" min="${today}" required value="${v('date')}"></label>
        <label>Giờ tập trung<input id="cfTime" data-k="time" type="time" value="${v('time')}"></label>
        <label class="wide">Địa điểm tập trung *<input id="cfPlace" data-k="place" maxlength="120" required value="${v('place')}" placeholder="VD: Chân cầu Rồng phía Trần Hưng Đạo"></label>` : ''}
        <label>Khu vực<select id="cfArea" data-k="area"><option value="">Không nêu</option>${areas}</select></label>
        ${ev ? `<label>Cự ly (km)<input id="cfKm" data-k="km" type="number" inputmode="decimal" min="0" max="100" step="0.1" value="${v('km')}"></label>
        <label>Số chỗ<input id="cfSlots" data-k="slots" type="number" inputmode="numeric" min="0" max="1000" value="${v('slots')}" placeholder="0 = không giới hạn"></label>
        <label>Liên hệ<input id="cfContact" data-k="contact" maxlength="120" value="${v('contact')}" placeholder="SĐT, Zalo hoặc Facebook"></label>` : ''}
        <label class="wide">${ev ? 'Mô tả' : 'Nội dung'}<textarea id="cfText" data-k="text" rows="4" maxlength="1500" placeholder="${ev ? 'Lộ trình, tốc độ dự kiến, cần mang gì…' : 'Nội dung tin'}">${v('text')}</textarea></label>
        <label class="wide">Link ảnh<input id="cfImage" data-k="image" maxlength="500" value="${v('image')}" placeholder="https://… hoặc link chia sẻ Google Drive (chế độ ai có link)"></label>
        <label class="wide">Link chi tiết / đăng ký ngoài<input id="cfLink" data-k="link" maxlength="300" value="${v('link')}" placeholder="https://…"></label>
      </div>
      <p class="fb-status" id="cfStatus" role="status"></p>
      <div class="cp-actions"><button type="submit" class="primary" ${st.posting ? 'disabled' : ''}>${st.posting ? 'Đang đăng…' : ev ? 'Đăng sự kiện' : 'Đăng tin'}</button><button type="button" class="soft-btn" id="cfCancel">Đóng</button></div>
      <p class="cp-note">Bài hiện ngay cho mọi người. Muốn sửa nội dung thì sửa trong tab ${ev ? 'su_kien' : 'tin_tuc'} của Google Sheet; muốn gỡ thì bấm "Ẩn" dưới bài.</p></form>`;
  }
  async function postJSON(url, body) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) throw new Error(data.reason || `HTTP ${res.status}`);
    return data;
  }
  async function submitPost(event) {
    event.preventDefault();
    const d = st.draft, ev = d.kind !== 'news', status = el('cfStatus');
    const fail = (m) => { status.textContent = m; status.className = 'fb-status err'; };
    if (String(d.title || '').trim().length < 4) return fail('Tiêu đề cần ít nhất 4 ký tự.');
    if (ev && !d.date) return fail('Chọn ngày diễn ra sự kiện.');
    if (ev && String(d.place || '').trim().length < 3) return fail('Nhập địa điểm tập trung.');
    st.posting = true; render();
    try {
      await postJSON('/api/admin/post', { ...d, kind: ev ? 'event' : 'news' });
      st.posting = false; st.composer = false; st.draft = { kind: d.kind };
      showToast(ev ? 'Đã đăng sự kiện.' : 'Đã đăng tin.');
      await loadFeed(true);
    } catch (error) { st.posting = false; render(); fail(error.message); }
  }
  async function toggleJoin(id, join) {
    if (!session?.token) { showToast('Đăng nhập để tham gia sự kiện.'); openAccount('login'); return; }
    try {
      const r = await postJSON('/api/events/join', { id, join });
      const e = st.feed?.events?.find((x) => x.id === id);
      if (e) { e.joined = r.joined; e.count = r.count; if (r.joined && !e.names.includes(session.user.ten)) e.names = [session.user.ten, ...e.names].slice(0, 4); if (!r.joined) e.names = e.names.filter((n) => n !== session.user.ten); e.full = e.slots > 0 && e.count >= e.slots; }
      showToast(r.joined ? 'Đã đăng ký tham gia. Ban tổ chức sẽ thấy tên bạn trong danh sách.' : 'Đã huỷ tham gia.');
      render();
      st.feedAt = 0; setTimeout(() => void loadFeed(true), 800); // lấy lại danh sách người tham gia đầy đủ
    } catch (error) { showToast(`Chưa thực hiện được: ${error.message}`); render(); }
  }
  async function hidePost(spec) {
    const [kind, id] = spec.split(':');
    try { await postJSON('/api/admin/hide', { kind, id, hidden: true }); showToast('Đã ẩn bài. Muốn hiện lại, sửa cột hien thành x trong Google Sheet.'); await loadFeed(true); }
    catch (error) { showToast(`Chưa ẩn được: ${error.message}`); }
  }

  /* ---------- Thẻ từng khu vực (điểm chạy tính trên máy, cùng công thức trang Kế hoạch) ---------- */
  function areasHtml() {
    const areaStat = (name) => { const k = String(name).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().trim(); return (st.data?.areas || []).find((a) => a.key === k); };
    let auto = '';
    if (!st.bulletins) auto = '<div class="cm-skel"></div><div class="cm-skel"></div>';
    else if (!st.bulletins.length) auto = '<div class="empty-state">Chưa lấy được số liệu thời tiết của các khu vực. <button type="button" class="chip-btn" id="cmNewsRetry">Thử lại</button></div>';
    else auto = `<div class="cm-area-grid">${st.bulletins.map((b, i) => {
      const s = st.period === 'week:0' ? areaStat(b.name) : null;
      return `<article class="card cm-area t-${b.tone}">${photo(b.key, 'thumb')}<div class="cm-area-in"><div class="cm-area-top"><div><small>${i === 0 ? 'Đang đẹp nhất để chạy' : ''}</small><b>${esc(b.name)}</b></div><span class="cm-score"><b>${vn(b.score)}</b>/10</span></div>
        <p class="cm-area-line">${esc(b.title)} · ${hasNum(b.temp) ? `${round(b.temp)}°` : '—'}${hasNum(b.feels) ? `, cảm giác ${round(b.feels)}°` : ''}${hasNum(b.aqi) ? ` · AQI ${round(b.aqi)}` : ''}</p>
        ${b.alerts.length ? `<ul class="cm-alerts">${b.alerts.map((a) => `<li class="t-${a.tone}">${icon('i-triangle-alert')}${esc(a.text)}</li>`).join('')}</ul>` : '<p class="cm-calm">Không có cảnh báo trong 12 giờ tới.</p>'}
        <div class="cm-area-foot"><span>${b.bestText ? `${icon('i-timer')}Giờ đẹp: ${esc(b.bestText)}` : ''}${s ? `<em>${icon('i-users')}${s.runners} người · ${vn(s.km)} km tuần này</em>` : ''}</span><button type="button" class="chip-btn" data-plan-area="${esc(b.key)}">Lên kế hoạch ở đây</button></div></div></article>`;
    }).join('')}</div>`;
    return `<h3 class="hub-h">Khu vực chạy hôm nay</h3>${auto}<p class="wx-note">Điểm chạy của từng khu vực tính từ dự báo Open-Meteo, cùng công thức với trang Kế hoạch. Ảnh khu vực từ Wikimedia Commons; bấm vào dòng nguồn trên ảnh để xem tác giả và giấy phép.</p>`;
  }
  function newsHtml() { return composerHtml() + dailyHtml() + eventsHtml() + postsHtml() + areasHtml(); }

  /* ---------- Khung trang ---------- */
  function render() {
    const box = el('communityPage'); if (!box) return;
    box.innerHTML = `<div class="wx-head"><div><p class="eyebrow">CỘNG ĐỒNG AIRUN</p><h2>${st.tab === 'board' ? 'Bảng xếp hạng người chạy' : 'Bản tin chạy bộ'}</h2></div></div>
      <div class="seg cm-tabs" role="tablist" aria-label="Mục cộng đồng"><button type="button" role="tab" class="${st.tab === 'news' ? 'on' : ''}" data-cm-tab="news">${icon('i-newspaper')}Bản tin</button><button type="button" role="tab" class="${st.tab === 'board' ? 'on' : ''}" data-cm-tab="board">${icon('i-trophy')}Xếp hạng</button></div>
      ${st.tab === 'board' ? `<div class="seg cm-period" role="tablist" aria-label="Khoảng thời gian">${PERIODS.map((p) => `<button type="button" role="tab" class="${p.key === st.period ? 'on' : ''}" data-period="${p.key}">${p.label}</button>`).join('')}</div><div class="cm-body${st.loading ? ' is-loading' : ''}" aria-live="polite">${boardHtml()}</div>` : `<div class="cm-body" aria-live="polite">${newsHtml()}</div>`}`;
    box.querySelectorAll('[data-cm-tab]').forEach((b) => b.addEventListener('click', () => { st.tab = b.dataset.cmTab; render(); if (st.tab === 'news') { void loadFeed(); void loadBulletins(); } else if (!st.data) void loadBoard(); }));
    box.querySelectorAll('[data-period]').forEach((b) => b.addEventListener('click', () => { st.period = b.dataset.period; void loadBoard(); }));
    box.querySelectorAll('[data-area]').forEach((b) => b.addEventListener('click', () => { st.area = b.dataset.area; void loadBoard(); }));
    el('cmRetry')?.addEventListener('click', () => void loadBoard());
    el('cmNewsRetry')?.addEventListener('click', () => void loadBulletins(true));
    el('cmFeedRetry')?.addEventListener('click', () => void loadFeed(true));
    el('cmCompose')?.addEventListener('click', () => { st.composer = true; render(); el('cfTitle')?.focus(); });
    el('cfCancel')?.addEventListener('click', () => { st.composer = false; render(); });
    const form = el('cmForm');
    if (form) {
      form.addEventListener('submit', submitPost);
      form.querySelectorAll('[data-k]').forEach((i) => ['input', 'change'].forEach((ev) => i.addEventListener(ev, () => { st.draft[i.dataset.k] = i.value; const s2 = el('cfStatus'); if (s2) s2.textContent = ''; })));
      form.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => { st.draft.kind = b.dataset.kind; render(); }));
    }
    box.querySelectorAll('[data-join]').forEach((b) => b.addEventListener('click', () => { b.disabled = true; void toggleJoin(b.dataset.join, true); }));
    box.querySelectorAll('[data-leave]').forEach((b) => b.addEventListener('click', () => { b.disabled = true; void toggleJoin(b.dataset.leave, false); }));
    box.querySelectorAll('[data-hide]').forEach((b) => b.addEventListener('click', () => { b.disabled = true; void hidePost(b.dataset.hide); }));
    el('cmLogin')?.addEventListener('click', () => openAccount('login'));
    el('cmHide')?.addEventListener('change', (e) => { localSet(HIDE_KEY, e.target.checked); showToast(e.target.checked ? 'Tên bạn sẽ được ẩn từ buổi chạy kế tiếp.' : 'Tên bạn sẽ hiện lại từ buổi chạy kế tiếp.'); });
    box.querySelectorAll('[data-plan-area]').forEach((b) => b.addEventListener('click', async () => { const key = b.dataset.planArea; activateView('plan'); try { await selectWard(key, { analyze: true }); } catch {} }));
  }

  document.addEventListener('airun:view', (e) => {
    if (e.detail?.view !== 'community') return;
    render();
    if (st.tab === 'board' && (!st.data || Date.now() - (st.data.updated || 0) > 3 * 60e3 || e.detail.changed)) void loadBoard();
    if (st.tab === 'news') { void loadFeed(e.detail.changed && Date.now() - st.feedAt > 60e3); void loadBulletins(); if (!st.data) void loadBoard(); }
  });
  setCat('Bản tin hôm nay · sự kiện · xếp hạng');
  window.__airunCommunity = { state: st, reload: loadBoard, reloadFeed: loadFeed };
  // Đăng nhập / đăng xuất → tải lại để biết quyền quản trị và trạng thái tham gia.
  let lastToken = session?.token || '';
  setInterval(() => { const t = session?.token || ''; if (t !== lastToken) { lastToken = t; st.feedAt = 0; if (document.body.dataset.view === 'community') { void loadFeed(true); void loadBoard(); } } }, 1500);
  if (document.body.dataset.view === 'community') { render(); void loadFeed(); void loadBulletins(); void loadBoard(); }
})();
