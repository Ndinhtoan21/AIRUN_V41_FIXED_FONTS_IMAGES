# AIRUN Đà Nẵng V5.3 — GPS + Live Environment

AIRUN là Static Site/PWA chạy trực tiếp trong trình duyệt, không cần backend và không cần API key cho Open-Meteo.

## V5.3 tập trung vào độ ổn định
- GPS theo tọa độ thiết bị bằng Web Geolocation API.
- Running Tracker bằng `watchPosition()`.
- Quãng đường, thời gian, pace, tốc độ và độ chính xác GPS.
- Weather API và Air Quality API cập nhật độc lập, theo từng phần.
- Bảng trạng thái realtime: App / Weather API / Air API / GPS.
- Watchdog phát hiện trường hợp `app.js` không chạy.
- Service Worker V5.3 không còn trả HTML thay cho JS/CSS.
- Dữ liệu dự phòng luôn hiện ngay; dữ liệu live sẽ thay thế khi API phản hồi.
- Leaflet + OpenStreetMap cho bản đồ và lộ trình chạy.

## Render
- Service: Static Site
- Branch: main
- Root Directory: để trống
- Build Command: `echo "No build required"`
- Publish Directory: `.`
- Environment Variables: không cần

## Kiểm tra sau khi deploy
1. Mở website.
2. Quan sát 4 trạng thái dưới bảng số liệu.
3. `Ứng dụng` phải hiện `V5.3 đang chạy`.
4. Weather API / Air API sẽ hiện thời gian phản hồi, ví dụ `412 ms`.
5. Bấm `Dùng vị trí hiện tại`; GPS sẽ đổi trạng thái ngay.
6. Nếu `Ứng dụng` báo `app.js chưa chạy`, bấm `Sửa cache & tải lại`.

GPS web cần HTTPS và quyền Location. Trên điện thoại, độ chính xác tốt hơn laptop và ổn định nhất khi AIRUN ở foreground.
