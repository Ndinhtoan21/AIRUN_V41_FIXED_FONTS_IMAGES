# Deploy AIRUN V6.2

Không tạo site Render mới.

1. Xóa/thay các file cũ trong repo AIRUN (không xóa .git).
2. Copy toàn bộ nội dung gói V6.2 vào root repo.
3. Giữ nguyên 2 Rewrite Rule Weather/Air đang hoạt động trên Render.
4. Commit + push branch main.
5. Chờ Render Auto Deploy hoàn tất.
6. Hard refresh một lần (Ctrl+Shift+R) sau deploy.

Bản V6.2 không đăng ký Service Worker mới, nhằm tránh cache PWA cũ gây lỗi.

Lưu ý routing: AIRUN dùng Valhalla public demo theo fair-use để thử tạo cung đi-về. Đây phù hợp demo/thi thử nghiệm; khi triển khai production đông người dùng nên chuyển routing sang backend/API riêng có SLA.
