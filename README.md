# AIRUN Đà Nẵng · V8.0 AI Coach

Trang web hỗ trợ người chạy bộ ở Đà Nẵng: kiểm tra thời tiết, AQI, UV theo giờ → chấm điểm thuận lợi bằng công thức minh bạch → **AI Coach giải thích bằng lời và trả lời câu hỏi** → tạo cung chạy theo số km → chạy với GPS (AI nhắc bằng giọng nói) → **đánh giá khuyến nghị sau buổi chạy** để hiệu chỉnh công thức.

## Cấu trúc
| File | Vai trò |
|---|---|
| `index.html` | Toàn bộ giao diện + logic phía trình duyệt |
| `server.js` | Máy chủ Node (không cần thư viện ngoài): phục vụ trang, proxy Open-Meteo, AI Coach (OpenAI), GraphHopper, nhận phản hồi |
| `render.yaml` | Cấu hình deploy Render Web Service |
| `tests/run-tests.js` | Kiểm thử nhanh: `npm test` |

## Chạy trên máy
```bash
node server.js            # mở http://localhost:10000
OPENAI_API_KEY=sk-... node server.js   # bật AI Coach
```

## Biến môi trường (đặt trên Render → Environment)
| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `OPENAI_API_KEY` | Có (để bật AI) | Khóa OpenAI, chỉ nằm trên máy chủ |
| `OPENAI_MODEL` | Không | Mặc định `gpt-4.1-mini`; tự thử `gpt-4o-mini` nếu model không dùng được |
| `GRAPHHOPPER_API_KEY` | Không | Tạo cung chạy vòng chính xác hơn. Thiếu thì dùng Valhalla (OpenStreetMap) |
| `MAPBOX_PUBLIC_TOKEN` | Không | Token `pk.` (giới hạn domain). Thiếu thì dùng OpenFreeMap |
| `FEEDBACK_WEBHOOK_URL` | Không | URL Google Apps Script để lưu phản hồi lâu dài vào Google Sheet (xem `DEPLOY_RENDER.md`) |
| `ADMIN_TOKEN` | Không | Tải CSV phản hồi: `/api/feedback/export?token=...` |

## API
- `GET /api/config` – tính năng nào đang bật (không trả khóa bí mật)
- `GET /api/weather/:lat/:lon`, `GET /api/air/:lat/:lon` – Open-Meteo, có dự báo theo giờ cho AQI/PM2.5/UV
- `POST /api/coach` – `mode: plan | chat | run | live`
- `GET /api/route?lat=&lon=&km=&seed=` – GraphHopper round trip (khóa trên máy chủ)
- `POST /api/feedback`, `GET /api/feedback/summary`, `GET /api/feedback/export?token=`
