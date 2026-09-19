# AIRUN V7.3 — OpenFreeMap Stable

## Sửa lỗi bản đồ
- Bỏ hoàn toàn việc dùng `openstreetmap.org/export/embed.html` trong phần bản đồ.
- Không còn gọi trực tiếp `tile.openstreetmap.org` làm tile fallback.
- Khi không có Mapbox hoặc Mapbox lỗi, AIRUN dùng MapLibre GL JS + OpenFreeMap style `liberty`.
- MapLibre thử tải từ 2 CDN: jsDelivr trước, UNPKG sau.
- Nếu cả Mapbox và OpenFreeMap đều lỗi, AIRUN hiển thị trạng thái rõ ràng nhưng GPS vẫn tiếp tục ghi quãng đường.
- Phần bản đồ cung chạy và GPS Tracker đều dùng cùng cơ chế fallback mới.
- Liên kết mở vị trí bên ngoài đổi sang Google Maps thay vì phụ thuộc trang OpenStreetMap.

## Không thay đổi
- Weather/Air Rewrite trên Render giữ nguyên.
- GraphHopper routing giữ nguyên.
- Token Mapbox/GraphHopper đã lưu trên trình duyệt vẫn được dùng lại.
