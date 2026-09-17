# AIRUN V6.0

- Viết lại luồng Weather/Air theo kiểu live-first: luôn gọi proxy Render khi online, không để cache cũ chặn dashboard.
- Weather và Air cập nhật độc lập ngay khi từng proxy trả JSON.
- Bản đồ khu vực không còn phụ thuộc Leaflet CDN; dùng OpenStreetMap embed trực tiếp và đổi tâm theo khu vực/GPS.
- Lộ trình GPS dùng SVG nội bộ để vẫn vẽ được ngay cả khi thư viện bản đồ ngoài không tải.
- Gỡ Service Worker/cache AIRUN cũ nhưng không reload vòng lặp.
- Vẫn giữ planner, GPS tracker, nhật ký và đánh giá môi trường.
