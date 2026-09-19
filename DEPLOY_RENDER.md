# Deploy AIRUN V7.2

1. Copy đè toàn bộ file V7.2 vào repo AIRUN hiện tại.
2. Giữ nguyên Rewrite Rule Weather/Air trên Render.
3. Commit và push branch `main`.
4. Chờ Render Auto Deploy.
5. Hard refresh trình duyệt (Ctrl+Shift+R) hoặc đóng/mở lại tab trên điện thoại.
6. Không cần nhập lại Mapbox/GraphHopper nếu trình duyệt vẫn còn localStorage cũ.

Sau deploy, GPS Tracker sẽ hiển thị một trong các trạng thái:
- `Mapbox · GPS trực tiếp`: tốt nhất.
- `OpenStreetMap · MapLibre`: fallback ổn định, không cần token.
- `OpenStreetMap · iframe cuối`: chỉ xuất hiện nếu MapLibre CDN cũng không tải được.
