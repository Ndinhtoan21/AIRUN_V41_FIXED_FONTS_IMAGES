/* AIRUN V9.6 — AI Coach thành HLV online:
   1) Thể trạng & BMI (tính ngay trên máy, ngưỡng WHO cho người châu Á; chỉ lưu trên máy này).
   2) Lộ trình chạy nhiều tuần (app lập theo quy tắc an toàn: tăng ≤ 10%/tuần, có tuần giảm tải; AI viết phần nhận xét).
   3) Dinh dưỡng – nước uống cho buổi chạy đang lên kế hoạch.
   Dùng lại hàm/biến của js/app.js (currentPlan, planEstimate, postCoach, sendAgent, …). */
(() => {
  'use strict';
  if (typeof document === 'undefined' || typeof WARDS === 'undefined') return;
  const el = (id) => document.getElementById(id);
  const esc = (v) => escapeHTML(String(v ?? ''));
  const icon = (name) => `<svg class="ic" aria-hidden="true"><use href="#${name}"/></svg>`;
  const A_KEY = 'airun-v96-athlete', P_KEY = 'airun-v96-program';
  const GOALS = { health: 'Chạy đều vì sức khoẻ', fat: 'Giảm mỡ, giữ dáng', k5: 'Hoàn thành 5 km', k10: 'Hoàn thành 10 km', k21: 'Bán marathon 21 km' };
  const LEVELS = ['Mới bắt đầu', 'Đã chạy được 3–5 km', 'Chạy đều hằng tuần'];
  const DAY_NAMES = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
  const DAY_SETS = { 3: [1, 3, 6], 4: [1, 3, 5, 6], 5: [0, 1, 3, 5, 6] }; // buổi dài luôn vào Chủ nhật (6)

  let athlete = localGet(A_KEY, null);
  let program = localGet(P_KEY, null);
  let editing = false;

  /* ---------- 1. Thể trạng & BMI ---------- */
  const ageOf = (a) => a?.birthYear ? Number(vnIso().slice(0, 4)) - Number(a.birthYear) : null;
  function bmiOf(a) {
    if (!a || !(a.heightCm > 0) || !(a.weightKg > 0)) return null;
    const h = a.heightCm / 100, bmi = round(a.weightKg / (h * h), 1), age = ageOf(a);
    const range = [round(18.5 * h * h, 1), round(22.9 * h * h, 1)];
    if (age !== null && age < 18) return { bmi: round(bmi, 1), key: 'minor', label: 'Dưới 18 tuổi', tone: 'none', range: null, minor: true };
    const c = bmi < 18.5 ? ['under', 'Thiếu cân', 'ok'] : bmi < 23 ? ['normal', 'Bình thường', 'good'] : bmi < 25 ? ['over', 'Thừa cân', 'ok'] : bmi < 30 ? ['obese1', 'Béo phì độ I', 'warn'] : ['obese2', 'Béo phì độ II', 'bad'];
    return { bmi: round(bmi, 1), key: c[0], label: c[1], tone: c[2], range, minor: false };
  }
  function bmiAdvice(b, a) {
    if (!b) return '';
    if (b.minor) return 'Ngưỡng BMI của người lớn không áp dụng cho người dưới 18 tuổi vì cơ thể còn đang lớn. Hãy ăn đủ bữa, ngủ đủ, chạy vui là chính; muốn biết cân nặng có hợp không thì hỏi phụ huynh, thầy cô thể dục hoặc bác sĩ để xem biểu đồ tăng trưởng theo tuổi.';
    const t = {
      under: 'Bạn hơi nhẹ cân so với chiều cao. Không cần giảm cân: ăn đủ bữa, thêm bữa phụ sau chạy, chạy nhẹ 3 buổi/tuần và tập thêm sức mạnh (squat, plank) để tăng cơ.',
      normal: 'Cân nặng đang hợp với chiều cao. Bạn có thể tăng dần quãng đường theo lộ trình, mỗi tuần không quá 10%.',
      over: 'Bạn nhỉnh hơn mức khuyến nghị một chút. Chạy nhẹ đều 3–4 buổi/tuần kết hợp đi bộ nhanh; chú ý giày êm và tăng quãng đường chậm.',
      obese1: 'Nên bắt đầu bằng chạy xen đi bộ trên mặt phẳng (ven biển, công viên), giày êm, tăng rất chậm để bảo vệ khớp gối. Nếu có bệnh nền, hãy hỏi bác sĩ trước khi tăng tải.',
      obese2: 'Hãy bắt đầu bằng đi bộ nhanh 2–4 tuần rồi mới chạy xen đi bộ. Nên trao đổi với bác sĩ trước khi tập nặng hơn; AIRUN sẽ lập lộ trình tăng chậm cho bạn.'
    }[b.key];
    return t + (ageOf(a) >= 55 ? ' Ở tuổi của bạn, nên khởi động kỹ hơn và kiểm tra sức khoẻ định kỳ.' : '');
  }
  function athleteContext() {
    if (!athlete) return null;
    const b = bmiOf(athlete), age = ageOf(athlete);
    return { age, sex: athlete.sex || null, height_cm: athlete.heightCm || null, weight_kg: athlete.weightKg || null, bmi: b?.bmi ?? null, bmi_class: b ? (b.minor ? 'dưới 18 tuổi – không dùng ngưỡng người lớn' : `${b.label} (ngưỡng WHO châu Á)`) : null, healthy_weight_range_kg: b?.range || null, goal: GOALS[athlete.goal] || null, level: LEVELS[athlete.level] || null, days_per_week: athlete.days || null, health_note: athlete.health || null };
  }

  function athleteForm() {
    const a = athlete || {};
    const opt = (obj, val) => Object.entries(obj).map(([k, v]) => `<option value="${k}"${String(val) === String(k) ? ' selected' : ''}>${esc(v)}</option>`).join('');
    return `<form class="card cp-form" id="athleteForm" autocomplete="off">
      <div class="cp-grid">
        <label>Năm sinh<input id="atYear" type="number" inputmode="numeric" min="1930" max="2018" placeholder="VD: 1998" value="${esc(a.birthYear || '')}"></label>
        <label>Giới tính<select id="atSex"><option value="">Không nêu</option><option value="nam"${a.sex === 'nam' ? ' selected' : ''}>Nam</option><option value="nu"${a.sex === 'nu' ? ' selected' : ''}>Nữ</option></select></label>
        <label>Chiều cao (cm)<input id="atHeight" type="number" inputmode="decimal" min="100" max="230" step="0.5" placeholder="VD: 165" value="${esc(a.heightCm || '')}" required></label>
        <label>Cân nặng (kg)<input id="atWeight" type="number" inputmode="decimal" min="25" max="250" step="0.1" placeholder="VD: 58" value="${esc(a.weightKg || '')}" required></label>
        <label>Mục tiêu<select id="atGoal">${opt(GOALS, a.goal || 'health')}</select></label>
        <label>Trình độ hiện tại<select id="atLevel">${opt(LEVELS, a.level ?? 0)}</select></label>
        <label>Số buổi chạy mỗi tuần<select id="atDays">${opt({ 3: '3 buổi', 4: '4 buổi', 5: '5 buổi' }, a.days || 3)}</select></label>
        <label>Lưu ý sức khoẻ (tuỳ chọn)<input id="atHealth" maxlength="120" placeholder="VD: hen nhẹ, từng đau gối" value="${esc(a.health || '')}"></label>
      </div>
      <p class="fb-status" id="atStatus" role="status"></p>
      <div class="cp-actions"><button class="primary" type="submit">Lưu &amp; tính BMI</button>${athlete ? '<button class="soft-btn" type="button" id="atCancel">Huỷ</button>' : ''}</div>
      <p class="cp-note">Chỉ lưu trên máy này. Khi bạn hỏi HLV, các số này được gửi kèm câu hỏi để AI tư vấn đúng người; AIRUN không ghi chúng vào bảng dữ liệu của nhóm.</p>
    </form>`;
  }
  function bmiCard() {
    const b = bmiOf(athlete), a = athlete;
    const pos = Math.max(2, Math.min(98, ((b.bmi - 15) / (35 - 15)) * 100));
    return `<article class="card cp-bmi t-${b.tone}">
      <div class="cp-bmi-top"><div><small>CHỈ SỐ BMI</small><b>${String(b.bmi).replace('.', ',')}</b><span class="cp-tag">${esc(b.label)}</span></div>
        <ul><li><small>Chiều cao</small><b>${esc(a.heightCm)} cm</b></li><li><small>Cân nặng</small><b>${esc(a.weightKg)} kg</b></li>${ageOf(a) ? `<li><small>Tuổi</small><b>${ageOf(a)}</b></li>` : ''}</ul></div>
      ${b.minor ? '' : `<div class="cp-scale" aria-hidden="true"><i style="left:${pos}%"></i><span class="z1"></span><span class="z2"></span><span class="z3"></span><span class="z4"></span></div><div class="cp-scale-lbl" aria-hidden="true"><span>18,5</span><span>23</span><span>25</span></div>
      <p class="cp-range">Cân nặng hợp với chiều cao của bạn: khoảng <b>${String(b.range[0]).replace('.', ',')}–${String(b.range[1]).replace('.', ',')} kg</b>.</p>`}
      <p class="cp-advice">${esc(bmiAdvice(b, a))}</p>
      <div class="cp-actions"><button type="button" class="primary" id="atAsk">${icon('i-sparkles')}Hỏi HLV nên tập thế nào</button><button type="button" class="soft-btn" id="atEdit">Sửa số đo</button></div>
      <p class="cp-note">BMI chỉ là chỉ số sàng lọc theo ngưỡng WHO cho người châu Á; không phản ánh tỉ lệ cơ – mỡ và không thay cho khám sức khoẻ. Số đo chỉ lưu trên máy này.</p>
    </article>`;
  }
  function renderAthlete() {
    const box = el('athleteSection'); if (!box) return;
    const head = `<div class="section-heading"><div><p class="eyebrow">THỂ TRẠNG &amp; BMI</p><h2>${athlete && !editing ? 'Thể trạng của bạn' : 'Cho HLV biết về bạn'}</h2><p class="step-lead">Vài số đo giúp HLV tư vấn tập luyện, ăn uống và lập lộ trình đúng với cơ thể bạn.</p></div></div>`;
    box.innerHTML = head + (athlete && !editing && bmiOf(athlete) ? bmiCard() : athleteForm());
    el('athleteForm')?.addEventListener('submit', saveAthlete);
    el('atCancel')?.addEventListener('click', () => { editing = false; renderAthlete(); });
    el('atEdit')?.addEventListener('click', () => { editing = true; renderAthlete(); });
    el('atAsk')?.addEventListener('click', () => askCoachBox('Dựa trên thể trạng và mục tiêu trong hồ sơ của mình, mình nên tập chạy và ăn uống thế nào trong 2 tuần tới?'));
  }
  function saveAthlete(event) {
    event.preventDefault();
    const st = el('atStatus'), year = Number(el('atYear').value) || null, h = Number(el('atHeight').value), w = Number(el('atWeight').value);
    const fail = (m) => { st.textContent = m; st.className = 'fb-status err'; };
    const thisYear = Number(vnIso().slice(0, 4));
    if (!(h >= 100 && h <= 230)) return fail('Chiều cao tính bằng cm, từ 100 đến 230 (ví dụ 165).');
    if (!(w >= 25 && w <= 250)) return fail('Cân nặng tính bằng kg, từ 25 đến 250 (ví dụ 58).');
    if (year && !(thisYear - year >= 8 && thisYear - year <= 95)) return fail('Năm sinh chưa hợp lệ (ví dụ 1998).');
    athlete = { birthYear: year, sex: el('atSex').value, heightCm: h, weightKg: w, goal: el('atGoal').value, level: Number(el('atLevel').value), days: Number(el('atDays').value), health: el('atHealth').value.trim().slice(0, 120), savedAt: Date.now() };
    localSet(A_KEY, athlete); editing = false;
    renderAthlete(); renderProgram(); renderNutrition();
    showToast('Đã lưu thể trạng trên máy này. HLV sẽ tư vấn theo số đo của bạn.');
  }
  function askCoachBox(q) {
    activateView('coach');
    el('coachForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    void sendAgent(q, { box: 'coach' });
  }

  /* ---------- 2. Lộ trình nhiều tuần (quy tắc an toàn, không phụ thuộc AI) ---------- */
  function mondayOf(ms = Date.now()) {
    const d = new Date(`${vnIso(new Date(ms)).slice(0, 10)}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  }
  function buildProgram(a, profile) {
    const age = ageOf(a), b = bmiOf(a);
    let goal = a.goal || 'health', note = '';
    const level = Number(a.level) || 0, days = [3, 4, 5].includes(Number(a.days)) ? Number(a.days) : 3;
    if (goal === 'k21' && (level === 0 || (age !== null && age < 18))) { goal = 'k10'; note = age !== null && age < 18 ? 'Dưới 18 tuổi nên hoàn thành 10 km trước; bán marathon để sau.' : 'Người mới nên hoàn thành 10 km trước rồi mới tập bán marathon, nên lộ trình này hướng tới 10 km.'; }
    const careful = (b && !b.minor && b.bmi >= 27) || (age !== null && age >= 55) || Boolean(a.health);
    const growth = careful ? 1.07 : 1.10;
    const base = [6, 12, 22][level];
    const recent = Number(profile?.km_last_28_days) > 0 ? profile.km_last_28_days / 4 : 0;
    let start = Math.max(base * 0.75, Math.min(recent || base, base * 1.6));
    if (b && !b.minor && b.bmi >= 30) start = Math.min(start, 5);
    const targetLong = { health: level ? 8 : 5, fat: level ? 8 : 6, k5: 5, k10: 10, k21: 18 }[goal];
    const peak = Math.max(start, Math.min(targetLong / 0.38, { health: 22, fat: 26, k5: 20, k10: 32, k21: 48 }[goal]));
    const minWeeks = { health: 6, fat: 8, k5: 8, k10: 10, k21: 12 }[goal];
    const race = ['k5', 'k10', 'k21'].includes(goal);
    // Số tuần cần để lên tới đỉnh với mức tăng an toàn (có tuần giảm tải), tối đa 16 tuần.
    let need = 1, v = start; while (v < peak * 0.98 && need < 16) { need++; if (need % 4 !== 0) v *= growth; }
    const total = Math.max(minWeeks, Math.min(16, need + (race ? 1 : 0)));
    const easyPace = (() => { const m = String(profile?.avg_pace || '').match(/^(\d+):(\d{1,2})$/); const p = m ? Number(m[1]) + Number(m[2]) / 60 + 0.5 : [8.5, 7.5, 6.5][level]; return Math.max(5, Math.min(10, p)); })();
    const weeks = []; let build = start;
    for (let n = 1; n <= total; n++) {
      const deload = n % 4 === 0 && n !== total, last = n === total;
      if (n > 1 && !deload && !(n - 1 > 0 && (n - 1) % 4 === 0)) build = Math.min(peak, build * growth);
      let km = deload ? build * 0.8 : build;
      if (last && race) km = build * 0.65;
      km = round(km, 1);
      const runWalk = (level === 0 || (b && !b.minor && b.bmi >= 27)) && n <= (careful ? 6 : 4);
      const rw = ['chạy 1 phút, đi bộ 2 phút', 'chạy 2 phút, đi bộ 2 phút', 'chạy 3 phút, đi bộ 90 giây', 'chạy 5 phút, đi bộ 1 phút', 'chạy 8 phút, đi bộ 1 phút', 'chạy 10 phút, đi bộ 1 phút'][Math.min(5, n - 1)];
      let long = last && race ? targetLong === 18 ? 21.1 : targetLong : Math.min(targetLong, round(km * (days === 3 ? 0.42 : 0.38), 1));
      const restKm = Math.max(1, km - long), each = last && race ? { k5: 2, k10: 3, k21: 4 }[goal] : round(restKm / (days - 1), 1);
      const quality = level >= 1 && days >= 4 && n >= 3 && !deload && !last;
      const sessions = DAY_SETS[days].map((d, i) => {
        const isLong = d === 6;
        const skm = isLong ? long : Math.max(1, each), min = Math.round(skm * (isLong ? easyPace + 0.2 : easyPace) / 5) * 5 || 10;
        let type = isLong ? (last && race ? `Chạy mục tiêu ${GOALS[goal].replace('Hoàn thành ', '').replace('Bán marathon ', '')}` : 'Chạy dài, chậm') : 'Chạy nhẹ';
        let how = runWalk ? `Lặp lại: ${rw}.` : isLong ? 'Chậm hơn chạy nhẹ một chút, mang nước.' : 'Tốc độ vừa nói chuyện được.';
        let intensity = 'Nhẹ';
        if (quality && i === 1) { type = n % 2 ? 'Biến tốc nhẹ' : 'Chạy đều (tempo)'; how = n % 2 ? 'Khởi động 10 phút, 6 lần × 1 phút nhanh + 2 phút chậm, thả lỏng 10 phút.' : 'Khởi động 10 phút, 15–20 phút hơi gắng (vẫn nói được câu ngắn), thả lỏng.'; intensity = 'Vừa'; }
        if (deload && !isLong) how = 'Tuần giảm tải: chạy thật nhẹ để cơ thể hồi phục.';
        return { day: d, type, km: round(skm, 1), min, how, intensity, long: isLong };
      });
      weeks.push({ n, km: round(sessions.reduce((s, x) => s + x.km, 0), 1), long: sessions.find((x) => x.long)?.km || 0, deload, last: last && race, sessions });
    }
    return { v: 1, goal, goalLabel: GOALS[goal], level, days, weeksCount: total, growthPct: Math.round((growth - 1) * 100), startMonday: mondayOf(), createdAt: Date.now(), easyPace: formatPace(easyPace), note, careful, weeks, ai: null };
  }
  const weekIndex = (p) => Math.max(0, Math.min(p.weeks.length - 1, Math.floor((new Date(`${mondayOf()}T00:00:00Z`) - new Date(`${p.startMonday}T00:00:00Z`)) / (7 * 864e5))));
  function weekDoneKm(p, idx) {
    const from = new Date(`${p.startMonday}T00:00:00+07:00`).getTime() + idx * 7 * 864e5, to = from + 7 * 864e5;
    return round(journalRows().filter((r) => r.type === 'run').reduce((s, r) => { const t = new Date(r.at).getTime(); return t >= from && t < to ? s + (Number(r.distance) || 0) : s; }, 0), 1);
  }
  function programContext() {
    if (!program) return null;
    const i = weekIndex(program), w = program.weeks[i];
    return { goal: program.goalLabel, total_weeks: program.weeksCount, current_week: i + 1, sessions_per_week: program.days, weekly_increase_pct: program.growthPct, easy_pace_min_per_km: program.easyPace, weekly_km: program.weeks.map((x) => x.km), long_run_km: program.weeks.map((x) => x.long), this_week: { target_km: w.km, done_km: weekDoneKm(program, i), deload: w.deload, sessions: w.sessions.map((s) => ({ day: DAY_NAMES[s.day], type: s.type, km: s.km, minutes: s.min })) } };
  }

  function sessionRow(s, i, today) {
    return `<div class="wk${s.day === today ? ' today' : ''}"><div class="wk-day"><b>${DAY_NAMES[s.day]}</b><small>${s.day === today ? 'Hôm nay' : ''}</small></div><div class="wk-main"><b>${esc(s.type)}</b><span>${String(s.km).replace('.', ',')} km · khoảng ${s.min} phút</span><small>${esc(s.how)}</small></div><button type="button" class="chip-btn" data-use="${i}">Dùng buổi này</button></div>`;
  }
  function renderProgram() {
    const box = el('programSection'); if (!box) return;
    const head = (lead) => `<div class="section-heading"><div><p class="eyebrow">LỘ TRÌNH CHẠY</p><h2>${program ? esc(program.goalLabel) : 'Lộ trình chạy hợp với bạn'}</h2><p class="step-lead">${lead}</p></div></div>`;
    if (!athlete) { box.innerHTML = head('Nhập thể trạng và mục tiêu ở trên, AIRUN lập lộ trình tăng dần an toàn cho bạn.') + `<a class="next-step slim" href="#athleteSection" data-jump><span class="ns-ic">${icon('i-flag')}</span><span class="ns-body"><small>BƯỚC ĐẦU</small><b>Điền thể trạng &amp; mục tiêu</b><em>Mất khoảng 30 giây.</em></span>${icon('i-arrow-right')}</a>`; return; }
    if (!program) {
      const lv = LEVELS[athlete.level] || LEVELS[0];
      box.innerHTML = head(`Mục tiêu: ${esc(GOALS[athlete.goal] || GOALS.health)} · ${esc(lv)} · ${athlete.days || 3} buổi/tuần.`) + `<article class="card cp-empty"><p>AIRUN lập lộ trình theo quy tắc an toàn của huấn luyện chạy bộ: mỗi tuần tăng không quá 10% quãng đường, cứ 4 tuần có một tuần giảm tải, luôn có ngày nghỉ. Sau đó HLV AI nhận xét và gợi ý ăn uống, phục hồi.</p><div class="cp-actions"><button type="button" class="primary" id="pgCreate">${icon('i-flag')}Lập lộ trình cho tôi</button><button type="button" class="soft-btn" id="pgEditGoal">Đổi mục tiêu</button></div></article>`;
      el('pgCreate')?.addEventListener('click', createProgram);
      el('pgEditGoal')?.addEventListener('click', () => { editing = true; renderAthlete(); el('athleteSection')?.scrollIntoView({ behavior: 'smooth' }); });
      return;
    }
    const p = program, i = weekIndex(p), w = p.weeks[i], done = weekDoneKm(p, i), pct = Math.min(100, Math.round(done / Math.max(0.1, w.km) * 100));
    const today = (new Date(`${vnIso().slice(0, 10)}T00:00:00Z`).getUTCDay() + 6) % 7, maxKm = Math.max(...p.weeks.map((x) => x.km));
    const bars = p.weeks.map((x, k) => `<span class="${k === i ? 'now' : k < i ? 'past' : ''}${x.deload ? ' deload' : ''}" title="Tuần ${x.n}: ${x.km} km"><i style="height:${Math.max(12, Math.round(x.km / maxKm * 100))}%"></i><em>${x.n}</em></span>`).join('');
    const ai = p.ai, list = (items) => (Array.isArray(items) ? items : []).slice(0, 4).map((x) => `<li>${esc(x)}</li>`).join('');
    box.innerHTML = head(`${p.weeksCount} tuần · ${p.days} buổi/tuần · tăng tối đa ${p.growthPct}%/tuần · chạy nhẹ quanh pace ${esc(p.easyPace)}/km.`) + `
      <article class="card cp-program">
        ${p.note ? `<p class="cp-flag">${esc(p.note)}</p>` : ''}
        <div class="cp-weeks" role="img" aria-label="Quãng đường mỗi tuần của lộ trình">${bars}</div>
        <div class="cp-week-head"><div><small>TUẦN ${w.n}/${p.weeksCount}${w.deload ? ' · GIẢM TẢI' : w.last ? ' · TUẦN MỤC TIÊU' : ''}</small><b>${String(w.km).replace('.', ',')} km</b></div><div class="cp-progress"><span><i style="width:${pct}%"></i></span><small>Đã chạy ${String(done).replace('.', ',')} km (${pct}%)</small></div></div>
        <div class="weekly-list">${w.sessions.map((s, k) => sessionRow(s, k, today)).join('')}</div>
        <details class="fold cp-all"><summary><span><b>Xem tất cả ${p.weeksCount} tuần</b><small>Tổng km và buổi dài từng tuần</small></span>${icon('i-chevron-down')}</summary><ol class="cp-all-list">${p.weeks.map((x, k) => `<li class="${k === i ? 'now' : ''}"><b>Tuần ${x.n}</b><span>${String(x.km).replace('.', ',')} km · buổi dài ${String(x.long).replace('.', ',')} km${x.deload ? ' · giảm tải' : ''}${x.last ? ' · tuần mục tiêu' : ''}</span></li>`).join('')}</ol></details>
        <div class="cp-ai" id="pgAi">${ai ? `<p class="eyebrow">HLV AI NHẬN XÉT</p><h3>${esc(ai.headline || '')}</h3><p>${esc(ai.summary || '')}</p>${ai.focus?.length ? `<small>TRỌNG TÂM</small><ul>${list(ai.focus)}</ul>` : ''}${ai.nutrition?.length ? `<small>ĂN UỐNG</small><ul>${list(ai.nutrition)}</ul>` : ''}${ai.recovery?.length ? `<small>PHỤC HỒI</small><ul>${list(ai.recovery)}</ul>` : ''}${ai.caution ? `<p class="cp-flag">${esc(ai.caution)}</p>` : ''}` : ''}</div>
        <div class="cp-actions"><button type="button" class="soft-btn" id="pgAiBtn">${icon('i-sparkles')}${ai ? 'HLV nhận xét lại' : 'HLV nhận xét lộ trình'}</button><button type="button" class="soft-btn" id="pgRedo">Lập lại</button><button type="button" class="link-danger" id="pgDelete">Xoá lộ trình</button></div>
        <p class="cp-note">Lộ trình là khuyến nghị chung, không thay cho tư vấn y tế. Đau kéo dài, choáng hoặc tức ngực thì dừng tập và đi khám.</p>
      </article>`;
    box.querySelectorAll('[data-use]').forEach((btn) => btn.addEventListener('click', () => {
      const s = w.sessions[Number(btn.dataset.use)];
      void runAgentAction({ type: 'set_plan', time: null, duration_min: Math.max(10, Math.min(240, s.min)), intensity: s.intensity, area: null });
    }));
    el('pgAiBtn')?.addEventListener('click', () => void programNotes(true));
    el('pgRedo')?.addEventListener('click', createProgram);
    el('pgDelete')?.addEventListener('click', () => { program = null; try { localStorage.removeItem(P_KEY); } catch {} renderProgram(); showToast('Đã xoá lộ trình trên máy này.'); });
  }
  function createProgram() {
    program = buildProgram(athlete, typeof currentProfile === 'function' ? currentProfile() : null);
    localSet(P_KEY, program); renderProgram();
    el('programSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Đã lập lộ trình ${program.weeksCount} tuần.`);
    void programNotes(false);
  }
  async function programNotes(manual) {
    if (!program) return;
    const box = el('pgAi'), btn = el('pgAiBtn');
    if (!SERVER_CFG.ai) { if (manual) showToast('Máy chủ chưa bật AI nên chưa có nhận xét của HLV. Lộ trình vẫn dùng được.'); return; }
    if (btn) setBusy(btn, true, 'HLV đang đọc lộ trình…');
    try {
      const data = await postCoach('program', coachContext());
      const r = data.result || {};
      program.ai = { headline: String(r.headline || '').slice(0, 120), summary: String(r.summary || '').slice(0, 600), focus: (r.focus || []).map(String).slice(0, 4), nutrition: (r.nutrition || []).map(String).slice(0, 4), recovery: (r.recovery || []).map(String).slice(0, 3), caution: String(r.caution || '').slice(0, 300) };
      localSet(P_KEY, program); renderProgram();
    } catch (error) {
      if (btn) setBusy(btn, false);
      if (manual && box) box.innerHTML = `<p class="fb-status err">HLV chưa nhận xét được: ${esc(error.message)}</p>`;
    }
  }

  /* ---------- 3. Dinh dưỡng – nước uống cho buổi chạy đang lên kế hoạch ---------- */
  function renderNutrition() {
    const box = el('nutritionSection'); if (!box) return;
    const plan = currentPlan(), est = planEstimate(plan), hour = Number(String(plan.time || '17').slice(0, 2));
    const feels = typeof activeSnapshot !== 'undefined' && activeSnapshot && hasNum(activeSnapshot.feels) ? Number(activeSnapshot.feels) : null;
    const hot = feels !== null && feels >= 33, min = Number(plan.duration) || 30;
    const b = bmiOf(athlete), minor = Boolean(b?.minor), w = athlete?.weightKg;
    const before = hour < 8 ? 'Chạy sáng sớm: ăn nhẹ 20–40 phút trước (1 quả chuối, lát bánh mì hoặc ít xôi) và uống 200–300 ml nước. Chạy dưới 40 phút mà quen bụng rỗng thì chỉ cần uống nước.'
      : hour < 15 ? 'Ăn bữa chính trước 2–3 giờ (cơm/bún/phở vừa phải, ít dầu mỡ). Nếu đói sát giờ chạy, ăn 1 quả chuối hoặc hộp sữa chua 30–45 phút trước.'
      : 'Bữa trưa đủ tinh bột; trước khi chạy 45–60 phút ăn nhẹ (chuối, bánh mì, sữa đậu nành) và uống 300 ml nước. Tránh đồ chiên, cay sát giờ chạy.';
    const during = min <= 30 ? `Buổi ${min} phút: không cần ăn; uống vài ngụm nước nếu khát${hot ? ' (trời nóng nên mang chai nhỏ 300 ml)' : ''}.`
      : min <= 60 ? `Buổi ${min} phút: mang ${hot ? '500–600' : '300–500'} ml nước, uống từng ngụm mỗi 15–20 phút.`
      : `Buổi ${min} phút: uống ${hot ? '600–800' : '500–700'} ml mỗi giờ, thêm điện giải (oresol pha đúng hướng dẫn hoặc nước dừa) và khoảng 30 g tinh bột mỗi giờ sau 60 phút đầu (1 quả chuối hoặc 1 gel).`;
    const after = 'Trong 30–60 phút sau chạy: tinh bột + đạm, ví dụ phở/bún bò, cơm gà, bánh mì trứng, hoặc sữa đậu nành + chuối. Uống bù nước dần trong 2 giờ; nước tiểu vàng nhạt là đủ.';
    const daily = minor ? 'Tuổi đang lớn: ăn đủ 3 bữa chính và bữa phụ, có sữa, trứng, cá, rau quả mỗi ngày; không bỏ bữa, không ăn kiêng để giảm cân.'
      : w ? `Với ${String(w).replace('.', ',')} kg: mỗi ngày khoảng ${Math.round(w * 1.2)}–${Math.round(w * 1.6)} g đạm (thịt nạc, cá, trứng, đậu phụ) và ${String(round(w * 0.03, 1)).replace('.', ',')}–${String(round(w * 0.035, 1)).replace('.', ',')} lít nước, chưa tính lượng uống thêm khi chạy.`
      : 'Mỗi bữa có tinh bột (cơm, bún, khoai), đạm (cá, trứng, đậu phụ, thịt nạc) và rau; uống nước đều trong ngày. Nhập cân nặng ở phần Thể trạng để có con số riêng cho bạn.';
    const goalNote = !minor && athlete?.goal === 'fat' ? '<p class="cp-flag">Muốn giảm mỡ: đừng nhịn ăn trước buổi chạy. Giảm chậm, không quá 0,5 kg mỗi tuần, bằng cách bớt đồ ngọt, nước có đường và đồ chiên; vẫn ăn đủ sau khi chạy để hồi phục.</p>' : '';
    const item = (ic, t, d) => `<li><span class="cat-ic">${icon(ic)}</span><div><b>${t}</b><p>${esc(d)}</p></div></li>`;
    box.innerHTML = `<div class="section-heading"><div><p class="eyebrow">DINH DƯỠNG</p><h2>Ăn uống cho buổi chạy ${esc(plan.time)}</h2><p class="step-lead">Theo kế hoạch ${min} phút · ${est.distance.toFixed(1)} km${feels !== null ? ` · cảm giác ${round(feels)}°C` : ''}.</p></div></div>
      <article class="card cp-nutri"><ul>${item('i-utensils', 'Trước khi chạy', before)}${item('i-droplets', 'Trong lúc chạy', during)}${item('i-heart-pulse', 'Sau khi chạy', after)}${item('i-calendar-clock', 'Hằng ngày', daily)}</ul>${goalNote}
        <div class="coach-suggest cp-ask"><button type="button" data-ask="Gợi ý giúp mình thực đơn một ngày có buổi chạy theo kế hoạch hiện tại, dùng món Việt dễ mua ở Đà Nẵng.">Thực đơn cho ngày chạy</button><button type="button" data-ask="Mình hay bị xóc hông và đầy bụng khi chạy, nên ăn uống và hít thở thế nào?">Hay bị xóc hông</button><button type="button" data-ask="Chạy trời nóng ẩm Đà Nẵng thì bù nước và điện giải thế nào cho đúng?">Bù nước khi trời nóng</button></div>
        <p class="cp-note">Hướng dẫn chung cho người khoẻ mạnh, không thay cho tư vấn của bác sĩ hay chuyên gia dinh dưỡng. Có bệnh nền (tiểu đường, thận, tim mạch) hãy hỏi bác sĩ trước.</p>
      </article>`;
    box.querySelectorAll('[data-ask]').forEach((btn) => btn.addEventListener('click', () => askCoachBox(btn.dataset.ask)));
  }

  /* ---------- Kết nối với AI Coach ---------- */
  window.__airunCoachExtra = () => { const a = athleteContext(), p = programContext(); return { ...(a ? { athlete: a } : {}), ...(p ? { program: p } : {}) }; };
  window.__airunCoachPro = { bmiOf, buildProgram, get athlete() { return athlete; }, get program() { return program; } };

  document.addEventListener('click', (event) => {
    const a = event.target.closest?.('a[data-jump],a.next-step[href^="#"]:not([href^="#/"])');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' }); // app.js tự mở đúng tab trước khi cuộn
  });
  let nutriTimer = null;
  document.addEventListener('airun:update', () => { clearTimeout(nutriTimer); nutriTimer = setTimeout(() => { if (document.body.dataset.view === 'coach') renderNutrition(); }, 400); });
  document.addEventListener('airun:view', (e) => { if (e.detail?.view === 'coach') { renderProgram(); renderNutrition(); } });
  renderAthlete(); renderProgram(); renderNutrition();
})();
