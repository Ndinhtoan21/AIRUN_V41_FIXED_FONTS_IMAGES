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

const TABS = ['nguoi_chay', 'buoi_chay', 'ke_hoach', 'danh_gia', 'gop_y', 'nhat_ky_ai'];
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
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('missing_tab_' + name);
  return sh;
}

function headers(sh) {
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
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
