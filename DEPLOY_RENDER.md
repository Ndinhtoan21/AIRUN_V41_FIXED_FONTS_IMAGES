# Cập nhật AIRUN V5.3 lên Render

Không tạo Static Site mới.

1. Giải nén ZIP V5.3.
2. Copy đè toàn bộ file vào ROOT repository AIRUN hiện tại.
3. Commit + push branch `main`.
4. Render Auto Deploy; nếu chưa chạy thì Manual Deploy > Deploy latest commit.
5. Sau khi Live, mở trang và kiểm tra bảng trạng thái kết nối.

Cấu hình Render:
- Static Site
- Root Directory: trống
- Build Command: `echo "No build required"`
- Publish Directory: `.`

## Dấu hiệu bản mới đã chạy
- `Ứng dụng: V5.3 đang chạy`
- Weather API và Air API hiện số ms khi phản hồi.
- Nút `Kiểm tra kết nối ngay` xuất hiện dưới các số liệu.

## Nếu trình duyệt vẫn giữ bản cũ
Bản V5.3 có watchdog. Nếu app.js không chạy, sau 2,5 giây nút sẽ đổi thành `Sửa cache & tải lại`; bấm nút này để gỡ Service Worker/cache cũ và tải lại.
