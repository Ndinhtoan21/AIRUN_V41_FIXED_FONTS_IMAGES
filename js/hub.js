/* AIRUN V9.2 — "mỗi màn một thông tin chính"
   1) Trang chủ: thẻ lớn "Bây giờ chạy được không?" + lưới danh mục.
   2) Trang Thời tiết: chọn khu vực → ngày → khung giờ; một chỉ số hiện to, chỉ số khác chạm để đổi.
   3) Bảng chọn khu vực dùng chung (trang chủ đổi khu vực của kế hoạch; trang Thời tiết chỉ để xem).
   Dùng lại hàm/biến của js/app.js (WARDS, fetchEnvironment, analyzeSnapshot, currentPlan, …).
   Trang Thời tiết KHÔNG gọi AI và KHÔNG đổi kế hoạch cho tới khi người dùng bấm "Đặt giờ chạy này". */
(() => {
  'use strict';
  if (typeof document === 'undefined' || typeof WARDS === 'undefined') return;

  const el = (id) => document.getElementById(id);
  const esc = (v) => escapeHTML(v);
  const icon = (name, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#${name}"/></svg>`;
  const pad = (n) => String(n).padStart(2, '0');
  const avg = (list) => { const v = list.filter(hasNum).map(Number); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const max = (list) => { const v = list.filter(hasNum).map(Number); return v.length ? Math.max(...v) : null; };
  const nowHour = () => Number(vnIso().slice(11, 13));
  const dayDate = (day) => vnIso(new Date(Date.now() + day * 86400000)).slice(0, 10);

  /* ---------- Khung giờ, khu vực, chỉ số ---------- */
  const SLOTS = [
    { key: 'early', name: 'Sáng sớm', from: 5, to: 8 },
    { key: 'morning', name: 'Buổi sáng', from: 8, to: 11 },
    { key: 'noon', name: 'Buổi trưa', from: 11, to: 14 },
    { key: 'afternoon', name: 'Buổi chiều', from: 14, to: 17 },
    { key: 'evening', name: 'Chiều tối', from: 17, to: 20 },
    { key: 'night', name: 'Buổi tối', from: 20, to: 23 }
  ];
  const POPULAR = ['HaiChau', 'SonTra', 'NguHanhSon', 'AnHai', 'ThanhKhe', 'LienChieu', 'CamLe', 'HoiAn', 'TamKy'];
  const GROUPS = [
    { name: 'Đà Nẵng – nội thành', keys: ['HaiChau', 'HoaCuong', 'ThanhKhe', 'AnKhe', 'AnHai', 'SonTra', 'NguHanhSon', 'HoaKhanh', 'LienChieu', 'HaiVan', 'CamLe', 'HoaXuan'] },
    { name: 'Hội An', keys: ['HoiAn', 'HoiAnDong', 'HoiAnTay'] },
    { name: 'Điện Bàn', keys: ['DienBan', 'DienBanDong', 'AnThang', 'DienBanBac'] },
    { name: 'Tam Kỳ', keys: ['TamKy', 'QuangPhu', 'HuongTra', 'BanThach'] }
  ];
  const scoreLevel = (s) => !hasNum(s) ? { word: 'Chưa có', tone: 'none' }
    : s >= 8.5 ? { word: 'Rất hợp để chạy', tone: 'good' } : s >= 7.5 ? { word: 'Hợp để chạy', tone: 'good' }
    : s >= 6.5 ? { word: 'Chạy nhẹ được', tone: 'ok' } : s >= 5 ? { word: 'Nên đổi giờ', tone: 'warn' } : { word: 'Không nên chạy', tone: 'bad' };
  const METRICS = {
    temp: { label: 'Nhiệt độ', icon: 'i-thermometer-sun', stat: 'temp', show: (v) => `${round(v)}°`, level: (st) => levelHeat(st.feels) },
    air: { label: 'Không khí', icon: 'i-gauge', stat: 'aqi', show: (v) => `${round(v)}`, unit: 'AQI', level: (st) => levelAir(st.aqi) },
    rain: { label: 'Mưa', icon: 'i-droplets', stat: 'rain', show: (v) => `${round(v)}%`, level: (st) => levelRain(st.rain) },
    wind: { label: 'Gió', icon: 'i-wind', stat: 'wind', show: (v) => `${round(v)}`, unit: 'km/h', level: (st) => levelWind(st.wind) },
    uv: { label: 'Tia UV', icon: 'i-sun', stat: 'uv', show: (v) => `${round(v, 1)}`, unit: 'UV', level: (st) => levelUv(st.uv) },
    score: { label: 'Điểm chạy', icon: 'i-footprints', stat: 'score', show: (v) => `${round(v, 1)}`, unit: '/10', level: (st) => scoreLevel(st.score) }
  };

  function weatherIcon(code, hour) {
    const c = Number(code), night = hour < 6 || hour >= 18;
    if ([95, 96, 99].includes(c)) return 'w-storm';
    if ([61, 63, 65, 80, 81, 82].includes(c)) return 'i-cloud-rain';
    if ([51, 53, 55].includes(c)) return 'w-drizzle';
    if ([45, 48].includes(c)) return 'w-fog';
    if (c === 3) return 'w-cloud';
    if (c === 1 || c === 2) return night ? 'w-cloud' : 'w-cloud-sun';
    if (c === 0) return night ? 'w-moon' : 'i-sun';
    return 'w-cloud';
  }
  // Mã thời tiết "đáng chú ý nhất" trong khung (dông > mưa > mưa phùn > sương mù > nhiều mây > ít mây > quang).
  function worstCode(codes) {
    const rank = (c) => [95, 96, 99].includes(c) ? 7 : [61, 63, 65, 80, 81, 82].includes(c) ? 6 : [51, 53, 55].includes(c) ? 5 : [45, 48].includes(c) ? 4 : c === 3 ? 3 : c === 2 ? 2 : c === 1 ? 1 : 0;
    return codes.filter(hasNum).map(Number).sort((a, b) => rank(b) - rank(a))[0] ?? null;
  }
  const toneOf = (t) => t === 'caution' ? 'ok' : t;
  const unitHtml = (m, compact = false) => !m.unit || (compact && (m.unit === 'AQI' || m.unit === 'UV')) ? '' : m.unit === '/10' ? '<span>/10</span>' : `<span> ${m.unit}</span>`;

  /* ---------- Trạng thái trang Thời tiết ---------- */
  const STORE = 'airun-v92-weather';
  const saved = localGet(STORE, {});
  const st = {
    key: WARDS.some((w) => w.key === saved.key) ? saved.key : null,
    gps: false, day: 0, slot: null, metric: METRICS[saved.metric] ? saved.metric : 'temp',
    recent: Array.isArray(saved.recent) ? saved.recent.filter((k) => WARDS.some((w) => w.key === k)).slice(0, 4) : [],
    data: null, loading: false, reqId: 0, fresh: new Map()
  };
  const persist = () => localSet(STORE, { key: st.key, metric: st.metric, recent: st.recent });

  function areaLabel() {
    if (st.gps && gpsLocation) return gpsLocation.label || 'Vị trí của tôi';
    return ward(st.key).name;
  }

  async function loadWeather({ force = false } = {}) {
    if (!st.key) st.key = selectedKey;
    const cacheId = st.gps && gpsLocation ? gpsLocation.cacheId : `ward:${st.key}`;
    const hit = st.fresh.get(cacheId);
    // Cùng khu vực đang dùng cho kế hoạch và đã có dữ liệu trực tiếp → dùng luôn, không gọi lại.
    const sameAsPlan = !st.gps && st.key === selectedKey && !gpsLocation && activeData && !isNoData(activeData) && activeData.source !== 'cached' && Date.now() - activeData.updated < 10 * 60e3;
    if (!force && hit && Date.now() - hit.updated < 10 * 60e3) { st.data = hit; renderWeather(); return; }
    if (!force && sameAsPlan) { st.data = activeData; st.fresh.set(cacheId, activeData); renderWeather(); return; }
    const id = ++st.reqId;
    st.loading = true;
    const quick = st.gps && gpsLocation ? quickEnvironmentForGps(gpsLocation) : quickEnvironmentForWard(st.key);
    st.data = isNoData(quick) ? null : quick;
    renderWeather();
    let data = null;
    try {
      data = st.gps && gpsLocation
        ? await fetchEnvironmentAt(gpsLocation.lat, gpsLocation.lon, { key: nearestWard(gpsLocation.lat, gpsLocation.lon).item.key, label: gpsLocation.label, cacheId: gpsLocation.cacheId, accuracy: gpsLocation.accuracy, mode: 'gps' })
        : await fetchEnvironment(st.key);
    } catch (error) { console.warn('AIRUN weather page:', error); }
    if (id !== st.reqId) return;
    st.loading = false;
    if (data && !isNoData(data)) { st.data = data; st.fresh.set(cacheId, data); }
    else if (!st.data) st.data = data;
    renderWeather();
  }

  function dayRows(data, day) {
    const date = dayDate(day), h0 = day === 0 ? nowHour() : -1;
    return (data?.hourly || []).filter((r) => r.time.slice(0, 10) === date && Number(r.time.slice(11, 13)) >= h0);
  }

  function slotStats(data, day, slot, plan) {
    const rows = dayRows(data, day).filter((r) => { const h = Number(r.time.slice(11, 13)); return h >= slot.from && h < slot.to; });
    if (!rows.length) return null;
    const scored = rows.map((r) => ({ r, res: analyzeSnapshot({ ...data.current, ...r }, plan) }));
    const best = [...scored].sort((a, b) => b.res.score - a.res.score || a.r.time.localeCompare(b.r.time))[0];
    return {
      rows: scored, best,
      temp: avg(rows.map((r) => r.temp)), feels: avg(rows.map((r) => r.feels)), aqi: avg(rows.map((r) => r.aqi)), pm: avg(rows.map((r) => r.pm)),
      rain: max(rows.map((r) => r.rain)), wind: avg(rows.map((r) => r.wind)), uv: max(rows.map((r) => r.uv)), humidity: avg(rows.map((r) => r.humidity)),
      score: avg(scored.map((x) => x.res.score)), code: worstCode(rows.map((r) => r.code))
    };
  }

  /* ---------- Vẽ trang Thời tiết ---------- */
  function renderAreaChips() {
    const box = el('wxAreas'); if (!box) return;
    const keys = [...new Set([...(st.key ? [st.key] : []), ...st.recent, ...POPULAR])].slice(0, 9);
    const gpsChip = gpsLocation ? `<button type="button" role="option" class="chip${st.gps ? ' on' : ''}" data-area="__gps">${icon('i-locate-fixed')}Vị trí của tôi</button>` : '';
    box.innerHTML = gpsChip + keys.map((k) => `<button type="button" role="option" aria-selected="${!st.gps && k === st.key}" class="chip${!st.gps && k === st.key ? ' on' : ''}" data-area="${k}">${esc(ward(k).name)}</button>`).join('')
      + `<button type="button" class="chip more" data-area="__all">Tất cả ${icon('i-chevron-down')}</button>`;
    const name = el('wxAreaName'); if (name) name.textContent = areaLabel();
  }

  function renderWeather() {
    if (!el('weatherPage')) return;
    if (!st.key) st.key = selectedKey;
    renderAreaChips();
    const data = st.data, plan = currentPlan(), metric = METRICS[st.metric];
    el('wxDays')?.querySelectorAll('[data-day]').forEach((b) => { const on = Number(b.dataset.day) === st.day; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
    el('wxMetrics')?.querySelectorAll('[data-metric]').forEach((b) => { const on = b.dataset.metric === st.metric; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
    const main = el('wxMain'), slotsBox = el('wxSlots'), hours = el('wxHours'), useBtn = el('wxUseBtn');
    if (!data || isNoData(data)) {
      const failed = data?.failed && !st.loading;
      slotsBox.innerHTML = SLOTS.map(() => '<div class="slot skel"></div>').join('');
      main.innerHTML = failed
        ? `<div class="wx-empty"><b>Chưa lấy được dữ liệu cho ${esc(areaLabel())}</b><p>Open-Meteo chưa phản hồi. AIRUN không hiện số mô phỏng.</p><button type="button" class="soft-btn" data-wx-retry>${icon('i-refresh-cw')}Thử lại</button></div>`
        : '<div class="wx-skel"></div>';
      hours.innerHTML = ''; if (useBtn) useBtn.disabled = true;
      el('wxSource').textContent = st.loading ? 'Đang tải…' : '';
      return;
    }
    // Hôm nay đã qua hết các khung → chuyển sang ngày mai.
    const statsFor = (day) => SLOTS.map((s) => ({ slot: s, stats: slotStats(data, day, s, plan) }));
    let all = statsFor(st.day);
    if (st.day === 0 && !all.some((x) => x.stats)) { st.day = 1; all = statsFor(1); return renderWeather(); }
    if (!st.slot || !all.find((x) => x.slot.key === st.slot && x.stats)) st.slot = (all.find((x) => x.stats) || all[0]).slot.key;
    const bestSlot = [...all].filter((x) => x.stats).sort((a, b) => b.stats.score - a.stats.score)[0]?.slot.key;

    slotsBox.innerHTML = all.map(({ slot, stats }) => {
      if (!stats) return `<button type="button" role="tab" class="slot past" disabled><b>${slot.name}</b><small>${pad(slot.from)}–${pad(slot.to)}h</small><em>Đã qua</em></button>`;
      const v = stats[metric.stat], lv = metric.level(stats), on = slot.key === st.slot;
      return `<button type="button" role="tab" aria-selected="${on}" class="slot t-${lv.tone}${on ? ' on' : ''}" data-slot="${slot.key}">`
        + `<b>${slot.name}${slot.key === bestSlot ? ' <i class="star" title="Khung chạy tốt nhất">★</i>' : ''}</b><small>${pad(slot.from)}–${pad(slot.to)}h</small>`
        + `<span class="slot-v">${icon(weatherIcon(stats.code, slot.from + 1), 'wx')}<strong>${hasNum(v) ? metric.show(v) : '—'}</strong></span><i class="dot" aria-hidden="true"></i></button>`;
    }).join('');

    const cur = all.find((x) => x.slot.key === st.slot), s = cur.stats, slot = cur.slot;
    const lv = metric.level(s), value = s[metric.stat], dayName = st.day === 0 ? 'Hôm nay' : 'Ngày mai';
    const desc = weatherText(s.code)[0], sl = scoreLevel(s.score);
    const heroIcon = st.metric === 'temp' || st.metric === 'rain' ? weatherIcon(s.code, slot.from + 1) : metric.icon;
    const sub = {
      temp: `Cảm giác ${hasNum(s.feels) ? round(s.feels) + '°' : '—'} · ${desc}`,
      air: hasNum(s.pm) ? `Bụi mịn PM2.5 khoảng ${round(s.pm)} µg/m³` : 'Chỉ số AQI Mỹ, trung bình trong khung',
      rain: `${desc} · khả năng mưa cao nhất trong khung`,
      wind: 'Tốc độ gió trung bình trong khung',
      uv: 'Mức UV cao nhất trong khung',
      score: s.best ? `Giờ tốt nhất trong khung: ${s.best.r.time.slice(11, 16)} (${s.best.res.score}/10)` : ''
    }[st.metric];
    const facts = Object.entries(METRICS).filter(([k]) => k !== st.metric).map(([k, m]) => {
      const v = s[m.stat], l = m.level(s);
      return `<li><button type="button" data-metric="${k}" class="t-${l.tone}" title="Xem ${m.label.toLowerCase()} theo khung giờ">${icon(m.icon)}<small>${m.label}</small><b>${hasNum(v) ? m.show(v) + unitHtml(m, true) : '—'}</b></button></li>`;
    }).join('');
    main.className = `wx-main t-${lv.tone}`;
    main.innerHTML = `<div class="wxm-top"><span>${esc(dayName)} · ${slot.name} · ${pad(slot.from)}:00–${pad(slot.to)}:00</span><span class="pill t-${sl.tone}">${icon('i-footprints')}${hasNum(s.score) ? round(s.score, 1) : '—'}/10</span></div>`
      + `<div class="wxm-hero">${icon(heroIcon, 'wx big')}<div class="wxm-value"><small>${metric.label}</small><b>${hasNum(value) ? metric.show(value) + unitHtml(metric) : '—'}</b></div></div>`
      + `<p class="wxm-level"><b class="t-${lv.tone}">${esc(lv.word)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</p>`
      + `<ul class="wxm-facts">${facts}</ul>`;

    el('wxHoursTitle').textContent = `Từng giờ · ${slot.name.toLowerCase()}`;
    hours.innerHTML = s.rows.map(({ r, res }) => {
      const h = Number(r.time.slice(11, 13)), val = metric.stat === 'score' ? res.score : r[metric.stat];
      const isBest = s.best && r.time === s.best.r.time;
      return `<li class="${isBest ? 'best' : ''}"><time>${pad(h)}:00</time>${icon(weatherIcon(r.code, h), 'wx')}`
        + `<b>${hasNum(val) ? metric.show(val) + unitHtml(metric) : '—'}</b>`
        + `<small>${[st.metric !== 'temp' && `${hasNum(r.temp) ? round(r.temp) + '°' : '—'}`, st.metric !== 'air' && `AQI ${fmt(r.aqi)}`, st.metric !== 'rain' && `mưa ${hasNum(r.rain) ? round(r.rain) + '%' : '—'}`].filter(Boolean).join(' · ')}</small>`
        + `<i class="pill t-${toneOf(res.tone)}">${res.score}</i></li>`;
    }).join('');
    const updated = new Date(data.updated).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    el('wxSource').textContent = `${sourceLabel(data.source)} · ${updated}${st.loading ? ' · đang cập nhật…' : ''}`;
    if (useBtn) {
      useBtn.disabled = !s.best;
      el('wxUseText').textContent = s.best ? `Chạy lúc ${s.best.r.time.slice(11, 16)} ${st.day === 0 ? 'hôm nay' : 'ngày mai'} · ${areaLabel()}` : 'Đặt giờ chạy này';
      useBtn.dataset.time = s.best ? s.best.r.time.slice(11, 16) : '';
    }
  }

  async function useSlotForPlan() {
    const time = el('wxUseBtn')?.dataset.time; if (!time) return;
    if (!st.gps && (st.key !== selectedKey || gpsLocation)) await selectWard(st.key, { analyze: false });
    el('time').value = time;
    savePlanSettings();
    const target = targetIso(time), today = target.slice(0, 10) === vnIso().slice(0, 10);
    location.hash = '#/plan';
    void analyzePlan(false);
    showToast(`Đã đặt kế hoạch: ${time} ${today ? 'hôm nay' : 'ngày mai'} · ${areaLabel()}.${st.day === 1 && today ? ' (AIRUN dùng giờ gần nhất.)' : ''}`);
  }

  /* ---------- Trang chủ ---------- */
  function greeting(h) { return h < 4 ? 'Chào buổi tối' : h < 11 ? 'Chào buổi sáng' : h < 13 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'; }
  function setText(id, text) { const n = el(id); if (n && n.textContent !== text) n.textContent = text; }

  function renderHub() {
    if (!el('hub')) return;
    const h = nowHour();
    const date = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    setText('hubDate', date.charAt(0).toUpperCase() + date.slice(1));
    setText('hubHello', greeting(h));
    setText('nowTime', vnIso().slice(11, 16));
    const data = activeData, plan = currentPlan(), est = planEstimate(plan);
    const label = gpsLocation ? `${gpsLocation.label || 'Vị trí của tôi'}` : (data?.location?.label || ward().name);
    setText('hubAreaName', label);
    setText('catPlan', `${plan.time} · ${plan.duration} phút · ${est.distance.toFixed(1)} km`);
    const ai = el('homeAiHead')?.textContent || '';
    setText('catCoach', ai && !/^Đang|^AI Coach$/.test(ai) ? ai : 'Hỏi gì cũng được');
    setText('catRoute', routePlanner.current ? `Đã tạo ${Number(routePlanner.current.distanceKm || 0).toFixed(1)} km` : 'Theo số km hoặc mô tả');
    setText('catGps', tracker.status === 'running' || tracker.status === 'paused' ? `Đang chạy · ${tracker.distanceKm.toFixed(2)} km` : (el('homeRunHead')?.textContent || 'Sẵn sàng chạy'));
    const runs = journalRows().filter((r) => r.type === 'run').length;
    setText('catJournal', runs ? `${runs} buổi chạy đã lưu` : 'Chưa có buổi chạy');
    const card = el('nowCard');
    if (!data || isNoData(data)) {
      card.dataset.tone = 'none';
      setText('nowScore', '—'); setText('nowTemp', '—°'); setText('nowFeels', 'Cảm giác —');
      setText('nowTitle', data?.failed ? 'Chưa lấy được dữ liệu thật' : 'Đang đọc thời tiết và không khí…');
      setText('nowSrc', data?.failed ? 'Lỗi kết nối' : 'Đang tải');
      el('nowFacts').innerHTML = ''; setText('nowBest', '');
      ['catWeather', 'catAir', 'catBest'].forEach((id) => setText(id, data?.failed ? 'Chưa có dữ liệu' : 'Đang tải…'));
      return;
    }
    const c = data.current || {};
    const res = analyzeSnapshot({ ...c, time: vnIso() }, { ...plan, time: vnIso().slice(11, 16) });
    card.dataset.tone = toneOf(res.tone);
    setText('nowScore', String(res.score));
    setText('nowTitle', res.title);
    setText('nowSrc', data.source === 'live' ? 'Trực tiếp' : data.source === 'partial' ? 'Một phần' : 'Đã lưu');
    setText('nowTemp', hasNum(c.temp) ? `${round(c.temp)}°` : '—°');
    setText('nowFeels', `Cảm giác ${hasNum(c.feels) ? round(c.feels) + '°' : '—'} · ${weatherText(c.code)[0]}`);
    const use = card.querySelector('.now-wx use'); if (use) use.setAttribute('href', `#${weatherIcon(c.code, h)}`);
    const air = levelAir(c.aqi), uv = levelUv(c.uv), rain = levelRain(c.rain), wind = levelWind(c.wind);
    el('nowFacts').innerHTML = [
      ['air', 'Không khí', hasNum(c.aqi) ? `AQI ${round(c.aqi)}` : '—', air],
      ['rain', 'Mưa', hasNum(c.rain) ? `${round(c.rain)}%` : '—', rain],
      ['uv', 'UV', hasNum(c.uv) ? `${round(c.uv, 1)}` : '—', uv],
      ['wind', 'Gió', hasNum(c.wind) ? `${round(c.wind)} km/h` : '—', wind]
    ].map(([k, n, v, l]) => `<li><a href="#/weather" data-metric="${k}" class="t-${l.tone}"><small>${n}</small><b>${v}</b></a></li>`).join('');
    const best = bestTimeFor(data, plan);
    const bestText = best ? `${best.row.time.slice(11, 16)} ${best.row.time.slice(0, 10) === vnIso().slice(0, 10) ? 'hôm nay' : 'ngày mai'}` : '';
    setText('nowBest', best ? `Giờ tốt nhất sắp tới: ${bestText} · ${best.result.score}/10` : '');
    setText('catWeather', `${hasNum(c.temp) ? round(c.temp) + '° · ' : ''}${weatherText(c.code)[0]}`);
    setText('catAir', hasNum(c.aqi) ? `AQI ${round(c.aqi)} · ${air.word}` : 'Chưa có AQI');
    setText('catBest', best ? `${bestText} · ${best.result.score}/10` : 'Chưa có dự báo');
  }

  /* ---------- Bảng chọn khu vực ---------- */
  let sheetCtx = 'home';
  const fold = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  function renderSheet(filter = '') {
    const list = el('areaSheetList'); if (!list) return;
    const q = fold(filter.trim()), current = sheetCtx === 'weather' ? (st.gps ? null : st.key) : (gpsLocation ? null : selectedKey);
    list.innerHTML = GROUPS.map((g) => {
      const items = g.keys.map((k) => ward(k)).filter((w) => !q || fold(w.name).includes(q) || fold(g.name).includes(q));
      if (!items.length) return '';
      return `<section><h3>${g.name}</h3><div class="sheet-items">${items.map((w) => `<button type="button" data-key="${w.key}" class="${w.key === current ? 'on' : ''}"><b>${esc(w.name)}</b><small>${esc(w.desc)}</small></button>`).join('')}</div></section>`;
    }).join('') || '<p class="sheet-empty">Không tìm thấy khu vực.</p>';
  }
  function openSheet(ctx) {
    const dlg = el('areaSheet'); if (!dlg) return;
    sheetCtx = ctx;
    el('areaSheetTitle').textContent = ctx === 'weather' ? 'Xem thời tiết ở đâu?' : 'Khu vực bạn chạy';
    el('areaSheetSearch').value = '';
    renderSheet();
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function closeSheet() { const dlg = el('areaSheet'); if (dlg?.open) dlg.close?.(); }
  function pickArea(key) {
    closeSheet();
    if (sheetCtx === 'weather') {
      st.gps = false; st.key = key; st.slot = null;
      st.recent = [key, ...st.recent.filter((k) => k !== key)].slice(0, 4); persist();
      renderAreaChips(); void loadWeather();
    } else {
      runAsyncTask('Đổi khu vực', () => selectWard(key, { analyze: true }));
      showToast(`Đã chọn khu vực ${ward(key).name}.`);
    }
  }
  async function pickGps() {
    closeSheet();
    await useGPS({ scroll: false });
    if (sheetCtx === 'weather' && gpsLocation) { st.gps = true; st.slot = null; void loadWeather({ force: true }); }
  }

  /* ---------- Sự kiện ---------- */
  function bind() {
    // Liên kết có data-metric (danh mục Trang chủ, ô số liệu nhỏ) → mở trang Thời tiết đúng chỉ số.
    document.addEventListener('click', (event) => {
      const link = event.target.closest('[data-metric]');
      if (!link) return;
      if (METRICS[link.dataset.metric]) { st.metric = link.dataset.metric; persist(); }
      if (link.tagName === 'BUTTON') renderWeather();
    });
    el('wxDays')?.addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (!b) return; st.day = Number(b.dataset.day); st.slot = null; renderWeather(); });
    el('wxSlots')?.addEventListener('click', (e) => { const b = e.target.closest('[data-slot]'); if (!b) return; st.slot = b.dataset.slot; renderWeather(); });
    el('wxAreas')?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-area]'); if (!b) return;
      const k = b.dataset.area;
      if (k === '__all') return openSheet('weather');
      if (k === '__gps') { st.gps = true; st.slot = null; return void loadWeather(); }
      st.gps = false; st.key = k; st.slot = null; persist(); renderAreaChips(); void loadWeather();
    });
    el('wxMain')?.addEventListener('click', (e) => { if (e.target.closest('[data-wx-retry]')) void loadWeather({ force: true }); });
    el('wxAreaBtn')?.addEventListener('click', () => openSheet('weather'));
    el('hubAreaBtn')?.addEventListener('click', () => openSheet('home'));
    el('wxUseBtn')?.addEventListener('click', () => runAsyncTask('Đặt giờ chạy', useSlotForPlan));
    el('areaSheetClose')?.addEventListener('click', closeSheet);
    el('areaSheet')?.addEventListener('click', (e) => { if (e.target === el('areaSheet')) closeSheet(); });
    el('areaSheetSearch')?.addEventListener('input', (e) => renderSheet(e.target.value));
    el('areaSheetList')?.addEventListener('click', (e) => { const b = e.target.closest('[data-key]'); if (b) pickArea(b.dataset.key); });
    el('areaSheetGps')?.addEventListener('click', () => runAsyncTask('GPS', pickGps));

    document.addEventListener('airun:update', () => { renderHub(); });
    new MutationObserver(() => {
      const v = document.body.dataset.view;
      if (v === 'weather') { renderWeather(); void loadWeather(); }
      if (v === 'home') renderHub();
    }).observe(document.body, { attributes: true, attributeFilter: ['data-view'] });
    // Đồng hồ "Bây giờ" và khung giờ đã qua cập nhật mỗi phút.
    setInterval(() => { renderHub(); if (document.body.dataset.view === 'weather') renderWeather(); }, 60000);
  }

  function start() {
    bind(); renderHub();
    if (document.body.dataset.view === 'weather') void loadWeather();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0), { once: true });
  else setTimeout(start, 0);
})();
