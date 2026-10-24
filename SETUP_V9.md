# AIRUN V9 · Cài đặt Google Maps, Google Sheet và tài khoản người chạy

Code đã sẵn sàng. Chỉ cần làm 3 việc dưới đây một lần rồi bấm **Redeploy** trên Vercel. Việc nào chưa làm thì AIRUN vẫn chạy bằng phương án dự phòng (OpenFreeMap, lưu trên máy).

## Có gì mới trong V9
- **Google Maps** cho bản đồ cung chạy và bản đồ GPS. Nếu khóa lỗi, trang tự chuyển sang OpenFreeMap.
- **Chọn điểm xuất phát** theo 3 cách: tìm tên địa điểm, chạm trên bản đồ hoặc dùng GPS.
- **AI tạo cung theo mô tả**, ví dụ “5 km từ Cầu Rồng qua Cầu Tình Yêu rồi quay lại”. AI tìm từng địa điểm và vẽ đường đi bộ thật.
- **AI Coach ở mọi tab** (nút “Hỏi AI”). AI có thể làm giúp ba việc: tạo cung, đổi giờ hay thời lượng chạy, mở đúng tab.
- **Tài khoản người chạy** bằng tên và mã PIN 4–6 số, không cần email. Buổi chạy, kế hoạch và đánh giá được lưu vào Google Sheet.
- **AI gợi ý theo thói quen** của từng người và lập **kế hoạch chạy 7 ngày**.
- **Góp ý về app** (chấm sao, mức dễ dùng, mức hữu ích) được lưu vào Sheet.
- Chữ to và rõ hơn, đồng bộ trên toàn trang.

---

## 1. Google Maps (Google Cloud Console)
1. Vào https://console.cloud.google.com → tạo project, ví dụ “AIRUN”.
2. **Billing**: gắn thẻ thanh toán. Đây là điều kiện bắt buộc của Google Maps. Mỗi dịch vụ có hạn mức miễn phí hàng tháng; với lượng dùng demo và thuyết trình thì không vượt.
3. **APIs & Services → Library**, bật 3 API:
   - Maps JavaScript API
   - Places API (New)
   - Routes API
4. **APIs & Services → Credentials → Create credentials → API key**, tạo **2 khóa**:

   | Khóa | Application restrictions | API restrictions | Dán vào Vercel |
   |---|---|---|---|
   | Khóa trình duyệt | *Websites*: `https://airun-da-nang.vercel.app/*` (thêm `http://localhost:10000/*` nếu thử trên máy) | Chỉ **Maps JavaScript API** | `GOOGLE_MAPS_BROWSER_KEY` |
   | Khóa máy chủ | *None* (Vercel không có IP cố định) | Chỉ **Places API (New)** và **Routes API** | `GOOGLE_MAPS_SERVER_KEY` |

5. **Chặn chi tiêu ngoài ý muốn** (khuyên làm):
   - **APIs & Services → Maps JavaScript API → Quotas**: *Map loads per day* đặt khoảng **300**.
   - **Places API (New)**: *Text Search requests per day* khoảng **150**.
   - **Routes API**: *Compute Routes requests per day* khoảng **300**.
   - **Billing → Budgets & alerts**: tạo ngân sách **1 USD** để được báo qua email.

**Cách AIRUN tính lượt:**
- Mỗi lần mở tab **Chạy** tạo 2 bản đồ (cung chạy + GPS), tức 2 lượt *Dynamic Maps*. Kéo, zoom hay vẽ lại đường đều không tính thêm.
- Mỗi lần bấm “Tạo cung” hoặc “Tạo cung khác” tốn 1–3 lượt *Compute Routes*.
- Mỗi lần AI tạo cung theo mô tả tốn thêm 1 lượt *Text Search* cho mỗi địa điểm được nhắc tới.
- Kết quả tìm địa điểm được máy chủ lưu 24 giờ, nên tìm lại cùng một địa điểm không tốn lượt.

## 2. Google Sheet lưu dữ liệu người chạy
Sheet đã được tạo sẵn: **AIRUN – Dữ liệu người chạy**, gồm các tab `nguoi_chay`, `buoi_chay`, `ke_hoach`, `danh_gia`, `gop_y`, `nhat_ky_ai` và `huong_dan`.
https://docs.google.com/spreadsheets/d/14vc1W-sBSAJgaUDgUbEVgizVWh4a5Q05YimTAMg5p3w/edit

1. Mở Sheet → **Tiện ích mở rộng → Apps Script**.
2. Xóa code mẫu, dán toàn bộ file [`apps-script/Code.gs`](apps-script/Code.gs), rồi bấm **Lưu**.
3. Mở **⚙ Cài đặt dự án → Thuộc tính tập lệnh → Thêm thuộc tính**:
   - Tên: `AIRUN_SECRET`
   - Giá trị: một chuỗi dài tự đặt, ví dụ 30 ký tự chữ + số ngẫu nhiên. Đừng chia sẻ chuỗi này.
4. Bấm **Triển khai → Tùy chọn triển khai mới → Ứng dụng web**:
   - Thực thi dưới dạng: **Tôi**
   - Ai có quyền truy cập: **Bất kỳ ai**
   - Bấm Triển khai, cấp quyền, rồi sao chép URL kết thúc bằng `/exec`.
5. Khi sửa `Code.gs` về sau: **Triển khai → Quản lý triển khai → ✎ → Phiên bản mới**. Làm vậy thì URL không đổi.

> Mã PIN không bao giờ được lưu dạng gốc: máy chủ AIRUN mã hóa (scrypt) trước khi ghi vào Sheet. Mọi yêu cầu tới Apps Script phải kèm đúng `AIRUN_SECRET`.

## 3. Biến môi trường trên Vercel
Vào Vercel → project **airun-da-nang** → **Settings → Environment Variables**, thêm cho cả *Production* và *Preview*:

| Biến | Giá trị |
|---|---|
| `GOOGLE_MAPS_BROWSER_KEY` | Khóa trình duyệt ở bước 1 |
| `GOOGLE_MAPS_SERVER_KEY` | Khóa máy chủ ở bước 1 |
| `SHEETS_WEBAPP_URL` | URL `/exec` ở bước 2 |
| `SHEETS_SECRET` | Đúng chuỗi `AIRUN_SECRET` ở bước 2 |
| `SESSION_SECRET` | Một chuỗi dài ngẫu nhiên khác, dùng để ký phiên đăng nhập |
| `OPENAI_API_KEY` | Khóa OpenAI **mới**. Khóa hiện tại đang bị OpenAI báo không hợp lệ |

Sau đó vào **Deployments → … → Redeploy**.

## 4. Kiểm tra
Mở https://airun-da-nang.vercel.app/api/config, cần thấy:
- `"ai": true`
- `"googleMapsKey": "AIza…"` (đây là khóa trình duyệt đã giới hạn website, công khai là bình thường)
- `"googlePlaces": true`
- `"accounts": true`

Sau đó thử trên trang:
1. Mở tab **Chạy** và kiểm tra bản đồ Google hiện lên.
2. Gõ “Cầu Rồng” vào ô điểm xuất phát.
3. Bấm “AI tạo cung theo mô tả”.
4. Tạo một tài khoản thử, lưu một kế hoạch, rồi mở Sheet xem tab `ke_hoach` có dòng mới.

Nếu bản đồ hiện thông báo “Google Maps chưa dùng được”, kiểm tra 3 điều:
- Khóa trình duyệt đã bật **Maps JavaScript API**.
- Phần giới hạn website khớp đúng `https://airun-da-nang.vercel.app/*`.
- Billing đã được bật.
