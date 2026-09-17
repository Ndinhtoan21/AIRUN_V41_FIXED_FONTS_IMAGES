# AIRUN V5.4 — Fast Live API + Working Planner

## Sửa kết nối dữ liệu
- Tách API thành 2 tầng: `current` nhẹ trước, `forecast` theo giờ tải nền sau.
- Weather API và Air Quality API cập nhật độc lập; nguồn nào về trước hiển thị trước.
- Tự retry 1 lần khi request hiện tại lỗi/timeout.
- Hiển thị lỗi cụ thể hơn: Timeout / HTTP / Offline / Không phản hồi.
- Planner không còn bị chặn bởi API: dữ liệu dự phòng/cache được phân tích ngay, sau đó tự nâng cấp bằng dữ liệu trực tiếp.
- `cache: no-store` cho request API để tránh số liệu cũ do HTTP cache.

## Sửa phần lên kế hoạch
- Thêm ô Pace dự kiến (ví dụ `6:30 /km`).
- Tính quãng đường dự kiến ngay trên thiết bị: `thời lượng / pace`.
- Hiển thị tốc độ tương đương km/h.
- Kết quả phân tích có bảng tóm tắt: quãng đường, pace, thời lượng, nguồn dữ liệu môi trường và trạng thái forecast.
- Kế hoạch được lưu cùng pace + quãng đường dự kiến vào nhật ký.

## Kiểm thử
- `node --check app.js`: PASS.
- Unit tests V5.4: PASS.
- Không có duplicate HTML ID.
- Không có JS `$()` reference bị thiếu trong HTML.
- Browser integration test với Weather/Air response mô phỏng: PASS.
  - Weather current cập nhật nhiệt độ.
  - Air current cập nhật AQI/PM2.5.
  - 60 phút @ pace 6:00 = 10.00 km và ~10.0 km/h.
  - Planner trả kết quả ngay và nâng cấp sang forecast trực tiếp.
