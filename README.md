# AIRUN Đà Nẵng V5.0 — GPS-first

AIRUN là Static Site/PWA chạy trực tiếp trong trình duyệt, không cần backend và không cần API key.

## Điểm mới V5.0
- GPS chính xác theo tọa độ thiết bị, không chỉ chọn phường gần nhất.
- GPS Running Tracker bằng `navigator.geolocation.watchPosition()`.
- Tính quãng đường, thời gian, pace, tốc độ và độ chính xác GPS.
- Lọc điểm GPS sai số lớn và bước nhảy tốc độ bất thường trước khi cộng quãng đường.
- Vẽ lộ trình trực tiếp bằng Leaflet + OpenStreetMap.
- Screen Wake Lock khi chạy trên trình duyệt hỗ trợ.
- Thời tiết + AQI theo đúng tọa độ GPS qua Open-Meteo.
- Bổ sung UV vào phân tích chạy.
- Nếu API lỗi: ưu tiên cache gần đây; cuối cùng mới dùng dữ liệu mô phỏng và ghi nhãn rõ.
- Nhật ký chỉ lưu tóm tắt buổi chạy, không lưu toàn bộ chuỗi tọa độ GPS.
- Ảnh chụp thật từ Unsplash; SVG cũ chỉ là fallback khi ảnh mạng không tải được.

## Render
- Service: Static Site
- Branch: main
- Root Directory: để trống
- Build Command: `echo "No build required"`
- Publish Directory: `.`
- Environment Variables: không cần

## Lưu ý GPS web
GPS cần HTTPS (Render có HTTPS). Trên điện thoại, theo dõi ổn định nhất khi AIRUN đang ở foreground. Một số hệ điều hành có thể giảm/tắt cập nhật vị trí khi tắt màn hình hoặc chuyển ứng dụng; đây là giới hạn của web app, không phải lỗi thuật toán AIRUN.
