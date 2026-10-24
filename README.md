# AIRUN Đà Nẵng · V9.0 Google Maps + AI ở mọi tab

Trang web hỗ trợ người chạy bộ ở Đà Nẵng: kiểm tra thời tiết, AQI, UV theo giờ → chấm điểm thuận lợi bằng công thức minh bạch → **AI Coach giải thích bằng lời, trả lời câu hỏi và làm giúp (tạo cung, đổi kế hoạch, mở tab)** → **mô tả cung chạy bằng lời, AI tìm địa điểm và vẽ đường trên Google Maps** → chạy với GPS → **đánh giá khuyến nghị sau buổi chạy** → dữ liệu lưu vào **tài khoản người chạy (Google Sheet)** để AI gợi ý cá nhân hoá và lập kế hoạch tuần.

Hướng dẫn cài đặt Google Maps, Google Sheet và biến môi trường: **[SETUP_V9.md](SETUP_V9.md)**.

## Cấu trúc
| File | Vai trò |
|---|---|
| `index.html` | Toàn bộ giao diện + logic phía trình duyệt |
| `server.js` | Máy chủ Node (không cần thư viện ngoài): phục vụ trang, proxy Open-Meteo, AI Coach (OpenAI), Google Places/Routes, GraphHopper, tài khoản, phản hồi |
| `api/index.js`, `vercel.json` | Chạy cùng code trên Vercel (serverless) |
| `apps-script/Code.gs` | Apps Script dán vào Google Sheet để lưu người chạy, buổi chạy, kế hoạch, đánh giá, góp ý |
| `tests/run-tests.js` | Kiểm thử nhanh: `npm test` |

## Chạy trên máy
```bash
node server.js            # mở http://localhost:10000
OPENAI_API_KEY=sk-... GOOGLE_MAPS_BROWSER_KEY=AIza... node server.js
```

## Biến môi trường
| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `OPENAI_API_KEY` | Có (để bật AI) | Khóa OpenAI, chỉ nằm trên máy chủ |
| `OPENAI_MODEL` | Không | Mặc định `gpt-4.1-mini`; tự thử `gpt-4o-mini` nếu model không dùng được |
| `GOOGLE_MAPS_BROWSER_KEY` | Không (khuyên dùng) | Khóa Maps JavaScript API, **giới hạn theo website**. Thiếu thì dùng OpenFreeMap |
| `GOOGLE_MAPS_SERVER_KEY` | Không (khuyên dùng) | Khóa Places API (New) + Routes API, chỉ nằm trên máy chủ. Dùng để tìm địa điểm và vẽ đường đi bộ |
| `SHEETS_WEBAPP_URL` | Không | URL `/exec` của Apps Script → bật tài khoản người chạy và lưu dữ liệu vào Google Sheet |
| `SHEETS_SECRET` | Cùng với trên | Chuỗi bí mật, phải giống `AIRUN_SECRET` trong Apps Script |
| `SESSION_SECRET` | Không | Khóa ký phiên đăng nhập (nếu thiếu sẽ tự suy ra từ `SHEETS_SECRET`) |
| `GRAPHHOPPER_API_KEY` | Không | Tạo cung vòng bằng GraphHopper. Thiếu thì dùng Google Routes, rồi Valhalla (OpenStreetMap) |
| `MAPBOX_PUBLIC_TOKEN` | Không | Token `pk.` (chỉ dùng khi không có Google Maps) |
| `FEEDBACK_WEBHOOK_URL`, `ADMIN_TOKEN` | Không | Cách lưu phản hồi cũ (V8), vẫn hoạt động |

## API
- `GET /api/config` – tính năng nào đang bật (không trả khóa bí mật; khóa Google cho trình duyệt là khóa công khai đã giới hạn website)
- `GET /api/weather/:lat/:lon`, `GET /api/air/:lat/:lon` – Open-Meteo, có dự báo theo giờ
- `POST /api/coach` – `mode: plan | chat | agent | route_intent | weekly | run | live`
- `GET /api/places?q=&lat=&lon=` – tìm địa điểm (Google Places, dự phòng OpenStreetMap)
- `GET /api/route?lat=&lon=&km=&seed=` – cung vòng theo số km
- `POST /api/route/plan` – `{start, waypoints[], km, loop}` → cung chạy qua các điểm
- `POST /api/account/register | login`, `GET /api/account/me`, `POST /api/account/log` – tài khoản tên + mã PIN
- `POST /api/feedback`, `POST /api/app-feedback`, `GET /api/feedback/summary`

## Deploy lên Vercel
Repo đã kết nối Vercel: mỗi lần push lên `main` sẽ tự deploy. Thêm/đổi biến môi trường ở Vercel → Settings → Environment Variables rồi **Redeploy**. Kiểm tra `https://airun-da-nang.vercel.app/api/config`.
