# AIRUN V5.3 — Live Connection Fix

## Lỗi chính đã sửa
- Sửa Service Worker: không bao giờ trả `index.html` thay cho `app.js`, `style.css` hoặc ảnh khi asset lỗi.
- Thêm watchdog trong HTML. Nếu `app.js` không khởi động, giao diện sẽ báo rõ và có nút `Sửa cache & tải lại`.
- Khởi tạo ứng dụng theo từng bước độc lập; một lỗi ở bản đồ, dialog hoặc PWA không còn làm chết toàn bộ nút bấm.
- Event listener dùng cơ chế an toàn, thiếu một phần tử không làm dừng toàn bộ script.

## API realtime
- Weather API và Air Quality API được gọi song song.
- Dữ liệu được cập nhật từng phần ngay khi từng API phản hồi, không chờ cả hai xong mới render.
- Timeout rút xuống ~4,2 giây cho mỗi API.
- Hiển thị thời gian phản hồi theo ms và trạng thái riêng cho Weather API / Air API.
- Luôn hiển thị dữ liệu dự phòng ngay từ HTML để giao diện không còn toàn dấu gạch.

## GPS
- Nút GPS phản hồi ngay bằng trạng thái trực quan.
- GPS nhanh và GPS chính xác được thử song song; lấy kết quả thành công đầu tiên.
- Sau khi có tọa độ đầu tiên, AIRUN tiếp tục tăng độ chính xác ở nền.
- Trạng thái GPS hiển thị rõ: chờ quyền, đang định vị, ±m, bị chặn, không có vị trí, timeout.

## Chẩn đoán
- Thêm bảng: Ứng dụng / Weather API / Air API / GPS.
- Thêm nút `Kiểm tra kết nối ngay`.
- Nếu JavaScript chính không chạy, hệ thống tự phát hiện sau 2,5 giây.
