'use strict';
/*
 * AIRUN V8 server — Node 18+ (không cần thư viện ngoài).
 * - Phục vụ index.html + assets.
 * - Proxy Open-Meteo Weather/Air (có dự báo theo giờ cho AQI, PM2.5, UV).
 * - Giữ khóa dịch vụ trên máy chủ: OPENAI_API_KEY, GRAPHHOPPER_API_KEY (biến môi trường Render).
 * - /api/coach: AI Coach đọc đúng số liệu đang hiển thị và trả lời bằng tiếng Việt.
 * - /api/feedback: nhận phản hồi sau buổi chạy để nhóm phát hiện chỗ chấm điểm chưa đúng.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 10000;
const ROOT = __dirname;
const VERSION = '8.0.0';
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim();
const OPENAI_MODEL = (process.env.OPENAI_MODEL || 'gpt-4.1-mini').trim();
const OPENAI_FALLBACK_MODEL = (process.env.OPENAI_FALLBACK_MODEL || 'gpt-4o-mini').trim();
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const GRAPHHOPPER_API_KEY = (process.env.GRAPHHOPPER_API_KEY || '').trim();
const MAPBOX_PUBLIC_TOKEN = (process.env.MAPBOX_PUBLIC_TOKEN || '').trim();
const FEEDBACK_WEBHOOK_URL = (process.env.FEEDBACK_WEBHOOK_URL || '').trim();
const ADMIN_TOKEN = (process.env.ADMIN_TOKEN || '').trim();
const WEATHER_BASE = (process.env.WEATHER_BASE || 'https://api.open-meteo.com/v1/forecast');
const AIR_BASE = (process.env.AIR_BASE || 'https://air-quality-api.open-meteo.com/v1/air-quality');
const FEEDBACK_FILE = path.join(process.env.DATA_DIR || (process.env.VERCEL ? '/tmp' : path.join(ROOT, 'data')), 'feedback.jsonl');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8'
};
const PUBLIC_FILES = new Set(['/index.html', '/manifest.webmanifest', '/robots.txt']);

/* ---------- tiện ích ---------- */
function send(res, status, body, headers = {}) {
  const isBuffer = Buffer.isBuffer(body);
  const payload = isBuffer || typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': isBuffer || typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...headers
  });
  res.end(payload);
}
const json = (res, status, data, headers = {}) => send(res, status, data, { 'Cache-Control': 'no-store', ...headers });

function readBody(req, limit = 48 * 1024) {
  // Vercel (serverless) có thể đã đọc sẵn body vào req.body.
  if (process.env.VERCEL && req.body !== undefined && req.body !== null) {
    const b = req.body;
    if (typeof b === 'object' && !Buffer.isBuffer(b)) return Promise.resolve(b);
    const text = Buffer.isBuffer(b) ? b.toString('utf8') : String(b);
    if (text.length > limit) return Promise.reject(Object.assign(new Error('BODY_TOO_LARGE'), { status: 413 }));
    try { return Promise.resolve(text ? JSON.parse(text) : {}); } catch { return Promise.reject(Object.assign(new Error('INVALID_JSON'), { status: 400 })); }
  }
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > limit) { reject(Object.assign(new Error('BODY_TOO_LARGE'), { status: 413 })); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); }
      catch { reject(Object.assign(new Error('INVALID_JSON'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

async function fetchWithTimeout(url, options = {}, timeout = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

function validCoord(lat, lon) {
  const a = Number(lat), o = Number(lon);
  return Number.isFinite(a) && Number.isFinite(o) && a >= -90 && a <= 90 && o >= -180 && o <= 180 ? [a, o] : null;
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
}

/* Giới hạn số lần gọi AI theo IP để tránh lạm dụng khóa OpenAI. */
const rateBuckets = new Map();
function rateLimited(req, key, max, windowMs) {
  const id = `${key}:${clientIp(req)}`; const now = Date.now();
  const bucket = (rateBuckets.get(id) || []).filter(t => now - t < windowMs);
  if (bucket.length >= max) { rateBuckets.set(id, bucket); return true; }
  bucket.push(now); rateBuckets.set(id, bucket);
  if (rateBuckets.size > 5000) rateBuckets.clear();
  return false;
}

/* ---------- Weather / Air proxy (có cache 10 phút) ---------- */
const envCache = new Map();
async function cachedJSON(cacheKey, url, ttl = 10 * 60 * 1000) {
  const hit = envCache.get(cacheKey);
  if (hit && Date.now() - hit.at < ttl) return hit.data;
  const response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 9000);
  const text = await response.text();
  let data; try { data = JSON.parse(text); } catch { throw Object.assign(new Error('UPSTREAM_NOT_JSON'), { status: 502 }); }
  if (!response.ok || data.error) throw Object.assign(new Error(data.reason || `UPSTREAM_${response.status}`), { status: 502 });
  envCache.set(cacheKey, { at: Date.now(), data });
  if (envCache.size > 400) envCache.delete(envCache.keys().next().value);
  return data;
}

function weatherUrl(lat, lon) {
  const q = new URLSearchParams({
    latitude: lat.toFixed(4), longitude: lon.toFixed(4), timezone: 'Asia/Ho_Chi_Minh', forecast_days: '2',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,uv_index'
  });
  return `${WEATHER_BASE}?${q}`;
}
function airUrl(lat, lon) {
  const q = new URLSearchParams({
    latitude: lat.toFixed(4), longitude: lon.toFixed(4), timezone: 'Asia/Ho_Chi_Minh', forecast_days: '2',
    current: 'us_aqi,pm2_5,pm10,uv_index',
    hourly: 'us_aqi,pm2_5,pm10,uv_index'
  });
  return `${AIR_BASE}?${q}`;
}

async function handleEnv(res, kind, latRaw, lonRaw) {
  const coord = validCoord(latRaw, lonRaw);
  if (!coord) return json(res, 400, { error: true, reason: 'Tọa độ không hợp lệ' });
  const [lat, lon] = coord;
  const key = `${kind}:${lat.toFixed(3)},${lon.toFixed(3)}`;
  try {
    const data = await cachedJSON(key, kind === 'weather' ? weatherUrl(lat, lon) : airUrl(lat, lon));
    return json(res, 200, data, { 'Cache-Control': 'public, max-age=300' });
  } catch (error) {
    return json(res, error.status || 502, { error: true, reason: `Open-Meteo chưa phản hồi (${error.message})` });
  }
}

/* ---------- GraphHopper round trip (khóa nằm trên máy chủ) ---------- */
async function handleRoute(res, url) {
  if (!GRAPHHOPPER_API_KEY) return json(res, 503, { error: true, reason: 'Máy chủ chưa cấu hình GraphHopper' });
  const coord = validCoord(url.searchParams.get('lat'), url.searchParams.get('lon'));
  const km = Math.min(30, Math.max(0.8, Number(url.searchParams.get('km')) || 3));
  const seed = Math.max(0, Math.min(99, Math.round(Number(url.searchParams.get('seed')) || 0)));
  if (!coord) return json(res, 400, { error: true, reason: 'Tọa độ không hợp lệ' });
  const qs = new URLSearchParams();
  qs.append('point', `${coord[0]},${coord[1]}`);
  qs.set('profile', 'foot'); qs.set('locale', 'vi'); qs.set('algorithm', 'round_trip');
  qs.set('round_trip.distance', String(Math.round(km * 1000))); qs.set('round_trip.seed', String(seed));
  qs.set('points_encoded', 'false'); qs.set('instructions', 'false'); qs.set('calc_points', 'true'); qs.set('elevation', 'true');
  qs.set('key', GRAPHHOPPER_API_KEY);
  try {
    const response = await fetchWithTimeout(`https://graphhopper.com/api/1/route?${qs}`, {}, 10000);
    const data = await response.json();
    if (!response.ok || !data?.paths?.length) return json(res, 502, { error: true, reason: data?.message || `GraphHopper HTTP ${response.status}` });
    const p = data.paths[0];
    const points = (p.points?.coordinates || []).map(c => ({ lon: Number(c[0]), lat: Number(c[1]), ele: Number.isFinite(Number(c[2])) ? Number(c[2]) : null }));
    if (points.length < 4) return json(res, 502, { error: true, reason: 'GraphHopper không trả đủ tọa độ' });
    return json(res, 200, { points, distanceKm: Number(p.distance) / 1000, durationMs: Number(p.time) || null, ascend: p.ascend ?? null, source: 'graphhopper', seed });
  } catch (error) {
    return json(res, 502, { error: true, reason: `GraphHopper lỗi: ${error.message}` });
  }
}

/* ---------- AI Coach ---------- */
const COACH_SYSTEM = `Bạn là "AIRUN Coach", trợ lý chạy bộ cho người chạy ở Đà Nẵng (Việt Nam).
Nguyên tắc bắt buộc:
1. CHỈ dùng số liệu trong khối DỮ LIỆU do ứng dụng gửi (thời tiết, AQI, PM2.5, UV, gió, mưa, kế hoạch, điểm AIRUN, dự báo theo giờ, phản hồi cũ của người dùng). Không bịa số, không đoán số không có. Trường nào null/thiếu thì nói "chưa có dữ liệu".
2. Khi nhận định, nêu kèm con số làm căn cứ (ví dụ: "cảm giác 36°C", "AQI 67").
3. Bối cảnh địa phương: người chạy ở Đà Nẵng đã quen nắng nóng ẩm. Nhiệt cảm nhận 30–35°C thường vẫn chạy được nếu chạy nhẹ, mang nước, chọn bóng râm hoặc ven biển/ven sông có gió — đừng khuyên bỏ chạy chỉ vì nóng ở mức này. Chỉ khuyên đổi giờ/hoãn rõ ràng khi: cảm giác ≥ 39°C, AQI > 150 (hoặc > 100 với nhóm nhạy cảm), có dông/mưa lớn, gió ≥ 35 km/h, UV ≥ 8 vào giữa trưa.
4. Gợi ý phải cụ thể, làm được ngay: chạy lúc mấy giờ (lấy từ dự báo theo giờ), chạy nhẹ hơn bao nhiêu (pace/thời lượng), mang gì (lượng nước, mũ, áo mưa, đèn phản quang...).
5. Nếu người dùng từng phản hồi khuyến nghị "quá khắt khe" hoặc "quá dễ dãi", hãy cân nhắc điều đó và nói rõ bạn đã cân nhắc.
6. Không chẩn đoán hay thay thế tư vấn y tế. Với nhóm nhạy cảm (hen, tim mạch...), nhắc thận trọng hơn.
7. Xưng "mình", gọi người dùng là "bạn". Tiếng Việt tự nhiên, ngắn gọn, thân thiện.`;

const MODE_INSTRUCTIONS = {
  plan: `Nhiệm vụ: đọc toàn bộ DỮ LIỆU và trả về JSON đúng dạng sau (không thêm chữ ngoài JSON):
{"headline":"một câu kết luận ≤ 14 từ","summary":"2–3 câu mô tả tình hình bằng lời dễ hiểu, có số liệu","when":"nên chạy lúc mấy giờ và vì sao (1 câu, dựa vào dự báo theo giờ)","adjust":["1–3 điều chỉnh cụ thể cho kế hoạch"],"bring":["2–4 món nên mang"],"watch":["0–2 dấu hiệu cần dừng/lưu ý"],"score_comment":"1 câu: điểm AIRUN có hợp lý với bối cảnh không, nếu công thức có vẻ khắt khe hoặc dễ dãi thì nói rõ"}`,
  run: `Nhiệm vụ: nhận xét buổi chạy vừa xong dựa vào kế hoạch, kết quả GPS, điều kiện và phản hồi của người dùng. Trả về JSON:
{"headline":"một câu ≤ 14 từ","summary":"2–3 câu so sánh kế hoạch với thực tế và cảm nhận","next_time":["1–3 gợi ý cho lần chạy sau"],"score_review":"1 câu: phản hồi của người dùng cho thấy công thức chấm điểm cần chỉnh gì (nếu có)"}`,
  live: `Nhiệm vụ: người dùng ĐANG CHẠY. Đưa ra một lời nhắc ngắn (tối đa 2 câu, ≤ 35 từ) để đọc bằng giọng nói, dựa vào quãng đường, pace, thời gian và điều kiện hiện tại. Trả về JSON: {"cue":"..."}`,
  chat: `Nhiệm vụ: trả lời câu hỏi mới nhất của người dùng dựa trên DỮ LIỆU. Tối đa 90 từ, có số liệu làm căn cứ, kết thúc bằng một gợi ý hành động cụ thể. Trả lời dạng văn bản thường (không JSON, không markdown đậm).`
};

function trimContext(ctx) {
  // Giữ gói dữ liệu nhỏ gọn: tối đa 18 giờ dự báo, bỏ tọa độ chính xác.
  const copy = JSON.parse(JSON.stringify(ctx || {}));
  if (Array.isArray(copy.next_hours)) copy.next_hours = copy.next_hours.slice(0, 18);
  if (copy.location) { delete copy.location.lat; delete copy.location.lon; }
  const text = JSON.stringify(copy);
  return text.length > 14000 ? text.slice(0, 14000) : text;
}

async function callOpenAI(messages, { wantJSON, maxTokens }) {
  const models = [OPENAI_MODEL, OPENAI_FALLBACK_MODEL].filter((m, i, a) => m && a.indexOf(m) === i);
  let lastError = null;
  for (const model of models) {
    const reasoning = /^(o\d|gpt-5)/i.test(model);
    const body = { model, messages, max_completion_tokens: reasoning ? Math.max(1600, maxTokens * 3) : maxTokens };
    if (!reasoning) body.temperature = 0.4;
    if (wantJSON) body.response_format = { type: 'json_object' };
    try {
      const response = await fetchWithTimeout(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify(body)
      }, 25000);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error?.message || `OpenAI HTTP ${response.status}`;
        lastError = Object.assign(new Error(message), { status: response.status });
        const modelProblem = response.status === 404 || /model/i.test(message);
        if (modelProblem) continue; // thử model dự phòng
        throw lastError;
      }
      const content = data?.choices?.[0]?.message?.content || '';
      return { content, model };
    } catch (error) {
      lastError = error;
      if (error.name === 'AbortError') throw Object.assign(new Error('OpenAI phản hồi quá lâu'), { status: 504 });
      if (error.status && error.status !== 404) throw error;
    }
  }
  throw lastError || new Error('OpenAI không phản hồi');
}

function parseJSONLoose(text) {
  try { return JSON.parse(text); } catch {}
  const match = String(text).match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

async function handleCoach(req, res) {
  if (!OPENAI_API_KEY) return json(res, 503, { error: true, reason: 'Máy chủ chưa cấu hình OPENAI_API_KEY' });
  if (rateLimited(req, 'coach', 40, 10 * 60 * 1000)) return json(res, 429, { error: true, reason: 'Bạn hỏi AI hơi nhanh, đợi vài phút rồi thử lại nhé.' });
  let body;
  try { body = await readBody(req); } catch (error) { return json(res, error.status || 400, { error: true, reason: error.message }); }
  const mode = MODE_INSTRUCTIONS[body.mode] ? body.mode : 'plan';
  const context = trimContext(body.context);
  const messages = [
    { role: 'system', content: `${COACH_SYSTEM}\n\n${MODE_INSTRUCTIONS[mode]}` },
    { role: 'user', content: `DỮ LIỆU (JSON, do ứng dụng AIRUN tạo từ số liệu đang hiển thị):\n${context}` }
  ];
  if (mode === 'chat') {
    const history = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
    for (const m of history) {
      const role = m?.role === 'assistant' ? 'assistant' : 'user';
      const content = String(m?.content || '').slice(0, 700);
      if (content) messages.push({ role, content });
    }
    if (messages[messages.length - 1].role !== 'user') return json(res, 400, { error: true, reason: 'Thiếu câu hỏi' });
  }
  try {
    const started = Date.now();
    const { content, model } = await callOpenAI(messages, { wantJSON: mode !== 'chat', maxTokens: mode === 'live' ? 160 : mode === 'chat' ? 420 : 650 });
    const result = mode === 'chat' ? { answer: content.trim() } : parseJSONLoose(content);
    if (!result) return json(res, 502, { error: true, reason: 'AI trả về sai định dạng' });
    return json(res, 200, { ok: true, mode, model, ms: Date.now() - started, result });
  } catch (error) {
    console.warn('AIRUN coach error:', error.message);
    const status = error.status === 401 ? 503 : (error.status || 502);
    return json(res, status, { error: true, reason: error.status === 401 ? 'Khóa OpenAI không hợp lệ' : `AI chưa phản hồi: ${error.message}` });
  }
}

/* ---------- Phản hồi sau buổi chạy ---------- */
const feedbackStore = [];
try {
  if (fs.existsSync(FEEDBACK_FILE)) {
    fs.readFileSync(FEEDBACK_FILE, 'utf8').split('\n').filter(Boolean).slice(-2000).forEach(line => { try { feedbackStore.push(JSON.parse(line)); } catch {} });
  }
} catch {}

function cleanFeedback(raw) {
  const pick = (v, list) => (list.includes(v) ? v : null);
  const num = (v, min, max) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null; };
  const str = (v, n) => String(v ?? '').slice(0, n);
  const c = raw.conditions || {};
  return {
    id: str(raw.id, 40) || String(Date.now()),
    at: new Date().toISOString(),
    verdict: pick(raw.verdict, ['dung', 'qua_khat_khe', 'qua_de_dai']),
    route: pick(raw.route, ['phu_hop', 'chua_phu_hop', 'khong_dung']),
    heat: num(raw.heat, 1, 5), breath: num(raw.breath, 1, 5), effort: num(raw.effort, 1, 5),
    note: str(raw.note, 400),
    area: str(raw.area, 60),
    hasGps: Boolean(raw.hasGps),
    score: num(raw.score, 0, 10), scoreTitle: str(raw.scoreTitle, 60),
    conditions: { feels: num(c.feels, -10, 60), temp: num(c.temp, -10, 60), aqi: num(c.aqi, 0, 600), pm: num(c.pm, 0, 1000), uv: num(c.uv, 0, 20), rain: num(c.rain, 0, 100), wind: num(c.wind, 0, 200), time: str(c.time, 20), source: str(c.source, 20) },
    run: { distanceKm: num(raw.run?.distanceKm, 0, 200), durationSec: num(raw.run?.durationSec, 0, 86400), pace: str(raw.run?.pace, 10) },
    plan: { durationMin: num(raw.plan?.durationMin, 0, 600), intensity: str(raw.plan?.intensity, 10), sensitive: Boolean(raw.plan?.sensitive), paceMin: num(raw.plan?.paceMin, 0, 30) },
    tester: str(raw.tester, 40)
  };
}

function feedbackSummary() {
  const rows = feedbackStore.filter(r => r.verdict);
  const count = v => rows.filter(r => r.verdict === v).length;
  const band = r => { const f = r.conditions?.feels; if (f == null) return 'khong_ro'; if (f < 30) return 'duoi_30'; if (f < 35) return '30_35'; if (f < 39) return '35_39'; return 'tu_39'; };
  const byHeat = {};
  for (const r of rows) {
    const b = band(r); byHeat[b] = byHeat[b] || { total: 0, dung: 0, qua_khat_khe: 0, qua_de_dai: 0 };
    byHeat[b].total++; byHeat[b][r.verdict]++;
  }
  return { total: rows.length, dung: count('dung'), qua_khat_khe: count('qua_khat_khe'), qua_de_dai: count('qua_de_dai'), byHeat, since: rows[0]?.at || null, persistent: Boolean(FEEDBACK_WEBHOOK_URL) };
}

async function handleFeedback(req, res) {
  if (rateLimited(req, 'feedback', 30, 10 * 60 * 1000)) return json(res, 429, { error: true, reason: 'Gửi quá nhiều phản hồi, thử lại sau.' });
  let body;
  try { body = await readBody(req, 16 * 1024); } catch (error) { return json(res, error.status || 400, { error: true, reason: error.message }); }
  const row = cleanFeedback(body || {});
  if (!row.verdict) return json(res, 400, { error: true, reason: 'Thiếu đánh giá khuyến nghị' });
  feedbackStore.push(row); if (feedbackStore.length > 5000) feedbackStore.shift();
  try { fs.mkdirSync(path.dirname(FEEDBACK_FILE), { recursive: true }); fs.appendFileSync(FEEDBACK_FILE, JSON.stringify(row) + '\n'); } catch {}
  let forwarded = false;
  if (FEEDBACK_WEBHOOK_URL) {
    try {
      const r = await fetchWithTimeout(FEEDBACK_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row), redirect: 'follow' }, 8000);
      forwarded = r.ok;
    } catch (error) { console.warn('AIRUN feedback webhook:', error.message); }
  }
  return json(res, 200, { ok: true, forwarded, summary: feedbackSummary() });
}

function handleFeedbackExport(res, url) {
  if (!ADMIN_TOKEN || url.searchParams.get('token') !== ADMIN_TOKEN) return json(res, 403, { error: true, reason: 'Cần ADMIN_TOKEN' });
  const header = ['Thời điểm', 'Khu vực', 'Đánh giá', 'Cung đường', 'Nóng 1-5', 'Khó thở 1-5', 'Mệt 1-5', 'Điểm AIRUN', 'Cảm giác °C', 'AQI', 'UV', 'Mưa %', 'Gió', 'Km', 'Phút', 'Pace', 'Ghi chú', 'Người thử'];
  const cell = v => { let t = String(v ?? ''); if (/^[=+\-@]/.test(t)) t = `'${t}`; return `"${t.replace(/"/g, '""')}"`; };
  const rows = feedbackStore.map(r => [r.at, r.area, r.verdict, r.route, r.heat, r.breath, r.effort, r.score, r.conditions.feels, r.conditions.aqi, r.conditions.uv, r.conditions.rain, r.conditions.wind, r.run.distanceKm, r.run.durationSec ? Math.round(r.run.durationSec / 60) : '', r.run.pace, r.note, r.tester]);
  const csv = '﻿' + [header, ...rows].map(r => r.map(cell).join(',')).join('\r\n');
  res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="airun-feedback.csv"', 'Cache-Control': 'no-store' });
  res.end(csv);
}

/* ---------- Static ---------- */
function serveStatic(req, res, pathname) {
  let file = pathname === '/' ? '/index.html' : pathname;
  try { file = decodeURIComponent(file); } catch { return send(res, 400, 'Bad request'); }
  const allowed = PUBLIC_FILES.has(file) || file.startsWith('/assets/');
  const full = path.normalize(path.join(ROOT, file));
  if (!allowed || !full.startsWith(ROOT + path.sep)) {
    // Đường dẫn lạ → trả trang chính (giống SPA), không lộ file mã nguồn.
    return serveFile(res, path.join(ROOT, 'index.html'), req.method === 'HEAD');
  }
  return serveFile(res, full, req.method === 'HEAD');
}
function serveFile(res, full, headOnly) {
  fs.readFile(full, (error, data) => {
    if (error) return send(res, 404, 'Not found');
    const ext = path.extname(full).toLowerCase();
    const isHtml = ext === '.html';
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': isHtml ? 'no-cache' : 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()'
    });
    res.end(headOnly ? undefined : data);
  });
}

/* ---------- Router ---------- */
async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  let p = url.pathname;
  // Vercel: vercel.json chuyển /api/* → /api/index?__p=*
  if (url.searchParams.has('__p')) {
    const sub = url.searchParams.get('__p').replace(/^\/+/, '');
    url.searchParams.delete('__p');
    p = sub === '__healthz' ? '/healthz' : `/api/${sub}`;
  }
  try {
    if (p === '/healthz') return json(res, 200, { ok: true, version: VERSION });
    if (p === '/api/config' && req.method === 'GET') {
      return json(res, 200, { version: VERSION, server: true, ai: Boolean(OPENAI_API_KEY), aiModel: OPENAI_API_KEY ? OPENAI_MODEL : null, routing: Boolean(GRAPHHOPPER_API_KEY), mapboxToken: MAPBOX_PUBLIC_TOKEN || '', feedback: true, feedbackPersistent: Boolean(FEEDBACK_WEBHOOK_URL) });
    }
    let m = p.match(/^\/api\/(weather|air)\/(-?[\d.]+)\/(-?[\d.]+)\/?$/);
    if (m && req.method === 'GET') return handleEnv(res, m[1], m[2], m[3]);
    if (p === '/api/route' && req.method === 'GET') return handleRoute(res, url);
    if (p === '/api/coach' && req.method === 'POST') return handleCoach(req, res);
    if (p === '/api/feedback' && req.method === 'POST') return handleFeedback(req, res);
    if (p === '/api/feedback/summary' && req.method === 'GET') return json(res, 200, feedbackSummary());
    if (p === '/api/feedback/export' && req.method === 'GET') return handleFeedbackExport(res, url);
    if (p.startsWith('/api/')) return json(res, 404, { error: true, reason: 'Không có API này' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    return serveStatic(req, res, p);
  } catch (error) {
    console.error('AIRUN server error:', error);
    return json(res, 500, { error: true, reason: 'Lỗi máy chủ' });
  }
}
const server = http.createServer(handler);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`AIRUN ${VERSION} chạy tại cổng ${PORT} · AI ${OPENAI_API_KEY ? 'BẬT (' + OPENAI_MODEL + ')' : 'TẮT (thiếu OPENAI_API_KEY)'} · GraphHopper ${GRAPHHOPPER_API_KEY ? 'BẬT' : 'TẮT'}`);
  });
}
module.exports = { handler, server, cleanFeedback, feedbackSummary, parseJSONLoose };
