# AIRUN V5.0 — thay đổi chính

- Thay ảnh minh họa chính bằng ảnh chụp thực tế; SVG chỉ còn là fallback offline/lỗi mạng.
- Dùng GPS chính xác để gọi Weather/AQI thay vì chỉ ánh xạ sang phường gần nhất.
- Thêm GPS Running Tracker: watchPosition, quãng đường, thời gian, pace, tốc độ, độ chính xác.
- Lọc nhiễu GPS: không cộng điểm sai số >80 m; loại bước nhảy >350 m hoặc vận tốc suy ra >32 km/h.
- Vẽ route trực tiếp trên OpenStreetMap/Leaflet.
- Screen Wake Lock khi trình duyệt hỗ trợ.
- Thêm UV vào bộ dữ liệu và thuật toán đánh giá.
- So sánh khu vực theo đúng giờ chạy đã chọn, không còn chỉ dùng thời điểm hiện tại.
- API lỗi không để chỉ số trống: live > cache gần đây > dữ liệu mô phỏng có nhãn rõ.
- Nhật ký hỗ trợ cả kế hoạch lẫn tóm tắt buổi chạy; không lưu chuỗi tọa độ route.
- Service Worker tăng cache version lên V5 để tránh Render hiển thị bản cũ.
