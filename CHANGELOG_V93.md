# AIRUN V9.3 — bản đồ sáng/tối, độ cao, chất lượng cung đường, bản đồ hành trình

Tất cả đều miễn phí, không cần thêm tài khoản hay khoá API.

## Bản đồ Sáng/Tối
- Nút "Tối/Sáng" trên bản đồ cung chạy và bản đồ GPS. Sáng = OpenFreeMap Positron (đường phố rõ, sạch); Tối = OpenFreeMap Dark, đường chạy màu xanh chanh nổi bật.
- Lần đầu tự chọn theo giờ (18:00–6:00 dùng bản đồ tối), sau đó nhớ lựa chọn của bạn. Nếu kiểu bản đồ không tải được, tự quay về kiểu Liberty.

## Độ cao & độ dốc
- API mới `POST /api/elevation` (Open-Meteo Elevation, DEM 90 m, có cache). Biểu đồ độ cao, tổng leo, dốc tối đa (đo trên đoạn ≥150 m để tránh nhiễu).

## Chất lượng cung đường
- Chấm 0–10 theo: thời tiết & không khí lúc chạy, độ dốc, đúng quãng đường/khép kín, loại đường (tỉ lệ đường lớn/đường đi bộ) và mặt đường (GraphHopper path details; tự gọi lại không kèm details nếu bị từ chối).
- Ghi rõ phần chưa tính: bóng râm, đèn đường.

## Bản đồ hành trình mỗi buổi chạy
- Lưu đường GPS đã rút gọn (≤300 điểm) CHỈ TRÊN MÁY này, tối đa 30 buổi gần nhất; không gửi máy chủ hay Google Sheet.
- Hình đường chạy trong Nhật ký và thẻ tổng kết; hộp thoại xem lại có bản đồ, chia km (splits), tải GPX để tự đưa lên Strava.
- Xoá buổi chạy là xoá luôn bản đồ.
