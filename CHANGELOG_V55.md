# AIRUN V5.5

- Sửa watchdog kiểm tra sai v53/v54 khiến giao diện báo giả “app.js chưa chạy”.
- Nhúng CSS + JavaScript cốt lõi trực tiếp vào index.html để nút/planner không còn phụ thuộc app.js tải riêng.
- Tạm ngừng Service Worker và tự gỡ cache PWA cũ để tránh chạy nhầm mã phiên bản trước.
- Giảm Open-Meteo từ 4 request xuống 2 request song song: Weather và Air, mỗi request mang cả current + hourly 36 giờ.
- Planner và ước tính quãng đường hoạt động hoàn toàn cục bộ, không phụ thuộc API/GPS.
- Weather/Air cập nhật độc lập ngay khi từng nguồn phản hồi.
- Giữ app.js/style.css dưới dạng source để dễ chỉnh sửa, nhưng index.html không phụ thuộc chúng để khởi động.
