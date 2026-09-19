# AIRUN V7.2 — Stable Map Fallback

## Sửa lỗi bản đồ GPS bị trang lỗi OpenStreetMap
- Mapbox vẫn là bản đồ ưu tiên khi có token hợp lệ.
- Nếu thiếu token hoặc Mapbox không tải được, AIRUN chuyển sang MapLibre GL JS + OpenStreetMap raster tiles.
- Không còn phụ thuộc trực tiếp vào trang `openstreetmap.org/export/embed.html` cho fallback chính.
- Iframe OpenStreetMap chỉ còn là fallback cuối cùng nếu cả Mapbox và MapLibre đều không tải được.
- Giữ nguyên route dự kiến, GPS thực tế, marker vị trí và auto-fit trên MapLibre.

## Vì sao V7.1 lỗi
Ảnh lỗi cho thấy tracker đang ở chế độ `OpenStreetMap · dự phòng`. URL `export/embed.html` của OSM có thể tạm thời không khả dụng, khiến iframe hiện trang lỗi dù GPS vẫn chạy.
