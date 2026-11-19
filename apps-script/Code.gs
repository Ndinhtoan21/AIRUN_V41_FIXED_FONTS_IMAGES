/**
 * AIRUN – Apps Script lưu dữ liệu vào Google Sheet "AIRUN – Dữ liệu người chạy".
 *
 * Cách cài (làm 1 lần):
 * 1. Mở Google Sheet → Tiện ích mở rộng (Extensions) → Apps Script.
 * 2. Xoá code mẫu, dán toàn bộ file này vào, bấm Lưu.
 * 3. Bên trái chọn ⚙ Cài đặt dự án → Thuộc tính tập lệnh (Script properties) → Thêm:
 *      Tên: AIRUN_SECRET   Giá trị: (một chuỗi bí mật dài, giống hệt biến SHEETS_SECRET trên Vercel)
 * 4. Bấm Triển khai (Deploy) → Tùy chọn triển khai mới → Loại: Ứng dụng web
 *      Thực thi dưới dạng: Tôi (Me)   ·   Ai có quyền truy cập: Bất kỳ ai (Anyone)
 *    → Triển khai → cấp quyền → sao chép URL kết thúc bằng /exec.
 * 5. Trên Vercel thêm biến SHEETS_WEBAPP_URL = URL /exec vừa sao chép, rồi Redeploy.
 *
 * Bảo mật: mọi yêu cầu phải kèm đúng AIRUN_SECRET. Mã PIN chỉ lưu dạng đã mã hoá (do máy chủ AIRUN tạo).
 */

const TABS = ['nguoi_chay', 'buoi_chay', 'ke_hoach', 'danh_gia', 'gop_y', 'nhat_ky_ai', 'tin_tuc', 'su_kien', 'dang_ky', 'ban_tin_ngay'];
// V9.7: các tab này được tạo tự động (kèm tiêu đề cột) khi cần; tab cũ thiếu cột sẽ được thêm cột ở cuối.
const AUTO_TABS = {
  tin_tuc: ['id', 'ngay', 'khu_vuc', 'tieu_de', 'noi_dung', 'hinh_anh', 'lien_ket', 'hien', 'nguoi_dang', 'tao_luc'],
  su_kien: ['id', 'ngay', 'gio', 'khu_vuc', 'dia_diem', 'tieu_de', 'mo_ta', 'cu_ly_km', 'so_cho', 'lien_he', 'hinh_anh', 'lien_ket', 'hien', 'nguoi_dang', 'tao_luc'],
  dang_ky: ['thoi_diem', 'su_kien_id', 'nguoi_chay_id', 'ten', 'trang_thai'],
  ban_tin_ngay: ['ngay', 'noi_dung_json', 'tao_luc']
};
const HISTORY_TABS = ['buoi_chay', 'ke_hoach', 'danh_gia'];

function doGet() {
  return out({ ok: true, service: 'AIRUN Sheets', time: new Date().toISOString() });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'bad_json' }); }
  const secret = PropertiesService.getScriptProperties().getProperty('AIRUN_SECRET');
  if (!secret || req.secret !== secret) return out({ ok: false, error: 'unauthorized' });
  try {
    switch (req.action) {
      case 'ping': return out({ ok: true });
      case 'register': return out(register(req.user));
      case 'getUser': return out(getUser(req.ten_khoa));
      case 'touch': return out(touch(req.id));
      case 'append': return out(append(req.tab, req.row));
      case 'history': return out(history(req.id, Number(req.limit) || 60));
      case 'community': return out(community(Number(req.days) || 70));
      case 'role': return out(role(req.id));
      case 'setHidden': return out(setHidden(req.tab, req.id, req.hidden !== false));
      case 'putBulletin': return out(putBulletin(req.ngay, req.json));
      default: return out({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return out({ ok: false, error: String(err && err.message || err) });
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet(name) {
  if (TABS.indexOf(name) < 0) throw new Error('tab_not_allowed');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  const want = AUTO_TABS[name];
  if (!sh) {
    if (!want) throw new Error('missing_tab_' + name);
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, want.length).setValues([want]).setFontWeight('bold');
    sh.setFrozenRows(1);
    return sh;
  }
  if (want) {
    const head = headers(sh);
    const miss = want.filter(h => head.indexOf(h) < 0);
    if (miss.length) sh.getRange(1, head.length + 1, 1, miss.length).setValues([miss]).setFontWeight('bold');
  }
  return sh;
}

function headers(sh) {
  const n = sh.getLastColumn();
  if (n < 1) return [];
  return sh.getRange(1, 1, 1, n).getValues()[0].map(String);
}

function rowsAsObjects(sh) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  const head = headers(sh);
  return sh.getRange(2, 1, last - 1, head.length).getValues().map(r => {
    const o = {}; head.forEach((h, i) => { o[h] = r[i]; }); return o;
  });
}

function append(tab, row) {
  if (tab === 'nguoi_chay') throw new Error('use_register');
  const sh = sheet(tab);
  const head = headers(sh);
  // Chặn công thức (=, +, -, @) để không bị chèn công thức vào Sheet.
  const safe = v => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
    return v;
  };
  sh.appendRow(head.map(h => safe(row ? row[h] : '')));
  return { ok: true };
}

function register(user) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet('nguoi_chay');
    const exists = rowsAsObjects(sh).some(r => String(r.ten_khoa) === String(user.ten_khoa));
    if (exists) return { ok: false, error: 'name_taken' };
    const head = headers(sh);
    const row = Object.assign({}, user, { tao_luc: new Date().toISOString(), dang_nhap_cuoi: new Date().toISOString(), so_lan_dang_nhap: 1 });
    sh.appendRow(head.map(h => row[h] === undefined ? '' : row[h]));
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function getUser(tenKhoa) {
  const sh = sheet('nguoi_chay');
  const u = rowsAsObjects(sh).find(r => String(r.ten_khoa) === String(tenKhoa));
  if (!u) return { ok: false, error: 'not_found' };
  return { ok: true, user: { id: u.id, ten: u.ten, pin_hash: u.pin_hash, salt: u.salt } };
}

function touch(id) {
  const sh = sheet('nguoi_chay');
  const head = headers(sh);
  const idCol = head.indexOf('id'), lastCol = head.indexOf('dang_nhap_cuoi'), countCol = head.indexOf('so_lan_dang_nhap');
  const last = sh.getLastRow();
  if (last < 2) return { ok: false };
  const ids = sh.getRange(2, idCol + 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sh.getRange(i + 2, lastCol + 1).setValue(new Date().toISOString());
      const c = sh.getRange(i + 2, countCol + 1);
      c.setValue((Number(c.getValue()) || 0) + 1);
      return { ok: true };
    }
  }
  return { ok: false };
}

function history(id, limit) {
  const result = {};
  HISTORY_TABS.forEach(tab => {
    const rows = rowsAsObjects(sheet(tab)).filter(r => String(r.nguoi_chay_id) === String(id));
    result[tab] = rows.slice(-limit).reverse().map(r => {
      Object.keys(r).forEach(k => { if (r[k] instanceof Date) r[k] = r[k].toISOString(); });
      return r;
    });
  });
  return { ok: true, history: result };
}


/**
 * V9.6 – Cộng đồng: trả về các buổi chạy gần đây của mọi người (để máy chủ AIRUN xếp hạng tuần/tháng/khu vực)
 * và các tin trong tab "tin_tuc". Không trả mã PIN hay dữ liệu nhạy cảm; chỉ tên người chạy, km, thời gian, khu vực.
 * Tab "tin_tuc" được tạo tự động lần đầu. Bạn (quản trị) gõ tin vào đó: ngay | khu_vuc | tieu_de | noi_dung | lien_ket | hien
 * (cột "hien" để trống hoặc gõ "x" = hiện; gõ "an" = ẩn tin).
 */
function isoOf(v) {
  if (v instanceof Date) return v.toISOString();
  const d = new Date(v);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

function cellText(v) {
  if (v instanceof Date) {
    const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    return Utilities.formatDate(v, tz, v.getFullYear() < 1900 ? 'HH:mm' : 'yyyy-MM-dd');
  }
  return v === null || v === undefined ? '' : String(v);
}

function community(days) {
  const since = Date.now() - Math.min(120, Math.max(7, days)) * 864e5;
  const runs = rowsAsObjects(sheet('buoi_chay')).map(r => ({
    id: String(r.nguoi_chay_id || ''), ten: String(r.ten || ''), km: Number(r.km) || 0, giay: Number(r.thoi_gian_giay) || 0,
    khu_vuc: String(r.khu_vuc || ''), thoi_diem: isoOf(r.thoi_diem), ma: String(r.ma_buoi || ''), nguon: String(r.nguon || 'gps')
  })).filter(r => r.id && r.thoi_diem && new Date(r.thoi_diem).getTime() >= since);
  const shown = r => cellText(r.hien).trim().toLowerCase() !== 'an';
  const news = rowsAsObjects(sheet('tin_tuc')).filter(n => cellText(n.tieu_de).trim() && shown(n)).slice(-20).reverse().map(n => ({
    id: cellText(n.id), ngay: cellText(n.ngay), khu_vuc: cellText(n.khu_vuc), tieu_de: cellText(n.tieu_de), noi_dung: cellText(n.noi_dung), hinh_anh: cellText(n.hinh_anh), lien_ket: cellText(n.lien_ket)
  }));
  // Đăng ký sự kiện: lấy trạng thái MỚI NHẤT của từng người với từng sự kiện (tham_gia / huy).
  const latest = {};
  rowsAsObjects(sheet('dang_ky')).forEach(r => {
    const e = cellText(r.su_kien_id), u = cellText(r.nguoi_chay_id);
    if (e && u) latest[e + '|' + u] = { e: e, id: u, ten: cellText(r.ten), on: cellText(r.trang_thai) !== 'huy' };
  });
  const people = {};
  Object.keys(latest).forEach(k => { const r = latest[k]; if (r.on) (people[r.e] = people[r.e] || []).push({ id: r.id, ten: r.ten }); });
  const events = rowsAsObjects(sheet('su_kien')).filter(e => cellText(e.id) && cellText(e.tieu_de).trim() && shown(e)).slice(-40).map(e => ({
    id: cellText(e.id), ngay: cellText(e.ngay), gio: cellText(e.gio), khu_vuc: cellText(e.khu_vuc), dia_diem: cellText(e.dia_diem), tieu_de: cellText(e.tieu_de),
    mo_ta: cellText(e.mo_ta), cu_ly_km: Number(e.cu_ly_km) || 0, so_cho: Number(e.so_cho) || 0, lien_he: cellText(e.lien_he), hinh_anh: cellText(e.hinh_anh),
    lien_ket: cellText(e.lien_ket), nguoi_dang: cellText(e.nguoi_dang), nguoi: (people[cellText(e.id)] || []).slice(0, 300)
  }));
  const today = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  let bulletin = null;
  rowsAsObjects(sheet('ban_tin_ngay')).forEach(b => { if (cellText(b.ngay) === today) bulletin = cellText(b.noi_dung_json); });
  return { ok: true, runs: runs, news: news, events: events, bulletin: bulletin };
}

/* Quyền quản trị: gõ "admin" vào cột vai_tro (tab nguoi_chay) ở dòng tài khoản của bạn. Cột được tạo tự động. */
function role(id) {
  const sh = sheet('nguoi_chay');
  const head = headers(sh);
  if (head.indexOf('vai_tro') < 0) { sh.getRange(1, head.length + 1).setValue('vai_tro').setFontWeight('bold'); return { ok: true, role: '' }; }
  const u = rowsAsObjects(sh).find(r => String(r.id) === String(id));
  return { ok: true, role: u ? String(u.vai_tro || '').trim().toLowerCase() : '' };
}

function setHidden(tab, id, hidden) {
  if (tab !== 'tin_tuc' && tab !== 'su_kien') return { ok: false, error: 'tab_not_allowed' };
  const sh = sheet(tab), head = headers(sh), idCol = head.indexOf('id'), hCol = head.indexOf('hien');
  const last = sh.getLastRow();
  if (last < 2 || idCol < 0 || hCol < 0) return { ok: false, error: 'not_found' };
  const ids = sh.getRange(2, idCol + 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) { sh.getRange(i + 2, hCol + 1).setValue(hidden ? 'an' : 'x'); return { ok: true }; }
  }
  return { ok: false, error: 'not_found' };
}

/* Bản tin hằng ngày do máy chủ AIRUN tổng hợp: mỗi ngày một dòng, ghi đè nếu đã có. */
function putBulletin(ngay, json) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet('ban_tin_ngay'), day = String(ngay || '').replace(/^'/, '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return { ok: false, error: 'bad_date' };
    const rows = rowsAsObjects(sh);
    for (let i = 0; i < rows.length; i++) {
      if (cellText(rows[i].ngay) === day) { sh.getRange(i + 2, 2, 1, 2).setValues([[String(json || ''), new Date().toISOString()]]); return { ok: true }; }
    }
    sh.appendRow(["'" + day, String(json || ''), new Date().toISOString()]);
    return { ok: true };
  } finally { lock.releaseLock(); }
}
