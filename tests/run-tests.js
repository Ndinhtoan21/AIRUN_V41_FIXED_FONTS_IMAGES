'use strict';
// Kiểm thử nhanh không cần thư viện: node tests/run-tests.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { cleanFeedback, parseJSONLoose } = require('../server.js');

// 1) Lấy script chính (js/app.js) và chạy trong sandbox (không có DOM).
const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const sandbox = { module: { exports: {} }, console, Intl, Date, Math, Number, JSON, setTimeout, clearTimeout, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
vm.createContext(sandbox); vm.runInContext(code, sandbox);
const app = sandbox.module.exports;
const plan = { intensity: 'Nhẹ', duration: 30, sensitive: false, time: '17:30' };

// Người dùng mới (localStorage trống) không được làm hỏng điểm.
const mild = app.analyzeSnapshot({ aqi: 40, pm: 8, feels: 28, wind: 8, rain: 10, uv: 2 }, plan, { personal: false });
assert.ok(mild.score >= 9, 'điều kiện tốt phải ≥ 9 điểm');

// Nóng 33°C kiểu Đà Nẵng: vẫn "có thể chạy" với chạy nhẹ (BTC: V7 quá khắt khe).
const warm = app.analyzeSnapshot({ aqi: 60, pm: 18, feels: 33, wind: 8, rain: 10, uv: 3 }, plan, { personal: false });
assert.ok(warm.score >= 7.5, `33°C chạy nhẹ nên ≥ 7.5, nhận ${warm.score}`);

// Rất nóng hoặc AQI xấu vẫn phải cảnh báo.
const hot = app.analyzeSnapshot({ aqi: 60, pm: 18, feels: 41, wind: 8, rain: 10, uv: 8 }, plan, { personal: false });
assert.strictEqual(hot.tone, 'bad');
const smog = app.analyzeSnapshot({ aqi: 170, pm: 60, feels: 28, wind: 5, rain: 0, uv: 1 }, plan, { personal: false });
assert.strictEqual(smog.tone, 'bad');

// Thiếu AQI: không được coi là "AQI tốt".
const noAir = app.analyzeSnapshot({ aqi: null, pm: null, feels: 29, wind: 8, rain: 10, uv: 2 }, plan, { personal: false });
assert.ok(noAir.reasons.some(r => r.includes('Chưa lấy được AQI')));

// 2) Máy chủ: làm sạch phản hồi + đọc JSON lỏng từ AI.
const fb = cleanFeedback({ verdict: 'qua_khat_khe', heat: 9, note: 'x'.repeat(900), conditions: { feels: 36.4 } });
assert.strictEqual(fb.verdict, 'qua_khat_khe'); assert.strictEqual(fb.heat, 5); assert.strictEqual(fb.note.length, 400);
assert.strictEqual(cleanFeedback({ verdict: 'hack' }).verdict, null);
assert.deepStrictEqual(parseJSONLoose('```json\n{"a":1}\n```'), { a: 1 });

console.log('✓ AIRUN tests passed', { mild: mild.score, warm: warm.score, hot: hot.score, smog: smog.score });

// V9.6: bảng xếp hạng chỉ tính buổi chạy GPS hợp lý, người ẩn tên không hiện trên bảng.
{
  const assert = require('assert');
  const s = require('../server.js');
  const now = Date.now(), range = s.periodRange('week');
  assert.ok(range.from <= now && now < range.to, 'tuần hiện tại phải chứa thời điểm này');
  assert.ok(s.validRun({ id: 'a', km: 5, giay: 1800, nguon: 'gps' }));
  assert.ok(!s.validRun({ id: 'a', km: 20, giay: 1200, nguon: 'gps' }), 'đi xe (1:00/km) không được tính');
  assert.ok(!s.validRun({ id: 'a', km: 5, giay: 1800, nguon: 'manual' }), 'nhập tay không được tính');
  const runs = [{ id: 'a', ten: 'An', km: 5, giay: 1800, area: 'Hải Châu', at: now - 1000, nguon: 'gps' }, { id: 'b', ten: 'Bình', km: 9, giay: 3200, area: 'Sơn Trà', at: now - 1000, nguon: 'gps-an' }];
  const b = s.buildBoard(runs, range, '', 'b');
  assert.strictEqual(b.board.length, 1); assert.strictEqual(b.board[0].ten, 'An'); assert.strictEqual(b.me.hidden, true); assert.strictEqual(b.totals.km, 14);
  assert.deepStrictEqual(s.cleanLookup({ type: 'weather', place: 'Hội An' }), { type: 'weather', place: 'Hội An' });
  assert.strictEqual(s.cleanLookup({ type: 'shell', cmd: 'x' }), null);
  console.log('✓ V9.6 community/lookup tests passed');
}

// V9.7: sự kiện, ảnh, bản tin theo quy tắc.
{
  const assert = require('assert');
  const s = require('../server.js');
  assert.strictEqual(s.cleanImage('https://drive.google.com/file/d/1AbCdEfGhIjKlMn/view?usp=sharing'), 'https://drive.google.com/thumbnail?id=1AbCdEfGhIjKlMn&sz=w1200');
  assert.strictEqual(s.cleanImage('javascript:alert(1)'), null);
  assert.strictEqual(s.cleanImage('http://x.com/a.jpg'), null);
  const day = new Date(Date.now() + 7 * 3600e3), iso = (d) => new Date(day.getTime() + d * 864e5).toISOString().slice(0, 10);
  const data = { events: [
    { id: 'e_1', date: iso(2), time: '05:00', title: 'A', slots: 2, people: [{ id: 'u1', ten: 'An' }, { id: 'u2', ten: 'Bình' }] },
    { id: 'e_0', date: iso(-1), time: '05:00', title: 'Đã qua', slots: 0, people: [] },
    { id: 'e_2', date: iso(1), time: '06:00', title: 'B', slots: 0, people: [] }] };
  const up = s.upcomingEvents(data, 'u1');
  assert.deepStrictEqual(up.map((e) => e.id), ['e_2', 'e_1'], 'bỏ sự kiện đã qua, xếp theo ngày');
  assert.ok(up[1].joined && up[1].full && up[1].count === 2);
  const d = s.ruleDaily({ areas: [{ name: 'Hải Châu', temp_c: 27, temp_max_c: 31, temp_min_c: 24, rain_prob_max: 20, us_aqi: 60, coolest_run: { time: '05:00', feels_c: 26 } }], community: null });
  assert.ok(d.headline && d.summary.includes('24°C') && d.highlights.length >= 2);
  console.log('✓ V9.7 bulletin/events tests passed');
}

process.exit(0);
