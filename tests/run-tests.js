'use strict';
// Kiểm thử nhanh không cần thư viện: node tests/run-tests.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { cleanFeedback, parseJSONLoose } = require('../server.js');

// 1) Lấy script chính trong index.html và chạy trong sandbox (không có DOM).
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const code = html.match(/<script id="airun-inline-app">([\s\S]*?)<\/script>/)[1];
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
process.exit(0);
