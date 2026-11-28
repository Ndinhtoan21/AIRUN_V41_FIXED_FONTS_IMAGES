# AIRUN V10.0 — Chặng 2 vòng Chung kết: dữ liệu thật và an toàn truy cập

Đề: "Cần phân biệt dữ liệu thời tiết thực với dữ liệu minh họa; thông tin truy cập dịch vụ bản đồ đang có thể bị lộ từ phía trình duyệt. Rà soát nguồn và thời điểm cập nhật dữ liệu; bảo vệ thông tin bí mật ở máy chủ, hạn chế chia sẻ tọa độ/lịch sử GPS."

## 1. Phân biệt dữ liệu thật và dữ liệu minh họa
- Bỏ hẳn 23 bộ số minh họa (`mock`) trong `js/app.js`. Khi chưa lấy được dữ liệu thật, mọi chỉ số là `null`, giao diện hiện "—" và nhãn "Chưa có dữ liệu thật". Không còn đường nào để số minh họa lọt vào điểm chạy.
- Máy chủ gắn `_meta` vào mỗi gói thời tiết / không khí: tên nguồn (Open-Meteo Forecast API, Open-Meteo Air Quality API), cách tạo số liệu (mô hình dự báo, không phải trạm đo), `observedAt` (mốc giờ của số liệu), `fetchedAt` (lúc máy chủ AIRUN lấy), `cached` (có phải bản lưu tạm tối đa 10 phút của máy chủ).
- Thẻ "Bây giờ" có nhãn trạng thái: Dữ liệu thật / Dữ liệu thật đã lưu / Dữ liệu cũ (quá 90 phút) / Chưa có dữ liệu thật; dòng "Nguồn: Open-Meteo · thời tiết lúc …, không khí lúc … · cập nhật … phút trước" (tự làm mới mỗi phút); bấm vào để xem chi tiết từng nguồn và liên kết tài liệu nguồn.

## 2. Bảo vệ thông tin bí mật ở máy chủ
- `/api/config` không còn trả `mapboxToken` và `googleMapsKey`. Trình duyệt không còn tải Google Maps JavaScript bằng khoá, không dùng token Mapbox; bản đồ dùng OpenFreeMap (không cần khoá). Tìm địa điểm, vẽ cung đường vẫn đi qua máy chủ, khoá Google/GraphHopper nằm ở máy chủ (header `X-Goog-Api-Key`).
- Gỡ hẳn mã bản đồ Google trên trình duyệt trong `js/app.js` (khoảng 130 dòng, không còn `google.maps` hay đường dẫn `maps/api/js?key=`).
- Lớp chặn cuối trong `server.js` (`scrubSecrets`): mọi phản hồi JSON được quét, nếu lỡ chứa giá trị của biến bí mật (OpenAI, Google, GraphHopper, Mapbox, Sheets, SESSION_SECRET…) hoặc `key=…` trong URL thì thay bằng `***`.

## 3. Hạn chế chia sẻ tọa độ và lịch sử GPS
- Toạ độ gửi lên máy chủ để lấy thời tiết chỉ còn 2 chữ số thập phân (~1 km); máy chủ làm tròn thêm một lần trước khi hỏi Open-Meteo. AI Coach chỉ nhận vị trí gần đúng ~1 km (trước là ~100 m) và tên khu vực.
- Vị trí GPS gần nhất lưu trên máy chỉ còn ~100 m.
- Bản đồ hành trình vẫn chỉ lưu trên máy (không gửi lên máy chủ), nay tự xoá sau 60 ngày; thêm nút "Xoá lịch sử GPS" trong Nhật ký.
- Xuất GPX có "vùng riêng tư": mặc định ẩn 200 m quanh điểm bắt đầu và kết thúc (chọn được Không ẩn / 200 m / 500 m), ghi rõ trong file.

## 4. Kiểm thử
- `tests/security-check.js` (6 kiểm tra): quét 24 tệp phía trình duyệt với 8 mẫu khoá; chạy máy chủ với đủ khoá giả để chứng minh `/api/config` không lộ khoá; thử lớp chặn cuối; kiểm tra `_meta` nguồn + thời điểm và bản lưu tạm; kiểm tra toạ độ gửi Open-Meteo đã làm tròn; kiểm tra không còn số minh họa.
- Chạy: `npm test` (gồm `tests/run-tests.js` và `tests/security-check.js`).

## Việc chủ dự án làm trên Vercel
- Có thể xoá biến `GOOGLE_MAPS_BROWSER_KEY` (không còn dùng). Giữ `GOOGLE_MAPS_SERVER_KEY` và nên giới hạn khoá này chỉ cho Places API và Routes API trong Google Cloud.
