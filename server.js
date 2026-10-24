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
const VERSION = '9.0.0';
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
  const coord = validCoord(url.searchParams.get('lat'), url.searchParams.get('lon'));
  const km = Math.min(30, Math.max(0.8, Number(url.searchParams.get('km')) || 3));
  const seed = Math.max(0, Math.min(99, Math.round(Number(url.searchParams.get('seed')) || 0)));
  if (!coord) return json(res, 400, { error: true, reason: 'Tọa độ không hợp lệ' });
  if (!GRAPHHOPPER_API_KEY && !GOOGLE_MAPS_SERVER_KEY) return json(res, 503, { error: true, reason: 'Máy chủ chưa cấu hình GraphHopper/Google Routes' });
  try {
    const r = await roundTripBest({ lat: coord[0], lon: coord[1] }, km, seed);
    return json(res, 200, { points: r.points, distanceKm: r.distanceKm, durationMs: null, source: r.source, seed, attempts: r.attempts });
  } catch (error) {
    return json(res, 502, { error: true, reason: `Không tạo được vòng chạy: ${error.message}` });
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
7. Điểm AIRUN thang 0–10: điểm CAO hơn nghĩa là THUẬN LỢI hơn. Không bao giờ nói giờ có điểm thấp hơn là tốt hơn. Nếu giờ dự định có điểm thấp hơn giờ tốt nhất, hãy gợi ý giờ tốt nhất (hoặc cách chạy nhẹ nếu người dùng chỉ rảnh giờ dự định).
8. Nếu có runner_profile (thói quen của người chạy: số buổi, km trung bình, pace trung bình, giờ hay chạy, khu vực quen, phản hồi cũ) thì cá nhân hoá lời khuyên theo đó (ví dụ: "bạn hay chạy 5:30 sáng, pace 7:10") và không đề xuất tăng quá 10–15% quãng đường so với thói quen.
9. Xưng "mình", gọi người dùng là "bạn". Tiếng Việt tự nhiên, ngắn gọn, thân thiện.`;

const MODE_INSTRUCTIONS = {
  plan: `Nhiệm vụ: đọc toàn bộ DỮ LIỆU và trả về JSON đúng dạng sau (không thêm chữ ngoài JSON):
{"headline":"một câu kết luận ≤ 14 từ","summary":"2–3 câu mô tả tình hình bằng lời dễ hiểu, có số liệu","when":"1 câu: so sánh giờ dự định (plan.start_time) với best_upcoming_time; nếu giờ tốt nhất khác giờ dự định thì nói rõ cả hai và chênh lệch điều kiện (số liệu), nếu giờ dự định đã ổn thì nói vậy","adjust":["1–3 điều chỉnh cụ thể cho kế hoạch"],"bring":["2–4 món nên mang"],"watch":["0–2 dấu hiệu cần dừng/lưu ý"],"score_comment":"1 câu: điểm AIRUN có hợp lý với bối cảnh không, nếu công thức có vẻ khắt khe hoặc dễ dãi thì nói rõ"}`,
  run: `Nhiệm vụ: nhận xét buổi chạy vừa xong dựa vào kế hoạch, kết quả GPS, điều kiện và phản hồi của người dùng. Trả về JSON:
{"headline":"một câu ≤ 14 từ","summary":"2–3 câu so sánh kế hoạch với thực tế và cảm nhận","next_time":["1–3 gợi ý cho lần chạy sau"],"score_review":"1 câu: phản hồi của người dùng cho thấy công thức chấm điểm cần chỉnh gì (nếu có)"}`,
  live: `Nhiệm vụ: người dùng ĐANG CHẠY. Đưa ra một lời nhắc ngắn (tối đa 2 câu, ≤ 35 từ) để đọc bằng giọng nói, dựa vào quãng đường, pace, thời gian và điều kiện hiện tại. Trả về JSON: {"cue":"..."}`,
  chat: `Nhiệm vụ: trả lời câu hỏi mới nhất của người dùng dựa trên DỮ LIỆU. Tối đa 90 từ, có số liệu làm căn cứ, kết thúc bằng một gợi ý hành động cụ thể. Trả lời dạng văn bản thường (không JSON, không markdown đậm).`,
  agent: `Nhiệm vụ: bạn là trợ lý xuất hiện ở mọi tab của app AIRUN (tab hiện tại: current_tab). Trả lời câu hỏi mới nhất (tối đa 90 từ, có số liệu nếu liên quan) VÀ nếu người dùng muốn app LÀM một việc thì đề xuất đúng một hành động. Trả về JSON:
{"reply":"câu trả lời bằng lời","action":null}
hoặc action là một trong:
{"type":"plan_route","start_text":"tên địa điểm xuất phát hoặc null","use_current_start":true|false,"waypoints":["tên địa điểm muốn đi qua"],"distance_km":số hoặc null,"loop":true|false}
{"type":"set_plan","time":"HH:MM hoặc null","duration_min":số hoặc null,"intensity":"Nhẹ|Vừa|Cao hoặc null","area":"tên khu vực trong available_areas hoặc null"}
{"type":"open_tab","tab":"home|plan|coach|run|journal"}
Quy tắc: chỉ tạo action khi người dùng yêu cầu rõ (ví dụ "tạo cung 5 km qua cầu Rồng", "đổi sang 6 giờ sáng", "mở nhật ký"). Địa điểm phải là tên cụ thể ở Đà Nẵng/Hội An (thêm "Đà Nẵng" nếu cần). "từ đây", "chỗ mình" → use_current_start=true. Không bịa toạ độ.`,
  route_intent: `Nhiệm vụ: người dùng mô tả cung chạy họ muốn. Phân tích thành JSON (không thêm chữ ngoài JSON):
{"start_text":"tên địa điểm xuất phát cụ thể (kèm 'Đà Nẵng' nếu cần) hoặc null","use_current_start":true|false,"waypoints":["tối đa 5 địa điểm muốn đi qua, theo thứ tự"],"distance_km":số hoặc null,"loop":true nếu muốn quay về điểm xuất phát,"reply":"1–2 câu xác nhận bạn sẽ tạo cung thế nào, kèm lưu ý thời tiết/không khí nếu đáng chú ý (dựa trên DỮ LIỆU)"}
Nếu người dùng không nêu điểm xuất phát → use_current_start=true, start_text=null. Nếu không nêu số km nhưng nêu thời gian chạy → quy đổi bằng pace trong plan. Không bịa toạ độ.`,
  weekly: `Nhiệm vụ: dựa vào runner_profile (thói quen, lịch sử) và DỮ LIỆU thời tiết, đề xuất kế hoạch chạy 7 ngày tới, an toàn, tăng dần nhẹ. Trả về JSON:
{"headline":"≤ 14 từ","summary":"2 câu nhận xét thói quen hiện tại (có số liệu từ runner_profile; nếu chưa có lịch sử thì nói rõ và đề xuất kế hoạch cho người mới)","sessions":[{"day":"Thứ Hai…","time":"HH:MM","duration_min":số,"km":số,"type":"chạy nhẹ|chạy đều|biến tốc nhẹ|chạy dài|nghỉ/giãn cơ","why":"lý do ngắn"}],"tip":"1 lời khuyên"}
Có 3–5 buổi chạy và ít nhất 1 ngày nghỉ. Giờ chạy ưu tiên sáng sớm hoặc chiều tối (Đà Nẵng nóng).`
};
const ACTION_TYPES = new Set(['plan_route', 'set_plan', 'open_tab']);
function cleanAction(a) {
  if (!a || typeof a !== 'object' || !ACTION_TYPES.has(a.type)) return null;
  if (a.type === 'open_tab') return ['home', 'plan', 'coach', 'run', 'journal'].includes(a.tab) ? { type: 'open_tab', tab: a.tab } : null;
  if (a.type === 'set_plan') return { type: 'set_plan', time: /^\d{1,2}:\d{2}$/.test(String(a.time || '')) ? String(a.time).padStart(5, '0') : null, duration_min: Number(a.duration_min) > 0 ? Math.min(240, Math.round(Number(a.duration_min))) : null, intensity: ['Nhẹ', 'Vừa', 'Cao'].includes(a.intensity) ? a.intensity : null, area: a.area ? String(a.area).slice(0, 40) : null };
  return { type: 'plan_route', start_text: a.start_text ? String(a.start_text).slice(0, 100) : null, use_current_start: Boolean(a.use_current_start) || !a.start_text, waypoints: (Array.isArray(a.waypoints) ? a.waypoints : []).map(w => String(w).slice(0, 100)).filter(Boolean).slice(0, 5), distance_km: Number(a.distance_km) > 0 ? Math.min(42, Number(a.distance_km)) : null, loop: a.loop !== false };
}

function trimContext(ctx) {
  // Giữ gói dữ liệu nhỏ gọn: tối đa 18 giờ dự báo, bỏ tọa độ chính xác.
  const copy = JSON.parse(JSON.stringify(ctx || {}));
  if (Array.isArray(copy.next_hours)) copy.next_hours = copy.next_hours.slice(0, 18);
  if (copy.location) { delete copy.location.lat; delete copy.location.lon; }
  const text = JSON.stringify(copy);
  return text.length > 18000 ? text.slice(0, 18000) : text;
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
  if (mode === 'route_intent') {
    const text = String(body.text || '').trim().slice(0, 600);
    if (!text) return json(res, 400, { error: true, reason: 'Hãy mô tả cung chạy bạn muốn' });
    messages.push({ role: 'user', content: `MÔ TẢ CUNG CHẠY CỦA NGƯỜI DÙNG: ${text}` });
  }
  if (mode === 'chat' || mode === 'agent') {
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
    const maxTokens = { live: 160, chat: 420, agent: 520, route_intent: 380, weekly: 800 }[mode] || 650;
    const { content, model } = await callOpenAI(messages, { wantJSON: mode !== 'chat', maxTokens });
    const result = mode === 'chat' ? { answer: content.trim() } : parseJSONLoose(content);
    if (!result) return json(res, 502, { error: true, reason: 'AI trả về sai định dạng' });
    if (mode === 'agent') { result.reply = String(result.reply || result.answer || '').trim(); result.action = cleanAction(result.action); }
    if (mode === 'route_intent') { result.waypoints = (Array.isArray(result.waypoints) ? result.waypoints : []).map(w => String(w).slice(0, 100)).filter(Boolean).slice(0, 5); result.use_current_start = Boolean(result.use_current_start) || !result.start_text; result.distance_km = Number(result.distance_km) > 0 ? Math.min(42, Number(result.distance_km)) : null; result.loop = result.loop !== false; }
    if (['agent', 'chat', 'route_intent', 'weekly'].includes(mode)) {
      const user = verifyToken(req);
      const question = mode === 'route_intent' ? String(body.text || '') : String((Array.isArray(body.messages) ? body.messages : []).slice(-1)[0]?.content || mode);
      const answer = result.reply || result.answer || result.headline || '';
      await sheetsAppendQuiet('nhat_ky_ai', { thoi_diem: new Date().toISOString(), nguoi_chay_id: user?.id || '', ten: user?.ten || '', loai: mode, cau_hoi: question.slice(0, 500), tra_loi: String(answer).slice(0, 800), hanh_dong: result.action ? JSON.stringify(result.action) : (mode === 'route_intent' ? JSON.stringify({ start: result.start_text, waypoints: result.waypoints, km: result.distance_km }) : '') });
    }
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
  if (accountsEnabled()) {
    const user = verifyToken(req), c = row.conditions || {}, r = row.run || {};
    forwarded = (await sheetsAppendQuiet('danh_gia', { thoi_diem: row.at, nguoi_chay_id: user?.id || '', ten: user?.ten || '', ma: row.id, khu_vuc: row.area, danh_gia: row.verdict, cung_duong: row.route, nong_1_5: row.heat, kho_tho_1_5: row.breath, met_1_5: row.effort, diem_airun: row.score, cam_giac_c: c.feels, aqi: c.aqi, uv: c.uv, mua: c.rain, gio: c.wind, km: r.distanceKm, thoi_gian_giay: r.durationSec, pace: r.pace, ghi_chu: row.note, nguoi_thu: row.tester, co_gps: row.hasGps ? 'có' : 'không' }, 5000)) || forwarded;
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

/* ---------- V9: Google Maps · Places · Routes ---------- */
const crypto = require('crypto');
const GOOGLE_MAPS_BROWSER_KEY = (process.env.GOOGLE_MAPS_BROWSER_KEY || process.env.GOOGLE_MAPS_API_KEY || '').trim();
const GOOGLE_MAPS_SERVER_KEY = (process.env.GOOGLE_MAPS_SERVER_KEY || '').trim() || GOOGLE_MAPS_BROWSER_KEY;
const PUBLIC_SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://airun-da-nang.vercel.app').replace(/\/+$/, '');
const GOOGLE_PLACES_BASE = (process.env.GOOGLE_PLACES_BASE || 'https://places.googleapis.com/v1').replace(/\/+$/, '');
const GOOGLE_ROUTES_BASE = (process.env.GOOGLE_ROUTES_BASE || 'https://routes.googleapis.com').replace(/\/+$/, '');
const NOMINATIM_BASE = (process.env.NOMINATIM_BASE || 'https://nominatim.openstreetmap.org').replace(/\/+$/, '');
const VALHALLA_BASE = (process.env.VALHALLA_BASE || 'https://valhalla1.openstreetmap.de').replace(/\/+$/, '');
const GRAPHHOPPER_BASE = (process.env.GRAPHHOPPER_BASE || 'https://graphhopper.com/api/1').replace(/\/+$/, '');
const DN_CENTER = { lat: 16.0544, lon: 108.2022 };

function googleHeaders(fieldMask) {
  // Referer giúp khóa bị giới hạn theo trang web (HTTP referrer) vẫn dùng được từ máy chủ.
  return { 'Content-Type': 'application/json', 'X-Goog-Api-Key': GOOGLE_MAPS_SERVER_KEY, 'X-Goog-FieldMask': fieldMask, Referer: `${PUBLIC_SITE_URL}/` };
}
function decodePolyline(str, factor = 1e5) {
  let index = 0, lat = 0, lon = 0; const out = [];
  while (index < str.length) {
    let result = 0, shift = 0, b;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20 && index <= str.length);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    result = 0; shift = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20 && index <= str.length);
    lon += (result & 1) ? ~(result >> 1) : (result >> 1);
    out.push({ lat: lat / factor, lon: lon / factor });
  }
  return out;
}
function haversineKm(a, b) {
  const r = v => v * Math.PI / 180, dLat = r(b.lat - a.lat), dLon = r(b.lon - a.lon);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function destinationPoint(p, km, bearing) {
  const R = 6371, d = km / R, t = bearing * Math.PI / 180, f1 = p.lat * Math.PI / 180, l1 = p.lon * Math.PI / 180;
  const f2 = Math.asin(Math.sin(f1) * Math.cos(d) + Math.cos(f1) * Math.sin(d) * Math.cos(t));
  const l2 = l1 + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(f1), Math.cos(d) - Math.sin(f1) * Math.sin(f2));
  return { lat: f2 * 180 / Math.PI, lon: l2 * 180 / Math.PI };
}
function cleanPoint(p) {
  const c = validCoord(p?.lat, p?.lon);
  return c ? { lat: c[0], lon: c[1], label: String(p.label || p.name || '').slice(0, 80) } : null;
}

const placeCache = new Map();
async function searchPlaces(query, near) {
  const q = String(query || '').trim().slice(0, 120);
  if (q.length < 2) return [];
  const center = near && validCoord(near.lat, near.lon) ? { lat: Number(near.lat), lon: Number(near.lon) } : DN_CENTER;
  const cacheKey = `${q.toLowerCase()}|${center.lat.toFixed(2)},${center.lon.toFixed(2)}|${GOOGLE_MAPS_SERVER_KEY ? 'g' : 'n'}`;
  const hit = placeCache.get(cacheKey);
  if (hit && Date.now() - hit.at < 24 * 3600 * 1000) return hit.data;
  let data = [];
  if (GOOGLE_MAPS_SERVER_KEY) {
    try {
      const r = await fetchWithTimeout(`${GOOGLE_PLACES_BASE}/places:searchText`, {
        method: 'POST', headers: googleHeaders('places.id,places.displayName,places.formattedAddress,places.location'),
        body: JSON.stringify({ textQuery: q, languageCode: 'vi', regionCode: 'VN', maxResultCount: 6, locationBias: { circle: { center: { latitude: center.lat, longitude: center.lon }, radius: 40000 } } })
      }, 8000);
      const j = await r.json().catch(() => ({}));
      if (r.ok) data = (j.places || []).map(p => ({ id: p.id, name: p.displayName?.text || q, address: p.formattedAddress || '', lat: p.location?.latitude, lon: p.location?.longitude, source: 'google' })).filter(p => validCoord(p.lat, p.lon));
      else console.warn('AIRUN places:', j?.error?.message || r.status);
    } catch (e) { console.warn('AIRUN places:', e.message); }
  }
  if (!data.length) {
    try {
      const needCity = !/(đà nẵng|da nang|hội an|hoi an|quảng nam|quang nam|tam kỳ|điện bàn)/i.test(q);
      const qs = new URLSearchParams({ format: 'jsonv2', limit: '6', countrycodes: 'vn', 'accept-language': 'vi', viewbox: '107.90,16.30,108.60,15.50', bounded: '0', q: needCity ? `${q}, Đà Nẵng` : q });
      const r = await fetchWithTimeout(`${NOMINATIM_BASE}/search?${qs}`, { headers: { 'User-Agent': `AIRUN-DaNang/9.0 (+${PUBLIC_SITE_URL})`, Accept: 'application/json' } }, 8000);
      const j = await r.json().catch(() => []);
      if (Array.isArray(j)) data = j.map(p => ({ id: `osm:${p.osm_id}`, name: String(p.name || p.display_name || q).split(',')[0], address: p.display_name || '', lat: Number(p.lat), lon: Number(p.lon), source: 'osm' })).filter(p => validCoord(p.lat, p.lon));
    } catch (e) { console.warn('AIRUN nominatim:', e.message); }
  }
  placeCache.set(cacheKey, { at: Date.now(), data });
  if (placeCache.size > 500) placeCache.delete(placeCache.keys().next().value);
  return data;
}

async function routeGoogle(points) {
  if (!GOOGLE_MAPS_SERVER_KEY) throw new Error('no_google');
  const ll = p => ({ location: { latLng: { latitude: p.lat, longitude: p.lon } } });
  const body = { origin: ll(points[0]), destination: ll(points[points.length - 1]), intermediates: points.slice(1, -1).map(ll), travelMode: 'WALK', languageCode: 'vi', units: 'METRIC', polylineEncoding: 'ENCODED_POLYLINE' };
  const r = await fetchWithTimeout(`${GOOGLE_ROUTES_BASE}/directions/v2:computeRoutes`, { method: 'POST', headers: googleHeaders('routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline'), body: JSON.stringify(body) }, 10000);
  const j = await r.json().catch(() => ({}));
  const route = j.routes?.[0];
  if (!r.ok || !route?.polyline?.encodedPolyline) throw new Error(j?.error?.message || `Google Routes HTTP ${r.status}`);
  return { points: decodePolyline(route.polyline.encodedPolyline), distanceKm: Number(route.distanceMeters || 0) / 1000, source: 'google' };
}
async function routeGraphHopper(points) {
  if (!GRAPHHOPPER_API_KEY) throw new Error('no_graphhopper');
  const qs = new URLSearchParams();
  points.forEach(p => qs.append('point', `${p.lat},${p.lon}`));
  qs.set('profile', 'foot'); qs.set('locale', 'vi'); qs.set('points_encoded', 'false'); qs.set('instructions', 'false'); qs.set('calc_points', 'true'); qs.set('key', GRAPHHOPPER_API_KEY);
  const r = await fetchWithTimeout(`${GRAPHHOPPER_BASE}/route?${qs}`, {}, 10000);
  const j = await r.json().catch(() => ({}));
  const p = j.paths?.[0];
  if (!r.ok || !p?.points?.coordinates?.length) throw new Error(j?.message || `GraphHopper HTTP ${r.status}`);
  return { points: p.points.coordinates.map(c => ({ lon: Number(c[0]), lat: Number(c[1]) })), distanceKm: Number(p.distance) / 1000, source: 'graphhopper' };
}
async function routeValhalla(points) {
  const body = { locations: points.map(p => ({ lat: p.lat, lon: p.lon })), costing: 'pedestrian', units: 'kilometers' };
  const r = await fetchWithTimeout(`${VALHALLA_BASE}/route`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': `AIRUN-DaNang/9.0 (+${PUBLIC_SITE_URL})` }, body: JSON.stringify(body) }, 9000);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j?.trip?.legs?.length) throw new Error(j?.error || `Valhalla HTTP ${r.status}`);
  const pts = [];
  for (const leg of j.trip.legs) { const lp = decodePolyline(leg.shape || '', 1e6); if (pts.length && lp.length) lp.shift(); pts.push(...lp); }
  return { points: pts, distanceKm: Number(j.trip.summary?.length) || 0, source: 'network' };
}
async function routeThrough(points) {
  const errors = [];
  for (const fn of [routeGoogle, routeGraphHopper, routeValhalla]) {
    try { const r = await fn(points); if (r.points.length >= 2) return r; } catch (e) { errors.push(e.message); }
  }
  throw new Error(`Không tạo được đường chạy (${errors.filter(e => !/^no_/.test(e)).join('; ') || 'chưa có dịch vụ định tuyến'})`);
}
async function ghRoundTrip(start, km, seed) {
  const qs = new URLSearchParams();
  qs.append('point', `${start.lat},${start.lon}`);
  qs.set('profile', 'foot'); qs.set('locale', 'vi'); qs.set('algorithm', 'round_trip');
  qs.set('round_trip.distance', String(Math.round(km * 1000))); qs.set('round_trip.seed', String(seed));
  qs.set('points_encoded', 'false'); qs.set('instructions', 'false'); qs.set('calc_points', 'true'); qs.set('key', GRAPHHOPPER_API_KEY);
  const r = await fetchWithTimeout(`${GRAPHHOPPER_BASE}/route?${qs}`, {}, 10000);
  const j = await r.json().catch(() => ({}));
  const p = j.paths?.[0];
  if (!r.ok || !p?.points?.coordinates?.length) throw new Error(j?.message || `GraphHopper HTTP ${r.status}`);
  return { points: p.points.coordinates.map(c => ({ lon: Number(c[0]), lat: Number(c[1]), ele: Number.isFinite(Number(c[2])) ? Number(c[2]) : null })), distanceKm: Number(p.distance) / 1000, source: 'graphhopper', seed };
}
/* Vòng chạy theo số km: thử lại (tối đa 3 lần) với mục tiêu hiệu chỉnh để quãng đường gần mục tiêu nhất. */
async function roundTripBest(start, km, seed = 0) {
  const tries = [];
  let ask = km;
  for (let i = 0; i < 3; i++) {
    let r = null;
    try {
      if (GRAPHHOPPER_API_KEY) r = await ghRoundTrip(start, ask, seed + i * 7);
      else {
        const radius = Math.max(0.35, ask / 4.15), bearing = (seed * 47 + i * 60) % 360;
        const v1 = destinationPoint(start, radius, bearing), v2 = destinationPoint(start, radius, (bearing + 112) % 360);
        r = await routeThrough([start, v1, v2, start]);
      }
    } catch (e) { if (!tries.length && i === 2) throw e; continue; }
    tries.push(r);
    const err = Math.abs(r.distanceKm - km) / km;
    if (err <= 0.08) break;
    ask = Math.min(42, Math.max(0.8, ask * km / Math.max(0.3, r.distanceKm)));
  }
  if (!tries.length) throw new Error('Không tạo được vòng chạy');
  tries.sort((a, b) => Math.abs(a.distanceKm - km) - Math.abs(b.distanceKm - km));
  return { ...tries[0], attempts: tries.length };
}

async function handlePlaces(res, url) {
  const q = url.searchParams.get('q') || '';
  const near = { lat: url.searchParams.get('lat'), lon: url.searchParams.get('lon') };
  const results = await searchPlaces(q, near);
  return json(res, 200, { ok: true, results, provider: results[0]?.source || (GOOGLE_MAPS_SERVER_KEY ? 'google' : 'osm') });
}

async function resolvePlace(item, near) {
  if (!item) return null;
  if (typeof item === 'object' && validCoord(item.lat, item.lon)) return cleanPoint(item);
  const text = typeof item === 'string' ? item : item.text || item.name || '';
  const found = (await searchPlaces(text, near))[0];
  return found ? { lat: found.lat, lon: found.lon, label: found.name, address: found.address } : null;
}

async function handleRoutePlan(req, res) {
  if (rateLimited(req, 'routeplan', 30, 10 * 60 * 1000)) return json(res, 429, { error: true, reason: 'Tạo cung hơi nhanh, đợi một chút nhé.' });
  let body;
  try { body = await readBody(req, 16 * 1024); } catch (e) { return json(res, e.status || 400, { error: true, reason: e.message }); }
  const near = cleanPoint(body.near) || DN_CENTER;
  const start = await resolvePlace(body.start, near);
  if (!start) return json(res, 400, { error: true, reason: 'Không tìm thấy điểm xuất phát' });
  const notFound = [];
  const waypoints = [];
  for (const w of (Array.isArray(body.waypoints) ? body.waypoints.slice(0, 6) : [])) {
    const p = await resolvePlace(w, start);
    if (p && haversineKm(start, p) < 40) waypoints.push(p); else notFound.push(typeof w === 'string' ? w : (w?.text || w?.name || ''));
  }
  const km = Number(body.km) > 0 ? Math.min(42, Math.max(0.8, Number(body.km))) : null;
  const loop = body.loop !== false;
  try {
    let route;
    if (!waypoints.length) {
      if (!km) return json(res, 400, { error: true, reason: 'Cần số km hoặc ít nhất một điểm muốn đi qua' });
      route = await roundTripBest(start, km, Math.max(0, Math.round(Number(body.seed) || 0)));
    } else {
      route = await routeThrough(loop ? [start, ...waypoints, start] : [start, ...waypoints]);
    }
    return json(res, 200, { ok: true, start, waypoints, notFound, loop, targetKm: km, ...route });
  } catch (e) {
    return json(res, 502, { error: true, reason: e.message, start, waypoints, notFound });
  }
}

/* ---------- V9: Tài khoản người chạy + Google Sheet ---------- */
const SHEETS_WEBAPP_URL = (process.env.SHEETS_WEBAPP_URL || '').trim();
const SHEETS_SECRET = (process.env.SHEETS_SECRET || '').trim();
const SESSION_SECRET = (process.env.SESSION_SECRET || '').trim() || crypto.createHash('sha256').update(`airun:${SHEETS_SECRET}:${OPENAI_API_KEY}:${ADMIN_TOKEN}`).digest('hex');
const accountsEnabled = () => Boolean(SHEETS_WEBAPP_URL && SHEETS_SECRET);

async function sheetsCall(payload, timeout = 12000) {
  if (!accountsEnabled()) throw Object.assign(new Error('Chưa kết nối Google Sheet'), { status: 503 });
  const r = await fetchWithTimeout(SHEETS_WEBAPP_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret: SHEETS_SECRET, ...payload }), redirect: 'follow' }, timeout);
  const text = await r.text();
  let j; try { j = JSON.parse(text); } catch { throw Object.assign(new Error('Google Sheet trả về sai định dạng (kiểm tra lại Deploy Apps Script)'), { status: 502 }); }
  if (j.error === 'unauthorized') throw Object.assign(new Error('Sai SHEETS_SECRET (khác với AIRUN_SECRET trong Apps Script)'), { status: 502 });
  return j;
}
const b64u = buf => Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const fromB64u = s => Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
function signToken(user) {
  const payload = b64u(JSON.stringify({ id: user.id, ten: user.ten, exp: Date.now() + 60 * 24 * 3600 * 1000 }));
  const sig = b64u(crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest());
  return `${payload}.${sig}`;
}
function verifyToken(req) {
  const h = String(req.headers.authorization || '');
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expect = b64u(crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest());
  if (sig.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try { const d = JSON.parse(fromB64u(payload).toString('utf8')); return d.exp > Date.now() ? { id: d.id, ten: d.ten } : null; } catch { return null; }
}
function nameKey(name) {
  return String(name || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
}
function cleanName(name) { return String(name || '').replace(/\s+/g, ' ').trim().slice(0, 30); }
function hashPin(pin, salt) { return crypto.scryptSync(String(pin), salt, 32).toString('hex'); }

async function handleRegister(req, res) {
  if (!accountsEnabled()) return json(res, 503, { error: true, reason: 'Máy chủ chưa kết nối Google Sheet' });
  if (rateLimited(req, 'register', 10, 60 * 60 * 1000)) return json(res, 429, { error: true, reason: 'Tạo tài khoản quá nhiều lần, thử lại sau.' });
  let body; try { body = await readBody(req, 4096); } catch (e) { return json(res, 400, { error: true, reason: e.message }); }
  const ten = cleanName(body.name), pin = String(body.pin || '');
  if (ten.length < 2 || !/^[\p{L}\p{N} ._-]+$/u.test(ten)) return json(res, 400, { error: true, reason: 'Tên người chạy cần 2–30 ký tự (chữ, số, dấu cách)' });
  if (!/^\d{4,6}$/.test(pin)) return json(res, 400, { error: true, reason: 'Mã PIN gồm 4–6 chữ số' });
  const salt = crypto.randomBytes(16).toString('hex');
  const user = { id: `u_${crypto.randomBytes(6).toString('hex')}`, ten, ten_khoa: nameKey(ten), pin_hash: hashPin(pin, salt), salt };
  try {
    const r = await sheetsCall({ action: 'register', user });
    if (!r.ok) return json(res, r.error === 'name_taken' ? 409 : 502, { error: true, reason: r.error === 'name_taken' ? 'Tên này đã có người dùng, hãy chọn tên khác' : `Không tạo được tài khoản (${r.error})` });
    return json(res, 200, { ok: true, token: signToken(user), user: { id: user.id, ten }, profile: buildProfile({}) });
  } catch (e) { return json(res, e.status || 502, { error: true, reason: e.message }); }
}
async function handleLogin(req, res) {
  if (!accountsEnabled()) return json(res, 503, { error: true, reason: 'Máy chủ chưa kết nối Google Sheet' });
  let body; try { body = await readBody(req, 4096); } catch (e) { return json(res, 400, { error: true, reason: e.message }); }
  const key = nameKey(body.name), pin = String(body.pin || '');
  if (rateLimited(req, `login:${key}`, 8, 10 * 60 * 1000)) return json(res, 429, { error: true, reason: 'Nhập sai quá nhiều lần, đợi 10 phút nhé.' });
  try {
    const r = await sheetsCall({ action: 'getUser', ten_khoa: key });
    if (!r.ok || !r.user) return json(res, 401, { error: true, reason: 'Sai tên hoặc mã PIN' });
    const expect = Buffer.from(String(r.user.pin_hash)), got = Buffer.from(hashPin(pin, String(r.user.salt)));
    if (expect.length !== got.length || !crypto.timingSafeEqual(expect, got)) return json(res, 401, { error: true, reason: 'Sai tên hoặc mã PIN' });
    const user = { id: String(r.user.id), ten: String(r.user.ten) };
    const [, hist] = await Promise.all([sheetsCall({ action: 'touch', id: user.id }).catch(() => null), sheetsCall({ action: 'history', id: user.id, limit: 60 }).catch(() => null)]);
    return json(res, 200, { ok: true, token: signToken(user), user, history: hist?.history || {}, profile: buildProfile(hist?.history || {}) });
  } catch (e) { return json(res, e.status || 502, { error: true, reason: e.message }); }
}
async function handleMe(req, res) {
  const user = verifyToken(req);
  if (!user) return json(res, 401, { error: true, reason: 'Phiên đăng nhập hết hạn' });
  try {
    const hist = await sheetsCall({ action: 'history', id: user.id, limit: 60 });
    return json(res, 200, { ok: true, user, history: hist.history || {}, profile: buildProfile(hist.history || {}) });
  } catch (e) { return json(res, e.status || 502, { error: true, reason: e.message, user }); }
}

const num = (v, d = null) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const str = (v, n = 200) => String(v ?? '').slice(0, n);
function rowFor(kind, d, user) {
  const base = { thoi_diem: new Date().toISOString(), nguoi_chay_id: user?.id || '', ten: user?.ten || '' };
  if (kind === 'run') return ['buoi_chay', { ...base, ma_buoi: str(d.id, 40), khu_vuc: str(d.area, 60), km: num(d.distance), thoi_gian_giay: num(d.durationSec), pace: str(d.pace, 10), diem_airun: num(d.score), aqi: num(d.aqi), cam_giac_c: num(d.feels), danh_gia: str(d.verdict, 20), ghi_chu: str(d.note, 300), nguon: str(d.source || 'gps', 20) }];
  if (kind === 'plan') return ['ke_hoach', { ...base, ma: str(d.id, 40), khu_vuc: str(d.area, 60), gio_chay: str(d.time, 8), thoi_luong_phut: num(d.duration), km_du_kien: num(d.distance), pace: str(d.pace, 10), cuong_do: str(d.intensity, 10), nhom_nhay_cam: d.sensitive ? 'có' : 'không', quyet_dinh: str(d.decision, 30), diem_airun: num(d.score), aqi: num(d.aqi), nhiet_do: num(d.temp), ghi_chu: str(d.note, 300) }];
  return null;
}
async function handleLog(req, res) {
  const user = verifyToken(req);
  if (!user) return json(res, 401, { error: true, reason: 'Cần đăng nhập' });
  if (rateLimited(req, `log:${user.id}`, 60, 10 * 60 * 1000)) return json(res, 429, { error: true, reason: 'Quá nhiều yêu cầu' });
  let body; try { body = await readBody(req, 16 * 1024); } catch (e) { return json(res, 400, { error: true, reason: e.message }); }
  const mapped = rowFor(body.kind, body.data || {}, user);
  if (!mapped) return json(res, 400, { error: true, reason: 'Loại dữ liệu không hợp lệ' });
  try { const r = await sheetsCall({ action: 'append', tab: mapped[0], row: mapped[1] }); return json(res, r.ok ? 200 : 502, r.ok ? { ok: true } : { error: true, reason: r.error }); }
  catch (e) { return json(res, e.status || 502, { error: true, reason: e.message }); }
}
async function handleAppFeedback(req, res) {
  if (rateLimited(req, 'appfb', 10, 10 * 60 * 1000)) return json(res, 429, { error: true, reason: 'Gửi quá nhiều góp ý, thử lại sau.' });
  let body; try { body = await readBody(req, 8192); } catch (e) { return json(res, 400, { error: true, reason: e.message }); }
  const user = verifyToken(req);
  const stars = Math.min(5, Math.max(1, Math.round(num(body.stars, 0) || 0)));
  if (!num(body.stars)) return json(res, 400, { error: true, reason: 'Hãy chọn số sao' });
  const row = { thoi_diem: new Date().toISOString(), nguoi_chay_id: user?.id || '', ten: user?.ten || str(body.name, 30), so_sao: stars, de_dung_1_5: num(body.easy), huu_ich_1_5: num(body.useful), tinh_nang_thich: str(body.liked, 120), gop_y: str(body.text, 800), tab: str(body.tab, 20), thiet_bi: /Mobi|Android|iPhone/i.test(String(req.headers['user-agent'] || '')) ? 'điện thoại' : 'máy tính' };
  if (!accountsEnabled()) return json(res, 200, { ok: true, stored: false });
  try { const r = await sheetsCall({ action: 'append', tab: 'gop_y', row }); return json(res, 200, { ok: true, stored: Boolean(r.ok) }); }
  catch (e) { return json(res, 200, { ok: true, stored: false, reason: e.message }); }
}
async function sheetsAppendQuiet(tab, row, timeout = 3500) {
  if (!accountsEnabled()) return false;
  try { const r = await Promise.race([sheetsCall({ action: 'append', tab, row }, timeout), new Promise(r => setTimeout(() => r({ ok: false }), timeout))]); return Boolean(r?.ok); } catch { return false; }
}

/* Hồ sơ thói quen chạy (tính trên máy chủ từ lịch sử trong Sheet) → đưa cho AI để cá nhân hoá. */
function paceToMin(p) { const m = String(p || '').match(/^(\d+):(\d{1,2})$/); return m ? Number(m[1]) + Number(m[2]) / 60 : null; }
function minToPace(v) { if (!Number.isFinite(v)) return null; const m = Math.floor(v), s = Math.round((v - m) * 60); return `${m}:${String(s === 60 ? 0 : s).padStart(2, '0')}`; }
function modeOf(arr) { const c = new Map(); arr.forEach(v => { if (v !== null && v !== undefined && v !== '') c.set(v, (c.get(v) || 0) + 1); }); let best = null, n = 0; c.forEach((k, v) => { if (k > n) { n = k; best = v; } }); return best; }
function vnHour(iso) { const d = new Date(iso); return Number.isFinite(d.getTime()) ? Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', hourCycle: 'h23' }).format(d)) : null; }
function buildProfile(h) {
  const runs = (h.buoi_chay || []).filter(r => num(r.km, 0) > 0.05);
  const plans = h.ke_hoach || [], fb = h.danh_gia || [];
  const now = Date.now();
  const kms = runs.map(r => num(r.km, 0));
  const paces = runs.map(r => paceToMin(r.pace)).filter(Number.isFinite);
  const startHours = runs.map(r => { const end = new Date(r.thoi_diem).getTime(); return Number.isFinite(end) ? vnHour(new Date(end - num(r.thoi_gian_giay, 0) * 1000).toISOString()) : null; }).filter(v => v !== null);
  const planHours = plans.map(p => Number(String(p.gio_chay || '').slice(0, 2))).filter(Number.isFinite);
  const last28 = runs.filter(r => now - new Date(r.thoi_diem).getTime() < 28 * 864e5);
  const verdicts = fb.map(f => f.danh_gia);
  return {
    total_runs: runs.length,
    total_km: Math.round(kms.reduce((a, b) => a + b, 0) * 10) / 10,
    avg_km: runs.length ? Math.round(kms.reduce((a, b) => a + b, 0) / runs.length * 10) / 10 : null,
    longest_km: runs.length ? Math.max(...kms) : null,
    avg_pace: paces.length ? minToPace(paces.reduce((a, b) => a + b, 0) / paces.length) : null,
    usual_start_hour: modeOf(startHours) ?? modeOf(planHours),
    favorite_area: modeOf(runs.map(r => r.khu_vuc).concat(plans.map(p => p.khu_vuc))),
    runs_last_28_days: last28.length,
    km_last_28_days: Math.round(last28.reduce((a, r) => a + num(r.km, 0), 0) * 10) / 10,
    last_run: runs[0] ? { date: String(runs[0].thoi_diem).slice(0, 10), km: num(runs[0].km), pace: runs[0].pace || null } : null,
    plans_saved: plans.length,
    usual_intensity: modeOf(plans.map(p => p.cuong_do)),
    feedback: { total: fb.length, dung: verdicts.filter(v => v === 'dung').length, qua_khat_khe: verdicts.filter(v => v === 'qua_khat_khe').length, qua_de_dai: verdicts.filter(v => v === 'qua_de_dai').length },
    recent_notes: fb.map(f => str(f.ghi_chu, 120)).filter(Boolean).slice(0, 3)
  };
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
      return json(res, 200, { version: VERSION, server: true, ai: Boolean(OPENAI_API_KEY), aiModel: OPENAI_API_KEY ? OPENAI_MODEL : null, routing: Boolean(GRAPHHOPPER_API_KEY), mapboxToken: MAPBOX_PUBLIC_TOKEN || '', googleMapsKey: GOOGLE_MAPS_BROWSER_KEY || '', googlePlaces: Boolean(GOOGLE_MAPS_SERVER_KEY), routePlan: true, accounts: accountsEnabled(), feedback: true, feedbackPersistent: Boolean(FEEDBACK_WEBHOOK_URL) || accountsEnabled() });
    }
    let m = p.match(/^\/api\/(weather|air)\/(-?[\d.]+)\/(-?[\d.]+)\/?$/);
    if (m && req.method === 'GET') return handleEnv(res, m[1], m[2], m[3]);
    if (p === '/api/route' && req.method === 'GET') return handleRoute(res, url);
    if (p === '/api/route/plan' && req.method === 'POST') return handleRoutePlan(req, res);
    if (p === '/api/places' && req.method === 'GET') return handlePlaces(res, url);
    if (p === '/api/account/register' && req.method === 'POST') return handleRegister(req, res);
    if (p === '/api/account/login' && req.method === 'POST') return handleLogin(req, res);
    if (p === '/api/account/me' && req.method === 'GET') return handleMe(req, res);
    if (p === '/api/account/log' && req.method === 'POST') return handleLog(req, res);
    if (p === '/api/app-feedback' && req.method === 'POST') return handleAppFeedback(req, res);
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
