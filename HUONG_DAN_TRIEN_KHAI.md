# Hướng dẫn đưa AIRUN V4.1 lên Render

## Cách 1: Tạo Static Site trực tiếp

1. Đưa toàn bộ tệp trong thư mục AIRUN V4.1 lên GitHub.
2. Trên Render chọn **New → Static Site**.
3. Chọn đúng repository và nhánh `main`.
4. Build Command: `echo AIRUN`.
5. Publish Directory: `.`.
6. Bấm tạo site và chờ trạng thái **Live**.

## Cách 2: Dùng Blueprint

Chọn **New → Blueprint** rồi kết nối repository. Render sẽ đọc `render.yaml` ở thư mục gốc.

## Khi đã cập nhật nhưng trang vẫn cũ

1. Kiểm tra GitHub đã có commit mới và đã **Push origin**.
2. Trong Render mở **Events** và kiểm tra commit đang triển khai.
3. Chọn **Manual Deploy → Deploy latest commit** nếu cần.
4. Khi trạng thái Live, mở trang ở tab ẩn danh hoặc tải lại bằng `Ctrl + Shift + R`.
5. Nếu từng cài AIRUN như ứng dụng, đóng ứng dụng rồi mở lại để service worker cập nhật.

AIRUN V4.1 là website tĩnh nên không cần máy chủ Python, biến môi trường hay API key.
