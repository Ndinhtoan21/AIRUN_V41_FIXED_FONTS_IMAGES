# Cập nhật AIRUN V5 lên Render

Bạn KHÔNG cần tạo Static Site mới nếu `airun-da-nang` đã hoạt động.

1. Giải nén ZIP V5.
2. Thay toàn bộ file trong repository GitHub AIRUN hiện tại bằng nội dung V5 (giữ file ở root repo).
3. Commit và Push vào branch `main`.
4. Render sẽ Auto Deploy nếu đang bật.
5. Nếu Render chưa chạy: Dashboard > airun-da-nang > Manual Deploy > Deploy latest commit.
6. Sau khi deploy, mở site bằng tab ẩn danh hoặc Ctrl+Shift+R một lần để tránh cache service worker V4/V4.1.

Cấu hình vẫn là Static Site:
- Build Command: `echo "No build required"`
- Publish Directory: `.`
- Root Directory: trống

## Test GPS
- Mở website trên điện thoại qua HTTPS.
- Bấm `Bắt đầu chạy` hoặc `Dùng vị trí hiện tại`.
- Chọn Allow/Cho phép vị trí chính xác.
- Nếu GPS sai số >80 m, AIRUN vẫn hiển thị vị trí nhưng không cộng điểm đó vào quãng đường.
