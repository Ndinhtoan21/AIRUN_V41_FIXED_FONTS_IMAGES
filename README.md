# AIRUN V5.5 — Stable Core

Bản này ưu tiên độ ổn định. `index.html` chứa trực tiếp CSS và JavaScript cốt lõi nên các nút, planner, GPS và trạng thái API không còn phụ thuộc việc trình duyệt tải `app.js`/`style.css` riêng.

## Deploy Render Static Site
- Build Command: `echo "No build required"`
- Publish Directory: `.`
- Branch: `main`

Sau khi deploy, mở site và kiểm tra ô ỨNG DỤNG phải hiện `V5.5 đang chạy`. Weather/Air sẽ chuyển `Đang kết nối…` -> số mili-giây hoặc lỗi cụ thể.
