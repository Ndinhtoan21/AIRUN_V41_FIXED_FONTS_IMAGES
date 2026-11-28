'use strict';
// V10 · Chặng 2 — Kiểm tra "dữ liệu thật và an toàn truy cập". Chạy: node tests/security-check.js
// 1) Không có khoá bí mật trong mã gửi xuống trình duyệt (index.html, js/, css/, assets/, manifest).
// 2) /api/config không trả khoá nào, kể cả khi máy chủ có đủ khoá Google/Mapbox/OpenAI.
// 3) Lớp chặn cuối cùng xoá giá trị bí mật nếu lỡ lọt vào phản hồi.
// 4) Dữ liệu thời tiết/không khí có nguồn + thời điểm (_meta) và toạ độ gửi Open-Meteo đã làm tròn ~1 km.
// 5) Trình duyệt không còn số minh hoạ: khi chưa có dữ liệu thật, mọi chỉ số là null.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const results = [];
const ok = (name, detail = '') => { results.push(['ĐẠT', name, detail]); };

// ---------- 1) Quét mã phía trình duyệt ----------
// Vercel phục vụ cả thư mục dự án như tệp tĩnh, nên quét toàn bộ kho (trừ .git, node_modules), không chỉ js/css.
const PUBLIC = [];
for (const dir of ['.']) {
  (function walk(d) { for (const f of fs.readdirSync(path.join(ROOT, d))) { if (f === '.git' || f === 'node_modules') continue; const p = path.join(d, f); const st = fs.statSync(path.join(ROOT, p)); if (st.isDirectory()) walk(p); else if (/\.(js|css|html|json|webmanifest|svg|txt|md|gs|yaml|yml)$/i.test(f)) PUBLIC.push(p); } })(dir);
}
const PATTERNS = [
  ['Khoá Google (AIza…)', /AIza[0-9A-Za-z_-]{20,}/],
  ['Khoá OpenAI (sk-…)', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}/],
  ['Token Mapbox (pk.eyJ…)', /\bpk\.eyJ[A-Za-z0-9._-]{20,}/],
  ['Token GitHub', /\bgh[pousr]_[A-Za-z0-9]{30,}/],
  ['Địa chỉ Apps Script của Google Sheet', /script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}/],
  ['Khoá GraphHopper dán thẳng', /graphhopper\.com[^"'`\s]*key=[A-Za-z0-9-]{10,}/i],
  
  ['Khoá trong URL (key=…)', /[?&](?:key|api_key|access_token)=[A-Za-z0-9_-]{16,}/]
];
const hits = [];
for (const f of PUBLIC) { const text = fs.readFileSync(path.join(ROOT, f), 'utf8'); for (const [name, re] of PATTERNS) { const m = text.match(re); if (m) hits.push(`${f}: ${name} → ${m[0].slice(0, 12)}…`); } }
assert.deepStrictEqual(hits, [], 'Phát hiện thông tin bí mật trong mã trình duyệt:\n' + hits.join('\n'));
ok('Toàn bộ kho mã (mọi tệp Vercel phục vụ) không chứa khoá bí mật', `${PUBLIC.length} tệp đã quét, ${PATTERNS.length} mẫu khoá`);
// Riêng mã chạy trên trình duyệt: không được đọc biến môi trường máy chủ.
for (const f of PUBLIC.filter((x) => /^(js|css)\/|index\.html$/.test(x.replace(/\\/g, '/')))) assert.ok(!/process\.env\./.test(fs.readFileSync(path.join(ROOT, f), 'utf8')), `${f} đọc biến môi trường máy chủ`);

// ---------- 2–4) Chạy máy chủ với khoá giả và nguồn Open-Meteo giả ----------
const FAKE = {
  // Khoá giả được ghép lúc chạy để chính tệp kiểm thử không chứa chuỗi giống khoá thật.
  OPENAI_API_KEY: ['sk', 'test', 'FAKEOPENAIKEY1234567890'].join('-'),
  GOOGLE_MAPS_BROWSER_KEY: 'AI' + 'za' + 'FAKEBROWSERKEY12345678901234567',
  GOOGLE_MAPS_SERVER_KEY: 'AI' + 'za' + 'FAKESERVERKEY123456789012345678',
  MAPBOX_PUBLIC_TOKEN: 'pk.' + 'eyJ1IjoiZmFrZSIsImEiOiJmYWtlIn0.FAKE',
  GRAPHHOPPER_API_KEY: 'gh-fake-key-1234567890',
  SHEETS_SECRET: 'sheets-fake-secret-123456',
  GOOGLE_MAPS_BASEMAP: '1'
};
const seen = [];
const upstream = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); seen.push({ lat: u.searchParams.get('latitude'), lon: u.searchParams.get('longitude') });
  const air = u.pathname.includes('air');
  const body = air
    ? { current: { time: '2026-11-28T09:00', interval: 3600, us_aqi: 42, pm2_5: 9.1, pm10: 14, uv_index: 3 }, hourly: { time: [], us_aqi: [] } }
    : { current: { time: '2026-11-28T09:15', interval: 900, temperature_2m: 26.4, apparent_temperature: 28.9, relative_humidity_2m: 78, precipitation: 0, weather_code: 2, wind_speed_10m: 9 }, hourly: { time: [] } };
  res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body));
});

(async () => {
  await new Promise((r) => upstream.listen(0, r));
  const base = `http://127.0.0.1:${upstream.address().port}`;
  Object.assign(process.env, FAKE, { WEATHER_BASE: `${base}/forecast`, AIR_BASE: `${base}/air`, PORT: '0', AIRUN_NO_LISTEN: '1' });
  const srv = require('../server.js');
  const app = http.createServer(srv.handler); await new Promise((r) => app.listen(0, r));
  const get = (p) => new Promise((resolve, reject) => http.get(`http://127.0.0.1:${app.address().port}${p}`, (res) => { let t = ''; res.on('data', (c) => (t += c)); res.on('end', () => resolve({ status: res.statusCode, text: t })); }).on('error', reject));

  const cfg = await get('/api/config');
  for (const [k, v] of Object.entries(FAKE)) if (v.length > 4) assert.ok(!cfg.text.includes(v), `/api/config làm lộ ${k}`);
  assert.ok(!/mapboxToken|googleMapsKey/.test(cfg.text), '/api/config vẫn còn trường khoá bản đồ');
  assert.strictEqual(JSON.parse(cfg.text).secretsInBrowser, false);
  ok('/api/config không trả khoá nào', 'đã thử với đủ khoá Google, Mapbox, OpenAI, GraphHopper, Sheets');

  const scrubbed = srv.scrubSecrets(`lỗi gọi https://maps.googleapis.com/x?key=${FAKE.GOOGLE_MAPS_SERVER_KEY} và ${FAKE.OPENAI_API_KEY}`);
  assert.ok(!scrubbed.includes(FAKE.GOOGLE_MAPS_SERVER_KEY) && !scrubbed.includes(FAKE.OPENAI_API_KEY), 'scrubSecrets chưa xoá khoá');
  ok('Lớp chặn cuối xoá khoá nếu lỡ lọt vào thông báo lỗi', scrubbed);

  const w = await get('/api/weather/16.060312/108.220845');
  const wj = JSON.parse(w.text);
  assert.strictEqual(w.status, 200);
  assert.ok(wj._meta && wj._meta.real === true && wj._meta.source === 'Open-Meteo Forecast API', 'thiếu nguồn dữ liệu');
  assert.strictEqual(wj._meta.observedAt, '2026-11-28T09:15:00+07:00');
  assert.ok(!Number.isNaN(Date.parse(wj._meta.fetchedAt)), 'thiếu thời điểm máy chủ lấy dữ liệu');
  const a = JSON.parse((await get('/api/air/16.060312/108.220845')).text);
  assert.strictEqual(a._meta.source, 'Open-Meteo Air Quality API');
  const again = JSON.parse((await get('/api/weather/16.0601/108.2209')).text);
  assert.strictEqual(again._meta.cached, true, 'lần gọi thứ hai cùng ô ~1 km phải dùng bản lưu tạm');
  ok('Dữ liệu môi trường có nguồn và thời điểm', `thời tiết: số liệu lúc ${wj._meta.observedAt}, máy chủ lấy lúc ${wj._meta.fetchedAt}; không khí: ${a._meta.observedAt}; lần 2 cached=${again._meta.cached}`);

  for (const s of seen) { assert.ok(/^\d+\.\d{2}$/.test(String(Number(s.lat).toFixed(2))) && Number(s.lat) === Math.round(Number(s.lat) * 100) / 100, `toạ độ gửi Open-Meteo chưa làm tròn: ${s.lat}`); assert.ok(Number(s.lon) === Math.round(Number(s.lon) * 100) / 100); }
  ok('Toạ độ gửi Open-Meteo đã làm tròn ~1 km', seen.map((s) => `${s.lat},${s.lon}`).join(' | ') + ' (vị trí thật 16.060312,108.220845)');

  // ---------- 5) Trình duyệt không còn số minh hoạ ----------
  const code = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
  assert.ok(!/mock:\[/.test(code), 'js/app.js vẫn còn mảng số minh hoạ');
  const sb = { module: { exports: {} }, console, Intl, Date, Math, Number, JSON, setTimeout, clearTimeout, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
  vm.createContext(sb); vm.runInContext(code, sb);
  const fb = sb.module.exports.fallbackData(sb.module.exports.WARDS[0]);
  assert.ok(Object.values(fb.current).every((v) => v === null), 'dữ liệu dự phòng vẫn có số');
  const pv = sb.module.exports.dataProvenance(fb);
  assert.strictEqual(pv.state, 'none');
  const live = { source: 'live', current: {}, updated: Date.now(), liveParts: { weather: true, air: true }, meta: { weather: wj._meta, air: a._meta } };
  const pl = sb.module.exports.dataProvenance(live, Date.parse('2026-11-28T09:20:00+07:00'));
  assert.ok(/Open-Meteo/.test(pl.line) && /09:15/.test(pl.line), `nhãn nguồn chưa đúng: ${pl.line}`);
  ok('Không có số minh hoạ; nhãn nguồn hiển thị đúng', `chưa có dữ liệu → "${pv.badge}"; có dữ liệu → "${pl.line}"`);

  console.log('\n| Kết quả | Kiểm tra | Chi tiết |\n|---|---|---|');
  for (const [r, n, d] of results) console.log(`| ${r} | ${n} | ${String(d).replace(/\|/g, '/')} |`);
  console.log(`\n✓ V10 security/data checks passed (${results.length}/${results.length})`);
  app.close(); upstream.close(); process.exit(0);
})().catch((e) => { console.error('✗', e.message); process.exit(1); });
