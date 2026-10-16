# Deploy AIRUN V8 lên Render (Web Service)

V8 cần máy chủ Node để giữ khóa OpenAI/GraphHopper, nên chạy dạng **Web Service** (không phải Static Site).

## Cách 1 – Blueprint (nhanh nhất)
1. Render Dashboard → **New → Blueprint** → chọn repo này → Render đọc `render.yaml`.
2. Điền `OPENAI_API_KEY` (và `GRAPHHOPPER_API_KEY` nếu có) → **Apply**.

## Cách 2 – Tạo tay
1. **New → Web Service** → chọn repo, branch `main`.
2. Runtime **Node**, Build command `npm install --omit=dev`, Start command `node server.js`, Health check `/healthz`, Region Singapore, Plan Free.
3. Tab **Environment**: thêm `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-4.1-mini`, (tùy chọn) `GRAPHHOPPER_API_KEY`, `MAPBOX_PUBLIC_TOKEN`, `FEEDBACK_WEBHOOK_URL`, `ADMIN_TOKEN`.

## Kiểm tra sau deploy
- `https://<tên-app>.onrender.com/api/config` → `"ai": true`.
- Mở trang bằng **tab ẩn danh**: huy hiệu phải chuyển sang `DỮ LIỆU TRỰC TIẾP`, thẻ **AIRUN COACH** hiện nhãn `AI · gpt-...`.

## Lưu ý gói Free
- Web Service ngủ sau ~15 phút không có truy cập; lần mở đầu mất 30–60 giây. Trong thời gian chấm thi, dùng cron-job.org hoặc UptimeRobot gọi `https://<tên-app>.onrender.com/healthz` mỗi 10 phút.
- Ổ đĩa không lưu lâu dài → muốn giữ phản hồi người dùng thử, cấu hình `FEEDBACK_WEBHOOK_URL` tới Google Sheet:

```js
// Google Sheet → Extensions → Apps Script → dán đoạn này → Deploy → New deployment → Web app
// Execute as: Me · Who has access: Anyone → copy URL /exec vào FEEDBACK_WEBHOOK_URL trên Render
function doPost(e) {
  const r = JSON.parse(e.postData.contents);
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(['Thời điểm','Khu vực','Đánh giá','Cung đường','Nóng','Khó thở','Mệt','Điểm AIRUN','Cảm giác °C','AQI','UV','Mưa %','Gió','Km','Giây','Pace','Ghi chú','Người thử']);
  sh.appendRow([r.at, r.area, r.verdict, r.route, r.heat, r.breath, r.effort, r.score, r.conditions.feels, r.conditions.aqi, r.conditions.uv, r.conditions.rain, r.conditions.wind, r.run.distanceKm, r.run.durationSec, r.run.pace, r.note, r.tester]);
  return ContentService.createTextOutput('{"ok":true}').setMimeType(ContentService.MimeType.JSON);
}
```
